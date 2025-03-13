'use client';

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCGYRI4jdKhq22g_cpCeeSc2y6n_z663w8",
  authDomain: "see-eat-53aea.firebaseapp.com",
  projectId: "see-eat-53aea",
  storageBucket: "see-eat-53aea.firebasestorage.app",
  messagingSenderId: "735037793209",
  appId: "1:735037793209:web:fd8283bfc49ac4516c4c68",
  measurementId: "G-HM8PYJZMJ5"
};

// Initialize Firebase
let app: FirebaseApp;

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = isBrowser ? getAuth(app) : getAuth(app);
const db = getFirestore(app);

// Initialize Analytics and export it if it's supported
let analytics: Analytics | null = null;
if (isBrowser) {
  isSupported().then(yes => yes && (analytics = getAnalytics(app)));
}

export { app, auth, db, analytics };
