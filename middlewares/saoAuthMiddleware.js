const jwt = require("jsonwebtoken");
const { getUserById } = require("../model/userModel");

const authenticateSAO = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        console.error("❌ SAO Unauthorized: No token provided.");
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1].trim();

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        if (!decodedToken.id) {
            return res.status(401).json({ message: "Invalid token: Missing user ID" });
        }

        const userId = decodedToken.id.trim().toLowerCase();

        const user = await getUserById(userId);
        if (!user) {
            return res.status(401).json({ message: "SAO not found in Firestore." });
        }

        req.user = {
            uid: user.userId,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            schoolId: user.schoolId 
          };
          

        console.log("✅ SAO Authenticated:", req.user);
        next();
    } catch (error) {
        console.error("❌ SAO Token Verification Failed:", error.message);
        return res.status(401).json({ message: "Invalid SAO token" });
    }
};

module.exports = { authenticateSAO };
