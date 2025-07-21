const { Group, User, Media, SocialMedia, Event } = require('../models');
const { Op } = require('sequelize');

// Get all groups with optional filters
exports.getGroups = async (req, res) => {
  try {
    const { 
      category, 
      university, 
      location, 
      isPublic, 
      search, 
      limit = 10, 
      offset = 0 
    } = req.query;

    const whereClause = {};
    
    // Apply filters if provided
    if (category) whereClause.category = category;
    if (university) whereClause.location = university;
    if (location) whereClause.location = { [Op.like]: `%${location}%` };
    if (isPublic !== undefined) whereClause.isPublic = isPublic === 'true';
    
    // Search by name or description
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const groups = await Group.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'president',
          attributes: ['id', 'name', 'image']
        },
        {
          model: Media,
          as: 'media',
          limit: 5
        },
        {
          model: SocialMedia,
          as: 'socialMedia'
        },
        {
          model: Event,
          as: 'events',
          limit: 3,
          where: {
            // Only include upcoming events (date is in the future)
            date: { [Op.gt]: new Date().toISOString().split('T')[0] }
          },
          required: false // LEFT JOIN to include groups with no events
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    // If user is logged in, check which groups they've joined
    if (req.user) {
      const userId = req.user.id;
      const userGroups = await User.findByPk(userId, {
        include: [
          {
            model: Group,
            as: 'groups',
            attributes: ['id']
          }
        ]
      });

      const joinedGroupIds = userGroups.groups.map(group => group.id);
      
      // Add isJoined flag to each group
      groups.rows = groups.rows.map(group => {
        const plainGroup = group.get({ plain: true });
        plainGroup.isJoined = joinedGroupIds.includes(plainGroup.id);
        plainGroup.upcomingEvents = plainGroup.events ? plainGroup.events.length : 0;
        return plainGroup;
      });
    } else {
      // For non-logged in users, set isJoined to false for all groups
      groups.rows = groups.rows.map(group => {
        const plainGroup = group.get({ plain: true });
        plainGroup.isJoined = false;
        plainGroup.upcomingEvents = plainGroup.events ? plainGroup.events.length : 0;
        return plainGroup;
      });
    }

    return res.status(200).json({
      success: true,
      count: groups.count,
      groups: groups.rows
    });
  } catch (error) {
    console.error('Get groups error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get groups',
      details: error.message
    });
  }
};

// Get group by ID
exports.getGroupById = async (req, res) => {
  try {
    const groupId = req.params.id;
    
    const group = await Group.findByPk(groupId, {
      include: [
        {
          model: User,
          as: 'president',
          attributes: ['id', 'name', 'image']
        },
        {
          model: User,
          as: 'officers',
          attributes: ['id', 'name', 'image']
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'image'],
          through: { attributes: [] } // Don't include join table data
        },
        {
          model: Media,
          as: 'media'
        },
        {
          model: SocialMedia,
          as: 'socialMedia'
        },
        {
          model: Event,
          as: 'events',
          where: {
            // Only include upcoming events (date is in the future)
            date: { [Op.gt]: new Date().toISOString().split('T')[0] }
          },
          required: false // LEFT JOIN to include groups with no events
        },
        {
          model: Event,
          as: 'pastEvents',
          through: { attributes: [] } // Don't include join table data
        }
      ]
    });
    
    if (!group) {
      return res.status(404).json({
        error: true,
        message: 'Group not found'
      });
    }
    
    // If user is logged in, check if they've joined this group
    let isJoined = false;
    if (req.user) {
      const userId = req.user.id;
      const member = await group.members.find(member => member.id === userId);
      isJoined = !!member;
    }
    
    const plainGroup = group.get({ plain: true });
    plainGroup.isJoined = isJoined;
    plainGroup.memberCount = plainGroup.members.length;
    plainGroup.upcomingEvents = plainGroup.events.length;
    plainGroup.recentActivity = plainGroup.events.length > 0 ? 'Recent event activity' : (
      plainGroup.members.length > 0 ? 'New members joined' : 'Group created'
    );
    
    return res.status(200).json({
      success: true,
      group: plainGroup
    });
  } catch (error) {
    console.error('Get group error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get group',
      details: error.message
    });
  }
};

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const {
      name,
      description,
      category,
      location,
      isPublic,
      meetingTime,
      meetingDate,
      meetingLocation,
      meetingDays,
      universityOnly,
      allowedUniversity,
      image
    } = req.body;
    
    // Create the group
    const group = await Group.create({
      name,
      description,
      category,
      location,
      isPublic,
      meetingTime,
      meetingDate,
      meetingLocation,
      meetingDays,
      universityOnly,
      allowedUniversity,
      presidentId: userId,
      image,
      memberCount: 1, // President is the first member
      chatId: `group-chat-${Date.now()}`
    });
    
    // Add creator as president and member
    await group.setPresident(userId);
    await group.addMember(userId);
    
    // Process social media links if provided
    if (req.body.socialMedia && Array.isArray(req.body.socialMedia)) {
      const socialMediaPromises = req.body.socialMedia.map(social => 
        SocialMedia.create({
          platform: social.platform,
          link: social.link,
          groupId: group.id
        })
      );
      await Promise.all(socialMediaPromises);
    }
    
    return res.status(201).json({
      success: true,
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    console.error('Create group error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to create group',
      details: error.message
    });
  }
};

