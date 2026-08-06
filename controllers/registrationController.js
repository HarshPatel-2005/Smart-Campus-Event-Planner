// ============================================================
// registrationController.js — register for events, cancel,
// dashboard stats, my-registrations list
// Owner: You (Person 1)
//
// NOTE: This file calls Event.getEventById() from Person 2's
// models/Event.js to check event status/capacity before allowing
// a registration. That file needs to exist for this to run —
// coordinate with Person 2 on the function name/shape.
// ============================================================

const Registration = require('../models/Registration');
const Event = require('../models/Event'); // Person 2's file

// ------------------------------------------------------------
// Middleware-style helper: require the student to be logged in
// ------------------------------------------------------------
function requireLogin(req, res) {
    if (!req.session.userId) {
        res.status(401).json({ error: 'You must be logged in.' });
        return false;
    }
    return true;
}

// ------------------------------------------------------------
// POST /api/registrations/:eventId
// Powers the Register button on event-details.html
// Section 7.3's conditions: event open, not full, not already
// registered, not cancelled, date hasn't passed
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

        const eventDateTime = new Date(`${event.event_date}T${event.start_time}`);
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
// POST /api/registrations/:id/cancel
// Powers the Cancel button on my-registration.html
// ------------------------------------------------------------
async function cancelRegistration(req, res) {
    try {
        if (!requireLogin(req, res)) return;

        const registrationId = req.params.id;
        const registration = await Registration.getRegistrationById(registrationId);

        if (!registration) {
            return res.status(404).json({ error: 'Registration not found.' });
        }

        // Students may only access/modify their own registrations (Section 6)
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
// GET /api/registrations
// Powers my-registration.html — replaces the hardcoded
// allRegistrations array in main.js's loadRegistrationsData()
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
// GET /api/registrations/dashboard-stats
// Powers student-dashboard.html — replaces the hardcoded numbers
// in main.js's loadDashboardStats()
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

module.exports = {
    registerForEvent,
    cancelRegistration,
    getMyRegistrations,
    getDashboardStats
};