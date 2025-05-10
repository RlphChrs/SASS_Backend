const express = require('express');
const router = express.Router();
const { authenticateSAO } = require('../../middlewares/saoAuthMiddleware');
const { getRegisteredUsersStats } = require('../../controllers/sao/saoStatsController');

router.get('/registered-users', authenticateSAO, getRegisteredUsersStats);

module.exports = router;
