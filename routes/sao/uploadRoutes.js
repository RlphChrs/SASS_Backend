const express = require('express');
const multer = require('multer');
const { uploadFile, getUploadedFiles, deleteFile } = require('../../controllers/sao/uploadController');
const { authenticateSAO } = require('../../middlewares/saoAuthMiddleware'); // ✅ FIXED NAME

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', authenticateSAO, upload.single('File'), uploadFile);
router.get('/files', authenticateSAO, getUploadedFiles);
router.delete('/delete-file', authenticateSAO, deleteFile);

module.exports = router;
