// eventRoutes.js
// urls for browsing, creating, editing events

const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

router.get('/categories', eventController.listCategories); // has to come before /:id or express thinks "categories" is an id
router.get('/site-stats', eventController.getSiteStats); // same reason, has to come before /:id
router.get('/', eventController.listEvents);
router.get('/:id', eventController.getEventById);
router.post('/', eventController.createEvent);
router.put('/:id', eventController.updateEvent);
router.post('/:id/cancel', eventController.cancelEvent);
router.delete('/:id', eventController.deleteEvent);

module.exports = router;