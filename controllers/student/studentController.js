const { createStudent, getStudentByEmail } = require('../../model/studentModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerStudent = async (req, res) => {
  const { email, password, repeatPassword, firstName, lastName, termsAccepted } = req.body;

  console.log("🔍 Full Request Body:", req.body); // DEbbuging Log entire request to see what comes in

  if (!termsAccepted) {
    return res.status(400).json({ message: 'You must accept the terms and conditions.' });
  }

  console.log("Received Password:", `"${password}"`);
  console.log("Received Repeat Password:", `"${repeatPassword}"`);

  //Trim inputs to remove hidden characters or spaces due password mismatch even when they are same
  const trimmedPassword = password.trim();
  const trimmedRepeatPassword = repeatPassword.trim();

  if (trimmedPassword !== trimmedRepeatPassword) {
    console.log("❌ Passwords do NOT match after trimming!");
    return res.status(400).json({ message: "Passwords do not match." });
  }

  try {
    const existingStudent = await getStudentByEmail(email);
    if (existingStudent) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Generate a unique userId automatically
    const userId = `stu${Date.now()}`;

    await createStudent(userId, email, trimmedPassword, firstName, lastName);
    res.status(201).json({ message: "Student registered successfully", userId });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error });
  }
};

const registerStudentWithGoogle = async (req, res) => {
  const { email, firstName, lastName } = req.body;

  try {
    const existingStudent = await getStudentByEmail(email);
    if (existingStudent) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    // Generate `userId` automatically for Google signup
    const userId = `stu${Date.now()}`;

    await createStudent(userId, email, null, firstName, lastName);
    res.status(201).json({ message: 'Student registered successfully with Google', userId });
  } catch (error) {
    res.status(500).json({ message: 'Google Registration failed', error });
  }
};


const loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await getStudentByEmail(email);
    if (!student) {
      console.log("❌ Login failed: Email not found ->", email);
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    console.log("🔍 Stored Password (hashed):", student.password);
    console.log("🔍 Incoming Password:", password);

    const isPasswordValid = await bcrypt.compare(password, student.password);
    console.log("🔍 Password Match:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("❌ Login failed: Incorrect password for", email);
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: student.userId, role: student.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log("✅ Login successful: Token generated for", email);
    res.status(200).json({ message: 'Login successful', token });

  } catch (error) {
    console.log("❌ Login Error:", error);
    res.status(500).json({ message: 'Login failed', error });
  }
};


module.exports = { registerStudent, registerStudentWithGoogle, loginStudent };
