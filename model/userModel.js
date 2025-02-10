const { db } = require('../config/firebaseConfig');
const bcrypt = require('bcryptjs');

const createUser = async (userId, email, password, role, schoolId, firstName, lastName) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.collection('users').doc(userId).set({
    userId,
    email,
    password: hashedPassword,
    role,
    schoolId,
    firstName,
    lastName,
    createdAt: new Date()
  });
};

const getUserById = async (userId) => {
  const userDoc = await db.collection('users').doc(userId).get();
  return userDoc.exists ? userDoc.data() : null;
};

const getUserByEmail = async (email) => {
  const userSnapshot = await db.collection('users').where('email', '==', email).get();
  return userSnapshot.empty ? null : userSnapshot.docs[0].data();
};

module.exports = { createUser, getUserById, getUserByEmail };