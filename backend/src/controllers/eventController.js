const { Event, User, Group } = require('../models');
const { Op } = require('sequelize');

// Get all events with optional filters
exports.getEvents = async (req, res) => {
  try {
    const { 
      category, 
      university, 
      location, 
      date, 
      search, 
      limit = 10, 
      offset = 0,
      upcoming = 'true',
      past = 'false'
    } = req.query;

    const whereClause = {};
    
    // Apply filters if provided
    if (category) {
      whereClause.category = Array.isArray(category) 
        ? { [Op.overlap]: Array.isArray(category) ? category : [category] }
        : { [Op.contains]: [category] };
    }
    
    if (university) whereClause.allowedUniversity = university;
    if (location) whereClause.location = { [Op.iLike]: `%${location}%` };
    
    // Date filter
    if (date) {
      whereClause.date = date;
    } else if (upcoming === 'true') {
      // Default: show upcoming events (today and future)
      whereClause.date = { [Op.gte]: new Date().toISOString().split('T')[0] };
    } else if (past === 'true') {
      // Show past events
      whereClause.date = { [Op.lt]: new Date().toISOString().split('T')[0] };
    }
    
    // Search by title or description
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const events = await Event.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Group,
          as: 'group',
          attributes: ['id', 'name', 'image']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'ASC'], ['time', 'ASC']]
    });

    // If user is logged in, check which events they've RSVPed to or favorited
    if (req.user) {
      const userId = req.user.id;
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Event,
            as: 'events',
            attributes: ['id']
          },
          {
            model: Event,
            as: 'favoriteEvents',
            attributes: ['id']
          }
        ]
      });

      const rsvpedEventIds = user.events.map(event => event.id);
      const favoritedEventIds = user.favoriteEvents.map(event => event.id);
      
      // Add isRSVPed and isFavorited flags to each event
      events.rows = events.rows.map(event => {
        const plainEvent = event.get({ plain: true });
        plainEvent.isRSVPed = rsvpedEventIds.includes(plainEvent.id);
        plainEvent.isFavorited = favoritedEventIds.includes(plainEvent.id);
        return plainEvent;
      });
    } else {
      // For non-logged in users, set isRSVPed and isFavorited to false for all events
      events.rows = events.rows.map(event => {
        const plainEvent = event.get({ plain: true });
        plainEvent.isRSVPed = false;
        plainEvent.isFavorited = false;
        return plainEvent;
      });
    }

    return res.status(200).json({
      success: true,
      count: events.count,
      events: events.rows
    });
  } catch (error) {
    console.error('Get events error:', error);
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
    const eventId = req.params.id;
    
    const event = await Event.findByPk(eventId, {
      include: [
        {
          model: Group,
          as: 'group',
          attributes: ['id', 'name', 'image']
        },
        {
          model: User,
          as: 'eventAttendees',
          attributes: ['id', 'name', 'image'],
          through: { attributes: [] }
        }
      ]
    });
    
    if (!event) {
      return res.status(404).json({
        error: true,
        message: 'Event not found'
      });
    }
    
    // If user is logged in, check if they've RSVPed or favorited
    let isRSVPed = false;
    let isFavorited = false;
    
    if (req.user) {
      const userId = req.user.id;
      
      // Check RSVP status
      const attendee = await event.eventAttendees.find(user => user.id === userId);
      isRSVPed = !!attendee;
      
      // Check favorite status
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Event,
            as: 'favoriteEvents',
            where: { id: eventId },
            required: false
          }
        ]
      });
      
      isFavorited = user.favoriteEvents.length > 0;
    }
    
    const plainEvent = event.get({ plain: true });
    plainEvent.isRSVPed = isRSVPed;
    plainEvent.isFavorited = isFavorited;
    plainEvent.attendees = plainEvent.eventAttendees.length;
    
    return res.status(200).json({
      success: true,
      event: plainEvent
    });
  } catch (error) {
    console.error('Get event error:', error);
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
      title,
      name,
      description,
      date,
      time,
      location,
      category,
      groupId,
      maxAttendees,
      price,
      image,
      universityOnly,
      allowedUniversity
    } = req.body;
    
    // Validate that groupId is provided
    if (!groupId) {
      return res.status(400).json({
        error: true,
        message: 'An event must be associated with a group'
      });
    }
    
    // Check if group exists
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({
        error: true,
        message: 'Group not found'
      });
    }
    
    // Check if user is authorized to create an event for this group
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
            message: 'You must be a member of the group to create an event'
          });
        }
      }
    }
    
    // Create the event
    const event = await Event.create({
      title,
      name: name || title,
      description,
      date,
      time,
      location,
      category: Array.isArray(category) ? category : [category],
      organizer: group.name,
      maxAttendees,
      price,
      image,
      universityOnly,
      allowedUniversity: allowedUniversity || group.allowedUniversity,
      groupId
    });
    
    // Add creator as first attendee
    await event.addEventAttendee(userId);
    
    // Update the attendee count
    await event.update({
      attendees: 1
    });
    
    // Increment the group's upcomingEvents count
    await group.update({
      upcomingEvents: group.upcomingEvents + 1
    });
    
    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to create event',
      details: error.message
    });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    
    // Check if event exists
    const event = await Event.findByPk(eventId, {
      include: [
        {
          model: Group,
          as: 'group'
        }
      ]
    });
    
    if (!event) {
      return res.status(404).json({
        error: true,
        message: 'Event not found'
      });
    }
    
    const group = event.group;
    
    // Check if user is authorized to update this event
    const isPresident = group.presidentId === userId;
    
    if (!isPresident) {
      const officers = await group.getOfficers();
      const isOfficer = officers.some(officer => officer.id === userId);
      
      if (!isOfficer) {
        return res.status(403).json({
          error: true,
          message: 'Only group presidents and officers can update events'
        });
      }
    }
    
    // Update the event
    const updateData = {};
    const allowedFields = [
      'title', 'name', 'description', 'date', 'time', 'location', 
      'category', 'maxAttendees', 'price', 'image', 
      'universityOnly', 'allowedUniversity'
    ];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = field === 'category' && !Array.isArray(req.body[field]) 
          ? [req.body[field]]
          : req.body[field];
      }
    });
    
    await event.update(updateData);
    
    return res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Update event error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to update event',
      details: error.message
    });
  }
};

// RSVP to an event
exports.rsvpEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    
    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        error: true,
        message: 'Event not found'
      });
    }
    
    // Check if event has reached maximum attendees
    if (event.maxAttendees && event.attendees >= event.maxAttendees) {
      return res.status(400).json({
        error: true,
        message: 'Event has reached maximum capacity'
      });
    }
    
    // Check if user is already attending
    const attendees = await event.getEventAttendees();
    const isAttending = attendees.some(attendee => attendee.id === userId);
    
    if (isAttending) {
      return res.status(400).json({
        error: true,
        message: 'User is already attending this event'
      });
    }
    
    // Add user as attendee
    await event.addEventAttendee(userId);
    
    // Update user's eventsAttended count
    const user = await User.findByPk(userId);
    await user.update({
      eventsAttended: (user.eventsAttended || 0) + 1
    });
    
    // Increment attendee count
    await event.update({
      attendees: event.attendees + 1
    });
    
    return res.status(200).json({
      success: true,
      message: 'Successfully RSVPed to event'
    });
  } catch (error) {
    console.error('RSVP event error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to RSVP to event',
      details: error.message
    });
  }
};

// Cancel RSVP to an event
exports.cancelRsvp = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    
    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        error: true,
        message: 'Event not found'
      });
    }
    
    // Check if user is attending
    const attendees = await event.getEventAttendees();
    const isAttending = attendees.some(attendee => attendee.id === userId);
    
    if (!isAttending) {
      return res.status(400).json({
        error: true,
        message: 'User is not attending this event'
      });
    }
    
    // Remove user from attendees
    await event.removeEventAttendee(userId);
    
    // Update user's eventsAttended count
    const user = await User.findByPk(userId);
    await user.update({
      eventsAttended: Math.max(0, (user.eventsAttended || 0) - 1)
    });
    
    // Decrement attendee count
    await event.update({
      attendees: Math.max(0, event.attendees - 1)
    });
    
    return res.status(200).json({
      success: true,
      message: 'Successfully canceled RSVP to event'
    });
  } catch (error) {
    console.error('Cancel RSVP error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to cancel RSVP',
      details: error.message
    });
  }
};

// Favorite or unfavorite an event
exports.toggleFavorite = async (req, res) => {
  try {
    const eventId = req.params.id;
    const userId = req.user.id;
    const { favorite } = req.body; // true to favorite, false to unfavorite
    
    // Check if event exists
    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({
        error: true,
        message: 'Event not found'
      });
    }
    
    // Get user
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Event,
          as: 'favoriteEvents',
          where: { id: eventId },
          required: false
        }
      ]
    });
    
    const isFavorited = user.favoriteEvents.length > 0;
    
    if (favorite && !isFavorited) {
      // Add event to favorites
      await user.addFavoriteEvent(eventId);
      return res.status(200).json({
        success: true,
        message: 'Event added to favorites'
      });
    } else if (!favorite && isFavorited) {
      // Remove event from favorites
      await user.removeFavoriteEvent(eventId);
      return res.status(200).json({
        success: true,
        message: 'Event removed from favorites'
      });
    } else {
      // No change needed
      return res.status(200).json({
        success: true,
        message: 'No change to favorite status',
        isFavorited
      });
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return res.status(500).json({
      error: true,
      message: 'Failed to update favorite status',
      details: error.message
    });
  }
}; 