const { createStudent, getStudentByEmail } = require('../model/studentModel');

const registerStudent = async (req, res) => {
  const { userId, email, password, repeatPassword, firstName, lastName, termsAccepted } = req.body;

  if (!termsAccepted) {
    return res.status(400).json({ message: 'You must accept the terms and conditions.' });
  }

  if (password !== repeatPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  try {
    const existingStudent = await getStudentByEmail(email);
    if (existingStudent) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    await createStudent(userId, email, password, firstName, lastName);
    res.status(201).json({ message: 'Student registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed', error });
  }
};

const registerStudentWithGoogle = async (req, res) => {
  const { userId, email, firstName, lastName } = req.body;

  try {
    const existingStudent = await getStudentByEmail(email);
    if (existingStudent) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    await createStudent(userId, email, null, firstName, lastName);
    res.status(201).json({ message: 'Student registered successfully with Google' });
  } catch (error) {
    res.status(500).json({ message: 'Google Registration failed', error });
  }
};

module.exports = { registerStudent, registerStudentWithGoogle };