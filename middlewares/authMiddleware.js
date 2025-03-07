const { admin } = require('../config/firebaseConfig');
const { getUserById } = require('../model/userModel');
const jwt = require('jsonwebtoken');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Check if the token belongs to the Super Admin
    if (token === process.env.SUPER_ADMIN_TOKEN) {
      req.user = { role: 'Super Admin' }; // Super Admin access
      return next();
    }

    // Otherwise, verify SAO/Admin token (ayni tangtanga par gamit ni pang testing postman,
    //  need sya token taga login para ma testingan
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded Token:", decodedToken);

    // Retrieve user details from Firestore
    const user = await getUserById(decodedToken.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user details to request
    req.user = {
      uid: user.userId,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      firstName: user.firstName,
      lastName: user.lastName
    };

    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Allow only specified roles to access certain routes
const authorize = (roles) => {
  return async (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Access Denied' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
