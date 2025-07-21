const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middlewares/authMiddleware');

// All chat routes require authentication
router.use(authenticate);

// Conversations
router.get('/conversations', chatController.getUserConversations);
router.post('/conversations', chatController.createConversation);

// Messages
router.get('/conversations/:conversationId/messages', chatController.getConversationMessages);
router.post('/conversations/:conversationId/messages', chatController.sendMessage);

module.exports = router; 