const { db } = require('../../config/firebaseConfig');

// Get only student submission notifications
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
    console.error('Error fetching submission notifications:', error);
    res.status(500).json({ message: 'Failed to fetch submission notifications' });
  }
};

// Get only appointment booking notifications
const getAppointmentNotifications = async (req, res) => {
  try {
    const schoolName = req.user.schoolId;

    const snapshot = await db
      .collection('notifications')
      .doc(schoolName)
      .collection('appointmentBookings')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching appointment notifications:', error);
    res.status(500).json({ message: 'Failed to fetch appointment notifications' });
  }
};

// Get all SAO-related notifications combined
const getSAONotifications = async (req, res) => {
  try {
    const schoolName = req.user.schoolId;

    const [submissionSnap, appointmentSnap] = await Promise.all([
      db.collection('notifications')
        .doc(schoolName)
        .collection('studentSubmissions')
        .get(),

      db.collection('notifications')
        .doc(schoolName)
        .collection('appointmentBookings')
        .get()
    ]);

    const submissionNotifs = submissionSnap.docs.map(doc => ({
      id: doc.id,
      type: 'submission',
      schoolId: schoolName, 
      ...doc.data()
    }));
    
    const appointmentNotifs = appointmentSnap.docs.map(doc => ({
      id: doc.id,
      type: 'appointment',
      schoolId: schoolName, 
      ...doc.data()
    }));

    const allNotifs = [...submissionNotifs, ...appointmentNotifs].sort(
      (a, b) => b.timestamp?.seconds - a.timestamp?.seconds
    );

    res.status(200).json({ notifications: allNotifs });
  } catch (error) {
    console.error('Error fetching SAO notifications:', error);
    res.status(500).json({ message: 'Failed to fetch SAO notifications' });
  }
};

const markNotificationAsRead = async (req, res) => {
  const { schoolId } = req.user;
  const { type, id } = req.body; // type = "studentSubmissions" or "appointmentBookings"

  if (!type || !id) {
    return res.status(400).json({ message: 'Missing type or id.' });
  }

  try {
    const ref = db.collection('notifications')
      .doc(schoolId)
      .collection(type)
      .doc(id);

    await ref.update({ read: true });

    res.status(200).json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to update notification.' });
  }
};

module.exports = { getSubmissionNotifications, getAppointmentNotifications, getSAONotifications, markNotificationAsRead };
