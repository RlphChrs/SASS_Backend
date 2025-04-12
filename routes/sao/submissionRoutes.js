const express = require('express');
const router = express.Router();

const { getAllSubmissions, respondToSubmission, markSubmissionAsViewed } = require('../../controllers/sao/submissionController');
const { authenticateSAO } = require('../../middlewares/saoAuthMiddleware');

router.get('/', authenticateSAO, getAllSubmissions);
router.post('/respond', authenticateSAO, respondToSubmission);
router.post('/submissions/mark-viewed', authenticateSAO, markSubmissionAsViewed);


module.exports = router;
