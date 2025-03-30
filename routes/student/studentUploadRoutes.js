const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate } = require('../../middlewares/authMiddleware');
const { uploadFileForStudent } = require('../../controllers/student/uploadController');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', authenticate, upload.single('File'), uploadFileForStudent);

module.exports = router;
