import express from 'express';
import pool from '../db.js';
import { PrismaClient } from '@prisma/client';
import { isAuthenticated, getUserProfile } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

// Use the isAuthenticated middleware from auth.js instead of this function
// This comment is kept for reference of the previous implementation

// Get current user profile
router.get('/profile', isAuthenticated, async (req, res) => {
  try {
    // Get user ID from session or JWT token
    let userId;
    
    if (req.session && req.session.userId) {
      userId = req.session.userId;
    } else if (req.user && req.user.userId) {
      userId = req.user.userId;
    } else {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        groups: true,
        events: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove sensitive data
    const { passwordHash, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', isAuthenticated, async (req, res) => {
  try {
    // Get user ID from session or JWT token
    let userId;
    
    if (req.session && req.session.userId) {
      userId = req.session.userId;
    } else if (req.user && req.user.userId) {
      userId = req.user.userId;
    } else {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    const { 
      fullName, 
      university, 
      major,
      year,
      state, 
      city, 
      bio,
      linkedin,
      heritage,
      languages,
      profileImage,
      mobileNumber,
      dateOfBirth
    } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        fullName,
        university,
        major,
        year,
        state,
        city,
        bio,
        linkedin,
        heritage: heritage || [],
        languages: languages || [],
        profileImage,
        mobileNumber,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined
      }
    });

    // Remove sensitive data
    const { passwordHash, ...userWithoutPassword } = updatedUser;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's joined groups
router.get('/groups', isAuthenticated, async (req, res) => {
  try {
    // Get user ID from session or JWT token
    let userId;
    
    if (req.session && req.session.userId) {
      userId = req.session.userId;
    } else if (req.user && req.user.userId) {
      userId = req.user.userId;
    } else {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const userWithGroups = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        groups: true
      }
    });

    if (!userWithGroups) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(userWithGroups.groups);
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user by ID (for public profiles)
router.get('/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        university: true,
        major: true,
        year: true,
        state: true,
        city: true,
        bio: true,
        linkedin: true,
        heritage: true,
        languages: true,
        profileImage: true,
        createdAt: true,
        email: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;