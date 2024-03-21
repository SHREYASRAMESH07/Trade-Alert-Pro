const express = require('express');
const admin = require('firebase-admin');
const xlsx = require('xlsx');
const plotly = require('plotly')();

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
      // Assuming your Excel columns are named timestamp, open, high, low, close, and volume
      const { timestamp, open, high, low, close, volume } = record;

      const newDocRef = collectionRef.doc();
      batch.set(newDocRef, { timestamp, open, high, low, close, volume });
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

// Endpoint to render graph
app.get('/graph', async (req, res) => {
  try {
    const snapshot = await db.collection(collectionName).get();
    const data = [];

    snapshot.forEach((doc) => {
      data.push(doc.data());
    });

    // Extract relevant data for the graph
    const timestamp = data.map((record) => record.timestamp);
    const closeData = data.map((record) => record.close);
    const volumeData = data.map((record) => record.volume);

    // Create Plotly graph
    const trace1 = {
      x: timestamp,
      y: closeData,
      type: 'scatter',
      mode: 'lines',
      name: 'Close Data',
    };

    const trace2 = {
      x: timestamp,
      y: volumeData,
      type: 'bar',
      name: 'Volume Data',
      yaxis: 'y2', // Use a secondary y-axis for the bar chart
    };

    const layout = {
      title: 'IBM Market Data',
      xaxis: {
        title: 'Timestamp',
      },
      yaxis: {
        title: 'Close Data',
      },
      yaxis2: {
        title: 'Volume Data',
        overlaying: 'y',
        side: 'right',
      },
    };

    const graphOptions = { layout: layout, filename: 'IBM-Market-Data', fileopt: 'overwrite' };
    plotly.plot(timestamp, [trace1, trace2], graphOptions, function (err, msg) {
      if (err) {
        console.error('Error creating graph:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.send(`Graph created and saved: ${msg.url}`);
      }
    });
  } catch (error) {
    console.error('Error fetching data for graph:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Welcome message for the root path
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
