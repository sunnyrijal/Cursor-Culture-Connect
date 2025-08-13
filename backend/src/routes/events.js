import express from 'express';
import { PrismaClient } from '@prisma/client';
import pool from '../db.js';
import { isAuthenticated, getUserProfile } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Fetch events with their associated groups
    const events = await prisma.event.findMany({
      include: {
        group: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });
    
    // Transform the data for the frontend
    const transformedEvents = events.map(event => {
      return {
        ...event,
        // If a group exists, extract its info
        groupId: event.group?.id || null,
        groupName: event.group?.name || null,
        groupImage: event.group?.image || null,
        // Remove the nested group object to flatten the structure
        group: undefined
      };
    });
    
    res.json(transformedEvents);
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific event by ID
router.get('/:id', async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Transform the data for the frontend
    const transformedEvent = {
      ...event,
      // If a group exists, extract its info
      groupId: event.group?.id || null,
      groupName: event.group?.name || null,
      groupImage: event.group?.image || null,
      // Remove the nested group object to flatten the structure
      group: undefined
    };
    
    res.json(transformedEvent);
  } catch (err) {
    console.error('Error fetching event:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add POST endpoint to create new events
router.post('/', isAuthenticated, async (req, res) => {
  try {
    console.log('Received event data:', req.body);
    
    const { 
      title, 
      name,
      description, 
      date, 
      time,
      startTime,
      endTime, 
      location, 
      category = [],
      categories = [],
      isPublic = true, 
      universityOnly = false,
      image = null,
      images = [],
      groupId = null
    } = req.body;
    
    // Handle the combined time string from frontend or separate start/end times
    const timeString = time || (startTime && endTime ? `${startTime} - ${endTime}` : '');
    
    // Process images (use the images array if provided, or create one from the single image)
    const eventImages = images.length > 0 ? images : (image ? [image] : []);
    
    // Map the frontend fields to match the database schema
    const newEvent = await prisma.event.create({
      data: {
        name: title || name,
        description,
        date: new Date(date),
        time: timeString,
        startTime: startTime || null,  // Store startTime as separate field
        endTime: endTime || null,      // Store endTime as separate field
        location,
        categories: categories.length > 0 ? categories : category || [],
        organizer: req.session?.fullName || req.user?.fullName || "Anonymous User",
        userId: req.session?.userId || req.user?.userId, // Link to the user who created the event
        isRSVPed: true, // Default to true for creator
        isFavorited: false,
        image: eventImages.length > 0 ? eventImages[0] : null, // Keep single image for backward compatibility
        images: eventImages, // Store all images
        groupId: groupId ? parseInt(groupId) : null // Link to a group if provided
      }
    });
    
    console.log('Created new event:', newEvent);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event', details: error.message });
  }
});

// Add PATCH endpoint to update RSVP status
router.patch('/:id/rsvp', isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const { isRSVPed } = req.body;

    if (isRSVPed === undefined) {
      return res.status(400).json({ error: 'isRSVPed status is required' });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: { isRSVPed }
    });

    res.json(updatedEvent);
  } catch (err) {
    console.error('Error updating RSVP status:', err);
    res.status(500).json({ error: 'Failed to update RSVP status', details: err.message });
  }
});

// Add PUT endpoint to update an event
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const { 
      title, 
      name,
      description, 
      date, 
      time,
      startTime,
      endTime, 
      location, 
      category = [],
      categories = [],
      isPublic = true, 
      universityOnly = false,
      image = null,
      images = [],
      groupId = null
    } = req.body;
    
    // Handle the combined time string from frontend or separate start/end times
    const timeString = time || (startTime && endTime ? `${startTime} - ${endTime}` : '');
    
    // Process images (use the images array if provided, or create one from the single image)
    const eventImages = images.length > 0 ? images : (image ? [image] : []);
    
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        name: title || name,
        description,
        date: date ? new Date(date) : undefined,
        time: timeString || undefined,
        location,
        categories: categories.length > 0 ? categories : (category?.length > 0 ? category : undefined),
        image: eventImages.length > 0 ? eventImages[0] : null, // Keep single image for backward compatibility
        images: eventImages.length > 0 ? eventImages : undefined, // Store all images
        groupId: groupId ? parseInt(groupId) : null // Link to a group if provided
      }
    });
    
    res.json(updatedEvent);
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).json({ error: 'Failed to update event', details: err.message });
  }
});

export default router;
