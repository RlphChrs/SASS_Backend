const { admin, db } = require('../../config/firebaseConfig');
const path = require('path');
const os = require('os');
const fs = require('fs');

const uploadFileForStudent = async (req, res) => {
  const studentUid = req.user.uid;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const studentDoc = await db.collection('students').doc(studentUid).get();
    if (!studentDoc.exists) {
      return res.status(404).json({ message: 'Student not found in Firestore.' });
    }

    const studentData = studentDoc.data();
    const fullName = `${studentData.firstName} ${studentData.lastName}`;
    const studentId = studentData.studentId;
    const schoolName = studentData.schoolName;
    const submissionTime = new Date();

    // Upload to Firebase Storage
    const bucket = admin.storage().bucket();
    const file = req.file;
    const tempFilePath = path.join(os.tmpdir(), file.originalname);

    fs.writeFileSync(tempFilePath, file.buffer);

    const destination = `student_uploads/${studentUid}/${Date.now()}_${file.originalname}`;
    await bucket.upload(tempFilePath, {
      destination,
      metadata: {
        contentType: file.mimetype,
      },
    });

    const fileRef = bucket.file(destination);
    const [url] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-01-2030',
    });

    fs.unlinkSync(tempFilePath); // Clean up local temp file

    // 🔥 Save submission in Firestore
    const submissionData = {
      studentUid,
      studentId,
      studentName: fullName,
      fileUrl: url,
      fileName: file.originalname,
      reason: req.body.reason || 'No reason provided',
      date: submissionTime.toLocaleDateString('en-GB'),
      time: submissionTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: submissionTime,
      status: 'pending',
      feedback: null,
      feedbackTimestamp: null,
      schoolName // ✅ Required for SAO filtering
    };

    const docRef = await db.collection('submissions').add(submissionData);

    // 🔔 Notify SAO
    const notificationRef = db
      .collection('notifications')
      .doc(schoolName)
      .collection('studentSubmissions')
      .doc(docRef.id);

    await notificationRef.set({
      studentId,
      studentName: fullName,
      fileName: file.originalname,
      fileUrl: url,
      reason: req.body.reason || 'No reason provided',
      timestamp: submissionTime,
      seen: false
    });

    return res.status(200).json({
      message: 'File submitted successfully',
      submissionId: docRef.id
    });

  } catch (error) {
    console.error('Student file upload error:', error);
    return res.status(500).json({ message: 'Failed to upload and save file' });
  }
};

module.exports = {
  uploadFileForStudent
};
