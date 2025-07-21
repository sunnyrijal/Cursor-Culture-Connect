const { User, Group, Event } = require('../models');
const { Op } = require('sequelize');

// Get all users with filters
exports.getUsers = async (req, res) => {
  try {
    const { 
      university, 
      heritage, 
      search,
      limit = 10, 
      offset = 0 
    } = req.query;

    const whereClause = {
      isPublic: true // Only show public profiles
    };
    
    // Apply filters if provided
    if (university) whereClause.university = { [Op.iLike]: `%${university}%` };
    
    if (heritage) {
      whereClause.heritage = { [Op.contains]: Array.isArray(heritage) ? heritage : [heritage] };
    }
    
    // Search by name, university, or heritage
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { university: { [Op.iLike]: `%${search}%` } },
        { bio: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    // If the requester is logged in, check mutual connections
    if (req.user) {
      const userId = req.user.id;
      const currentUser = await User.findByPk(userId, {
        include: [
          {
            model: User,
            as: 'connections',
            attributes: ['id']
          }
        ]
      });

      const userConnections = currentUser.connections.map(connection => connection.id);
      
      // Add isConnected flag to each user
      users.rows = users.rows.map(user => {
        const plainUser = user.get({ plain: true });
        plainUser.isConnected = userConnections.includes(plainUser.id);
        return plainUser;
      });
    }

    return res.status(200).json({
      success: true,
      count: users.count,
      users: users.rows
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get users',
      details: error.message
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Group,
          as: 'groups',
          attributes: ['id', 'name', 'image', 'category'],
          through: { attributes: [] }
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    
    // Check if the user's profile is public or if the requester is viewing their own profile
    if (!user.isPublic && (!req.user || req.user.id !== user.id)) {
      return res.status(403).json({
        error: true,
        message: 'This profile is private'
      });
    }
    
    // If the requester is logged in, check if they are connected
    let isConnected = false;
    let mutualConnections = 0;
    
    if (req.user && req.user.id !== user.id) {
      const currentUser = await User.findByPk(req.user.id, {
        include: [
          {
            model: User,
            as: 'connections',
            attributes: ['id']
          }
        ]
      });
      
      const userConnections = currentUser.connections.map(connection => connection.id);
      isConnected = userConnections.includes(user.id);
      
      // Calculate mutual connections
      const targetUser = await User.findByPk(user.id, {
        include: [
          {
            model: User,
            as: 'connections',
            attributes: ['id']
          }
        ]
      });
      
      const targetUserConnections = targetUser.connections.map(connection => connection.id);
      const mutual = userConnections.filter(id => targetUserConnections.includes(id));
      mutualConnections = mutual.length;
    }
    
    // Get user stats
    const stats = {
      groupsJoined: user.groups.length,
    };
    
    // Get events attended
    if (user.eventsAttended) {
      stats.eventsAttended = user.eventsAttended;
    } else {
      const attendedEvents = await user.getEvents();
      stats.eventsAttended = attendedEvents.length;
    }
    
    // Get connections count
    const connections = await user.getConnections();
    stats.connections = connections.length;
    
    const plainUser = user.get({ plain: true });
    plainUser.isConnected = isConnected;
    plainUser.mutualConnections = mutualConnections;
    plainUser.joinedGroups = stats.groupsJoined;
    plainUser.connections = stats.connections;
    plainUser.eventsAttended = stats.eventsAttended;
    
    return res.status(200).json({
      success: true,
      user: plainUser
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get user',
      details: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    
    // Fields that can be updated
    const allowedFields = [
      'name', 'university', 'major', 'year', 'title', 
      'heritage', 'languages', 'bio', 'image', 
      'location', 'country', 'state', 'linkedinUrl',
      'isPublic', 'privacy'
    ];
    
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    // Update user
    await user.update(updateData);
    
    // Get updated user
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to update profile',
      details: error.message
    });
  }
};

// Connect with another user
exports.connectWithUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetId = req.params.targetId;
    
    // Check that users aren't the same
    if (userId === targetId) {
      return res.status(400).json({
        error: true,
        message: 'Cannot connect with yourself'
      });
    }
    
    // Check if target user exists
    const targetUser = await User.findByPk(targetId);
    if (!targetUser) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    
    // Check if already connected
    const user = await User.findByPk(userId, {
      include: [
        {
          model: User,
          as: 'connections',
          where: { id: targetId },
          required: false
        }
      ]
    });
    
    if (user.connections.length > 0) {
      return res.status(400).json({
        error: true,
        message: 'Already connected with this user'
      });
    }
    
    // Add connection
    await user.addConnection(targetUser);
    
    // Also add reverse connection (mutual)
    await targetUser.addConnection(user);
    
    return res.status(200).json({
      success: true,
      message: 'Successfully connected with user'
    });
  } catch (error) {
    console.error('Connect with user error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to connect with user',
      details: error.message
    });
  }
};

// Remove connection with another user
exports.removeConnection = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetId = req.params.targetId;
    
    // Check that users aren't the same
    if (userId === targetId) {
      return res.status(400).json({
        error: true,
        message: 'Cannot disconnect from yourself'
      });
    }
    
    // Check if target user exists
    const targetUser = await User.findByPk(targetId);
    if (!targetUser) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    
    // Remove connection
    const user = await User.findByPk(userId);
    await user.removeConnection(targetUser);
    
    // Also remove reverse connection
    await targetUser.removeConnection(user);
    
    return res.status(200).json({
      success: true,
      message: 'Successfully disconnected from user'
    });
  } catch (error) {
    console.error('Remove connection error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to disconnect from user',
      details: error.message
    });
  }
};

// Get user connections
exports.getUserConnections = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    
    // Check privacy settings if not the current user
    if (userId !== req.user.id && !user.isPublic) {
      return res.status(403).json({
        error: true,
        message: 'This user\'s connections are private'
      });
    }
    
    // Get connections
    const connections = await User.findAll({
      attributes: { exclude: ['password'] },
      include: [
        {
          model: User,
          as: 'connections',
          where: { id: userId },
          attributes: []
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      connections
    });
  } catch (error) {
    console.error('Get user connections error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get user connections',
      details: error.message
    });
  }
};

// Get user groups
exports.getUserGroups = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    
    // Get groups
    const groups = await Group.findAll({
      include: [
        {
          model: User,
          as: 'members',
          where: { id: userId },
          attributes: []
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      groups
    });
  } catch (error) {
    console.error('Get user groups error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get user groups',
      details: error.message
    });
  }
};

// Get user events
exports.getUserEvents = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    
    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    
    // Get events
    const events = await Event.findAll({
      include: [
        {
          model: User,
          as: 'eventAttendees',
          where: { id: userId },
          attributes: []
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Get user events error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get user events',
      details: error.message
    });
  }
}; 