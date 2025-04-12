const { db } = require('../../config/firebaseConfig');

// Get all submissions
const getAllSubmissions = async (req, res) => {
  try {
    const snapshot = await db.collection('submissions').orderBy('timestamp', 'desc').get();
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

// Respond to a submission
const respondToSubmission = async (req, res) => {
  const { submissionId, feedback } = req.body;

  console.log("📥 Responding to submission ID:", submissionId);
  console.log("📝 Feedback:", feedback);

  // Defensive check
  if (!submissionId || typeof feedback !== 'string') {
    console.error("❌ Missing or invalid submissionId or feedback");
    return res.status(400).json({ error: 'Missing or invalid submissionId or feedback' });
  }

  try {
    await db.collection('submissions').doc(submissionId).update({
      feedback,
      status: 'responded',
      feedbackTimestamp: new Date()
    });

    console.log("✅ Submission marked as responded in Firestore");
    res.status(200).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('❌ Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
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

module.exports = { getAllSubmissions, respondToSubmission, markSubmissionAsViewed };
