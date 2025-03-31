const { db, admin } = require('../../config/firebaseConfig');
const { getStudentFcmToken } = require('../../model/studentModel'); 
const sendPushNotification = require('../../utils/sendPushNotification'); // ✅ Add this line


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

    const studentDoc = await db.collection('students').doc(studentId).get();
    const studentData = studentDoc.data();
    const fcmToken = studentData?.fcmToken;

    if (fcmToken) {
      console.log(`📲 Sending push notification to ${studentId} (${studentName})`);

      await sendPushNotification(fcmToken, {
        title: `New Response from ${schoolId}`,
        body: `${subject} - ${message.substring(0, 40)}...`,
        data: {
          studentId,
          subject,
          message
        }
      });
    } else {
      console.warn(`⚠️ No FCM token found for student ${studentId}`);
    }

    return res.status(200).json({ message: 'Response sent successfully.' });
  } catch (error) {
    console.error('Error sending student response:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = { respondToStudent };