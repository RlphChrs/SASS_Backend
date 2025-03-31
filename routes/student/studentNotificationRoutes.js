const { db } = require('../../config/firebaseConfig');
const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/authMiddleware');
const { getStudentResponses } = require('../../controllers/student/studentNotificationController');

router.get('/responses', authenticate, getStudentResponses);

router.post('/update-token', authenticate, async (req, res) => {
    const { fcmToken } = req.body;
    const studentId = req.user.uid;
  
    if (!fcmToken) {
      return res.status(400).json({ message: "FCM token is required" });
    }
  
    try {
      await db.collection('students').doc(studentId).update({ fcmToken });
      return res.status(200).json({ message: 'FCM token updated' });
    } catch (error) {
      console.error("Error saving FCM token:", error);
      return res.status(500).json({ message: 'Failed to save FCM token' });
    }
  });
  

module.exports = router;
