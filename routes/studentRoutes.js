
const express = require('express');
const router = express.Router();
const { registerStudent, registerStudentWithGoogle } = require('../controllers/studentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

// Student Registration
router.post('/register/student', registerStudent);
router.post('/register/student/google', registerStudentWithGoogle);

// Protected Route for Student Dashboard
router.get('/dashboard', authenticate, authorize(['Student']), (req, res) => {
  res.send('Welcome to the Student Dashboard.');
});

module.exports = router;