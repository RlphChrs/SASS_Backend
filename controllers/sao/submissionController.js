const { db } = require('../../config/firebaseConfig');
const sendPushNotification = require('../../utils/sendPushNotification');

// Get all submissions
const getAllSubmissions = async (req, res) => {
  try {
    const { schoolId } = req.user; 

    const snapshot = await db
      .collection('submissions')
      .where('schoolName', '==', schoolId)
      .orderBy('timestamp', 'desc')
      .get();

    const submissions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

// Respond to a submission with feedback and push notification
const respondToSubmission = async (req, res) => {
  const { submissionId, feedback } = req.body;
  const { schoolId } = req.user;

  console.log("📥 Responding to submission ID:", submissionId);
  console.log("📝 Feedback:", feedback);

  if (!submissionId || typeof feedback !== 'string') {
    console.error("❌ Missing or invalid submissionId or feedback");
    return res.status(400).json({ error: 'Missing or invalid submissionId or feedback' });
  }

  try {
    const submissionRef = db.collection('submissions').doc(submissionId);
    const submissionSnap = await submissionRef.get();

    if (!submissionSnap.exists) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const submissionData = submissionSnap.data();
    const studentId = submissionData.studentUid;
    const timestamp = new Date();

    // Update submission
    await submissionRef.update({
      feedback,
      status: 'responded',
      feedbackTimestamp: timestamp
    });

    console.log("✅ Submission marked as responded in Firestore");

    // Log response in student_notifications
    const schoolDoc = await db.collection('users').doc(schoolId).get();
    const schoolName = schoolDoc.data()?.schoolName || 'SAO Admin';

    await db
      .collection('student_notifications')
      .doc(studentId)
      .collection('responses')
      .add({
        type: 'submission',
        from: schoolName,
        school: schoolId,
        subject: 'Submission Feedback',
        message: feedback,
        timestamp,
        seen: false
      });

    // Send push notification to student
    const studentDoc = await db.collection('students').doc(studentId).get();
    const fcmToken = studentDoc.data()?.fcmToken;

    if (fcmToken) {
      console.log(`📲 Sending push notification to student: ${studentId}`);

      await sendPushNotification(fcmToken, {
        title: 'SAO responded to your submission',
        body: feedback,
        data: {
          type: 'submission_response',
          submissionId,
          sender: schoolName
        }
      });

      console.log("✅ Push notification sent");
    } else {
      console.warn(`⚠️ No FCM token found for student ${studentId}`);
    }

    return res.status(200).json({ message: 'Feedback submitted and student notified.' });
  } catch (error) {
    console.error('❌ Error submitting feedback:', error);
    return res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

// Mark submission as viewed
const markSubmissionAsViewed = async (req, res) => {
  const { submissionId } = req.body;

  if (!submissionId) {
    return res.status(400).json({ message: 'Submission ID is required.' });
  }

  try {
    await db.collection('submissions').doc(submissionId).update({
      status: 'viewed',
    });

    return res.status(200).json({ message: 'Submission marked as viewed.' });
  } catch (error) {
    console.error('Error marking submission as viewed:', error);
    return res.status(500).json({ message: 'Failed to update submission status.' });
  }
};

module.exports = {
  getAllSubmissions,
  respondToSubmission,
  markSubmissionAsViewed
};
