// ============================================================
// Registration.js — database queries for the Registrations table
// Owner: You (Person 1)
// ============================================================

const db = require('../database/db');

// Insert a new registration
async function createRegistration(userId, eventId) {
    const [result] = await db.query(
        'INSERT INTO Registrations (user_id, event_id, status) VALUES (?, ?, ?)',
        [userId, eventId, 'Registered']
    );
    return result.insertId;
}

// Check if this student has already registered for this event
// (Section 9: students cannot register twice for the same event)
async function hasUserRegistered(userId, eventId) {
    const [rows] = await db.query(
        `SELECT * FROM Registrations 
         WHERE user_id = ? AND event_id = ? AND status = 'Registered'`,
        [userId, eventId]
    );
    return rows.length > 0;
}

// Count how many active registrations an event has (used for capacity checks)
async function countRegistrationsForEvent(eventId) {
    const [rows] = await db.query(
        `SELECT COUNT(*) AS count FROM Registrations 
         WHERE event_id = ? AND status = 'Registered'`,
        [eventId]
    );
    return rows[0].count;
}

// Get all registrations for a student, joined with event info
// so my-registration.html has everything it needs in one call
async function getRegistrationsByUser(userId) {
    const [rows] = await db.query(
        `SELECT r.registration_id, r.status, r.attended, r.registration_date,
                e.event_id, e.title, e.event_date, e.start_time, e.location
         FROM Registrations r
         JOIN Events e ON r.event_id = e.event_id
         WHERE r.user_id = ?
         ORDER BY e.event_date ASC`,
        [userId]
    );
    return rows;
}

// Cancel a registration (only if it belongs to this user — checked in the controller)
async function cancelRegistration(registrationId) {
    await db.query(
        `UPDATE Registrations SET status = 'Cancelled' WHERE registration_id = ?`,
        [registrationId]
    );
}

// Fetch a single registration by ID (used to confirm ownership before cancelling)
async function getRegistrationById(registrationId) {
    const [rows] = await db.query(
        'SELECT * FROM Registrations WHERE registration_id = ?',
        [registrationId]
    );
    return rows[0];
}

// Aggregate stats for the student dashboard (Section 7.4)
async function getDashboardStats(userId) {
    const [rows] = await db.query(
        `SELECT
            COUNT(*) AS total_registered,
            SUM(CASE WHEN status = 'Registered' AND e.event_date >= CURDATE() THEN 1 ELSE 0 END) AS upcoming,
            SUM(CASE WHEN status = 'Attended' THEN 1 ELSE 0 END) AS attended,
            SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled
         FROM Registrations r
         JOIN Events e ON r.event_id = e.event_id
         WHERE r.user_id = ?`,
        [userId]
    );
    return rows[0];
}

module.exports = {
    createRegistration,
    hasUserRegistered,
    countRegistrationsForEvent,
    getRegistrationsByUser,
    cancelRegistration,
    getRegistrationById,
    getDashboardStats
};