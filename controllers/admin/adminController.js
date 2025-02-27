const jwt = require('jsonwebtoken');

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    // Super Admin gets a static token
    return res.status(200).json({ 
      message: 'Admin login successful', 
      token: process.env.SUPER_ADMIN_TOKEN // Uses fixed token from .env
    });
  } else {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }
};

module.exports = { loginAdmin };
