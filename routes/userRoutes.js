const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/userController');
const { validateRegistration } = require('../middlewares/validateInput');


router.post('/register', validateRegistration, register);
router.post('/login', login);

module.exports = router;
