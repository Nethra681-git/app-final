import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAcYOu2XqBJMhhw8JJ08jJv6-V1SoUTX4o",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "shastika-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "shastika-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "shastika-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "596325100179",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:596325100179:web:2d23d531752756b71ffb66",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-X3PRLG6GRB"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);

export default app;