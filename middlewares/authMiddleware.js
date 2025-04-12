const { admin } = require("../config/firebaseConfig");
const { getUserById } = require("../model/userModel");
const jwt = require("jsonwebtoken");
const { db } = require("../config/firebaseConfig");
const { getStudentById } = require("../model/studentModel");

const authenticate = async (req, res, next) => {
    let authHeader = req.headers.authorization;
    console.log("🛡 Received Authorization Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.error("❌ Unauthorized: Missing or malformed token.");
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1].trim();
    console.log("🔍 Token to verify:", token);

    // ✅ Check for Super Admin static token FIRST
    if (token === process.env.SUPER_ADMIN_TOKEN) {
        req.user = {
            uid: "superadmin",
            email: process.env.ADMIN_EMAIL,
            role: "superadmin",
            firstName: "Super",
            lastName: "Admin"
        };
        console.log("✅ Super Admin authenticated via static token.");
        return next();
    }

    // 🔐 Proceed with normal student token validation
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Decoded Token:", decodedToken);

        if (!decodedToken.id) {
            console.error("❌ JWT Token is missing 'id' field");
            return res.status(401).json({ message: "Invalid token: Missing user ID" });
        }

        const studentId = decodedToken.id.trim().toLowerCase();
        console.log(`🔍 Searching for student in Firestore: "${studentId}"`);

        const student = await getStudentById(studentId);
        if (!student) {
            console.error(`❌ Student not found in Firestore for ID: "${studentId}"`);
            return res.status(401).json({ message: "Student not found in Firestore." });
        }

        req.user = {
            uid: student.studentId,
            email: student.email,
            role: student.role,
            firstName: student.firstName,
            lastName: student.lastName,
            schoolName: student.schoolName
        };

        console.log("✅ Student Authenticated:", req.user);
        next();
    } catch (error) {
        console.error("❌ JWT Verification Error:", error.message);
        return res.status(401).json({ message: "Invalid token" });
    }
};

// ✅ No change here
const authorize = (roles) => {
    return async (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            console.error("❌ Forbidden: Access denied for role", req.user?.role);
            return res.status(403).json({ message: "Forbidden: Access Denied" });
        }
        next();
    };
};

module.exports = { authenticate, authorize };
