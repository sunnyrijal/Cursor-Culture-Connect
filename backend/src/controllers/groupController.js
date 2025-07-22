const { Group, User, GroupRequest, Notification } = require('../models');
const { Op } = require('sequelize');

// Get all groups
exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({
      include: [
        {
          model: User,
          as: 'president',
          attributes: ['id', 'fullName', 'avatar']
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      groups
    });
  } catch (error) {
    console.error('Error getting groups:', error);
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
    const { id } = req.params;
    const userId = req.user.id;
    
    const group = await Group.findByPk(id, {
      include: [
        {
          model: User,
          as: 'president',
          attributes: ['id', 'fullName', 'avatar']
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'fullName', 'avatar', 'university'],
          through: { attributes: [] }
        },
        {
          model: User,
          as: 'admins',
          attributes: ['id', 'fullName', 'avatar'],
          through: { attributes: [] }
        }
      ]
    });
    
    if (!group) {
      return res.status(404).json({
        error: true,
        message: 'Group not found'
      });
    }
    
    // Check if the user is a member of the group
    const isMember = group.members.some(member => member.id === userId);
    
    // Check if the user is an admin of the group
    const isAdmin = group.admins.some(admin => admin.id === userId);
    
    // Check if the user is the president of the group
    const isPresident = group.presidentId === userId;
    
    // Add these properties to the group object
    const groupData = group.toJSON();
    groupData.isMember = isMember;
    groupData.isAdmin = isAdmin;
    groupData.isPresident = isPresident;
    
    // Check if there's a pending join request from the user
    const pendingRequest = await GroupRequest.findOne({
      where: {
        groupId: id,
        requesterId: userId,
        status: 'pending'
      }
    });
    
    groupData.hasPendingRequest = !!pendingRequest;
    
    return res.status(200).json({
      success: true,
      group: groupData
    });
  } catch (error) {
    console.error('Error getting group:', error);
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
    const { name, description, category, location, isPublic, image, universityOnly, allowedUniversity, meetingTime, meetingDate, meetingLocation, meetingDays } = req.body;
    
    if (!name || !description || !category) {
      return res.status(400).json({
        error: true,
        message: 'Name, description, and category are required'
      });
    }
    
    // Create the group
    const group = await Group.create({
      name,
      description,
      category,
      location,
      isPublic,
      image,
      universityOnly,
      allowedUniversity,
      meetingTime,
      meetingDate,
      meetingLocation,
      meetingDays,
      presidentId: userId
    });
    
    // Add the creator as a member and admin
    await group.addMember(userId);
    await group.addAdmin(userId);
    
    return res.status(201).json({
      success: true,
      message: 'Group created successfully',
      group
    });
  } catch (error) {
    console.error('Error creating group:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to create group',
      details: error.message
    });
  }
};

// Request to join a group
exports.requestJoinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const { message } = req.body;
    
    // Check if the group exists
    const group = await Group.findByPk(groupId, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id'],
          through: { attributes: [] }
        },
        {
          model: User,
          as: 'admins',
          attributes: ['id'],
          through: { attributes: [] }
        }
      ]
    });
    
    if (!group) {
      return res.status(404).json({
        error: true,
        message: 'Group not found'
      });
    }
    
    // Check if user is already a member
    const isMember = group.members.some(member => member.id === userId);
    if (isMember) {
      return res.status(400).json({
        error: true,
        message: 'You are already a member of this group'
      });
    }
    
    // Check if there's already a pending request
    const existingRequest = await GroupRequest.findOne({
      where: {
        groupId,
        requesterId: userId,
        status: 'pending'
      }
    });
    
    if (existingRequest) {
      return res.status(400).json({
        error: true,
        message: 'You already have a pending request to join this group'
      });
    }
    
    // Create the join request
    const request = await GroupRequest.create({
      groupId,
      requesterId: userId,
      message
    });
    
    // Get user details for notification
    const user = await User.findByPk(userId, {
      attributes: ['fullName']
    });
    
    // Create notifications for all admins
    const adminIds = group.admins.map(admin => admin.id);
    
    // Bulk create notifications for admins
    await Promise.all(adminIds.map(adminId => {
      return Notification.create({
        recipientId: adminId,
        senderId: userId,
        type: 'group_request',
        title: 'New Group Join Request',
        message: `${user.fullName} has requested to join ${group.name}`,
        relatedId: request.id,
        relatedType: 'GroupRequest'
      });
    }));
    
    return res.status(200).json({
      success: true,
      message: 'Join request sent successfully',
      request
    });
  } catch (error) {
    console.error('Error requesting to join group:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to send join request',
      details: error.message
    });
  }
};

