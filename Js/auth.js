import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyDt_P-mOpX_Os6EIqwc9YcWGK-6ZgPg7eg",
  authDomain: "auction-b0b43.firebaseapp.com",
  projectId: "auction-b0b43",
  storageBucket: "auction-b0b43.firebasestorage.app",
  messagingSenderId: "832734848629",
  appId: "1:832734848629:web:dce355ac78b104a75f7a3c",
  measurementId: "G-SXSGEBF7ZG",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { auth, signInWithEmailAndPassword, signOut, onAuthStateChanged };
