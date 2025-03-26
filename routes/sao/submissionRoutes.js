const express = require('express');
const router = express.Router();

const { getAllSubmissions, respondToSubmission } = require('../../controllers/sao/submissionController');
const { authenticateSAO } = require('../../middlewares/saoAuthMiddleware');

router.get('/', authenticateSAO, getAllSubmissions);
router.post('/respond', authenticateSAO, respondToSubmission);

module.exports = router;
