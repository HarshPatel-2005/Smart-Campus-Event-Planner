
const Registration = require('../models/Registration');
const Event = require('../models/Event');

// ------------------------------------------------------------
// Middleware type of helper: require the student to be logged in
// ------------------------------------------------------------
function requireLogin(req, res) {
    if (!req.session.userId) {
        res.status(401).json({ error: 'You must be logged in.' });
        return false;
    }
    return true;
}

// ------------------------------------------------------------
// register button on event-details.html
// ------------------------------------------------------------
async function registerForEvent(req, res) {
    try {
        if (!requireLogin(req, res)) return;

        const userId = req.session.userId;
        const eventId = req.params.eventId;

        const event = await Event.getEventById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found.' });
        }

        if (event.status === 'Cancelled' || event.status === 'Disabled') {
            return res.status(400).json({ error: 'This event is not open for registration.' });
        }

        // MySQL sends the date back as a full ISO string, grab just the
        // date part before gluing the start time onto it or this breaks
        const eventDateOnly = String(event.event_date).substring(0, 10);
        const eventDateTime = new Date(`${eventDateOnly}T${event.start_time}`);
        if (eventDateTime < new Date()) {
            return res.status(400).json({ error: 'This event has already passed.' });
        }

        const alreadyRegistered = await Registration.hasUserRegistered(userId, eventId);
        if (alreadyRegistered) {
            return res.status(409).json({ error: 'You are already registered for this event.' });
        }

        const currentCount = await Registration.countRegistrationsForEvent(eventId);
        if (currentCount >= event.capacity) {
            return res.status(400).json({ error: 'This event is full.' });
        }

        const registrationId = await Registration.createRegistration(userId, eventId);

        res.status(201).json({ message: 'Registered successfully!', registrationId });

    } catch (err) {
        console.error('Register for event error:', err);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
}

// ------------------------------------------------------------
// cancel button on my-registration.html
// ------------------------------------------------------------
async function cancelRegistration(req, res) {
    try {
        if (!requireLogin(req, res)) return;

        const registrationId = req.params.id;
        const registration = await Registration.getRegistrationById(registrationId);

        if (!registration) {
            return res.status(404).json({ error: 'Registration not found.' });
        }

        // Students may only access/modify their own registrations
        if (registration.user_id !== req.session.userId) {
            return res.status(403).json({ error: 'You cannot cancel someone else\'s registration.' });
        }

        await Registration.cancelRegistration(registrationId);

        res.json({ message: 'Registration cancelled.' });

    } catch (err) {
        console.error('Cancel registration error:', err);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
}

// ------------------------------------------------------------
// my-registration.html
// ------------------------------------------------------------
async function getMyRegistrations(req, res) {
    try {
        if (!requireLogin(req, res)) return;

        const registrations = await Registration.getRegistrationsByUser(req.session.userId);
        res.json({ registrations });

    } catch (err) {
        console.error('Get registrations error:', err);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
}

// ------------------------------------------------------------
// student-dashboard.html
// ------------------------------------------------------------
async function getDashboardStats(req, res) {
    try {
        if (!requireLogin(req, res)) return;

        const stats = await Registration.getDashboardStats(req.session.userId);
        res.json({
            totalRegistered: stats.total_registered || 0,
            upcomingEvents: stats.upcoming || 0,
            attendedEvents: stats.attended || 0,
            cancelledEvents: stats.cancelled || 0
        });

    } catch (err) {
        console.error('Dashboard stats error:', err);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
}

// ------------------------------------------------------------
// "Recent Activity" list on student-dashboard.html
// ------------------------------------------------------------
async function getRecentActivity(req, res) {
    try {
        if (!requireLogin(req, res)) return;

        const activity = await Registration.getRecentActivity(req.session.userId);
        res.json({ activity });
    } catch (err) {
        console.error('Recent activity error:', err);
        res.status(500).json({ error: 'Could not load recent activity.' });
    }
}

// ------------------------------------------------------------
// "Suggested For You" list on student-dashboard.html
// ------------------------------------------------------------
async function getSuggestedEvents(req, res) {
    try {
        if (!requireLogin(req, res)) return;

        const suggestions = await Registration.getSuggestedEvents(req.session.userId);
        res.json({ suggestions });
    } catch (err) {
        console.error('Suggested events error:', err);
        res.status(500).json({ error: 'Could not load suggestions.' });
    }
}

module.exports = {
    registerForEvent,
    cancelRegistration,
    getMyRegistrations,
    getDashboardStats,
    getRecentActivity,
    getSuggestedEvents
};