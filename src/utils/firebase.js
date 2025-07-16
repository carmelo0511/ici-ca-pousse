import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDyxtOXHNqly6q5R_P3WY5XJgXZjsPVn5M",
  authDomain: "ici-ca-pousse.firebaseapp.com",
  projectId: "ici-ca-pousse",
  storageBucket: "ici-ca-pousse.appspot.com",
  messagingSenderId: "633260578575",
  appId: "1:633260578575:web:bbabfd72ea861ca9e9107a",
  measurementId: "G-8PH0HHW4NG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);
export default app; 