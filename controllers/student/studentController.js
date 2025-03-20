const { db } = require('../../config/firebaseConfig'); // 🔥 Ensure Firestore is imported
const { createStudent, getStudentByEmail, saveChatMessage, getChatHistory, getStudentById } = require('../../model/studentModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const registerStudent = async (req, res) => {
    const { email, password, repeatPassword, firstName, lastName, termsAccepted } = req.body;

    console.log("🔍 Full Request Body:", req.body);

    if (!termsAccepted) {
        return res.status(400).json({ message: 'You must accept the terms and conditions.' });
    }

    console.log("Received Password:", password);
    console.log("Received Repeat Password:", repeatPassword);

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

        // ✅ Generate a single studentId and ensure consistency
        const studentId = `stu${Date.now()}`.trim().toLowerCase();
        console.log(`📝 Generated Student ID: "${studentId}"`);

        await createStudent(studentId, email, trimmedPassword, firstName, lastName);
        console.log(`✅ Student registered successfully with ID: "${studentId}"`);

        res.status(201).json({ message: "Student registered successfully", studentId });
    } catch (error) {
        console.error("❌ Registration Error:", error);
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

        // ✅ Generate studentId correctly
        const studentId = `stu${Date.now()}`.trim().toLowerCase();
        console.log(`📝 Google Registration Student ID: "${studentId}"`);

        await createStudent(studentId, email, null, firstName, lastName);
        console.log(`✅ Google Student registered successfully with ID: "${studentId}"`);

        res.status(201).json({ message: 'Student registered successfully with Google', studentId });
    } catch (error) {
        console.error("❌ Google Registration Error:", error);
        res.status(500).json({ message: 'Google Registration failed', error });
    }
};

// 🔹 Save chat message in Firebase Firestore
const saveChatHistory = async (req, res) => {
    const { studentId, userId, messages } = req.body; // Check for both studentId and userId

    const resolvedStudentId = studentId || userId; // Use the available ID

    if (!resolvedStudentId || !messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid request. Ensure studentId and messages array are provided." });
    }

    try {
        console.log(`🔍 Saving chat for student in 'chatHistory' collection: "${resolvedStudentId}"`);
        
        // Reference chat history collection instead of updating students directly
        const chatRef = db.collection('chatHistory').doc(resolvedStudentId);
        await chatRef.set({ messages }, { merge: true });

        res.status(200).json({ message: "Chat saved successfully in chatHistory" });
    } catch (error) {
        console.error("❌ Error saving chat:", error);
        res.status(500).json({ error: "Failed to save chat history" });
    }
};

// 🔹 Retrieve chat history from Firestore
const fetchChatHistory = async (req, res) => {
    const { studentId } = req.params;

    if (!studentId) {
        return res.status(400).json({ error: "Missing studentId in request parameters." });
    }

    try {
        console.log(`🔍 Fetching chat history for student: "${studentId}"`);

        // ✅ Retrieve messages from the 'chatHistory' collection
        const chatRef = db.collection('chatHistory').doc(studentId);
        const chatDoc = await chatRef.get();

        if (!chatDoc.exists) {
            console.log(`⚠ No chat history found for student: "${studentId}". Returning empty array.`);
            return res.status(200).json({ messages: [] });  // ✅ Return an empty array instead of an error
        }

        const chatData = chatDoc.data();
        console.log(`✅ Chat history retrieved for student ${studentId}:`, chatData.messages);

        res.status(200).json({ messages: chatData.messages });
    } catch (error) {
        console.error("❌ Error retrieving chat history:", error);
        res.status(500).json({ error: "Failed to fetch chat history" });
    }
};


// 🔹 Login Student
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

        // ✅ Ensure correct studentId is used in the token
        const token = jwt.sign(
            { id: student.studentId, role: student.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log("✅ Login successful: Token generated for", email);
        console.log("🔍 Token contains ID:", student.studentId);

        res.status(200).json({ message: 'Login successful', token, studentId: student.studentId });

    } catch (error) {
        console.log("❌ Login Error:", error);
        res.status(500).json({ message: 'Login failed', error });
    }
};

const getStudentProfile = async (req, res) => {
    let { studentId } = req.params;
    studentId = studentId.trim().toLowerCase();
    console.log(`🔍 Fetching profile for Student ID: ${studentId}`);

    if (!studentId) {
        return res.status(400).json({ error: "Missing studentId" });
    }

    try {
        const student = await getStudentById(studentId);
        if (!student) {
            console.log(`❌ Student not found: ${studentId}`);
            return res.status(404).json({ message: "Student not found" });
        }

        console.log(`✅ Profile retrieved for Student ID: ${studentId}`);
        res.status(200).json(student);
    } catch (error) {
        console.error(`❌ Error fetching profile:`, error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
};



module.exports = { registerStudent, registerStudentWithGoogle, saveChatHistory, fetchChatHistory, loginStudent, getStudentProfile };
