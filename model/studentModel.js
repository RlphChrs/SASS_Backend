const { db } = require('../config/firebaseConfig');
const bcrypt = require('bcryptjs');

const createStudent = async (userId, email, password, firstName, lastName) => {
  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
  await db.collection('students').doc(userId).set({
    userId,
    email,
    password: hashedPassword,
    role: 'Student',
    firstName,
    lastName,
    createdAt: new Date()
  });
};

const getStudentByEmail = async (email) => {
  const studentSnapshot = await db.collection('students').where('email', '==', email).get();
  return studentSnapshot.empty ? null : studentSnapshot.docs[0].data();
};

module.exports = { createStudent, getStudentByEmail };