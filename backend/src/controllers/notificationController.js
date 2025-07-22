const { Notification, User } = require('../models');

// Get all notifications for the current user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notifications = await Notification.findAll({
      where: {
        recipientId: userId
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'fullName', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      notifications
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get notifications',
      details: error.message
    });
  }
};

// Mark a notification as read
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    const notification = await Notification.findByPk(notificationId);
    
    if (!notification) {
      return res.status(404).json({
        error: true,
        message: 'Notification not found'
      });
    }
    
    // Check if the user is the recipient
    if (notification.recipientId !== userId) {
      return res.status(403).json({
        error: true,
        message: 'Not authorized to mark this notification as read'
      });
    }
    
    notification.read = true;
    await notification.save();
    
    return res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to mark notification as read',
      details: error.message
    });
  }
};

// Mark all notifications as read
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await Notification.update(
      { read: true },
      {
        where: {
          recipientId: userId,
          read: false
        }
      }
    );
    
    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to mark all notifications as read',
      details: error.message
    });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const count = await Notification.count({
      where: {
        recipientId: userId,
        read: false
      }
    });
    
    return res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get unread notification count',
      details: error.message
    });
  }
}; 