const express = require('express');
const router = express.Router();
const { authenticateSAO } = require('../../middlewares/saoAuthMiddleware');

const { getSubmissionNotifications } = require('../../controllers/sao/notificationController');

router.get('/notifications', authenticateSAO, getSubmissionNotifications);


module.exports = router;
