// firebase.js

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from "firebase/storage"
// Add other Firebase services you need, like Firestore, Storage, etc.

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};
// const firebaseConfig = {
//   apiKey: "AIzaSyBjNTFiExO2Bg-5-M8PUcJcwI3CCba23ms",
//   authDomain: "impact-engine.firebaseapp.com",
//   projectId: "impact-engine",
//   storageBucket: "impact-engine.firebasestorage.app",
//   messagingSenderId: "601651783589",
//   appId: "1:601651783589:web:9deb20d0ebacdf51ccaa4c",
//   measurementId: "G-4WNKC2NJVH"
// };
//console.log('firebaseConfig ', firebaseConfig);

// Initialize Firebase only if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
const db = getFirestore(app);  // Initialize Firestore
const storage = getStorage(app)

// Initialize Analytics only in a browser environment
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { auth, db, analytics, storage };  // Export both auth, db, and analytics
