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

// API endpoint to fetch data
app.get('/api/data', async (req, res) => {
  try {
    const snapshot = await db.collection(collectionName).get();
    const data = [];

    snapshot.forEach((doc) => {
      data.push(doc.data());
    });

    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Endpoint to render bar graph using Chart.js
app.get('/graph', async (req, res) => {
  try {
    const snapshot = await db.collection(collectionName).get();
    const data = [];

    snapshot.forEach((doc) => {
      data.push(doc.data());
    });

    // Extract relevant data for the bar graph
    const timestamps = data.map((record) => record.timestamp);
    const volumeData = data.map((record) => record.volume);

    // Send HTML file with Chart.js integration
    res.sendFile(path.join(__dirname, 'barGraph.html'));

  } catch (error) {
    console.error('Error fetching data for bar graph:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Welcome message for the root path
app.get('/', (req, res) => {
  res.send('Welcome to the IBM Market Data App. Use /importData to import data, /api/data to fetch data, and /graph to view the bar graph.');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
