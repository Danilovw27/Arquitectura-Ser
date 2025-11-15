// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  GithubAuthProvider,
  signOut 
} from 'firebase/auth';

import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDd5Ud4kw5WsaAAWpxdtgq6LppOuTMd94M",
  authDomain: "arquitecturaos.firebaseapp.com",
  projectId: "arquitecturaos",
  storageBucket: "arquitecturaos.firebasestorage.app",
  messagingSenderId: "889758830565",
  appId: "1:889758830565:web:433ee6d9ed8265c40c290c",
  measurementId: "G-1093HM00K2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
const auth = getAuth(app);

// Providers
const GoogleProvider = new GoogleAuthProvider();
const FacebookProvider = new FacebookAuthProvider();
const GithubProvider = new GithubAuthProvider();

// Firestore
const db = getFirestore(app);

// EXPORTS
export { 
  auth, 
  GoogleProvider, 
  FacebookProvider, 
  GithubProvider, 
  db, 
  signOut 
};
