const { admin, db } = require('../../config/firebaseConfig');
const { getStudentById } = require('../../model/studentModel');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const os = require('os');
const fs = require('fs');

const uploadFileForStudent = async (req, res) => {
    const studentUid = req.user.uid;

    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        const studentDoc = await db.collection('students').doc(studentUid).get();
        if (!studentDoc.exists) {
            return res.status(404).json({ message: 'Student not found in Firestore.' });
        }

        const studentData = studentDoc.data();
        const bucket = admin.storage().bucket();
        const file = req.file;
        const tempFilePath = path.join(os.tmpdir(), file.originalname);

        // Write file to temp storage
        fs.writeFileSync(tempFilePath, file.buffer);

        const destination = `student_uploads/${studentUid}/${Date.now()}_${file.originalname}`;
        await bucket.upload(tempFilePath, {
            destination,
            metadata: {
                contentType: file.mimetype,
            },
        });

        const fileRef = bucket.file(destination);
        const [url] = await fileRef.getSignedUrl({
            action: 'read',
            expires: '03-01-2030',
        });

        // Clean up temp file
        fs.unlinkSync(tempFilePath);

        return res.status(200).json({
            message: 'File uploaded successfully',
            fileUrl: url,
        });

    } catch (error) {
        console.error('Student file upload error:', error);
        return res.status(500).json({ message: 'Failed to upload file' });
    }
};

module.exports = {
    uploadFileForStudent
};
