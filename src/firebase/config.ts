import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyDPkpjzL6MRMsuvrsJSQEmVwm5nJk8nNzs",
  authDomain: "cyber-cafe-point.firebaseapp.com",
  projectId: "cyber-cafe-point",
  storageBucket: "cyber-cafe-point.firebasestorage.app",
  messagingSenderId: "692522261893",
  appId: "1:692522261893:web:940fe8cdc71ccb0fdd38ec"
};

// Initialize or reuse app
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Test connection on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase client appears offline or connecting:", error.message);
    }
  }
}

testConnection();
