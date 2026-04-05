import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCf8vCgTYMGJzizAiuDTbDnQm3jo_uQbAE",
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "dreambrum-we.firebaseapp.com",
    databaseURL: "https://dreambrum-we-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "dreambrum-we",
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "dreambrum-we.firebasestorage.app",
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "938380291423",
    appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:938380291423:web:8c579d206a8938d35f5aea",
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-LE9HEVEEWV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);