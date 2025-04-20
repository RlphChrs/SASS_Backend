const express = require('express');
const router = express.Router();

const {
    registerStudent,
    registerStudentWithGoogle,
    loginStudent,
    saveChatHistory,
    getChatHistory, 
    getStudentProfile
} = require('../../controllers/student/studentController'); 

const { getStudentById } = require('../../model/studentModel');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');

//  Student registration
router.post('/register/student', registerStudent);

//  Google registration
router.post('/register/student/google', registerStudentWithGoogle);

//  Login
router.post('/login', loginStudent);

//  Fetch student profile
router.get('/profile/:studentId', authenticate, getStudentProfile);

//  Save chat group messages (authenticated route)
router.post('/chat/save', authenticate, async (req, res) => {
    console.log("🛡️ Incoming /chat/save request");
    console.log("🔐 Token decoded user:", req.user); // show what's in the token
    console.log("📦 Incoming body before override:", req.body);

    req.body.studentId = req.user?.uid; // safe assignment

    console.log("📦 Final request body:", req.body);

    await saveChatHistory(req, res);
});


// Fetch chat history with flattened timestamps
router.get('/chat/history/:studentId', async (req, res) => {
    try {
        const history = await getChatHistory(req.params.studentId); 
        res.status(200).json({ conversations: history });
    } catch (error) {
        console.error("❌ Failed to fetch chat history:", error);
        res.status(500).json({ error: "Failed to fetch chat history" });
    }
});

// Student dashboard (role-protected route)
router.get('/dashboard', authenticate, authorize(['Student']), (req, res) => {
    res.send('Welcome to the Student Dashboard.');
});

// Debug Firestore fetch route (for internal testing)
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

const { updateStudentProfile } = require('../../controllers/student/studentProfileController');

router.put('/update-profile', authenticate, updateStudentProfile);


module.exports = router;
