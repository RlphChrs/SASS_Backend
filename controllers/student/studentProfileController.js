const { db } = require('../../config/firebaseConfig');

// PUT /api/students/update-profile
const updateStudentProfile = async (req, res) => {
  try {
    const studentId = req.user.uid; // ✅ Comes from your custom authMiddleware
    const { course, year, section } = req.body;

    // ✅ Check that at least one field is provided
    if (!course && !year && !section) {
      return res.status(400).json({ error: 'Please provide at least one field to update.' });
    }

    const updates = {};
    if (course) updates.course = course;
    if (year) updates.year = year;
    if (section) updates.section = section;

    const studentRef = db.collection('students').doc(studentId);
    await studentRef.update(updates);

    console.log(`✅ Student ${studentId} profile updated with:`, updates);
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('❌ Error updating student profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = { updateStudentProfile };
