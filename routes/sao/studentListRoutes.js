const express = require('express');
const router = express.Router();
const { fetchStudentsBySchool } = require('../../controllers/sao/studentListController');
const { authenticateSAO } = require('../../middlewares/saoAuthMiddleware');

router.get('/students/list', authenticateSAO, fetchStudentsBySchool);

module.exports = router;
