const { admin, db } = require('../../config/firebaseConfig'); 
const { createStudent, getStudentByEmail, saveChatMessage, getChatHistory, getStudentById } = require('../../model/studentModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const registerStudent = async (req, res) => {
  const { email, password, repeatPassword, studentId, schoolName, termsAccepted } = req.body;

  console.log("📥 Registration request:", req.body);

  if (!termsAccepted) {
    return res.status(400).json({ message: 'You must accept the terms and conditions.' });
  }

  const trimmedPassword = password.trim();
  const trimmedRepeatPassword = repeatPassword.trim();

  if (trimmedPassword !== trimmedRepeatPassword) {
    console.log("❌ Passwords do NOT match after trimming!");
    return res.status(400).json({ message: "Passwords do not match." });
  }

  if (!studentId || !schoolName) {
    return res.status(400).json({ message: "Missing studentId or schoolName." });
  }

  try {
    // ✅ 1. Verify that the school exists
    const schoolSnapshot = await db
      .collection('users')
      .where('role', '==', 'School Admin')
      .where('schoolId', '==', schoolName.trim())
      .limit(1)
      .get();

    if (schoolSnapshot.empty) {
      console.warn(`❌ School not found: "${schoolName}"`);
      return res.status(404).json({ message: `The school "${schoolName}" is not registered.` });
    }

    // ✅ 2. Check if studentId exists in uploaded_students
    const studentDoc = await db
      .collection('uploaded_students')
      .doc(schoolName)
      .collection('records')
      .doc(studentId)
      .get();

    if (!studentDoc.exists) {
      console.warn(`❌ Student ID "${studentId}" not found in uploaded list for ${schoolName}`);
      return res.status(404).json({ message: "Student ID not found in the school's uploaded list." });
    }

    const matchedData = studentDoc.data();

    // ✅ 3. Prevent duplicate registrations
    const existingStudent = await getStudentByEmail(email);
    if (existingStudent) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // ✅ 4. Proceed to create the student using their legit ID
    await createStudent(studentId, email, trimmedPassword, matchedData.firstName, matchedData.lastName, schoolName);

    // ✅ 5. Mark as registered in uploaded_students
    await db
      .collection('uploaded_students')
      .doc(schoolName)
      .collection('records')
      .doc(studentId)
      .update({ registered: true });

    console.log(`✅ Student "${studentId}" registered successfully.`);

    res.status(201).json({ message: "Student registered successfully", studentId, schoolName });

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

        // Generate studentId correctly
        const studentId = `stu${Date.now()}`.trim().toLowerCase();
        console.log(` Google Registration Student ID: "${studentId}"`);

        await createStudent(studentId, email, null, firstName, lastName);
        console.log(` Google Student registered successfully with ID: "${studentId}"`);

        res.status(201).json({ message: 'Student registered successfully with Google', studentId });
    } catch (error) {
        console.error(" Google Registration Error:", error);
        res.status(500).json({ message: 'Google Registration failed', error });
    }
};


const saveChatHistory = async (req, res) => {
    const { studentId, groupId, messages } = req.body;
    console.log(" Incoming Chat Save Payload:", req.body);

    if (!studentId || !groupId || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid request. Ensure studentId, groupId, and messages array are provided." });
    }

    try {
        console.log(` Saving messages for student "${studentId}" in group "${groupId}"`);

        // Reference to the group inside the student's conversations subcollection
        const groupRef = db
            .collection('chatHistory')
            .doc(studentId)
            .collection('conversations')
            .doc(groupId);

        const doc = await groupRef.get();

        if (!doc.exists) {
            // First time saving this group - create it
            await groupRef.set({
                groupId: groupId,
                timestamp: new Date(),
                messages: messages
            });
            console.log(` New chat group created: ${groupId}`);
        } else {
            // Group exists - append messages
            await groupRef.update({
                messages: admin.firestore.FieldValue.arrayUnion(...messages)
            });
            console.log(` Messages appended to existing group: ${groupId}`);
        }

        res.status(200).json({ message: "Chat group saved successfully" });
    } catch (error) {
        console.error(" Error saving chat history:", error);
        res.status(500).json({ error: "Failed to save chat messages" });
    }
};



//  Retrieve chat history from Firestore
const fetchChatHistory = async (req, res) => {
    const { studentId } = req.params;

    if (!studentId) {
        return res.status(400).json({ error: "Missing studentId in request parameters." });
    }

    try {
        console.log(`🔍 Fetching chat history for student: "${studentId}"`);

        const conversationSnapshot = await db
            .collection('chatHistory')
            .doc(studentId)
            .collection('conversations')
            .orderBy('timestamp', 'asc')
            .get();

        const conversations = conversationSnapshot.docs.map(doc => ({
            groupId: doc.id,
            ...doc.data()
        }));

        console.log(` Grouped chat history retrieved for student ${studentId}:`, conversations.length);

        res.status(200).json({ conversations });
    } catch (error) {
        console.error(" Error retrieving chat history:", error);
        res.status(500).json({ error: "Failed to fetch chat history" });
    }
};


//  Login Student
const loginStudent = async (req, res) => {
    const { email, password } = req.body;

    try {
        const student = await getStudentByEmail(email);
        if (!student) {
            console.log(" Login failed: Email not found ->", email);
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        console.log(" Stored Password (hashed):", student.password);
        console.log(" Incoming Password:", password);

        const isPasswordValid = await bcrypt.compare(password, student.password);
        console.log(" Password Match:", isPasswordValid);

        if (!isPasswordValid) {
            console.log(" Login failed: Incorrect password for", email);
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        //  Generate JWT
        const token = jwt.sign(
            { id: student.studentId, role: student.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log(" Login successful: Token generated for", email);
        console.log(" Token contains ID:", student.studentId);

        //  Add schoolName to the response
        res.status(200).json({
            message: 'Login successful',
            token,
            studentId: student.studentId,
            schoolName: student.schoolName || "" 
        });

    } catch (error) {
        console.log(" Login Error:", error);
        res.status(500).json({ message: 'Login failed', error });
    }
};


const getStudentProfile = async (req, res) => {
    let { studentId } = req.params;
    studentId = studentId.trim().toLowerCase();
    console.log(` Fetching profile for Student ID: ${studentId}`);

    if (!studentId) {
        return res.status(400).json({ error: "Missing studentId" });
    }

    try {
        const student = await getStudentById(studentId);
        if (!student) {
            console.log(` Student not found: ${studentId}`);
            return res.status(404).json({ message: "Student not found" });
        }

        console.log(` Profile retrieved for Student ID: ${studentId}`);
        res.status(200).json(student);
    } catch (error) {
        console.error(` Error fetching profile:`, error);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
};

//dri ninyo ibutang


module.exports = { registerStudent, registerStudentWithGoogle, saveChatHistory, getChatHistory, loginStudent, getStudentProfile };
