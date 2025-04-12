const { db, admin } = require('../../config/firebaseConfig');
const { Timestamp } = require('firebase-admin/firestore');

const submitReport = async (req, res) => {
  try {
    const { nameOfPerson, idNumberOfPerson, reason, description } = req.body;
    const { uid, firstName, lastName, schoolName } = req.user;
    const schoolId = schoolName;

    

    if (!nameOfPerson || !idNumberOfPerson || !reason || !description) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const studentName = `${firstName} ${lastName}`;
    const reportData = {
      studentId: uid,
      studentName,
      nameOfPerson,
      idNumberOfPerson,
      reason,
      description,
      dateSubmitted: admin.firestore.Timestamp.now(),
      schoolId
    };

    const reportRef = await db.collection('reports').add(reportData);

    const notification = {
      type: 'report',
      reportId: reportRef.id,
      studentName,
      reason,
      read: false,
      timestamp: Timestamp.now()
    };

    await db
      .collection('sao_notifications')
      .doc(schoolId)
      .collection('studentReports')
      .doc(reportRef.id)
      .set(notification);

    return res.status(201).json({ message: 'Report submitted successfully.' });
  } catch (err) {
    console.error('Submit Report Error:', err);
    res.status(500).json({ message: 'Failed to submit report.' });
  }
};

module.exports = { submitReport };
