const { db } = require('../../config/firebaseConfig');

const getSubmissionNotifications = async (req, res) => {
  try {
    const schoolName = req.user.schoolId;

    const snapshot = await db
      .collection('notifications')
      .doc(schoolName)
      .collection('studentSubmissions')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications' });
  }
};

module.exports = { getSubmissionNotifications };
