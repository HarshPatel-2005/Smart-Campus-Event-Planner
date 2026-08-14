// adminRoutes.js
// admin-only urls, dashboard stats + attendance

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/event-stats', adminController.getPerEventStats);
router.get('/events/:id/registrations', adminController.getEventRegistrations);
router.post('/attendance/:registrationId', adminController.markAttendance);

module.exports = router;