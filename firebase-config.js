import { initializeApp } from "firebase/app";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut 
} from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyA6RmZ6rquzUR1dct30s355PzLu-r1_fwE",
    authDomain: "vaiinternet.firebaseapp.com",
    projectId: "vaiinternet",
    storageBucket: "vaiinternet.firebasestorage.app",
    messagingSenderId: "367548633672",
    appId: "1:367548633672:web:44da44d1761085424b3e7d",
    measurementId: "G-0XBYP585WQ"
};

// Initialize Firebase App and Services
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Export authentication methods for use in your script
export { 
    signInWithPopup, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut 
};
