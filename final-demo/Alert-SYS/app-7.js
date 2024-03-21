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
let alertThreshold = 100000;

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

    if (totalVolume >= alertThreshold) {
      notifier.notify({
        title: 'Alert',
        message: `Loaded data volume exceeded the threshold! (Threshold: ${alertThreshold})`,
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

app.post('/setAlertThreshold/:threshold', (req, res) => {
  const newThreshold = parseInt(req.params.threshold, 10);
  if (!isNaN(newThreshold)) {
    alertThreshold = newThreshold;
    res.status(200).send(`Alert threshold set to: ${newThreshold}`);
  } else {
    res.status(400).send('Invalid threshold value');
  }
});

app.get('/api/loadedData', (req, res) => {
  res.json(loadedData);
});

app.get('/graph', async (req, res) => {
  try {
    const timestamps = loadedData.map((record) => record.timestamp);
    const volumeData = loadedData.map((record) => record.volume);

    res.sendFile(path.join(__dirname, 'barGraph-9.html'));

  } catch (error) {
    console.error('Error rendering bar graph:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/setAlert', (req, res) => {
  res.sendFile(path.join(__dirname, 'setAlert.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dash-7.html'));
});

loadDataGradually();

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
