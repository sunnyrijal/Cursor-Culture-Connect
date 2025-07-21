const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { User } = require('../models');

// Get user profile
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
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
    console.error('Get user profile error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get user profile',
      details: error.message
    });
  }
});

// Update user profile
router.put('/update-profile', authMiddleware.authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, bio, linkedIn, major, year, culturalBackground } = req.body;
    
    // Find the user
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    
    // Update user fields
    const updatedUser = await user.update({
      fullName: fullName || user.fullName,
      bio: bio !== undefined ? bio : user.bio,
      linkedIn: linkedIn !== undefined ? linkedIn : user.linkedIn,
      major: major !== undefined ? major : user.major,
      year: year !== undefined ? year : user.year,
      culturalBackground: culturalBackground !== undefined ? culturalBackground : user.culturalBackground
    });
    
    // Return updated user without password
    const userData = updatedUser.toJSON();
    delete userData.password;
    
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to update profile',
      details: error.message
    });
  }
});

module.exports = router; 