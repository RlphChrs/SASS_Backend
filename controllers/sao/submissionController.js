const { db } = require('../../config/firebaseConfig');


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
  try {
    await db.collection('submissions').doc(submissionId).update({
      feedback,
      status: 'reviewed',
      feedbackTimestamp: new Date()
    });
    res.status(200).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

module.exports = {
  getAllSubmissions,
  respondToSubmission
};
