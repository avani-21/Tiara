// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth,GoogleAuthProvider} from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAxZ5oiH_dnVOLrNxepdFEWJHh5mgkigGY",
  authDomain: "tiara-31a09.firebaseapp.com",
  projectId: "tiara-31a09",
  storageBucket: "tiara-31a09.firebasestorage.app",
  messagingSenderId: "559847045608",
  appId: "1:559847045608:web:601530babd9ff5711d0c5d",
  measurementId: "G-SH3DMFTBMX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth=getAuth(app)
const provider=new GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account',
});

export {auth,provider}