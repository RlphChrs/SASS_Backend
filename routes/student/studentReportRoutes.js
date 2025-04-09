const express = require('express');
const router = express.Router();
const studentReportController = require('../../controllers/student/studentReportController');
const { authenticate } = require('../../middlewares/authMiddleware'); 

router.post('/submit', authenticate, studentReportController.submitReport);

module.exports = router;