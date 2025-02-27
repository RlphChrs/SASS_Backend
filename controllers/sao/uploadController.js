const { db, admin } = require('../../config/firebaseConfig');
const bucket = admin.storage().bucket();


const uploadFile = async (req, res) => {
    try {
        console.log("🔹 Received File:", req.file); 
        console.log("🔹 Received Body:", req.body);

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { uid, schoolId } = req.user; 
        const file = req.file;

        const fileName = `schools/${schoolId}/${Date.now()}_${file.originalname}`;
        const fileUpload = bucket.file(fileName);

        const stream = fileUpload.createWriteStream({
            metadata: { contentType: file.mimetype }
        });

        stream.on('error', (err) => res.status(500).json({ message: err.message }));

        stream.on('finish', async () => {
            await fileUpload.makePublic();
            const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

            await db.collection('uploads').add({
                schoolId,
                uploadedBy: uid,
                fileName: file.originalname,
                fileUrl,
                fileType: file.mimetype,
                uploadedAt: new Date()
            });

            res.status(201).json({ message: 'File uploaded successfully', fileUrl });
        });

        stream.end(file.buffer);
    } catch (error) {
        console.error("❌ Upload Error:", error.message);
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
};


/**
 * Get uploaded files for the logged-in SAO's school.
 */
const getUploadedFiles = async (req, res) => {
    try {
        const { schoolId } = req.user;

        const filesSnapshot = await db.collection('uploads').where('schoolId', '==', schoolId).get();
        const files = filesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve files', error: error.message });
    }
};

module.exports = { uploadFile, getUploadedFiles };