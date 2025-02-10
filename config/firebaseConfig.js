var admin = require("firebase-admin");

const serviceAccount = require('./firebaseConfig.json'); 


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sass-db-946b7-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const db = admin.firestore();
module.exports = { admin, db };