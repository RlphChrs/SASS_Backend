const express = require('express');
const router = express.Router();
const { uploadStudentExcel, getUploadedStudents } = require('../../controllers/sao/studentMatchController');
const { authenticateSAO } = require('../../middlewares/saoAuthMiddleware');

router.post('/upload-excel', authenticateSAO, uploadStudentExcel);
router.get('/list/:schoolId', authenticateSAO, getUploadedStudents);

module.exports = router;
