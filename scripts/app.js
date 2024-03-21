// Import necessary Firebase modules
import { initializeApp } from './firebase/firebase-app.js';
import { getAuth } from './firebase/firebase-auth.js';
import { getDatabase, ref, set } from './firebase/firebase-database.js';

// Your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBkaTBfuWHIRIT_nGFu6Fui5F39kcNblnE",
  authDomain: "tradealertprok.firebaseapp.com",
  projectId: "tradealertprok",
  storageBucket: "tradealertprok.appspot.com",
  messagingSenderId: "170112773594",
  appId: "1:170112773594:web:8c223ab2ceb0f30373a4e3",
  measurementId: "G-17R8L9915W"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const database = getDatabase(firebaseApp);

// Logic common to all pages or global functionality
// ...

// Example: Function to get the current user
function getCurrentUser() {
    const user = auth.currentUser;
    if (user) {
        console.log('Current user:', user);
    } else {
        console.log('No user logged in.');
    }
}

// Call the function or perform other actions as needed
getCurrentUser();
