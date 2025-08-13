import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Middleware to check if user is authenticated via session
export const isAuthenticated = (req, res, next) => {
  // Check if user has an active session
  if (req.session && req.session.userId && req.session.authenticated) {
    return next();
  }
  
  // If no session, check for JWT token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
      req.user = decoded;
      return next();
    } catch (error) {
      console.error('JWT verification error:', error);
    }
  }
  
  // If no valid session or token, return unauthorized
  return res.status(401).json({ message: 'Unauthorized' });
};

// Middleware to validate .edu email addresses
export const validateEduEmail = (req, res, next) => {
  const { email } = req.body;
  
  if (!email || !email.endsWith('.edu')) {
    return res.status(400).json({ message: 'Only .edu email addresses are allowed' });
  }
  
  next();
};

// Middleware to get user profile from session or token
export const getUserProfile = async (req, res, next) => {
  try {
    let userId;
    
    // Get user ID from session or JWT token
    if (req.session && req.session.userId) {
      userId = req.session.userId;
    } else if (req.user && req.user.userId) {
      userId = req.user.userId;
    } else {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    // Get user profile from database
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        email: true,
        fullName: true,
        university: true,
        state: true,
        city: true,
        bio: true,
        mobileNumber: true,
        dateOfBirth: true,
        heritage: true,
        languages: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
        // Exclude passwordHash for security
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Attach user to request object
    req.userProfile = user;
    next();
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};