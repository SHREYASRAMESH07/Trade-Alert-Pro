const express = require('express');
const admin = require('firebase-admin');
const xlsx = require('xlsx');
const path = require('path');
const notifier = require('node-notifier');

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

app.use(express.static(path.join(__dirname, 'public')));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

async function loadDataGradually() {
  const snapshot = await db.collection(collectionName).get();
  const data = [];
  let totalVolume = 0;

  snapshot.forEach((doc) => {
    data.push(doc.data());
  });

  for (const record of data) {
    loadedData.push(record);
    totalVolume += record.volume;

    if (totalVolume >= 100000) {
      notifier.notify({
        title: 'Alert',
        message: 'Loaded data volume exceeded the threshold!',
        sound: true,
      });
    }

    await new Promise(resolve => setTimeout(resolve, 5000));
  }
}

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

app.get('/api/loadedData', (req, res) => {
  res.json(loadedData);
});

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

app.get('/', (req, res) => {
  res.send(`
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>IBM Market Data App</title>
      </head>
      <body style="font-family: 'Arial', sans-serif; text-align: center; margin: 50px;">
        <h1>Welcome to the IBM Market Data App</h1>
        <p>Choose an option:</p>
        <button onclick="window.location.href='/importData'" style="margin: 10px;">Import Data</button>
        <button onclick="window.location.href='/graph'" style="margin: 10px;">View Graph</button>
      </body>
    </html>
  `);
});

loadDataGradually();

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
