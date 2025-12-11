// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Replace your own config here:
const firebaseConfig = {
  apiKey: "AIzaSyCcWFby36-g8HUYiL0JXOuYKkjmi2DRhCU",
  authDomain: "income-expense-tracker-b6a0f.firebaseapp.com",
  projectId: "income-expense-tracker-b6a0f",
  storageBucket: "income-expense-tracker-b6a0f.firebasestorage.app",
  messagingSenderId: "400467816973",
  appId: "1:400467816973:web:2bb11fbf71efe583be5b44",
  measurementId: "G-QZTMMHNN6F"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Init Firestore database
export const db = getFirestore(app);

// Init Authentication
export const auth = getAuth(app);
