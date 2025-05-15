import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { Storage } from "@google-cloud/storage";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAedc2_z9EzPfRpa35iMwSKz3O-E3wyYgQ",
    authDomain: "fragrance-da32b.firebaseapp.com",
    projectId: "fragrance-da32b",
    storageBucket: "fragrance-da32b.firebasestorage.app", // Corrected storage bucket URL
    messagingSenderId: "339982009466",
    appId: "1:339982009466:web:1e54ae60457d2f59d6a7c3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
const storage = new Storage({
    projectId: firebaseConfig.projectId,
    keyFilename: "C:/Users/ferna/Downloads/fragrance-da32b-firebase-adminsdk-fbsvc-e67a5d8708.json" // Make sure you have the correct service account key file
});

const bucket = storage.bucket(firebaseConfig.storageBucket);

export { bucket };
