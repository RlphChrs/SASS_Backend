const multer = require('multer');
const xlsx = require('xlsx');
const { db } = require('../../config/firebaseConfig');

// ✅ Multer setup – accept any file field name
const storage = multer.memoryStorage();
const upload = multer({ storage }).any();

const uploadStudentExcel = async (req, res) => {
  upload(req, res, async function (err) {
    console.log("📥 Entered uploadStudentExcel route.");

    if (err) {
      console.error("❌ Multer file upload error:", err);
      return res.status(400).json({ error: 'File upload failed.' });
    }

    const file = req.files?.[0]; // ✅ Safely access first uploaded file
    const { schoolId } = req.body;

    console.log("📄 File metadata:", file);
    console.log("🏫 Received schoolId:", schoolId);

    if (!file) {
      console.error("⚠️ No file received in request.");
      return res.status(400).json({ error: 'Missing file.' });
    }

    if (!schoolId) {
      console.error("⚠️ Missing schoolId in request body.");
      return res.status(400).json({ error: 'Missing schoolId.' });
    }

    try {
      console.log("📊 Reading Excel buffer...");
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = xlsx.utils.sheet_to_json(worksheet);

      console.log(`📦 Parsed ${jsonData.length} students from Excel.`);

      // ✅ Normalize column headers to internal field names
      const normalizedData = jsonData.map(row => ({
        studentId: row['Student ID']?.toString(),
        email: row['Email'],
        firstName: row['First Name'],
        lastName: row['Last Name'],
        course: row['Course'],
        year: row['Year'],
        section: row['Section']
      }));

      const collectionRef = db.collection('uploaded_students').doc(schoolId).collection('records');

      console.log(`🔍 Checking existing records under schoolId: ${schoolId}`);
      const existingSnapshot = await collectionRef.get();
      const existingRecords = {};
      existingSnapshot.forEach(doc => {
        existingRecords[doc.id] = doc.data();
      });

      const batch = db.batch();
      let newCount = 0, updatedCount = 0, skippedCount = 0;

      for (const student of normalizedData) {
        const studentId = student.studentId;
        if (!studentId) {
          console.warn("⚠️ Skipping row with missing studentId:", student);
          continue;
        }

        const existing = existingRecords[studentId];

        if (existing?.registered === true) {
          skippedCount++;
          continue;
        }

        const docRef = collectionRef.doc(studentId);
        batch.set(docRef, {
          ...student,
          registered: existing?.registered === true,
          timestamp: new Date()
        }, { merge: true });

        existing ? updatedCount++ : newCount++;
      }

      await batch.commit();

      console.log("✅ Upload completed.");
      res.status(200).json({
        message: 'Upload processed.',
        totalUploaded: jsonData.length,
        newRecords: newCount,
        updatedRecords: updatedCount,
        skippedRegistered: skippedCount
      });

    } catch (err) {
      console.error('❌ Excel Upload Error:', err);
      res.status(500).json({ error: 'Failed to process Excel file.' });
    }
  });
};

const getUploadedStudents = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const snapshot = await db
      .collection('uploaded_students')
      .doc(schoolId)
      .collection('records')
      .get();

    const students = snapshot.docs.map(doc => doc.data());
    res.status(200).json(students);
  } catch (err) {
    console.error('❌ Error fetching uploaded students:', err);
    res.status(500).json({ error: 'Failed to fetch uploaded students' });
  }
};


module.exports = { uploadStudentExcel, getUploadedStudents };
