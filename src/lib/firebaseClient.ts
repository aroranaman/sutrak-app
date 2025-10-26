
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { firebaseConfig } from "@/firebase/config";

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

if (getApps().length) {
    app = getApp();
} else {
    app = initializeApp(firebaseConfig);
}

auth = getAuth(app);
firestore = getFirestore(app);


export { app, auth, firestore };
