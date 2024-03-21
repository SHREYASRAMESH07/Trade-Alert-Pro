// Import the necessary Firebase modules
import { getDatabase, ref, set } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js';
import firebaseApp from './firebase-app.js';

// Initialize Firebase Realtime Database
const database = getDatabase(firebaseApp);

// Export the database methods
export { database, ref, set };
