const express = require('express');
const admin = require('firebase-admin');
const xlsx = require('xlsx');
const path = require('path');

const app = express();
const port = 3000;

// Replace with your Firebase credentials file path
const serviceAccount = require('./serviceAccountKey.json');
 
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://tradealertprok-default-rtdb.firebaseio.com/', // Replace with your Firebase project URL
});

const db = admin.firestore();
const collectionName = 'IBM-Datasheet'; // Replace with your collection name in Firestore

let loadedData = []; // Array to store loaded data

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

// Function to load data gradually with a 5-second gap
async function loadDataGradually() {
  const snapshot = await db.collection(collectionName).get();
  const data = [];

  snapshot.forEach((doc) => {
    data.push(doc.data());
  });

  // Load data gradually with a 5-second gap
  for (const record of data) {
    loadedData.push(record);
    await new Promise(resolve => setTimeout(resolve, 5000)); // 5-second delay
  }
}

// Endpoint to import data from Excel to Firebase
app.get('/importData', async (req, res) => {
  try {
    const workbook = xlsx.readFile('./intraday_5min_IBM.xlsx'); // Replace with your Excel file path
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const batch = db.batch();
    const collectionRef = db.collection(collectionName);

    data.forEach((record) => {
      const newDocRef = collectionRef.doc();
      batch.set(newDocRef, record);
    });

    await batch.commit();

    res.status(200).send('Data imported to Firebase successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// API endpoint to fetch loaded data
app.get('/api/loadedData', (req, res) => {
  res.json(loadedData);
});

// Endpoint to render bar graph using Chart.js
app.get('/graph', async (req, res) => {
  try {
    // Extract relevant data for the bar graph from the loaded data
    const timestamps = loadedData.map((record) => record.timestamp);
    const volumeData = loadedData.map((record) => record.volume);

    // Send HTML file with Chart.js integration
    res.sendFile(path.join(__dirname, 'barGraph.html'));

  } catch (error) {
    console.error('Error rendering bar graph:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Welcome message for the root path
app.get('/', (req, res) => {
  res.send('Welcome to the IBM Market Data App. Use /importData to import data, /api/loadedData to fetch loaded data, and /graph to view the bar graph.');
});

// Load data gradually with a 5-second gap
loadDataGradually();

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
