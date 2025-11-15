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
  apiKey: "AIzaSyCWttbyjL2Lv0G_vhTPKkY3lzUbvX7yDik",
  authDomain: "arquitectura-ser.firebaseapp.com",
  projectId: "arquitectura-ser",
  storageBucket: "arquitectura-ser.firebasestorage.app",
  messagingSenderId: "298588646307",
  appId: "1:298588646307:web:e32bd4de87550f84fa4816"
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