import express from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const router = express.Router();
const SALT_ROUNDS = 10;

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      fullName, 
      university, 
      state, 
      city, 
      mobileNumber, 
      dateOfBirth,
      major,
      year
    } = req.body;
    
    // Check if email ends with .edu
    if (!email.endsWith('.edu')) {
      return res.status(400).json({ error: 'Only .edu email addresses are allowed' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create new user with Prisma
    const newUser = await prisma.user.create({
      data: { 
        email, 
        passwordHash,
        fullName, 
        university, 
        state, 
        city, 
        mobileNumber,
        major,
        year,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        heritage: [],
        languages: []
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1d' }
    );

    res.status(201).json({ 
      id: newUser.id, 
      email: newUser.email,
      fullName: newUser.fullName,
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate email domain
    if (!email.endsWith('.edu')) {
      return res.status(400).json({ error: 'Only .edu email addresses are allowed' });
    }
    
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1d' }
    );
    
    // Store user info in session
    req.session.userId = user.id;
    req.session.email = user.email;
    req.session.authenticated = true;

    res.json({ 
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      token,
      authenticated: true
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
