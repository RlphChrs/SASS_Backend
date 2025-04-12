const { db } = require('../../config/firebaseConfig');

// Get only student submission notifications (excluding responded)
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

    const rawNotifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const filtered = await Promise.all(
      rawNotifications.map(async (notif) => {
        const subDoc = await db.collection('submissions').doc(notif.id).get();
        return subDoc.exists && subDoc.data().status !== 'responded' ? notif : null;
      })
    );

    const notifications = filtered.filter(n => n !== null);
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

// Get all notifications, hiding responded submissions and reports
const getSAONotifications = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;

    const [submissionSnap, appointmentSnap, reportSnap] = await Promise.all([
      db.collection('notifications').doc(schoolId).collection('studentSubmissions').get(),
      db.collection('notifications').doc(schoolId).collection('appointmentBookings').get(),
      db.collection('sao_notifications').doc(schoolId).collection('studentReports').get()
    ]);

    const submissionNotifs = await Promise.all(
      submissionSnap.docs.map(async doc => {
        const submission = await db.collection('submissions').doc(doc.id).get();
        if (!submission.exists || submission.data().status === 'responded') return null;
        return {
          id: doc.id,
          type: 'submission',
          schoolId,
          submissionId: doc.id,
          ...doc.data()
        };
      })
    );

    const reportNotifs = await Promise.all(
      reportSnap.docs.map(async doc => {
        const report = await db.collection('reports').doc(doc.id).get();
        if (!report.exists || report.data().status === 'responded') return null;
        return {
          id: doc.id,
          type: 'report',
          schoolId,
          ...doc.data()
        };
      })
    );

    const appointmentNotifs = appointmentSnap.docs.map(doc => ({
      id: doc.id,
      type: 'appointment',
      schoolId,
      ...doc.data()
    }));

    const allNotifs = [...submissionNotifs, ...appointmentNotifs, ...reportNotifs]
    .filter(n => n !== null && n.timestamp?.seconds)
    .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);


    res.status(200).json({ notifications: allNotifs });
  } catch (error) {
    console.error('Error fetching SAO notifications:', error);
    res.status(500).json({ message: 'Failed to fetch SAO notifications' });
  }
};

// Mark a notification as read
const markNotificationAsRead = async (req, res) => {
  const { schoolId } = req.user;
  const { type, id } = req.body;

  if (!type || !id) {
    return res.status(400).json({ message: 'Missing type or id.' });
  }

  let targetCollection = type === 'report' ? 'studentReports' : type === 'appointment' ? 'appointmentBookings' : 'studentSubmissions';
  let collectionPath = type === 'report' ? 'sao_notifications' : 'notifications';

  try {
    const ref = db.collection(collectionPath).doc(schoolId).collection(targetCollection).doc(id);
    await ref.update({ read: true });
    res.status(200).json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to update notification.' });
  }
};

// Get report notifications only (excluding responded)
const getReportNotifications = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;

    const snapshot = await db
      .collection('sao_notifications')
      .doc(schoolId)
      .collection('studentReports')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    const raw = snapshot.docs.map(doc => ({ id: doc.id, type: 'report', schoolId, ...doc.data() }));

    const filtered = await Promise.all(
      raw.map(async (notif) => {
        const report = await db.collection('reports').doc(notif.id).get();
        return report.exists && report.data().status !== 'responded' ? notif : null;
      })
    );

    const notifications = filtered.filter(n => n !== null);
    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching report notifications:', error);
    res.status(500).json({ message: 'Failed to fetch report notifications' });
  }
};

// Fetch full report by ID
const getReportById = async (req, res) => {
  try {
    const reportId = req.params.reportId;

    const reportDoc = await db.collection('reports').doc(reportId).get();

    if (!reportDoc.exists) {
      return res.status(404).json({ message: 'Report not found' });
    }

    return res.status(200).json({ report: { id: reportDoc.id, ...reportDoc.data() } });
  } catch (error) {
    console.error('Error fetching report by ID:', error);
    return res.status(500).json({ message: 'Failed to fetch report' });
  }
};

module.exports = {
  getSubmissionNotifications,
  getAppointmentNotifications,
  getSAONotifications,
  markNotificationAsRead,
  getReportNotifications,
  getReportById
};
