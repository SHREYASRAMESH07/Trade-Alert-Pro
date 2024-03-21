const express = require('express');
const admin = require('firebase-admin');
const xlsx = require('xlsx');
const path = require('path');
const serviceAccount = require('./serviceAccountKey.json');
const dotenv = require('dotenv');
const twilio = require('twilio');

dotenv.config({ path: '.env.txt' });

const app = express();
const port = process.env.PORT || 3000;

// Firebase configuration
const firebaseConfig = {
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://tradealertprok-default-rtdb.firebaseio.com/',
};

admin.initializeApp(firebaseConfig);

const db = admin.firestore();
const collectionName = 'IBM-Datasheet';

// Twilio configuration
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('<h1>Oops! Something went wrong.</h1><p>We are working to fix it!</p>');
});

const importDataToFirebase = async () => {
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

    console.log('Data imported to Firebase successfully!');
  } catch (error) {
    console.error('Error importing data:', error);
    throw new Error('Error importing data');
  }
};

const sendSMS = async (message, phoneNumber) => {
  try {
    await twilioClient.messages.create({
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER,
      body: message,
    });

    console.log(`SMS sent to ${phoneNumber}: ${message}`);
  } catch (error) {
    console.error('Error sending SMS:', error);
  }
};

const checkAlertCondition = (currentVolume, thresholdVolume) => {
  return currentVolume > thresholdVolume;
};

app.get('/importData', async (req, res, next) => {
  try {
    await importDataToFirebase();
    res.status(200).send('<h1>Data Imported!</h1><p>Your data is now dancing in the clouds of Firebase!</p>');
  } catch (error) {
    next(error);
  }
});

app.get('/api/data', async (req, res, next) => {
  try {
    const snapshot = await db.collection(collectionName).get();
    const data = snapshot.docs.map((doc) => doc.data());
    res.json(data);
  } catch (error) {
    next(error);
  }
});

app.get('/graph', async (req, res, next) => {
  try {
    const snapshot = await db.collection(collectionName).get();
    const data = snapshot.docs.map((doc) => doc.data());

    // Extract relevant data for the bar graph
    const timestamps = data.map((record) => record.timestamp);
    const volumeData = data.map((record) => record.volume);

    // Simulate an alert scenario
    const thresholdVolume = 1000; // Replace with the desired threshold
    const interval = 2000; // 2 seconds gap
    const alertMessages = [];

    res.write('['); // Start of the JSON array

    for (let i = 0; i < volumeData.length; i++) {
      const currentVolume = volumeData[i];

      if (checkAlertCondition(currentVolume, thresholdVolume)) {
        const alertMessage = `Alert! Volume exceeded ${thresholdVolume}. Current Volume: ${currentVolume}`;
        alertMessages.push(alertMessage);
        console.log('Alert triggered:', alertMessage);
      }

      // Send data progressively with a 2-second gap
      setTimeout(() => {
        const responseData = {
          timestamp: timestamps[i],
          volume: volumeData[i],
        };

        res.write(JSON.stringify(responseData));

        if (i < volumeData.length - 1) {
          res.write(',');
        }
      }, i * interval);
    }

    res.write(']'); // End of the JSON array

    // After sending all data, close the response
    setTimeout(() => {
      res.end();
      
      // Send alert messages
      alertMessages.forEach(async (alertMessage) => {
        const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
        await sendSMS(alertMessage, phoneNumber);
      });
    }, volumeData.length * interval);

  } catch (error) {
    next(error);
  }
});

app.get('/', (req, res) => {
  res.send('<h1>Welcome to the IBM Market Data Wonderland!</h1><p>Explore /importData to bring data to life, /api/data to discover, and /graph to visualize the magical bar graph.</p>');
});

app.listen(port, () => {
  console.log(`🚀 Server is casting spells on http://localhost:${port}`);
});
