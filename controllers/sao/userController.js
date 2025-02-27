const { createUser, getUserByEmail } = require('../../model/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerSAO = async (req, res) => {
  const { userId, email, password, repeatPassword, schoolName, firstName, lastName, termsAccepted } = req.body;

  if (!termsAccepted) {
    return res.status(400).json({ message: 'You must accept the terms and conditions.' });
  }

  if (password !== repeatPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    await createUser(userId, email, password, 'School Admin', schoolName, firstName, lastName);
    res.status(201).json({ message: 'School Admin registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error });
  }
};

const registerWithGoogle = async (req, res) => {
  const { userId, email, schoolName, firstName, lastName } = req.body;

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    await createUser(userId, email, null, 'School Admin', schoolName, firstName, lastName);
    res.status(201).json({ message: 'School Admin registered successfully with Google' });
  } catch (error) {
    res.status(500).json({ message: 'Google Registration failed', error });
  }
};

const loginUser = async (req, res) => {
  console.log("Login Request Received", req.body);
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Generate a new token every login for SAO
    const token = jwt.sign(
      { id: user.userId, role: user.role, schoolId: user.schoolId },
      process.env.JWT_SECRET,
      { expiresIn: '5h' }
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error });
  }
};

module.exports = { registerSAO, registerWithGoogle, loginUser };
