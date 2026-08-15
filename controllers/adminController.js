const Event = require('../models/Event');
const db = require('../database/db');

// ------------------------------------------------------------
// Middleware type of helper: require the admin to be logged in
// ------------------------------------------------------------
function requireAdmin(req, res) {

    // checks for userId in session & if user role is admin
    // if either fail, sends 403 forbidden error
    if (!req.session.userId || req.session.role !== 'admin') {
        res.status(403).json({ error: 'Admins only.' });
        return false;
    }
    return true;
}


// stat cards + status alerts on admin-dashboard.html
async function getDashboardStats(req, res) {

    // check if user is admin (the function above passes)
    try {
        if (!requireAdmin(req, res)) return;

        // get stats from database & send as JSON to frontend
        const stats = await Event.getDashboardStats();
        res.json(stats);
    } catch (err) {
        console.error('Admin dashboard stats error:', err);
        res.status(500).json({ error: 'Could not load dashboard stats.' });
    }
}


// "who's registered" view for a specific event
async function getEventRegistrations(req, res) {

    // check if user is admin (same as above)
    try {
        if (!requireAdmin(req, res)) return;

        // get eventId from URL, get registrations & send as JSON
        const registrations = await Event.getRegistrationsForEvent(req.params.id);
        res.json({ registrations });
    } catch (err) {
        console.error('Get event registrations error:', err);
        res.status(500).json({ error: 'Could not load registrations.' });
    }
}


// marks student as attended or missed for an event they registered for
async function markAttendance(req, res) {

    // check if user is admin (same as above)
    try {
        if (!requireAdmin(req, res)) return;

        // get attended boolean from requested body & determine status
        const { attended } = req.body;
        const newStatus = attended ? 'Attended' : 'Missed';

        // update attendance in database & feedback success
        await db.query(
            'UPDATE Registrations SET status = ?, attended = ? WHERE registration_id = ?',
            [newStatus, attended ? 1 : 0, req.params.registrationId]
        );

        res.json({ message: 'Attendance updated.' });
    } catch (err) {
        console.error('Mark attendance error:', err);
        res.status(500).json({ error: 'Could not update attendance.' });
    }
}


// statistics.html
async function getPerEventStats(req, res) {

    // check if user is admin (same as above)
    try {
        if (!requireAdmin(req, res)) return;

        // get stats per event & send as JSON
        const stats = await Event.getPerEventStats();
        res.json({ stats });
    } catch (err) {
        console.error('Per-event stats error:', err);
        res.status(500).json({ error: 'Could not load statistics.' });
    }
}


module.exports = {
    getDashboardStats,
    getEventRegistrations,
    markAttendance,
    getPerEventStats
};