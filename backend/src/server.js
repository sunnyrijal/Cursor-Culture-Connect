import express from 'express';
import bodyParser from 'body-parser';
import authRouter from './routes/auth.js';
import eventsRouter from './routes/events.js';
import groupsRouter from './routes/groups.js';
import usersRouter from './routes/users.js';
import cors from 'cors';
import pool from './db.js';
import { initDatabase, updateUserTableWithAdditionalFields } from './db/initDb.js';
import { fileURLToPath } from 'url';
import path from 'path';
import session from 'express-session';
import { createClient } from 'redis';
import connectRedis from 'connect-redis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  console.error('Redis client error:', err);
});

// Connect to Redis
await redisClient.connect().catch(console.error);

// Initialize Redis store for sessions
const RedisStore = connectRedis(session);

// Configure CORS
app.use(cors({
  origin: ['http://localhost:19000', 'http://localhost:19006', 'exp://localhost:19000'],
  credentials: true
}));

// Configure session middleware
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'default_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Parse JSON request bodies
app.use(bodyParser.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Database initialization
async function setupDatabase() {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
    
    // Initialize database tables
    await initDatabase();
    
    // Update users table with additional fields if needed
    await updateUserTableWithAdditionalFields();
    
    console.log('Database setup complete');
  } catch (err) {
    console.error('Database setup error:', err);
    console.log('Application will start, but database might not be properly initialized');
  }
}

// Mount routers
app.use('/api/auth', authRouter);
app.use('/api/events', eventsRouter);
app.use('/api/groups', groupsRouter);
app.use('/api/users', usersRouter);

// Serve mockEvents.json for seeding
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.get('/api/seed/events', (req, res) => {
  try {
    const mockEventsPath = path.join(__dirname, '../../data/mockEvents.json');
    res.sendFile(mockEventsPath);
  } catch (err) {
    res.status(500).json({ error: 'Could not serve seed data' });
  }
});

// Add test route to confirm API is working
app.get('/api/ping', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Session check middleware
app.get('/api/auth/check-session', (req, res) => {
  if (req.session && req.session.userId) {
    return res.json({ authenticated: true, userId: req.session.userId });
  }
  return res.status(401).json({ authenticated: false });
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to logout' });
    }
    res.clearCookie('connect.sid');
    return res.json({ message: 'Logged out successfully' });
  });
});

// Start the server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server running on port ${PORT}`);
  await setupDatabase();
  console.log(`API endpoints available:
  - GET/POST /api/groups
  - GET/POST /api/events
  - GET/PUT /api/users/profile
  - POST /api/auth/login
  - POST /api/auth/signup
  - GET /api/auth/check-session
  - POST /api/auth/logout
  `);
});
