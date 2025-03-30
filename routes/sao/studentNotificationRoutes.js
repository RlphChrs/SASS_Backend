const express = require('express');
const router = express.Router();
const { respondToStudent } = require('../../controllers/sao/notificationResponseController');
const { authenticateSAO } = require('../../middlewares/saoAuthMiddleware');

router.post('/respond', authenticateSAO, respondToStudent);

module.exports = router;
