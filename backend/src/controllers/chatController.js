const { Conversation, Message, User, Group } = require('../models');
const { Op } = require('sequelize');

// Get user conversations
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get direct conversations (1-on-1)
    const directConversations = await Conversation.findAll({
      where: {
        isGroupChat: false
      },
      include: [
        {
          model: User,
          as: 'participants',
          where: { id: userId },
          attributes: ['id', 'name', 'image'],
          through: { attributes: [] }
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']]
        }
      ]
    });
    
    // Get group conversations
    const groupConversations = await Conversation.findAll({
      where: {
        isGroupChat: true
      },
      include: [
        {
          model: Group,
          as: 'group',
          include: [
            {
              model: User,
              as: 'members',
              where: { id: userId },
              attributes: [],
              through: { attributes: [] }
            }
          ]
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']]
        }
      ]
    });
    
    // Process conversations to include other participant info for direct conversations
    const processedDirectConversations = await Promise.all(
      directConversations.map(async (conv) => {
        const plainConv = conv.get({ plain: true });
        
        // Find the other participant
        const otherParticipant = plainConv.participants.find(p => p.id !== userId);
        
        // Add other participant info
        plainConv.otherUser = otherParticipant;
        
        // Add unread count
        const unreadCount = await Message.count({
          where: {
            conversationId: plainConv.id,
            senderId: { [Op.ne]: userId },
            readBy: { [Op.not]: { [Op.contains]: [userId] } }
          }
        });
        
        plainConv.unreadCount = unreadCount;
        plainConv.lastMessage = plainConv.messages.length > 0 ? plainConv.messages[0].text : '';
        plainConv.lastMessageTime = plainConv.messages.length > 0 ? plainConv.messages[0].timestamp : null;
        
        return plainConv;
      })
    );
    
    // Process group conversations
    const processedGroupConversations = await Promise.all(
      groupConversations.map(async (conv) => {
        const plainConv = conv.get({ plain: true });
        
        // Add unread count
        const unreadCount = await Message.count({
          where: {
            conversationId: plainConv.id,
            senderId: { [Op.ne]: userId },
            readBy: { [Op.not]: { [Op.contains]: [userId] } }
          }
        });
        
        plainConv.unreadCount = unreadCount;
        plainConv.lastMessage = plainConv.messages.length > 0 ? plainConv.messages[0].text : '';
        plainConv.lastMessageTime = plainConv.messages.length > 0 ? plainConv.messages[0].timestamp : null;
        
        return plainConv;
      })
    );
    
    // Combine and sort by last message time
    const allConversations = [...processedDirectConversations, ...processedGroupConversations]
      .sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
      });
    
    return res.status(200).json({
      success: true,
      conversations: allConversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get conversations',
      details: error.message
    });
  }
};

// Get conversation messages
exports.getConversationMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.conversationId;
    const { limit = 50, before } = req.query;
    
    // Check if conversation exists
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({
        error: true,
        message: 'Conversation not found'
      });
    }
    
    // Check if user is a participant in direct conversation
    if (!conversation.isGroupChat) {
      const isParticipant = await conversation.hasParticipant(userId);
      if (!isParticipant) {
        return res.status(403).json({
          error: true,
          message: 'Not authorized to access this conversation'
        });
      }
    } else {
      // Check if user is a member of the group
      const group = await conversation.getGroup();
      const isMember = await group.hasMember(userId);
      if (!isMember) {
        return res.status(403).json({
          error: true,
          message: 'Not authorized to access this group conversation'
        });
      }
    }
    
    // Build query to get messages
    const whereClause = {
      conversationId
    };
    
    // If "before" timestamp is provided, get messages before that time
    if (before) {
      whereClause.timestamp = { [Op.lt]: new Date(before) };
    }
    
    // Get messages
    const messages = await Message.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'image']
        }
      ],
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit)
    });
    
    // Mark messages as read
    await Promise.all(
      messages.map(async (message) => {
        if (message.senderId !== userId && !message.readBy.includes(userId)) {
          message.readBy = [...message.readBy, userId];
          await message.save();
        }
      })
    );
    
    // Return messages in chronological order
    return res.status(200).json({
      success: true,
      messages: messages.reverse()
    });
  } catch (error) {
    console.error('Get conversation messages error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get messages',
      details: error.message
    });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversationId = req.params.conversationId;
    const { text } = req.body;
    
    // Check if conversation exists
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({
        error: true,
        message: 'Conversation not found'
      });
    }
    
    // Check if user is a participant in direct conversation
    if (!conversation.isGroupChat) {
      const isParticipant = await conversation.hasParticipant(userId);
      if (!isParticipant) {
        return res.status(403).json({
          error: true,
          message: 'Not authorized to send message to this conversation'
        });
      }
    } else {
      // Check if user is a member of the group
      const group = await conversation.getGroup();
      const isMember = await group.hasMember(userId);
      if (!isMember) {
        return res.status(403).json({
          error: true,
          message: 'Not authorized to send message to this group conversation'
        });
      }
    }
    
    // Create message
    const message = await Message.create({
      conversationId,
      senderId: userId,
      text,
      timestamp: new Date(),
      readBy: [userId] // Sender has read their own message
    });
    
    // Update conversation's last message and time
    await conversation.update({
      lastMessage: text,
      lastMessageTime: new Date()
    });
    
    // Get message with sender info
    const messageWithSender = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name', 'image']
        }
      ]
    });
    
    return res.status(201).json({
      success: true,
      message: messageWithSender
    });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to send message',
      details: error.message
    });
  }
};

