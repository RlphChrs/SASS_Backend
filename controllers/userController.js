const { addUser, getUserByEmail } = require('../model/userModel');
const { admin } = require('../config/firebaseConfig');

// Registration
exports.register = async (req, res) => {
  try {
  
    const { schoolName, firstName, lastName, email, password } = req.body;
    
    //Validation Nigga
    if (!schoolName || !firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
     
    const fullName = `${firstName} ${lastName}`; 

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create User in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: fullName,
    });

    // Save to Firestore
    await addUser({
      uid: userRecord.uid,
      schoolName,
      firstName,
      lastName,
      fullName,
      email,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};