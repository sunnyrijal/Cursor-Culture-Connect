const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { authenticate } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', groupController.getGroups);
router.get('/:id', groupController.getGroupById);

// Protected routes (require authentication)
router.post('/', authenticate, groupController.createGroup);
router.put('/:id', authenticate, groupController.updateGroup);
router.post('/:id/join', authenticate, groupController.joinGroup);
router.post('/:id/leave', authenticate, groupController.leaveGroup);
router.post('/:id/media', authenticate, groupController.addGroupMedia);

module.exports = router; 