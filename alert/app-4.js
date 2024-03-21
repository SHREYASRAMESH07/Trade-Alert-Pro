const express = require('express');
const admin = require('firebase-admin');
const xlsx = require('xlsx');

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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
