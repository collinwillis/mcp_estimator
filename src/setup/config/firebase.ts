import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const config = {
  // Your web app's Firebase configuration
  firebaseConfig: {
    apiKey: "AIzaSyDg6KtukKDDeiNmbDdLIrHvAb4hteFbP1g",
    authDomain: "mcp-estimator.firebaseapp.com",
    projectId: "mcp-estimator",
    storageBucket: "mcp-estimator.appspot.com",
    messagingSenderId: "555763742472",
    appId: "1:555763742472:web:39e2cd665ba4c1799fdebd",
  },
};

const app = initializeApp(config.firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export const firestore = getFirestore(app);
