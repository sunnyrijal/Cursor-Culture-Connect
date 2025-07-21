require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const eventRoutes = require('./routes/event');
const groupRoutes = require('./routes/group');
const activityRoutes = require('./routes/activity');
const chatRoutes = require('./routes/chat');

const app = express();
// Set default port to 5001
const PORT = process.env.PORT || 5001;
const FALLBACK_PORTS = [5000, 5002, 5003, 5004, 5005];

// Configure CORS to allow requests from any origin
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON parsing middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/chat', chatRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: err.message || 'Internal Server Error'
  });
});

// Start server with port fallback
async function startServer(portIndex = 0) {
  const currentPort = portIndex === 0 ? PORT : FALLBACK_PORTS[portIndex - 1];
  
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync models with database
    await sequelize.sync();
    console.log('Database models synchronized.');
    
    const server = app.listen(currentPort, () => {
      console.log(`Server is running on port ${currentPort}`);
    });
    
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.log(`Port ${currentPort} is in use, trying another port...`);
        if (portIndex < FALLBACK_PORTS.length) {
          startServer(portIndex + 1);
        } else {
          console.error('All ports are in use. Please free up a port or configure a different port.');
        }
      } else {
        console.error('Server error:', error);
      }
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer(); 