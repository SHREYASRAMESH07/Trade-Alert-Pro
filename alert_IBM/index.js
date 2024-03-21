const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendEmailAlert = functions.firestore
  .document('IBM-Datasheet/{documentId}')
  .onCreate(async (snapshot, context) => {
    const data = snapshot.data();
    const thresholdValue = 100; // Example threshold value

    if (data.volume >= thresholdValue) {
      // Implement your email alert logic here
      console.log('Email alert sent.');
    }
  });
