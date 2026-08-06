// ============================================================
// registrationRoutes.js — URL routes for registering, cancelling,
// viewing registrations, and dashboard stats
// Owner: You (Person 1)
// ============================================================

const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');

router.get('/', registrationController.getMyRegistrations);
router.get('/dashboard-stats', registrationController.getDashboardStats);
router.post('/:eventId', registrationController.registerForEvent);
router.post('/:id/cancel', registrationController.cancelRegistration);

module.exports = router;