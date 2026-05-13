import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAcYOu2XqBJMhhw8JJ08jJv6-V1SoUTX4o",
  authDomain: "shastika-app.firebaseapp.com",
  projectId: "shastika-app",
  storageBucket: "shastika-app.appspot.com",
  messagingSenderId: "596325100179",
  appId: "1:596325100179:web:2d23d531752756b71ffb66",
  measurementId: "G-X3PRLG6GRB"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);

// ✅ Chrome mobile fix
setPersistence(auth, browserLocalPersistence).catch(console.error);

export default app;