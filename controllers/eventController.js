// eventController.js
// handles everything to do with events themselves (not registrations, that's Person 1's job)

const Event = require('../models/Event');

// small helper so we're not repeating this check in every function
function requireAdmin(req, res) {
    if (!req.session.userId || req.session.role !== 'admin') {
        res.status(403).json({ error: 'Admins only.' });
        return false;
    }
    return true;
}

// GET /api/events
// powers events.html — supports ?category= and ?search= query params for filtering
async function listEvents(req, res) {
    try {
        const { category, search } = req.query;
        const events = await Event.getAllEvents({ category, search });
        res.json({ events });
    } catch (err) {
        console.error('List events error:', err);
        res.status(500).json({ error: 'Could not load events.' });
    }
}

// GET /api/events/categories
// powers the category dropdown on create-event.html
async function listCategories(req, res) {
    try {
        const categories = await Event.getAllCategories();
        res.json({ categories });
    } catch (err) {
        console.error('List categories error:', err);
        res.status(500).json({ error: 'Could not load categories.' });
    }
}

// GET /api/events/:id
// powers event-details.html — one event's full info
async function getEventById(req, res) {
    try {
        const event = await Event.getEventById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found.' });
        }
        res.json({ event });
    } catch (err) {
        console.error('Get event error:', err);
        res.status(500).json({ error: 'Could not load the event.' });
    }
}

// POST /api/events
// powers the Create Event form on create-event.html
// Section 9's validation rules: title can't be empty, date can't be in the past, capacity positive
async function createEvent(req, res) {
    try {
        if (!requireAdmin(req, res)) return;

        const { title, description, categoryId, eventDate, startTime, endTime, location, capacity, status, organizerName } = req.body;

        if (!title || title.trim() === '') {
            return res.status(400).json({ error: 'Event title cannot be empty.' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(eventDate) < today) {
            return res.status(400).json({ error: 'Event date cannot be in the past.' });
        }

        if (!capacity || capacity <= 0) {
            return res.status(400).json({ error: 'Capacity must be a positive number.' });
        }

        const eventId = await Event.createEvent({
            title,
            description,
            categoryId,
            eventDate,
            startTime,
            endTime,
            location,
            capacity,
            status: status || 'Open',
            organizerId: req.session.userId,
            organizerName
        });

        res.status(201).json({ message: 'Event created.', eventId });
    } catch (err) {
        console.error('Create event error:', err);
        res.status(500).json({ error: 'Could not create the event.' });
    }
}

// PUT /api/events/:id
// powers the Edit button on manage-events.html
async function updateEvent(req, res) {
    try {
        if (!requireAdmin(req, res)) return;

        await Event.updateEvent(req.params.id, req.body);
        res.json({ message: 'Event updated.' });
    } catch (err) {
        console.error('Update event error:', err);
        res.status(500).json({ error: 'Could not update the event.' });
    }
}

// POST /api/events/:id/cancel
// powers the Cancel button on manage-events.html — doesn't delete, just flips status
async function cancelEvent(req, res) {
    try {
        if (!requireAdmin(req, res)) return;

        await Event.updateEventStatus(req.params.id, 'Cancelled');
        res.json({ message: 'Event cancelled.' });
    } catch (err) {
        console.error('Cancel event error:', err);
        res.status(500).json({ error: 'Could not cancel the event.' });
    }
}

// DELETE /api/events/:id
// powers the Delete button on manage-events.html
async function deleteEvent(req, res) {
    try {
        if (!requireAdmin(req, res)) return;

        await Event.deleteEvent(req.params.id);
        res.json({ message: 'Event deleted.' });
    } catch (err) {
        console.error('Delete event error:', err);
        res.status(500).json({ error: 'Could not delete the event.' });
    }
}

// GET /api/events/site-stats
// public numbers for the homepage stats box, no login required
async function getSiteStats(req, res) {
    try {
        const stats = await Event.getSiteStats();
        res.json(stats);
    } catch (err) {
        console.error('Site stats error:', err);
        res.status(500).json({ error: 'Could not load site stats.' });
    }
}

module.exports = {
    listEvents,
    listCategories,
    getEventById,
    createEvent,
    updateEvent,
    cancelEvent,
    deleteEvent,
    getSiteStats
};