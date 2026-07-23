import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC_jHwTsTurvs0yzxBrZZPGtbqF-aR1RYY",
  authDomain: "fanzone-475ea.firebaseapp.com",
  projectId: "fanzone-475ea",
  storageBucket: "fanzone-475ea.firebasestorage.app",
  messagingSenderId: "191045569247",
  appId: "1:191045569247:web:cdd8922712566ab05bf76a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
