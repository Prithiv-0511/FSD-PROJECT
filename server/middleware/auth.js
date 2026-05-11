const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');

// Verify JWT access token
const authenticate = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, config.jwt.secret);

    const user = await User.findById(decoded.id)
      .populate('organizationId', 'name slug plan settings')
      .populate('departmentId', 'name color');

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive.' });
    }

    req.user = user;
    req.organizationId = user.organizationId._id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = authenticate;
