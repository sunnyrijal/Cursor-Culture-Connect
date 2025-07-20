const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: true,
        message: 'Authentication required. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || 'culture_connect_secret_key_change_in_production'
    );
    
    // Check if user exists
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Invalid token. User not found.'
      });
    }
    
    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: true,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: true,
        message: 'Token expired.'
      });
    }
    
    return res.status(500).json({
      error: true,
      message: 'Authentication failed.',
      details: error.message
    });
  }
}; 