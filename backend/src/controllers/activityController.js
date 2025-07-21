const { Activity, User, ActivityPreference, Availability, TimeSlot, ActivityRequest, ActivityMatch } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

// Get all activities
exports.getActivities = async (req, res) => {
  try {
    const { category, indoor, outdoor } = req.query;
    
    const whereClause = {};
    
    if (category) whereClause.category = category;
    if (indoor !== undefined) whereClause.indoor = indoor === 'true';
    if (outdoor !== undefined) whereClause.outdoor = outdoor === 'true';
    
    const activities = await Activity.findAll({
      where: whereClause,
      order: [['name', 'ASC']]
    });
    
    return res.status(200).json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Get activities error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get activities',
      details: error.message
    });
  }
};

// Get activity by ID
exports.getActivityById = async (req, res) => {
  try {
    const activityId = req.params.id;
    
    const activity = await Activity.findByPk(activityId);
    
    if (!activity) {
      return res.status(404).json({
        error: true,
        message: 'Activity not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      activity
    });
  } catch (error) {
    console.error('Get activity error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get activity',
      details: error.message
    });
  }
};

// Get user's activity preferences
exports.getUserActivityPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const preferences = await ActivityPreference.findAll({
      where: { userId },
      include: [
        {
          model: Activity,
          as: 'activity'
        },
        {
          model: Availability,
          as: 'availability',
          include: [
            {
              model: TimeSlot,
              as: 'timeSlots'
            }
          ]
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      preferences
    });
  } catch (error) {
    console.error('Get user activity preferences error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get activity preferences',
      details: error.message
    });
  }
};

// Create or update activity preference
exports.updateActivityPreference = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.user.id;
    const activityId = req.params.activityId;
    
    const { 
      isOpen,
      locationRadius,
      equipment,
      transportation,
      skillLevel,
      notes,
      availability
    } = req.body;
    
    // Check if activity exists
    const activity = await Activity.findByPk(activityId);
    if (!activity) {
      await transaction.rollback();
      return res.status(404).json({
        error: true,
        message: 'Activity not found'
      });
    }
    
    // Find or create preference
    let preference = await ActivityPreference.findOne({
      where: {
        userId,
        activityId
      }
    });
    
    if (preference) {
      // Update existing preference
      await preference.update({
        isOpen,
        locationRadius,
        equipment,
        transportation,
        skillLevel,
        notes
      }, { transaction });
    } else {
      // Create new preference
      preference = await ActivityPreference.create({
        userId,
        activityId,
        isOpen,
        locationRadius,
        equipment,
        transportation,
        skillLevel,
        notes
      }, { transaction });
    }
    
    // Delete old availability if updating
    if (preference && availability) {
      // Get existing availabilities
      const existingAvailabilities = await Availability.findAll({
        where: {
          preferenceId: preference.id
        },
        include: [
          {
            model: TimeSlot,
            as: 'timeSlots'
          }
        ],
        transaction
      });
      
      // Delete all time slots
      for (const avail of existingAvailabilities) {
        await TimeSlot.destroy({
          where: {
            availabilityId: avail.id
          },
          transaction
        });
      }
      
      // Delete all availabilities
      await Availability.destroy({
        where: {
          preferenceId: preference.id
        },
        transaction
      });
      
      // Create new availability
      if (Array.isArray(availability)) {
        for (const avail of availability) {
          const { day, timeSlots } = avail;
          
          const newAvailability = await Availability.create({
            day,
            preferenceId: preference.id
          }, { transaction });
          
          if (Array.isArray(timeSlots)) {
            for (const slot of timeSlots) {
              await TimeSlot.create({
                startTime: slot.startTime,
                endTime: slot.endTime,
                availabilityId: newAvailability.id
              }, { transaction });
            }
          }
        }
      }
    }
    
    await transaction.commit();
    
    // Get updated preference with all associations
    const updatedPreference = await ActivityPreference.findByPk(preference.id, {
      include: [
        {
          model: Activity,
          as: 'activity'
        },
        {
          model: Availability,
          as: 'availability',
          include: [
            {
              model: TimeSlot,
              as: 'timeSlots'
            }
          ]
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      message: preference ? 'Activity preference updated' : 'Activity preference created',
      preference: updatedPreference
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Update activity preference error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to update activity preference',
      details: error.message
    });
  }
};

// Delete activity preference
exports.deleteActivityPreference = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const userId = req.user.id;
    const activityId = req.params.activityId;
    
    // Find preference
    const preference = await ActivityPreference.findOne({
      where: {
        userId,
        activityId
      },
      include: [
        {
          model: Availability,
          as: 'availability',
          include: [
            {
              model: TimeSlot,
              as: 'timeSlots'
            }
          ]
        }
      ]
    });
    
    if (!preference) {
      await transaction.rollback();
      return res.status(404).json({
        error: true,
        message: 'Activity preference not found'
      });
    }
    
    // Delete all time slots
    for (const avail of preference.availability) {
      await TimeSlot.destroy({
        where: {
          availabilityId: avail.id
        },
        transaction
      });
    }
    
    // Delete all availabilities
    await Availability.destroy({
      where: {
        preferenceId: preference.id
      },
      transaction
    });
    
    // Delete preference
    await preference.destroy({ transaction });
    
    await transaction.commit();
    
    return res.status(200).json({
      success: true,
      message: 'Activity preference deleted'
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Delete activity preference error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to delete activity preference',
      details: error.message
    });
  }
};

