const { db } = require('../../config/firebaseConfig');

const respondToStudent = async (req, res) => {
  const { studentId, studentName, subject, message } = req.body;
  const { firstName, lastName, schoolId } = req.user;

  if (!studentId || !subject || !message) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const timestamp = new Date();

    await db
      .collection('student_notifications')
      .doc(studentId)
      .collection('responses')
      .add({
        from: `${firstName} ${lastName}`,
        school: schoolId,
        subject,
        message,
        timestamp,
        seen: false
      });

    return res.status(200).json({ message: 'Response sent successfully.' });
  } catch (error) {
    console.error('Error sending student response:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { respondToStudent };
