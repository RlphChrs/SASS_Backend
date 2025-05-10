const { db, admin } = require('../../config/firebaseConfig');
const { watchFileUpload } = require('../../config/fileWatcher');
const axios = require("axios");

const bucket = admin.storage().bucket();

const uploadFile = async (req, res) => {
    try {
        console.log("🔹 Received File:", req.file);
        console.log("🔹 Received Body:", req.body);

        if (!req.file) {
            console.error("❌ No file received in request");
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        const { uid, schoolId } = req.user;
        const file = req.file;

        const fileName = `schools/${schoolId}/pdfs/${Date.now()}_${file.originalname}`;
        const fileUpload = bucket.file(fileName);

        const stream = fileUpload.createWriteStream({
            metadata: { contentType: file.mimetype }
        });

        stream.on('error', (err) => res.status(500).json({ message: err.message }));

        stream.on('finish', async () => {
            await fileUpload.makePublic();
            const fileUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

            const fileDoc = await db.collection('uploads').add({
                schoolId,
                uploadedBy: uid,
                fileName: file.originalname,
                fileUrl,
                fileType: file.mimetype,
                uploadedAt: new Date()
            });

            console.log(" File uploaded successfully:", fileUrl);

            // Notify external Python API via watcher
            watchFileUpload(fileName);

            res.status(201).json({
                message: 'File uploaded successfully',
                fileUrl,
                fileId: fileDoc.id
            });
        });

        stream.end(file.buffer);
    } catch (error) {
        console.error("❌ Upload Error:", error.message);
        res.status(500).json({ message: 'Upload failed', error: error.message });
    }
};

const getUploadedFiles = async (req, res) => {
    try {
        const { schoolId } = req.user;

        if (!schoolId) {
            console.error("❌ Missing schoolId in request user object");
            return res.status(400).json({ message: 'Missing schoolId for this user' });
        }

        const filesSnapshot = await db
            .collection('uploads')
            .where('schoolId', '==', schoolId)
            .get();

        const files = filesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve files', error: error.message });
    }
};

const deleteFile = async (req, res) => {
    console.log("🔥 Entered deleteFile()");

    try {
        const { fileUrl, fileId, schoolId, fileName } = req.body;

        if (!fileUrl || !fileId || !schoolId || !fileName) {
            console.error("❌ Missing required fields:", { fileUrl, fileId, schoolId, fileName });
            return res.status(400).json({ message: 'File ID, URL, file name, and schoolId are required' });
        }

        const storageBucketUrl = `https://storage.googleapis.com/${bucket.name}/`;
        const filePath = decodeURIComponent(fileUrl.replace(storageBucketUrl, "")); // ✅ safer with decode
        console.log("🔹 Computed file path:", filePath);

        const file = bucket.file(filePath);
        const [exists] = await file.exists();
        console.log("📁 File exists check result:", exists);

        if (!exists) {
            console.error("❌ File does not exist in Firebase Storage:", filePath);
            return res.status(404).json({ message: 'File not found in storage' });
        }

        // Step: Delete file from Firebase
        await file.delete();
        console.log(" Step: File deleted from Firebase");

        // Step: Delete Firestore document
        await db.collection('uploads').doc(fileId).delete();
        console.log(" Step: Firestore document deleted");

        // Step: Save file name to deletedFiles for future filtering
        await db
            .collection("deletedFiles")
            .doc(schoolId)
            .collection("files")
            .add({
                fileName,
                deletedAt: new Date()
            });
        console.log("🗑️ Step: File recorded in deletedFiles collection");

        // Step: Notify Python chatbot backend to delete Pinecone chunks
        try {
            const response = await axios.post("http://localhost:8000/delete-chunks", {
                schoolId,
                fileName
            });
            console.log("✅ Step: Pinecone cleanup called:", response.data);
        } catch (err) {
            console.error("❌ Step: Axios error while notifying chatbot backend:", err.message);
            if (err.response) {
                console.error("🔸 Response Status:", err.response.status);
                console.error("🔸 Response Data:", err.response.data);
            }
        }

        res.status(200).json({ message: 'File deleted successfully' });

    } catch (error) {
        console.error("❌ Delete Error:", error.message);
        res.status(500).json({ message: 'Failed to delete file', error: error.message });
    }
};

module.exports = { uploadFile, getUploadedFiles, deleteFile };
