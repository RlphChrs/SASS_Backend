const { db } = require('../config/firebaseConfig');

const addUser = async (user) => {
  await db.collection('users').doc(user.uid).set(user);
};

const getUserByEmail = async (email) => {
  const snapshot = await db.collection('users').where('email', '==', email).get();
  if (snapshot.empty) return null;
  return snapshot.docs[0].data();
};

module.exports = { addUser, getUserByEmail };
