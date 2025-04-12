const { db } = require('../../config/firebaseConfig');

exports.fetchStudentsBySchool = async (req, res) => {
  const schoolName = req.user.schoolId;

  try {
    const snapshot = await db.collection('students')
      .where('schoolName', '==', schoolName)
      .get();

    const students = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ success: true, students });
  } catch (error) {
    console.error('Failed to fetch students:', error);
    res.status(500).json({ success: false, message: 'Unable to retrieve students.' });
  }
};
