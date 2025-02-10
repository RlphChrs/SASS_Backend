const { createUser, getUserByEmail } = require('../model/userModel');

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

module.exports = { registerSAO, registerWithGoogle };