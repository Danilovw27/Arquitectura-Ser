// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  linkWithPopup,
  linkWithCredential,
} from "firebase/auth";

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

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Providers
export const GoogleProvider = new GoogleAuthProvider();
export const providerFacebook = new FacebookAuthProvider();
export const providerGitHub = new GithubAuthProvider();

// Configurar scopes
providerGitHub.addScope('user:email');
providerGitHub.setCustomParameters({ allow_signup: 'false' });
GoogleProvider.setCustomParameters({ prompt: 'select_account' });

// Helper functions para vinculación
export const linkProvider = async (user, provider) => {
  const result = await linkWithPopup(user, provider);
  return result;
};

// Exportar proveedores base
export { GoogleAuthProvider, FacebookAuthProvider, GithubAuthProvider, linkWithCredential };
