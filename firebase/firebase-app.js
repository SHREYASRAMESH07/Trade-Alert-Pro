// Import the necessary Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';

// Your Firebase configuration
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

// Export the initialized Firebase app
export default firebaseApp;