// Create new conversation
exports.createConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { recipientId, groupId } = req.body;
    
    // Check if it's a direct conversation or group conversation
    if (recipientId) {
      // Direct conversation (1-on-1)
      
      // Check if recipient exists
      const recipient = await User.findByPk(recipientId);
      if (!recipient) {
        return res.status(404).json({
          error: true,
          message: 'Recipient not found'
        });
      }
      
      // Check if conversation already exists between these users
      const existingConversation = await Conversation.findOne({
        where: {
          isGroupChat: false
        },
        include: [
          {
            model: User,
            as: 'participants',
            where: { id: userId },
            attributes: []
          },
          {
            model: User,
            as: 'participants',
            where: { id: recipientId },
            attributes: []
          }
        ]
      });
      
      if (existingConversation) {
        // Return existing conversation
        const conversation = await Conversation.findByPk(existingConversation.id, {
          include: [
            {
              model: User,
              as: 'participants',
              attributes: ['id', 'name', 'image']
            }
          ]
        });
        
        return res.status(200).json({
          success: true,
          conversation,
          message: 'Conversation already exists'
        });
      }
      
      // Create new conversation
      const conversation = await Conversation.create({
        isGroupChat: false
      });
      
      // Add participants
      await conversation.addParticipant(userId);
      await conversation.addParticipant(recipientId);
      
      // Get conversation with participants
      const conversationWithParticipants = await Conversation.findByPk(conversation.id, {
        include: [
          {
            model: User,
            as: 'participants',
            attributes: ['id', 'name', 'image']
          }
        ]
      });
      
      return res.status(201).json({
        success: true,
        conversation: conversationWithParticipants
      });
    } else if (groupId) {
      // Group conversation
      
      // Check if group exists
      const group = await Group.findByPk(groupId);
      if (!group) {
        return res.status(404).json({
          error: true,
          message: 'Group not found'
        });
      }
      
      // Check if user is a member of the group
      const isMember = await group.hasMember(userId);
      if (!isMember) {
        return res.status(403).json({
          error: true,
          message: 'Not authorized to create conversation for this group'
        });
      }
      
      // Check if conversation already exists for this group
      let conversation = await Conversation.findOne({
        where: {
          isGroupChat: true,
          groupId
        }
      });
      
      if (conversation) {
        // Return existing conversation
        conversation = await Conversation.findByPk(conversation.id, {
          include: [
            {
              model: Group,
              as: 'group'
            }
          ]
        });
        
        return res.status(200).json({
          success: true,
          conversation,
          message: 'Group conversation already exists'
        });
      }
      
      // Create new conversation
      conversation = await Conversation.create({
        isGroupChat: true,
        groupId
      });
      
      // Get conversation with group
      const conversationWithGroup = await Conversation.findByPk(conversation.id, {
        include: [
          {
            model: Group,
            as: 'group'
          }
        ]
      });
      
      return res.status(201).json({
        success: true,
        conversation: conversationWithGroup
      });
    } else {
      return res.status(400).json({
        error: true,
        message: 'Either recipientId or groupId must be provided'
      });
    }
  } catch (error) {
    console.error('Create conversation error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to create conversation',
      details: error.message
    });
  }
}; 