// Respond to a join request (approve/reject)
exports.respondToJoinRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;
    const { status } = req.body;
    
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        error: true,
        message: 'Status must be either "approved" or "rejected"'
      });
    }
    
    // Find the request
    const request = await GroupRequest.findByPk(requestId, {
      include: [
        {
          model: Group,
          as: 'group',
          include: [
            {
              model: User,
              as: 'admins',
              attributes: ['id'],
              through: { attributes: [] }
            }
          ]
        },
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'fullName']
        }
      ]
    });
    
    if (!request) {
      return res.status(404).json({
        error: true,
        message: 'Request not found'
      });
    }
    
    // Check if the user is an admin of the group
    const isAdmin = request.group.admins.some(admin => admin.id === userId);
    if (!isAdmin) {
      return res.status(403).json({
        error: true,
        message: 'You are not authorized to respond to this request'
      });
    }
    
    // Update the request status
    request.status = status;
    request.responderId = userId;
    await request.save();
    
    // If approved, add the requester as a member
    if (status === 'approved') {
      await request.group.addMember(request.requesterId);
    }
    
    // Create a notification for the requester
    await Notification.create({
      recipientId: request.requesterId,
      senderId: userId,
      type: 'group_request_response',
      title: `Group Request ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: `Your request to join ${request.group.name} has been ${status}`,
      relatedId: request.groupId,
      relatedType: 'Group'
    });
    
    return res.status(200).json({
      success: true,
      message: `Request ${status} successfully`,
      request
    });
  } catch (error) {
    console.error('Error responding to join request:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to respond to join request',
      details: error.message
    });
  }
};

// Get pending join requests for a group
exports.getPendingJoinRequests = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    
    // Check if the group exists
    const group = await Group.findByPk(groupId, {
      include: [
        {
          model: User,
          as: 'admins',
          attributes: ['id'],
          through: { attributes: [] }
        }
      ]
    });
    
    if (!group) {
      return res.status(404).json({
        error: true,
        message: 'Group not found'
      });
    }
    
    // Check if the user is an admin of the group
    const isAdmin = group.admins.some(admin => admin.id === userId);
    if (!isAdmin) {
      return res.status(403).json({
        error: true,
        message: 'You are not authorized to view join requests'
      });
    }
    
    // Get pending requests
    const requests = await GroupRequest.findAll({
      where: {
        groupId,
        status: 'pending'
      },
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'fullName', 'avatar', 'university']
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Error getting pending join requests:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get pending join requests',
      details: error.message
    });
  }
};

// Add an admin to a group
exports.addGroupAdmin = async (req, res) => {
  try {
    const { groupId, userId: targetUserId } = req.params;
    const currentUserId = req.user.id;
    
    // Check if the group exists
    const group = await Group.findByPk(groupId, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id'],
          through: { attributes: [] }
        },
        {
          model: User,
          as: 'admins',
          attributes: ['id'],
          through: { attributes: [] }
        }
      ]
    });
    
    if (!group) {
      return res.status(404).json({
        error: true,
        message: 'Group not found'
      });
    }
    
    // Check if current user is president or admin
    const isPresident = group.presidentId === currentUserId;
    const isAdmin = group.admins.some(admin => admin.id === currentUserId);
    
    if (!isPresident && !isAdmin) {
      return res.status(403).json({
        error: true,
        message: 'You are not authorized to add admins'
      });
    }
    
    // Check if target user is a member
    const isMember = group.members.some(member => member.id === targetUserId);
    if (!isMember) {
      return res.status(400).json({
        error: true,
        message: 'User must be a member of the group first'
      });
    }
    
    // Check if target user is already an admin
    const isAlreadyAdmin = group.admins.some(admin => admin.id === targetUserId);
    if (isAlreadyAdmin) {
      return res.status(400).json({
        error: true,
        message: 'User is already an admin of this group'
      });
    }
    
    // Add the user as an admin
    await group.addAdmin(targetUserId);
    
    // Create a notification for the new admin
    await Notification.create({
      recipientId: targetUserId,
      senderId: currentUserId,
      type: 'group_admin_added',
      title: 'New Admin Role',
      message: `You have been made an admin of ${group.name}`,
      relatedId: groupId,
      relatedType: 'Group'
    });
    
    return res.status(200).json({
      success: true,
      message: 'Admin added successfully'
    });
  } catch (error) {
    console.error('Error adding admin:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to add admin',
      details: error.message
    });
  }
};

// Remove an admin from a group
exports.removeGroupAdmin = async (req, res) => {
  try {
    const { groupId, userId: targetUserId } = req.params;
    const currentUserId = req.user.id;
    
    // Check if the group exists
    const group = await Group.findByPk(groupId, {
      include: [
        {
          model: User,
          as: 'admins',
          attributes: ['id'],
          through: { attributes: [] }
        }
      ]
    });
    
    if (!group) {
      return res.status(404).json({
        error: true,
        message: 'Group not found'
      });
    }
    
    // Only president can remove admins
    const isPresident = group.presidentId === currentUserId;
    
    if (!isPresident) {
      return res.status(403).json({
        error: true,
        message: 'Only the group president can remove admins'
      });
    }
    
    // Check if target user is an admin
    const isAdmin = group.admins.some(admin => admin.id === targetUserId);
    if (!isAdmin) {
      return res.status(400).json({
        error: true,
        message: 'User is not an admin of this group'
      });
    }
    
    // Cannot remove president as admin
    if (targetUserId === group.presidentId) {
      return res.status(400).json({
        error: true,
        message: 'Cannot remove the president as an admin'
      });
    }
    
    // Remove the user as an admin
    await group.removeAdmin(targetUserId);
    
    // Create a notification for the removed admin
    await Notification.create({
      recipientId: targetUserId,
      senderId: currentUserId,
      type: 'group_admin_removed',
      title: 'Admin Role Removed',
      message: `You are no longer an admin of ${group.name}`,
      relatedId: groupId,
      relatedType: 'Group'
    });
    
    return res.status(200).json({
      success: true,
      message: 'Admin removed successfully'
    });
  } catch (error) {
    console.error('Error removing admin:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to remove admin',
      details: error.message
    });
  }
};

// Get groups for the current user
exports.getUserGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get groups where user is a member
    const userWithGroups = await User.findByPk(userId, {
      include: [
        {
          model: Group,
          as: 'memberGroups',
          include: [
            {
              model: User,
              as: 'president',
              attributes: ['id', 'fullName', 'avatar']
            }
          ]
        },
        {
          model: Group,
          as: 'adminGroups',
          attributes: ['id']
        },
        {
          model: Group,
          as: 'createdGroups',
          attributes: ['id']
        }
      ]
    });
    
    if (!userWithGroups) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    
    // Process groups to add roles
    const groups = userWithGroups.memberGroups.map(group => {
      const groupData = group.toJSON();
      groupData.isAdmin = userWithGroups.adminGroups.some(adminGroup => adminGroup.id === group.id);
      groupData.isPresident = userWithGroups.createdGroups.some(createdGroup => createdGroup.id === group.id);
      return groupData;
    });
    
    return res.status(200).json({
      success: true,
      groups
    });
  } catch (error) {
    console.error('Error getting user groups:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get user groups',
      details: error.message
    });
  }
}; 