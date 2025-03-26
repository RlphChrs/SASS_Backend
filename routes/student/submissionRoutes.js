const express = require('express');
const router = express.Router();
const { submitFile } = require('../../controllers/student/submissionController');
const { authenticate } = require('../../middlewares/authMiddleware');

router.post('/submit', authenticate, submitFile);

module.exports = router;
