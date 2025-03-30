const { db } = require('../../config/firebaseConfig');

const getStudentResponses = async (req, res) => {
  const studentId = req.user.uid;

  try {
    const snapshot = await db
      .collection('student_notifications')
      .doc(studentId)
      .collection('responses')
      .orderBy('timestamp', 'desc')
      .get();

    const responses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ responses });
  } catch (error) {
    console.error('Error fetching student responses:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

module.exports = { getStudentResponses };
