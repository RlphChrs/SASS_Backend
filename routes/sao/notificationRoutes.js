const express = require('express');
const router = express.Router();
const { authenticateSAO } = require('../../middlewares/saoAuthMiddleware');

const { getSubmissionNotifications, getAppointmentNotifications, getSAONotifications, markNotificationAsRead } = require('../../controllers/sao/notificationController');


router.get('/notifications', authenticateSAO, getSubmissionNotifications);
router.get('/notifications/appointments', authenticateSAO, getAppointmentNotifications);
router.get('/notifications/all', authenticateSAO, getSAONotifications);
router.post('/notifications/mark-read', authenticateSAO, markNotificationAsRead);

module.exports = router;
