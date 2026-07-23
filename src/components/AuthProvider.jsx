import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase.init";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const ADMIN_EMAIL = "arjunbarua@gmail.com"; 

const isAdminEmail = (email) => (email || "").trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

async function loadOrCreateProfileDoc(user, extra = {}) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return { id: user.uid, ...snap.data() };
  }

  const doc_ = {
    name: extra.name || user.displayName || "Fanzone Member",
    email: user.email,
    phone: "",
    favPlayer: "",
    bio: "",
    tier: "Fan",
    joined: serverTimestamp()
  };
  await setDoc(ref, doc_);
  return { id: user.uid, ...doc_ };
}

export default function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState(null); 
  const [profile, setProfile] = useState(null); 
  const [profileError, setProfileError] = useState(null);
  const [loading, setLoading] = useState(true); 

  const loadProfile = useCallback(async (user, extra = {}) => {
    try {
      setProfileError(null);
      const p = await loadOrCreateProfileDoc(user, extra);
      setProfile(p);
      return p;
    } catch (err) {
      console.error("Profile details failed to load (non-blocking):", err.code || err.message, err);
      setProfileError(err);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setRole(isAdminEmail(user.email) ? "admin" : "fan");
        setLoading(false);
        
        loadProfile(user);
      } else {
        setRole(null);
        setProfile(null);
        setProfileError(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [loadProfile]);

  const retryProfile = useCallback(() => {
    if (currentUser) return loadProfile(currentUser);
  }, [currentUser, loadProfile]);

  
  const registerWithEmail = async (name, email, password) => {
    if (isAdminEmail(email)) {
      const err = new Error("This email is reserved for the club admin account and can't be used to register.");
      err.code = "auth/admin-registration-blocked";
      throw err;
    }

    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (name) {
      await updateProfile(result.user, { displayName: name });
    }
    setCurrentUser(result.user);
    setRole("fan");
    setLoading(false);
    loadProfile(result.user, { name }); 
    return { role: "fan" };
  };


  const loginWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const resolvedRole = isAdminEmail(result.user.email) ? "admin" : "fan";
    setCurrentUser(result.user);
    setRole(resolvedRole);
    setLoading(false);
    loadProfile(result.user); 
    return { role: resolvedRole };
  };

  const updateUserProfile = async (fields) => {
    if (!currentUser) throw new Error("No signed-in user to update.");
    const ref = doc(db, "users", currentUser.uid);
    await setDoc(ref, fields, { merge: true });
    setProfile((prev) => ({ ...prev, ...fields }));
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        profile,
        profileError,
        retryProfile,
        loading,
        registerWithEmail,
        loginWithEmail,
        updateUserProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
