import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ONLY replace the text inside the quotes below!
const firebaseConfig = {
  apiKey: "AIzaSyA7d4dJq8nD0AouLqJJTZS1AdtbvXLGq_U",
  authDomain: "challangeapp-100days.firebaseapp.com",
  projectId: "challangeapp-100days",
  storageBucket: "challangeapp-100days.firebasestorage.app",
  messagingSenderId: "689973624325",
  appId: "1:689973624325:web:6a517a4208e10cceba666c"
};

// Notice there is NO "getAnalytics" here. Just App, Auth, and Database.
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);