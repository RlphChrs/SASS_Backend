const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middlewares/authMiddleware');
const { getStudentResponses } = require('../../controllers/student/studentNotificationController');

router.get('/responses', authenticate, getStudentResponses);

module.exports = router;
