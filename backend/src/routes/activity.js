const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authenticate } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', activityController.getActivities);
router.get('/:id', activityController.getActivityById);

// Protected routes (require authentication)
router.get('/user/preferences', authenticate, activityController.getUserActivityPreferences);
router.post('/preference/:activityId', authenticate, activityController.updateActivityPreference);
router.put('/preference/:activityId', authenticate, activityController.updateActivityPreference);
router.delete('/preference/:activityId', authenticate, activityController.deleteActivityPreference);

router.get('/buddies/:activityId', authenticate, activityController.findActivityBuddies);
router.post('/request/:userId/:activityId', authenticate, activityController.createActivityRequest);
router.get('/requests/received', authenticate, activityController.getReceivedRequests);
router.get('/requests/sent', authenticate, activityController.getSentRequests);
router.put('/request/:requestId/respond', authenticate, activityController.respondToRequest);

module.exports = router; 