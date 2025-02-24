const { admin } = require('../config/firebaseConfig');
const { getUserById } = require('../model/userModel');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Retrieve user from Firestore
    const user = await getUserById(decodedToken.uid);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Attach user details to request, including schoolId
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
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const authorize = (roles) => {
  return async (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Access Denied' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
