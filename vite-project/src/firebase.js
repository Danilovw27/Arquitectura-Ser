// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signOut } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCWttbyjL2Lv0G_vhTPKkY3lzUbvX7yDik",
  authDomain: "arquitectura-ser.firebaseapp.com",
  projectId: "arquitectura-ser",
  storageBucket: "arquitectura-ser.firebasestorage.app",
  messagingSenderId: "298588646307",
  appId: "1:298588646307:web:e32bd4de87550f84fa4816"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const GoogleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

// Export the services
export { auth, GoogleProvider, db, signOut };