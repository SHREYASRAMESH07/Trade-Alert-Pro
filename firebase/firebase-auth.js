// Import the necessary Firebase modules
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import firebaseApp from './firebase-app.js';

// Initialize Firebase Authentication
const auth = getAuth(firebaseApp);

// Export the authentication methods
export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut };
