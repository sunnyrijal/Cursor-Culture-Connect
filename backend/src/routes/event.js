const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protect all routes with authentication
router.use(authMiddleware.authenticate);

// Get all events
router.get('/', eventController.getAllEvents);

// Get user's events
router.get('/my-events', eventController.getUserEvents);

// Get single event by ID
router.get('/:id', eventController.getEventById);

// Create a new event
router.post('/', eventController.createEvent);

// Event requests and approval
router.get('/requests/pending', eventController.getPendingEventRequests);
router.put('/requests/:requestId', eventController.respondToEventRequest);

// RSVP and favorite
router.post('/:eventId/rsvp', eventController.rsvpToEvent);
router.post('/:eventId/favorite', eventController.toggleFavoriteEvent);

// Get events for a group
router.get('/group/:groupId', eventController.getGroupEvents);

module.exports = router; 