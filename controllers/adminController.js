const jwt = require('jsonwebtoken');

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'Admin' }, process.env.JWT_SECRET, { expiresIn: '5h' });
    return res.status(200).json({ message: 'Admin login successful', token });
  } else {
    return res.status(401).json({ message: 'Invalid admin credentials' });
  }
};

module.exports = { loginAdmin };