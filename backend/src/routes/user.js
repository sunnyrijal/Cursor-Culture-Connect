const express = require('express');
const router = express.Router();
const { User } = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
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
    console.error('Get user error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get user',
      details: error.message
    });
  }
});

// Update user profile
router.put('/', authMiddleware.authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, university, culturalBackground, bio } = req.body;
    
    // Find user by ID
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    
    // Update user fields
    if (fullName) user.fullName = fullName;
    if (university) user.university = university;
    if (culturalBackground) user.culturalBackground = culturalBackground;
    if (bio) user.bio = bio;
    
    // Save changes
    await user.save();
    
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        university: user.university,
        culturalBackground: user.culturalBackground,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to update user',
      details: error.message
    });
  }
});

module.exports = router; 