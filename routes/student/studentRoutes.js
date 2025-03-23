const express = require('express');
const router = express.Router();
const { 
    registerStudent, 
    registerStudentWithGoogle, 
    loginStudent, 
    saveChatHistory, 
    fetchChatHistory, 
    getStudentProfile 
} = require('../../controllers/student/studentController');

const { getStudentById } = require('../../model/studentModel'); 
const { authenticate, authorize } = require('../../middlewares/authMiddleware');

router.post('/register/student', registerStudent);
router.post('/register/student/google', registerStudentWithGoogle);
router.post('/login', loginStudent);

// Fetch user profile
router.get('/profile/:studentId', authenticate, getStudentProfile);

// Save chat messages in `chatHistory` collection
router.post('/chat/save', authenticate, async (req, res) => {
  req.body.studentId = req.user.uid; // Attach authenticated student's ID if missing
  await saveChatHistory(req, res);
});


// 🔹 Fetch chat history from `chatHistory` collection
router.get('/chat/history/:studentId', authenticate, async (req, res) => {
  await fetchChatHistory(req, res);
});

// 🔹 Student Dashboard Route
router.get('/dashboard', authenticate, authorize(['Student']), (req, res) => {
    res.send('Welcome to the Student Dashboard.');
});

// ✅ 🔍 Debug Route to Fetch User Directly from Firestore
router.get('/debug-fetch/:studentId', authenticate, async (req, res) => {
    const { studentId } = req.params;
    console.log(`🛠 Debugging Firestore fetch for ID: "${studentId}"`);

    try {
        const student = await getStudentById(studentId);
        if (!student) {
            console.log(`❌ Firestore Query Returned: No student found.`);
            return res.status(404).json({ message: "Student not found in Firestore" });
        }
        console.log(`✅ Firestore Query Returned:`, student);
        res.status(200).json(student);
    } catch (error) {
        console.error(`❌ Error querying Firestore:`, error);
        res.status(500).json({ message: "Firestore query error", error });
    }
});

module.exports = router;
