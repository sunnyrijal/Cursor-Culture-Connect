const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);

// Protected routes (require authentication)
router.post('/', authenticate, eventController.createEvent);
router.put('/:id', authenticate, eventController.updateEvent);
router.post('/:id/rsvp', authenticate, eventController.rsvpEvent);
router.post('/:id/cancel-rsvp', authenticate, eventController.cancelRsvp);
router.post('/:id/favorite', authenticate, eventController.toggleFavorite);

module.exports = router; 