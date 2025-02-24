const express = require('express');
const router = express.Router();
const { registerSAO, registerWithGoogle, loginUser } = require('../../controllers/sao/userController');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');

router.post('/register/sao', registerSAO);
router.post('/register/google', registerWithGoogle);
router.post('/login', loginUser);

router.get('/admin-dashboard', authenticate, authorize(['Super Admin', 'School Admin']), (req, res) => {
  res.send('Welcome to the Admin Dashboard.');
});

module.exports = router;