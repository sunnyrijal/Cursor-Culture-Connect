const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);

// Protected routes (require authentication)
router.put('/profile', authenticate, userController.updateProfile);
router.post('/connect/:targetId', authenticate, userController.connectWithUser);
router.delete('/connect/:targetId', authenticate, userController.removeConnection);
router.get('/connections/all', authenticate, userController.getUserConnections);
router.get('/connections/:id', authenticate, userController.getUserConnections);
router.get('/groups/all', authenticate, userController.getUserGroups);
router.get('/groups/:id', authenticate, userController.getUserGroups);
router.get('/events/all', authenticate, userController.getUserEvents);
router.get('/events/:id', authenticate, userController.getUserEvents);

module.exports = router; 