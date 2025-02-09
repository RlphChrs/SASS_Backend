const admin = require('firebase-admin');
const serviceAccount = require('./firebaseConfig.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sass-database.firebaseapp.com" 
});

const db = admin.firestore();

module.exports = { admin };
