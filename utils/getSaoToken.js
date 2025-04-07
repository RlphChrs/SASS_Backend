const { db } = require('../config/firebaseConfig');

exports.getSAOToken = async (schoolId) => {
  try {
    const snapshot = await db
      .collection('users')
      .where('role', '==', 'sao')
      .where('schoolId', '==', schoolId)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const sao = snapshot.docs[0].data();
      return sao.fcmToken || null;
    }

    return null;
  } catch (err) {
    console.error('Error retrieving SAO token:', err);
    return null;
  }
};
