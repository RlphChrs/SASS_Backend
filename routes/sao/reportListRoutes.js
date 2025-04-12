const express = require('express');
const router = express.Router();
const { authenticateSAO } = require('../../middlewares/saoAuthMiddleware');
const { getAllReports } = require('../../controllers/sao/reportListController');

router.get('/reports', authenticateSAO, getAllReports);

module.exports = router;
