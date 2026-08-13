import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: "gen-lang-client-0202270271",
  appId: "1:960976587885:web:ff462b2277a1da9574c364",
  apiKey: "AIzaSyBlkUILi0zpZBdX1uKAhBtyppRRZ7YFLPo",
  authDomain: "gen-lang-client-0202270271.firebaseapp.com",
  storageBucket: "gen-lang-client-0202270271.firebasestorage.app",
  messagingSenderId: "960976587885"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, "ai-studio-personalportfoli-a44651b0-256b-4856-a798-151420662f66");
export const auth = getAuth(app);
export const storage = getStorage(app);
