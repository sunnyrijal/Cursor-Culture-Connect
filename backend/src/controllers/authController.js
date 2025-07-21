const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { 
      username, 
      email, 
      password, 
      name, 
      university, 
      major, 
      year, 
      title,
      heritage, 
      languages, 
      bio, 
      location, 
      country, 
      state 
    } = req.body;

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
      name,
      university,
      major,
      year,
      title,
      heritage: heritage || [],
      languages: languages || [],
      bio,
      location,
      country,
      state,
      verified: false,
      image: req.body.image || null
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'culture_connect_secret_key_change_in_production',
      { expiresIn: '7d' }
    );

    // Return user data (excluding password)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      university: user.university,
      major: user.major,
      year: user.year,
      title: user.title,
      heritage: user.heritage,
      languages: user.languages,
      bio: user.bio,
      location: user.location,
      country: user.country,
      state: user.state,
      verified: user.verified,
      image: user.image
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
      { expiresIn: '7d' }
    );

    // Return user data (excluding password)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      university: user.university,
      major: user.major,
      year: user.year,
      title: user.title,
      heritage: user.heritage,
      languages: user.languages,
      bio: user.bio,
      location: user.location,
      country: user.country,
      state: user.state,
      verified: user.verified,
      image: user.image,
      isPublic: user.isPublic,
      privacy: user.privacy
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

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find user by ID with relationships
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: User,
          as: 'connections',
          attributes: { exclude: ['password'] }
        }
      ]
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