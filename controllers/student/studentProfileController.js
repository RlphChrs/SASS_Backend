const { db } = require('../../config/firebaseConfig');

const getStudentProfile = async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.uid;
    const schoolId = req.user.schoolId || req.user.schoolName;

    if (!schoolId || !studentId) {
      return res.status(400).json({ error: "Missing schoolId or studentId." });
    }

    const docRef = db
      .collection('uploaded_students')
      .doc(schoolId)
      .collection('records')
      .doc(studentId);

    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Profile not found in uploaded records.' });
    }

    const profile = docSnap.data();

    console.log(`✅ Profile fetched for student ${studentId} from school ${schoolId}`);
    res.status(200).json(profile);
  } catch (error) {
    console.error('❌ Error fetching student profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

module.exports = { getStudentProfile };
