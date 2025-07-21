const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName, university, culturalBackground } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      where: {
        [Op.or]: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        error: true,
        message: 'User with this email or username already exists'
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password, // Will be hashed by the User model hooks
      fullName,
      university,
      culturalBackground
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'culture_connect_secret_key_change_in_production',
      { expiresIn: '24h' }
    );

    // Return user data (excluding password)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      university: user.university,
      culturalBackground: user.culturalBackground
    };

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      error: true,
      message: 'Registration failed',
      details: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        error: true,
        message: 'Invalid email or password'
      });
    }

    // Validate password
    const isPasswordValid = await user.validPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: true,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'culture_connect_secret_key_change_in_production',
      { expiresIn: '24h' }
    );

    // Return user data (excluding password)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      university: user.university,
      culturalBackground: user.culturalBackground,
      interests: user.interests,
      avatar: user.avatar,
      bio: user.bio
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: true,
      message: 'Login failed',
      details: error.message
    });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    // Since JWT tokens are stateless, we don't need to do anything on the server
    // The client will remove the token from storage
    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      error: true,
      message: 'Logout failed',
      details: error.message
    });
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find user by ID
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get current user',
      details: error.message
    });
  }
}; 