// Update a group
exports.updateGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;
    
    // Check if group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({
        error: true,
        message: 'Group not found'
      });
    }
    
    // Check if user is president or an officer
    const isPresident = group.presidentId === userId;
    
    if (!isPresident) {
      const officers = await group.getOfficers();
      const isOfficer = officers.some(officer => officer.id === userId);
      
      if (!isOfficer) {
        return res.status(403).json({
          error: true,
          message: 'Only group presidents and officers can update the group'
        });
      }
    }
    
    // Update the group
    const updateData = {};
    const allowedFields = [
      'name', 'description', 'category', 'location', 'isPublic',
      'meetingTime', 'meetingDate', 'meetingLocation', 'meetingDays',
      'universityOnly', 'allowedUniversity', 'image'
    ];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    await group.update(updateData);
    
    // Update social media if provided
    if (req.body.socialMedia && Array.isArray(req.body.socialMedia)) {
      // Remove existing social media
      await SocialMedia.destroy({ where: { groupId } });
      
      // Add new social media
      const socialMediaPromises = req.body.socialMedia.map(social => 
        SocialMedia.create({
          platform: social.platform,
          link: social.link,
          groupId
        })
      );
      await Promise.all(socialMediaPromises);
    }
    
    // Fetch the updated group with all associations
    const updatedGroup = await Group.findByPk(groupId, {
      include: [
        {
          model: User,
          as: 'president',
          attributes: ['id', 'name', 'image']
        },
        {
          model: SocialMedia,
          as: 'socialMedia'
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      message: 'Group updated successfully',
      group: updatedGroup
    });
  } catch (error) {
    console.error('Update group error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to update group',
      details: error.message
    });
  }
};

// Join a group
exports.joinGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;
    
    // Check if group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({
        error: true,
        message: 'Group not found'
      });
    }
    
    // Check if user is already a member
    const members = await group.getMembers();
    const isMember = members.some(member => member.id === userId);
    
    if (isMember) {
      return res.status(400).json({
        error: true,
        message: 'User is already a member of this group'
      });
    }
    
    // Add user as member
    await group.addMember(userId);
    
    // Increment member count
    await group.update({
      memberCount: group.memberCount + 1
    });
    
    return res.status(200).json({
      success: true,
      message: 'Successfully joined the group'
    });
  } catch (error) {
    console.error('Join group error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to join group',
      details: error.message
    });
  }
};

// Leave a group
exports.leaveGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;
    
    // Check if group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({
        error: true,
        message: 'Group not found'
      });
    }
    
    // Check if user is a member
    const members = await group.getMembers();
    const isMember = members.some(member => member.id === userId);
    
    if (!isMember) {
      return res.status(400).json({
        error: true,
        message: 'User is not a member of this group'
      });
    }
    
    // Check if user is the president
    if (group.presidentId === userId) {
      return res.status(400).json({
        error: true,
        message: 'Group presidents cannot leave their group. Transfer presidency first.'
      });
    }
    
    // Remove user from members
    await group.removeMember(userId);
    
    // Remove user from officers if applicable
    const officers = await group.getOfficers();
    const isOfficer = officers.some(officer => officer.id === userId);
    if (isOfficer) {
      await group.removeOfficer(userId);
    }
    
    // Decrement member count
    await group.update({
      memberCount: Math.max(0, group.memberCount - 1)
    });
    
    return res.status(200).json({
      success: true,
      message: 'Successfully left the group'
    });
  } catch (error) {
    console.error('Leave group error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to leave group',
      details: error.message
    });
  }
};

// Add media to a group
exports.addGroupMedia = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;
    const { type, url, caption } = req.body;
    
    // Check if group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({
        error: true,
        message: 'Group not found'
      });
    }
    
    // Check if user is president, officer or member
    const isPresident = group.presidentId === userId;
    
    if (!isPresident) {
      const officers = await group.getOfficers();
      const isOfficer = officers.some(officer => officer.id === userId);
      
      if (!isOfficer) {
        const members = await group.getMembers();
        const isMember = members.some(member => member.id === userId);
        
        if (!isMember) {
          return res.status(403).json({
            error: true,
            message: 'Only group members can add media'
          });
        }
      }
    }
    
    // Add media
    const media = await Media.create({
      type,
      url,
      caption,
      groupId
    });
    
    return res.status(201).json({
      success: true,
      message: 'Media added successfully',
      media
    });
  } catch (error) {
    console.error('Add group media error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to add media',
      details: error.message
    });
  }
}; 