// Find activity buddies
exports.findActivityBuddies = async (req, res) => {
  try {
    const userId = req.user.id;
    const activityId = req.params.activityId;
    
    // Check if user has a preference for this activity
    const userPreference = await ActivityPreference.findOne({
      where: {
        userId,
        activityId,
        isOpen: true
      },
      include: [
        {
          model: Availability,
          as: 'availability',
          include: [
            {
              model: TimeSlot,
              as: 'timeSlots'
            }
          ]
        }
      ]
    });
    
    if (!userPreference) {
      return res.status(400).json({
        error: true,
        message: 'You must have an open preference for this activity to find buddies'
      });
    }
    
    // Find other users with preferences for the same activity
    const otherPreferences = await ActivityPreference.findAll({
      where: {
        activityId,
        userId: { [Op.ne]: userId },
        isOpen: true
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'image', 'university', 'major', 'heritage', 'languages']
        },
        {
          model: Availability,
          as: 'availability',
          include: [
            {
              model: TimeSlot,
              as: 'timeSlots'
            }
          ]
        }
      ]
    });
    
    // Calculate match scores
    const matches = [];
    
    for (const otherPref of otherPreferences) {
      // Calculate time slot overlap
      const commonAvailability = [];
      let timeOverlapScore = 0;
      
      // For each day the user is available
      for (const userDay of userPreference.availability) {
        // Find if the other user is also available on that day
        const otherDay = otherPref.availability.find(a => a.day === userDay.day);
        
        if (otherDay) {
          const commonSlotsForDay = [];
          
          // For each time slot the user has on that day
          for (const userSlot of userDay.timeSlots) {
            // Check each time slot of the other user for overlap
            for (const otherSlot of otherDay.timeSlots) {
              // Check if time slots overlap
              const userStart = convertTimeToMinutes(userSlot.startTime);
              const userEnd = convertTimeToMinutes(userSlot.endTime);
              const otherStart = convertTimeToMinutes(otherSlot.startTime);
              const otherEnd = convertTimeToMinutes(otherSlot.endTime);
              
              if (userStart < otherEnd && userEnd > otherStart) {
                // Slots overlap
                const overlapStart = Math.max(userStart, otherStart);
                const overlapEnd = Math.min(userEnd, otherEnd);
                const overlapDuration = overlapEnd - overlapStart;
                
                timeOverlapScore += overlapDuration;
                
                commonSlotsForDay.push({
                  startTime: minutesToTimeString(overlapStart),
                  endTime: minutesToTimeString(overlapEnd)
                });
              }
            }
          }
          
          if (commonSlotsForDay.length > 0) {
            commonAvailability.push({
              day: userDay.day,
              timeSlots: commonSlotsForDay
            });
          }
        }
      }
      
      // Calculate equipment and transportation compatibility
      let equipmentScore = 0;
      let transportationScore = 0;
      
      if (
        userPreference.equipment === 'have' && otherPref.equipment === 'need' ||
        userPreference.equipment === 'need' && otherPref.equipment === 'have' ||
        userPreference.equipment === 'can_share' && otherPref.equipment === 'need' ||
        userPreference.equipment === 'not_needed' && otherPref.equipment === 'not_needed'
      ) {
        equipmentScore = 1;
      } else {
        equipmentScore = 0.5;
      }
      
      if (
        userPreference.transportation === 'have_car' && otherPref.transportation === 'need_ride' ||
        userPreference.transportation === 'need_ride' && otherPref.transportation === 'have_car' ||
        userPreference.transportation === 'can_drive' && otherPref.transportation === 'need_ride' ||
        userPreference.transportation === 'public_transit' && otherPref.transportation === 'public_transit' ||
        userPreference.transportation === 'walking_distance' && otherPref.transportation === 'walking_distance'
      ) {
        transportationScore = 1;
      } else {
        transportationScore = 0.5;
      }
      
      // Calculate skill level compatibility
      let skillScore = 1;
      if (userPreference.skillLevel === otherPref.skillLevel) {
        skillScore = 1;
      } else if (
        (userPreference.skillLevel === 'beginner' && otherPref.skillLevel === 'intermediate') ||
        (userPreference.skillLevel === 'intermediate' && otherPref.skillLevel === 'beginner') ||
        (userPreference.skillLevel === 'intermediate' && otherPref.skillLevel === 'advanced') ||
        (userPreference.skillLevel === 'advanced' && otherPref.skillLevel === 'intermediate')
      ) {
        skillScore = 0.7;
      } else {
        skillScore = 0.4; // Beginner with advanced might not be ideal
      }
      
      // Calculate final match score (0-100)
      const timeScore = Math.min(1, timeOverlapScore / 600); // Cap at 10 hours (600 min) of overlap
      const matchScore = Math.round((timeScore * 0.5 + equipmentScore * 0.2 + transportationScore * 0.2 + skillScore * 0.1) * 100);
      
      // Only include matches with common availability
      if (commonAvailability.length > 0) {
        matches.push({
          user: otherPref.user,
          matchScore,
          commonAvailability,
          preference: otherPref
        });
      }
    }
    
    // Sort by match score (highest first)
    matches.sort((a, b) => b.matchScore - a.matchScore);
    
    return res.status(200).json({
      success: true,
      matches
    });
  } catch (error) {
    console.error('Find activity buddies error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to find activity buddies',
      details: error.message
    });
  }
};

// Helper function to convert time string (HH:MM) to minutes since midnight
function convertTimeToMinutes(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper function to convert minutes since midnight to time string (HH:MM)
function minutesToTimeString(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Create an activity request
exports.createActivityRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const recipientId = req.params.userId;
    const activityId = req.params.activityId;
    
    const { 
      message, 
      proposedDateTime, 
      location 
    } = req.body;
    
    // Check if recipient exists
    const recipient = await User.findByPk(recipientId);
    if (!recipient) {
      return res.status(404).json({
        error: true,
        message: 'Recipient not found'
      });
    }
    
    // Check if activity exists
    const activity = await Activity.findByPk(activityId);
    if (!activity) {
      return res.status(404).json({
        error: true,
        message: 'Activity not found'
      });
    }
    
    // Create the request
    const request = await ActivityRequest.create({
      requesterId: userId,
      recipientId,
      activityId,
      message,
      proposedDateTime,
      location,
      status: 'pending'
    });
    
    // Get the full request with associations
    const fullRequest = await ActivityRequest.findByPk(request.id, {
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'image']
        },
        {
          model: Activity,
          as: 'activity'
        }
      ]
    });
    
    return res.status(201).json({
      success: true,
      message: 'Activity request sent',
      request: fullRequest
    });
  } catch (error) {
    console.error('Create activity request error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to send activity request',
      details: error.message
    });
  }
};

// Get received activity requests
exports.getReceivedRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const requests = await ActivityRequest.findAll({
      where: {
        recipientId: userId
      },
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'image', 'university', 'major']
        },
        {
          model: Activity,
          as: 'activity'
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Get received requests error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get activity requests',
      details: error.message
    });
  }
};

// Get sent activity requests
exports.getSentRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const requests = await ActivityRequest.findAll({
      where: {
        requesterId: userId
      },
      include: [
        {
          model: User,
          as: 'recipient',
          attributes: ['id', 'name', 'image', 'university', 'major']
        },
        {
          model: Activity,
          as: 'activity'
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      requests
    });
  } catch (error) {
    console.error('Get sent requests error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get sent activity requests',
      details: error.message
    });
  }
};

// Respond to activity request
exports.respondToRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const requestId = req.params.requestId;
    const { status } = req.body;
    
    // Validate status
    if (!['accepted', 'declined', 'cancelled'].includes(status)) {
      return res.status(400).json({
        error: true,
        message: 'Invalid status. Must be "accepted", "declined", or "cancelled"'
      });
    }
    
    // Find the request
    const request = await ActivityRequest.findByPk(requestId, {
      include: [
        {
          model: User,
          as: 'requester'
        },
        {
          model: Activity,
          as: 'activity'
        }
      ]
    });
    
    if (!request) {
      return res.status(404).json({
        error: true,
        message: 'Activity request not found'
      });
    }
    
    // Check if user is authorized to respond
    if (request.recipientId !== userId && request.requesterId !== userId) {
      return res.status(403).json({
        error: true,
        message: 'Not authorized to respond to this request'
      });
    }
    
    // Only the recipient can accept/decline
    if ((status === 'accepted' || status === 'declined') && request.recipientId !== userId) {
      return res.status(403).json({
        error: true,
        message: 'Only the recipient can accept or decline requests'
      });
    }
    
    // Only the requester can cancel
    if (status === 'cancelled' && request.requesterId !== userId) {
      return res.status(403).json({
        error: true,
        message: 'Only the requester can cancel requests'
      });
    }
    
    // Update the request
    await request.update({ status });
    
    // Create a match record if accepted
    if (status === 'accepted') {
      await ActivityMatch.create({
        user1Id: request.requesterId,
        user2Id: request.recipientId,
        activityId: request.activityId,
        matchScore: 100, // Perfect match since it was accepted
        createdAt: new Date()
      });
    }
    
    return res.status(200).json({
      success: true,
      message: `Activity request ${status}`,
      request
    });
  } catch (error) {
    console.error('Respond to request error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to respond to activity request',
      details: error.message
    });
  }
}; 