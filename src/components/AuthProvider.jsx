import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut
} from "firebase/auth";
import { collection, doc, getDoc, getDocs, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase.init";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// This email is a permanent admin no matter what's stored in Firestore — it's the account
// that can never accidentally get locked out (e.g. if its own role field were ever changed).
// Everyone else's admin status is read from their Firestore `role` field, which is what lets
// TitansAdminDashboard's "Promote to admin" button actually take effect on login.
export const ADMIN_EMAIL = "arjunbarua@gmail.com";

const isAdminEmail = (email) => (email || "").trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

async function loadOrCreateProfileDoc(user, extra = {}) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    const data = snap.data();
    // Backfill role for docs created before role tracking existed, so older accounts
    // don't end up with an undefined role.
    if (!data.role) {
      const backfillRole = isAdminEmail(user.email) ? "admin" : "fan";
      await setDoc(ref, { role: backfillRole }, { merge: true });
      return { id: user.uid, ...data, role: backfillRole };
    }
    return { id: user.uid, ...data };
  }

  const newDoc = {
    name: extra.name || user.displayName || "Fanzone Member",
    email: user.email,
    phone: "",
    favPlayer: "",
    bio: "",
    tier: "Fan",
    role: isAdminEmail(user.email) ? "admin" : "fan",
    joined: serverTimestamp()
  };
  await setDoc(ref, newDoc);
  return { id: user.uid, ...newDoc };
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Optimistic role so the UI doesn't flash "fan" for the bootstrap admin while
        // Firestore loads. The profile fetch below corrects this to the account's actual
        // stored role, which matters for anyone promoted through the admin dashboard.
        setRole(isAdminEmail(user.email) ? "admin" : "fan");
        const p = await loadProfile(user);
        setRole(isAdminEmail(user.email) ? "admin" : (p?.role || "fan"));
        setLoading(false);
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
    setCurrentUser(result.user);
    // Awaited (unlike before) so a promoted fan's stored "admin" role is known *before*
    // Login.jsx decides where to redirect them.
    const p = await loadProfile(result.user);
    const resolvedRole = isAdminEmail(result.user.email) ? "admin" : (p?.role || "fan");
    setRole(resolvedRole);
    setLoading(false);
    return { role: resolvedRole };
  };

  const updateUserProfile = async (fields) => {
    if (!currentUser) throw new Error("No signed-in user to update.");
    const ref = doc(db, "users", currentUser.uid);
    await setDoc(ref, fields, { merge: true });
    setProfile((prev) => ({ ...prev, ...fields }));
  };

  // ---------------- Admin-only: manage fan accounts ----------------

  /** List every registered fan/admin account, for the admin dashboard's Users & Roles tab. */
  const fetchAllUsers = useCallback(async () => {
    const snap = await getDocs(collection(db, "users"));
    return snap.docs.map((d) => ({ _id: d.id, ...d.data() }));
  }, []);

  /** Promote or revoke a user's admin access. Requires Firestore rules allowing an admin to write other users' docs. */
  const setUserRole = useCallback(async (uid, nextRole) => {
    const ref = doc(db, "users", uid);
    await setDoc(ref, { role: nextRole, roleUpdatedAt: serverTimestamp() }, { merge: true });
    return { modifiedCount: 1 };
  }, []);

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
        fetchAllUsers,
        setUserRole,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}