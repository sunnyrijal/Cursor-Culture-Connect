const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all routes with authentication
router.use(authMiddleware.authenticate);

// Get all groups
router.get('/', groupController.getAllGroups);

// Get user's groups
router.get('/my-groups', groupController.getUserGroups);

// Get single group by ID
router.get('/:id', groupController.getGroupById);

// Create a new group
router.post('/', groupController.createGroup);

// Join requests
router.post('/:groupId/join', groupController.requestJoinGroup);
router.get('/:groupId/join-requests', groupController.getPendingJoinRequests);
router.put('/join-requests/:requestId', groupController.respondToJoinRequest);

// Admin management
router.post('/:groupId/admins/:userId', groupController.addGroupAdmin);
router.delete('/:groupId/admins/:userId', groupController.removeGroupAdmin);

module.exports = router; 