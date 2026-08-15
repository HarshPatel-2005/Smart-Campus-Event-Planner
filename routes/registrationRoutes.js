// ============================================================
// registrationRoutes.js
// ============================================================

const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

router.get('/', registrationController.getMyRegistrations);
router.get('/dashboard-stats', registrationController.getDashboardStats);
router.get('/recent-activity', registrationController.getRecentActivity);
router.get('/suggested', registrationController.getSuggestedEvents);
router.post('/:eventId', registrationController.registerForEvent);
router.post('/:id/cancel', registrationController.cancelRegistration);

module.exports = router;