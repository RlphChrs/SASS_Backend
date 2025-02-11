const express = require('express');
const router = express.Router();
const { registerStudent, registerStudentWithGoogle, loginStudent } = require('../controllers/studentController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

router.post('/register/student', registerStudent);
router.post('/register/student/google', registerStudentWithGoogle);
router.post('/login', loginStudent);

router.get('/dashboard', authenticate, authorize(['Student']), (req, res) => {
  res.send('Welcome to the Student Dashboard.');
});

module.exports = router;