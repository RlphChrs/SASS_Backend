const { db } = require('../../config/firebaseConfig');

exports.fetchStudentsBySchool = async (req, res) => {
  const schoolId = req.user.schoolId;

  try {
    const snapshot = await db
      .collection('uploaded_students')
      .doc(schoolId)
      .collection('records')
      .where('registered', '==', true)
      .get();

    const students = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({ success: true, students });
  } catch (error) {
    console.error('❌ Failed to fetch registered students:', error);
    res.status(500).json({ success: false, message: 'Unable to retrieve registered students.' });
  }
};
