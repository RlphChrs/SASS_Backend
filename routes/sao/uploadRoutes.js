const express = require('express');
const multer = require('multer');
const { uploadFile, getUploadedFiles, deleteFile } = require('../../controllers/sao/uploadController');
const { authenticate } = require('../../middlewares/authMiddleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', authenticate, upload.single('File'), uploadFile); // ✅ Ensure 'File' matches frontend key
router.get('/files', authenticate, getUploadedFiles);
router.delete('/delete-file', authenticate, deleteFile);

module.exports = router;
