const { admin } = require('../config/firebaseConfig');
const { getUserById } = require('../model/userModel');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const authorize = (roles) => {
  return async (req, res, next) => {
    const user = await getUserById(req.user.uid);
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden: Access Denied' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };