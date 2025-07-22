const { Event, User, Group, EventRequest, Notification } = require('../models');
const { Op } = require('sequelize');

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'avatar']
        },
        {
          model: Group,
          as: 'group',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'attendees',
          attributes: ['id'],
          through: { attributes: [] }
        }
      ],
      where: {
        status: 'approved'
      }
    });
    
    // Count attendees for each event
    const eventsWithCounts = events.map(event => {
      const eventData = event.toJSON();
      eventData.attendeeCount = eventData.attendees.length;
      delete eventData.attendees; // Remove the attendees array to avoid sending all IDs
      return eventData;
    });
    
    return res.status(200).json({
      success: true,
      events: eventsWithCounts
    });
  } catch (error) {
    console.error('Error getting events:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get events',
      details: error.message
    });
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const event = await Event.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'avatar']
        },
        {
          model: Group,
          as: 'group',
          attributes: ['id', 'name', 'image']
        },
        {
          model: User,
          as: 'attendees',
          attributes: ['id', 'fullName', 'avatar'],
          through: { attributes: [] }
        },
        {
          model: User,
          as: 'favoritedBy',
          attributes: ['id'],
          through: { attributes: [] }
        }
      ],
      where: {
        status: 'approved'
      }
    });
    
    if (!event) {
      return res.status(404).json({
        error: true,
        message: 'Event not found'
      });
    }
    
    // Check if the user is attending the event
    const isAttending = event.attendees.some(attendee => attendee.id === userId);
    
    // Check if the user has favorited the event
    const isFavorite = event.favoritedBy.some(user => user.id === userId);
    
    // Add these properties to the event object
    const eventData = event.toJSON();
    eventData.isAttending = isAttending;
    eventData.isFavorite = isFavorite;
    eventData.attendeeCount = eventData.attendees.length;
    
    return res.status(200).json({
      success: true,
      event: eventData
    });
  } catch (error) {
    console.error('Error getting event:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get event',
      details: error.message
    });
  }
};

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      title, description, date, time, location, category, 
      organizer, maxAttendees, image, price, 
      universityOnly, allowedUniversity, groupId 
    } = req.body;
    
    if (!title || !description || !date || !time || !location || !category || !groupId) {
      return res.status(400).json({
        error: true,
        message: 'Missing required fields'
      });
    }
    
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
    
    // Check if the user is a member of the group
    const isMember = await group.hasMembers(userId);
    if (!isMember) {
      return res.status(403).json({
        error: true,
        message: 'You must be a member of the group to create an event'
      });
    }
    
    // Create the event (initially with status 'pending')
    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      category,
      organizer: organizer || group.name, // Use group name as default
      maxAttendees,
      image,
      price,
      universityOnly,
      allowedUniversity,
      groupId,
      creatorId: userId,
      status: 'pending'
    });
    
    // Create an event request
    const eventRequest = await EventRequest.create({
      eventId: event.id,
      creatorId: userId,
      message: 'Please approve this event'
    });
    
    // Get admins of the group for notifications
    const adminIds = group.admins.map(admin => admin.id);
    
    // Create notifications for all admins
    await Promise.all(adminIds.map(adminId => {
      return Notification.create({
        recipientId: adminId,
        senderId: userId,
        type: 'event_approval',
        title: 'New Event Approval Request',
        message: `New event "${title}" has been created and needs approval`,
        relatedId: eventRequest.id,
        relatedType: 'EventRequest'
      });
    }));
    
    return res.status(201).json({
      success: true,
      message: 'Event created and pending approval',
      event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to create event',
      details: error.message
    });
  }
};

// Approve or reject an event
exports.respondToEventRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;
    const { status, message } = req.body;
    
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        error: true,
        message: 'Status must be either "approved" or "rejected"'
      });
    }
    
    // Find the event request
    const eventRequest = await EventRequest.findByPk(requestId, {
      include: [
        {
          model: Event,
          as: 'event',
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
              as: 'creator',
              attributes: ['id', 'fullName']
            }
          ]
        }
      ]
    });
    
    if (!eventRequest) {
      return res.status(404).json({
        error: true,
        message: 'Event request not found'
      });
    }
    
    // Check if the user is an admin of the group
    const isAdmin = eventRequest.event.group.admins.some(admin => admin.id === userId);
    if (!isAdmin) {
      return res.status(403).json({
        error: true,
        message: 'You are not authorized to respond to this event request'
      });
    }
    
    // Update the request status
    eventRequest.status = status;
    eventRequest.responderId = userId;
    eventRequest.message = message || eventRequest.message;
    await eventRequest.save();
    
    // Update the event status
    const event = eventRequest.event;
    event.status = status;
    await event.save();
    
    // Create a notification for the event creator
    await Notification.create({
      recipientId: event.creatorId,
      senderId: userId,
      type: 'event_response',
      title: `Event ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      message: status === 'approved' 
        ? `Your event "${event.title}" has been approved and is now published.` 
        : `Your event "${event.title}" has been rejected. Reason: ${message || 'No reason provided'}`,
      relatedId: event.id,
      relatedType: 'Event'
    });
    
    return res.status(200).json({
      success: true,
      message: `Event ${status} successfully`,
      eventRequest
    });
  } catch (error) {
    console.error('Error responding to event request:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to respond to event request',
      details: error.message
    });
  }
};

// Get pending event requests
exports.getPendingEventRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get groups where the user is an admin
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Group,
          as: 'adminGroups',
          attributes: ['id'],
          through: { attributes: [] }
        }
      ]
    });
    
    if (!user || !user.adminGroups || user.adminGroups.length === 0) {
      return res.status(200).json({
        success: true,
        requests: []
      });
    }
    
    const adminGroupIds = user.adminGroups.map(group => group.id);
    
    // Find events for these groups that are pending approval
    const pendingEvents = await Event.findAll({
      where: {
        groupId: {
          [Op.in]: adminGroupIds
        },
        status: 'pending'
      },
      include: [
        {
          model: EventRequest,
          as: 'eventRequests',
          where: {
            status: 'pending'
          },
          include: [
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'fullName', 'avatar']
            }
          ]
        },
        {
          model: Group,
          as: 'group',
          attributes: ['id', 'name']
        }
      ]
    });
    
    return res.status(200).json({
      success: true,
      requests: pendingEvents
    });
  } catch (error) {
    console.error('Error getting pending event requests:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get pending event requests',
      details: error.message
    });
  }
};

// RSVP to an event
exports.rsvpToEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    
    // Check if the event exists
    const event = await Event.findByPk(eventId, {
      include: [
        {
          model: User,
          as: 'attendees',
          attributes: ['id'],
          through: { attributes: [] }
        }
      ],
      where: {
        status: 'approved'
      }
    });
    
    if (!event) {
      return res.status(404).json({
        error: true,
        message: 'Event not found or not approved'
      });
    }
    
    // Check if user is already attending
    const isAttending = event.attendees.some(attendee => attendee.id === userId);
    
    if (isAttending) {
      // Remove RSVP
      await event.removeAttendee(userId);
      
      return res.status(200).json({
        success: true,
        message: 'RSVP removed successfully',
        isAttending: false
      });
    } else {
      // Check if event has reached max attendees
      if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
        return res.status(400).json({
          error: true,
          message: 'Event has reached maximum attendees'
        });
      }
      
      // Add RSVP
      await event.addAttendee(userId);
      
      // Notify event creator
      await Notification.create({
        recipientId: event.creatorId,
        senderId: userId,
        type: 'event_rsvp',
        title: 'New Event RSVP',
        message: `A user has RSVP'd to your event "${event.title}"`,
        relatedId: eventId,
        relatedType: 'Event'
      });
      
      return res.status(200).json({
        success: true,
        message: 'RSVP added successfully',
        isAttending: true
      });
    }
  } catch (error) {
    console.error('Error managing RSVP:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to manage RSVP',
      details: error.message
    });
  }
};

// Favorite or unfavorite an event
exports.toggleFavoriteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    
    // Check if the event exists
    const event = await Event.findByPk(eventId, {
      include: [
        {
          model: User,
          as: 'favoritedBy',
          attributes: ['id'],
          through: { attributes: [] }
        }
      ],
      where: {
        status: 'approved'
      }
    });
    
    if (!event) {
      return res.status(404).json({
        error: true,
        message: 'Event not found or not approved'
      });
    }
    
    // Check if user has already favorited
    const isFavorite = event.favoritedBy.some(user => user.id === userId);
    
    if (isFavorite) {
      // Remove favorite
      await event.removeFavoritedBy(userId);
      
      return res.status(200).json({
        success: true,
        message: 'Event removed from favorites',
        isFavorite: false
      });
    } else {
      // Add favorite
      await event.addFavoritedBy(userId);
      
      return res.status(200).json({
        success: true,
        message: 'Event added to favorites',
        isFavorite: true
      });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to toggle favorite',
      details: error.message
    });
  }
};

// Get events for a group
exports.getGroupEvents = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    
    // Check if the group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({
        error: true,
        message: 'Group not found'
      });
    }
    
    // Get all approved events for this group
    const events = await Event.findAll({
      where: {
        groupId,
        status: 'approved'
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'fullName', 'avatar']
        },
        {
          model: User,
          as: 'attendees',
          attributes: ['id'],
          through: { attributes: [] }
        },
        {
          model: User,
          as: 'favoritedBy',
          attributes: ['id'],
          through: { attributes: [] }
        }
      ]
    });
    
    // Process events to add user-specific data
    const processedEvents = events.map(event => {
      const eventData = event.toJSON();
      eventData.isAttending = event.attendees.some(attendee => attendee.id === userId);
      eventData.isFavorite = event.favoritedBy.some(user => user.id === userId);
      eventData.attendeeCount = event.attendees.length;
      
      // Remove arrays of users to keep response size smaller
      delete eventData.attendees;
      delete eventData.favoritedBy;
      
      return eventData;
    });
    
    return res.status(200).json({
      success: true,
      events: processedEvents
    });
  } catch (error) {
    console.error('Error getting group events:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get group events',
      details: error.message
    });
  }
};

// Get user's events (attending, favorited, created)
exports.getUserEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Event,
          as: 'attendingEvents',
          where: { status: 'approved' },
          through: { attributes: [] },
          include: [
            {
              model: Group,
              as: 'group',
              attributes: ['id', 'name']
            }
          ],
          required: false
        },
        {
          model: Event,
          as: 'favoritedEvents',
          where: { status: 'approved' },
          through: { attributes: [] },
          include: [
            {
              model: Group,
              as: 'group',
              attributes: ['id', 'name']
            }
          ],
          required: false
        },
        {
          model: Event,
          as: 'createdEvents',
          include: [
            {
              model: Group,
              as: 'group',
              attributes: ['id', 'name']
            }
          ],
          required: false
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'User not found'
      });
    }
    
    // Simplify the events objects
    const attending = user.attendingEvents.map(event => ({
      ...event.toJSON(),
      isAttending: true
    }));
    
    const favorited = user.favoritedEvents.map(event => ({
      ...event.toJSON(),
      isFavorite: true
    }));
    
    const created = user.createdEvents.map(event => ({
      ...event.toJSON(),
      isCreator: true
    }));
    
    return res.status(200).json({
      success: true,
      events: {
        attending,
        favorited,
        created
      }
    });
  } catch (error) {
    console.error('Error getting user events:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to get user events',
      details: error.message
    });
  }
}; 