const express = require('express');
const router = express.Router();
const { authenticateSAO } = require('../../middlewares/saoAuthMiddleware');
const { respondToSubmission } = require('../../controllers/sao/submissionController');

const { getSubmissionNotifications, getAppointmentNotifications, getSAONotifications, markNotificationAsRead, getReportNotifications, getReportById} 
        = require('../../controllers/sao/notificationController');


router.get('/notifications', authenticateSAO, getSubmissionNotifications);
router.get('/notifications/appointments', authenticateSAO, getAppointmentNotifications);
router.get('/notifications/all', authenticateSAO, getSAONotifications);
router.post('/notifications/mark-read', authenticateSAO, markNotificationAsRead);
router.get('/notifications/reports', authenticateSAO, getReportNotifications);
router.get('/reports/:reportId', authenticateSAO, getReportById);
router.post('/notifications/respond', authenticateSAO, respondToSubmission);

module.exports = router;
