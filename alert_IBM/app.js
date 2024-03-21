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
  databaseURL: 'https://tradealertprok-default-rtdb.firebaseio.com/',
});

const db = admin.firestore();
const collectionName = 'IBM-Datasheet';

let loadedData = [];

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

// Firebase Cloud Function to send an email alert
exports.sendEmailAlert = functions.firestore
  .document('IBM-Datasheet/{documentId}')
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data();

    // Replace 'thresholdValue' with the fixed value the user sets
    const thresholdValue = 100; // Example threshold value

    // Check if the condition is met
    if (data.volume >= thresholdValue) {
      // Send an email alert
      const mailOptions = {
        from: 'your-email@gmail.com',
        to: 'recipient-email@example.com',
        subject: 'Alert: Value Reached',
        text: `The value (${data.volume}) has reached the threshold value (${thresholdValue}).`,
      };

      await transporter.sendMail(mailOptions);

      console.log('Email alert sent.');
    }
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

    // Trigger alert if the condition is met
    if (record.volume >= thresholdValue) {
      await db.collection('IBM-Datasheet').add({
        timestamp: new Date(),
        alert: true,
      });
    }
  }
}

// Endpoint to import data from Excel to Firebase
app.get('/importData', async (req, res) => {
  try {
    const workbook = xlsx.readFile('./intraday_5min_IBM.xlsx');
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
    const timestamps = loadedData.map((record) => record.timestamp);
    const volumeData = loadedData.map((record) => record.volume);

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
