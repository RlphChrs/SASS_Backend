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

// Get only appointment booking notifications (excluding expired)
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

    const now = new Date();

    const notifications = snapshot.docs.map(doc => {
      const data = doc.data();
      const endTime = new Date(`${data.date}T${data.toTime}`);
      console.log(`📅 Checking individual appointment "${doc.id}" => Ends: ${endTime}, Now: ${now}`);
      if (endTime <= now) return null;
      return {
        id: doc.id,
        ...data,
        status: 'pending',
      };
    }).filter(n => n !== null);

    console.log(`📤 Appointments returned to client: ${notifications.length}`);
    res.status(200).json({ notifications });
  } catch (error) {
    console.error('Error fetching appointment notifications:', error);
    res.status(500).json({ message: 'Failed to fetch appointment notifications' });
  }
};

// Get all notifications, hiding responded and expired ones
const getSAONotifications = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    console.log("📥 Fetching SAO notifications for:", schoolId);

    const [submissionSnap, reportSnap] = await Promise.all([
      db.collection('notifications').doc(schoolId).collection('studentSubmissions').get(),
      db.collection('sao_notifications').doc(schoolId).collection('studentReports').get()
    ]);

    const now = new Date();

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
        const reportId = doc.data().reportId || doc.id;
        const report = await db.collection('reports').doc(reportId).get();
    
        if (!report.exists) {
          console.warn(`🚫 Report does not exist: ${reportId}`);
          return null;
        }
    
        const status = report.data().status;
    
        if (status?.toLowerCase() === 'responded') {
          console.log(`🔕 Report "${reportId}" is responded, skipping`);
          return null;
        }
    
        return {
          id: doc.id,
          type: 'report',
          schoolId,
          ...doc.data(),
        };
      })
    );

    const appointmentQuery = await db.collection('appointments')
      .where('schoolId', '==', schoolId)
      .get();

    const appointmentNotifs = appointmentQuery.docs.map(doc => {
      const data = doc.data();
      const { date, fromTime } = data;

      if (!date || !fromTime) {
        console.warn(`⚠️ Missing date or fromTime in appointment "${doc.id}"`);
        return null;
      }

      const startTime = new Date(`${date}T${fromTime}:00`);
      if (isNaN(startTime)) {
        console.warn(`❌ Invalid date format in appointment "${doc.id}"`);
        return null;
      }

      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

      if (endTime <= now) return null;

      const appointmentNotif = {
        id: doc.id,
        type: 'appointment',
        schoolId,
        ...data,
        status: 'pending',
      };

      console.log("📌 Valid Appointment Notification:", appointmentNotif);
      return appointmentNotif;
    }).filter(n => n !== null);

    console.log("📋 Final appointment notifications to merge:", appointmentNotifs.length);

    const allNotifs = [...submissionNotifs, ...appointmentNotifs, ...reportNotifs]
      .filter(n => n !== null && (n.timestamp?.seconds || n.timestamp))
      .sort((a, b) => {
        const tsA = a.timestamp?.seconds || new Date(a.timestamp).getTime() / 1000;
        const tsB = b.timestamp?.seconds || new Date(b.timestamp).getTime() / 1000;
        return tsB - tsA;
      });

    console.log(`✅ Returning ${allNotifs.length} notifications`);
    res.status(200).json({ notifications: allNotifs });

  } catch (error) {
    console.error('❌ Error fetching SAO notifications:', error);
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

  const targetCollection =
    type === 'report' ? 'studentReports' :
    type === 'appointment' ? 'appointmentBookings' :
    'studentSubmissions';

  const collectionPath = type === 'report' ? 'sao_notifications' : 'notifications';

  try {
    const ref = db
      .collection(collectionPath)
      .doc(schoolId)
      .collection(targetCollection)
      .doc(id);

    const doc = await ref.get();

    if (!doc.exists) {
      console.warn(`⚠️ Notification not found: ${collectionPath}/${schoolId}/${targetCollection}/${id}`);
      return res.status(404).json({ message: 'Notification not found.' });
    }

    await ref.update({ read: true });
    console.log(`✅ Notification marked as read: ${type} | ${id}`);
    return res.status(200).json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    return res.status(500).json({ message: 'Failed to update notification.' });
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

module.exports = { getSubmissionNotifications, getAppointmentNotifications, getSAONotifications, markNotificationAsRead, getReportNotifications, getReportById };
