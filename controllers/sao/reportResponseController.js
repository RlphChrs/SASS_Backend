const { db } = require('../../config/firebaseConfig');
const sendPushNotification = require('../../utils/sendPushNotification');

const respondToReport = async (req, res) => {
  try {
    const { studentId, studentName, subject, message, reportId } = req.body;
    const schoolId = req.user.schoolId;

    if (!studentId || !subject || !message || !reportId) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // 🔍 Fetch school name
    const schoolDoc = await db.collection('users').doc(schoolId).get();
    const schoolName = schoolDoc.data()?.schoolName || 'SAO Admin';

    // 💾 Save response in Firestore (student_notifications)
    await db
      .collection('student_notifications')
      .doc(studentId)
      .collection('responses')
      .add({
        type: 'report',
        studentId,
        subject,
        message,
        from: schoolName,
        timestamp: new Date(),
      });

    // ✅ Mark the sao notification as read
    await db
      .collection('sao_notifications')
      .doc(schoolId)
      .collection('studentReports')
      .doc(reportId)
      .update({ read: true });

    // ✅ NEW: Update report status in main `reports` collection
    await db.collection('reports').doc(reportId).update({
      status: 'Responded',
      respondedAt: new Date()
    });

    // 🔔 Send Push Notification to student
    const studentDoc = await db.collection('students').doc(studentId).get();
    const fcmToken = studentDoc.data()?.fcmToken;

    if (fcmToken) {
      await sendPushNotification(fcmToken, {
        title: 'SAO responded to your report',
        body: `${subject} - ${message}`,
        data: {
          type: 'report_response',
          studentId,
          subject,
          message,
          sender: schoolName
        }
      });
    }

    return res.status(200).json({ message: 'Response sent and report updated.' });
  } catch (error) {
    console.error('❌ Error responding to report:', error.message);
    return res.status(500).json({ message: 'Failed to respond to report.' });
  }
};

module.exports = { respondToReport };
