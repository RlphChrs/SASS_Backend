const express = require('express');
const router = express.Router();
const { loginAdmin } = require('../../controllers/admin/adminController');
const { authenticate, authorize } = require('../../middlewares/authMiddleware');

router.post('/login', loginAdmin);

router.get('/dashboard', authenticate, authorize(['Admin']), (req, res) => {
  res.send('Welcome to the Admin Dashboard.');
});

module.exports = router;