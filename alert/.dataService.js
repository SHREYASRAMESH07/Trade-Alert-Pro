// dataService.js
const admin = require('firebase-admin');
const xlsx = require('xlsx');

function initializeFirebase() {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://tradealertprok-default-rtdb.firebaseio.com/', // Replace with your Firebase project URL
  });
}

async function importData(filePath, collectionName) {
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const batch = admin.firestore().batch();
    const collectionRef = admin.firestore().collection(collectionName);

    data.forEach((record) => {
      const newDocRef = collectionRef.doc();
      batch.set(newDocRef, record);
    });

    await batch.commit();

    return 'Data imported to Firebase successfully!';
  } catch (error) {
    console.error('Error importing data:', error);
    throw new Error('Failed to import data to Firebase');
  }
}

async function fetchData(collectionName) {
  try {
    const snapshot = await admin.firestore().collection(collectionName).get();
    const data = [];

    snapshot.forEach((doc) => {
      data.push(doc.data());
    });

    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch data');
  }
}

module.exports = { initializeFirebase, importData, fetchData };
