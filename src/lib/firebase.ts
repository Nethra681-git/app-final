import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase configuration with complete credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAcYOu2XqBJMhhw8JJ08jJv6-V1SoUTX4o",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "shastika-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "shastika-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "shastika-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "596325100179",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:596325100179:web:2d23d531752756b71ffb66",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-X3PRLG6GRB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

export default app;

/*
HOW TO SET UP FIREBASE:

1. Go to https://console.firebase.google.com/
2. Create a new project or select existing
3. Go to Project Settings (gear icon)
4. Copy your Web SDK config values
5. Create .env.local file in your project root
6. Add these environment variables:
   
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

7. Create two Firestore collections:
   - "payments" 
   - "orders"

8. Set up Firestore Rules (optional):
   
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /payments/{document=**} {
         allow read, write: if request.auth != null;
       }
       match /orders/{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
*/
