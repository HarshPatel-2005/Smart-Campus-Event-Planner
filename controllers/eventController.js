// eventController.js
// handles everything to do with events themselves

const Event = require('../models/Event');

// small helper so we're not repeating this check in every function
function requireAdmin(req, res) {

    // checks for userId in session & if user role is admin
    // if either fail, sends 403 forbidden error
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

        // get category & search from query string, call Event.getAllEvents with filter & return as JSON
        const { category, search } = req.query;
        const events = await Event.getAllEvents({ category, search });
        res.json({ events });
    } catch (err) {
        console.error('List events error:', err);
        res.status(500).json({ error: 'Could not load events.' });
    }
}

// category dropdown on create-event.html
async function listCategories(req, res) {
    try {
        const categories = await Event.getAllCategories();
        res.json({ categories });
    } catch (err) {
        console.error('List categories error:', err);
        res.status(500).json({ error: 'Could not load categories.' });
    }
}

// event-details.html
async function getEventById(req, res) {
    try {

        // get eventId from URL
        const event = await Event.getEventById(req.params.id);

        // if no event is found, return 404 not found
        if (!event) {
            return res.status(404).json({ error: 'Event not found.' });
        }

        // otherwise, send event details as JSON
        res.json({ event });
    } catch (err) {
        console.error('Get event error:', err);
        res.status(500).json({ error: 'Could not load the event.' });
    }
}

// Create Event form on create-event.html
async function createEvent(req, res) {
    try {

        // check if user is admin
        if (!requireAdmin(req, res)) return;

        // get event data from body
        const { title, description, categoryId, eventDate, startTime, endTime, location, capacity, status, organizerName } = req.body;

        // event title can't be empty, date can't be in the past, capacity must be >0
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

        // use the data to create an event
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

// edit button on manage-events.html
async function updateEvent(req, res) {
    try {

        // check if user is admin
        if (!requireAdmin(req, res)) return;

        // get eventId from URL & update data from req.body, call for an update & return success message
        await Event.updateEvent(req.params.id, req.body);
        res.json({ message: 'Event updated.' });
    } catch (err) {
        console.error('Update event error:', err);
        res.status(500).json({ error: 'Could not update the event.' });
    }
}

// cancel button on manage-events.html
async function cancelEvent(req, res) {
    try {

        // check if user is admin
        if (!requireAdmin(req, res)) return;

        // cancellation allows students to see that it is cancelled, rather than deleted (removed) entirely from the database
        await Event.updateEventStatus(req.params.id, 'Cancelled');
        res.json({ message: 'Event cancelled.' });
    } catch (err) {
        console.error('Cancel event error:', err);
        res.status(500).json({ error: 'Could not cancel the event.' });
    }
}

// delete button on manage-events.html
async function deleteEvent(req, res) {
    try {

        // check if user is admin
        if (!requireAdmin(req, res)) return;

        // this action, unlike the function above, actually will completely remove an event from the database
        await Event.deleteEvent(req.params.id);
        res.json({ message: 'Event deleted.' });
    } catch (err) {
        console.error('Delete event error:', err);
        res.status(500).json({ error: 'Could not delete the event.' });
    }
}

// public numbers for the homepage stats box, no login required
async function getSiteStats(req, res) {
    try {

        // this can occur without login (doesn't require an admin), unlike getDashboardStats() from the adminController.js file
        // get publicly available simple stats for the home page
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