const { db } = require('../../config/firebaseConfig');

const submitFile = async (req, res) => {
    const { fileUrl, fileName, reason } = req.body;
    const studentUid = req.user.uid;
  
    try {
      // Get student details from Firestore
      const studentDoc = await db.collection('students').doc(studentUid).get();
  
      if (!studentDoc.exists) {
        return res.status(404).json({ error: 'Student profile not found' });
      }
  
      const studentData = studentDoc.data();
  
      const fullName = `${studentData.firstName} ${studentData.lastName}`;
      const studentId = studentData.studentId;
      const submissionTime = new Date();
  
      const submissionData = {
        studentUid,
        studentId,
        studentName: fullName,
        fileUrl,
        fileName,
        reason,
        date: submissionTime.toLocaleDateString('en-GB'), // DD/MM/YYYY
        time: submissionTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: submissionTime,
        status: 'pending',
        feedback: null,
        feedbackTimestamp: null
      };
  
      const docRef = await db.collection('submissions').add(submissionData);
  
      res.status(200).json({ message: 'File submitted successfully', submissionId: docRef.id });
    } catch (error) {
      console.error('Error submitting file:', error);
      res.status(500).json({ error: 'Failed to submit file' });
    }
  };
  

module.exports = {
  submitFile
};
