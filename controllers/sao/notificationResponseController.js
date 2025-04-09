const { db } = require('../../config/firebaseConfig');
const sendPushNotification = require('../../utils/sendPushNotification');

const respondToStudent = async (req, res) => {
  const { studentId, studentName, subject, message } = req.body;
  const { schoolId } = req.user;

  if (!studentId || !subject || !message) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const timestamp = new Date();

    // 🔍 Fetch school name for consistency
    const schoolDoc = await db.collection('users').doc(schoolId).get();
    const schoolName = schoolDoc.data()?.schoolName || 'SAO Admin';

    // 💾 Save to Firestore
    await db
      .collection('student_notifications')
      .doc(studentId)
      .collection('responses')
      .add({
        type: 'submission',
        from: schoolName,
        school: schoolId,
        subject,
        message,
        timestamp,
        seen: false
      });

    // 🔔 Send Push Notification
    const studentDoc = await db.collection('students').doc(studentId).get();
    const fcmToken = studentDoc.data()?.fcmToken;

    if (fcmToken) {
      console.log(`📲 Sending push notification to ${studentId} (${studentName})`);

      await sendPushNotification(fcmToken, {
        title: 'SAO responded to your submission',
        body: `${subject} - ${message}`,
        data: {
          type: 'submission_response',
          studentId,
          subject,
          message,
          sender: schoolName
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
