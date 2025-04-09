const express = require('express');
const router = express.Router();
const { authenticateSAO } = require('../../middlewares/saoAuthMiddleware');
const { respondToReport } = require('../../controllers/sao/reportResponseController');

router.post('/respond-report', authenticateSAO, respondToReport);

module.exports = router;
