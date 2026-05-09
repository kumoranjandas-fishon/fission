import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBi48c1YkvZqi1_oFasXe2bqGRG2JkAGOU",
  authDomain: "fishon-95c71.firebaseapp.com",
  projectId: "fishon-95c71",
  storageBucket: "fishon-95c71.firebasestorage.app",
  messagingSenderId: "414551804155",
  appId: "1:414551804155:web:4bfc16a08d454db7f3885e",
  measurementId: "G-FWMX1N7D89"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export default app;