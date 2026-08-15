// ============================================================
// Registration.js — database queries for the Registrations table
// ============================================================

const db = require('../database/db');

// looks for any registration row this student has for this event
async function findAnyRegistration(userId, eventId) {
    const [rows] = await db.query(
        'SELECT * FROM Registrations WHERE user_id = ? AND event_id = ?',
        [userId, eventId]
    );
    return rows[0];
}

// registers a student for an event
async function createRegistration(userId, eventId) {
    const existing = await findAnyRegistration(userId, eventId);

    if (existing) {
        await db.query(
            `UPDATE Registrations SET status = 'Registered', registration_date = NOW(), attended = 0 WHERE registration_id = ?`,
            [existing.registration_id]
        );
        return existing.registration_id;
    }

    const [result] = await db.query(
        'INSERT INTO Registrations (user_id, event_id, status) VALUES (?, ?, ?)',
        [userId, eventId, 'Registered']
    );
    return result.insertId;
}

// Check if this student has already registered for this event
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

// Get all registrations for a student
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

// Cancel a registration
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

// stats for the student dashboard
async function getDashboardStats(userId) {
    const [rows] = await db.query(
        `SELECT
            COUNT(*) AS total_registered,
            SUM(CASE WHEN r.status = 'Registered' AND e.event_date >= CURDATE() THEN 1 ELSE 0 END) AS upcoming,
            SUM(CASE WHEN r.status = 'Attended' THEN 1 ELSE 0 END) AS attended,
            SUM(CASE WHEN r.status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled
         FROM Registrations r
         JOIN Events e ON r.event_id = e.event_id
         WHERE r.user_id = ?`,
        [userId]
    );
    return rows[0];
}

// last few things the student did
async function getRecentActivity(userId) {
    const [rows] = await db.query(
        `SELECT r.status, r.registration_date, e.title
         FROM Registrations r
         JOIN Events e ON r.event_id = e.event_id
         WHERE r.user_id = ?
         ORDER BY r.registration_date DESC
         LIMIT 3`,
        [userId]
    );
    return rows;
}

// figures out which category this student registers for the most
async function getSuggestedEvents(userId) {
    const [topCategoryRows] = await db.query(
        `SELECT e.category_id, COUNT(*) AS times_registered
         FROM Registrations r
         JOIN Events e ON r.event_id = e.event_id
         WHERE r.user_id = ? AND e.category_id IS NOT NULL
         GROUP BY e.category_id
         ORDER BY times_registered DESC
         LIMIT 1`,
        [userId]
    );

    let rows;
    if (topCategoryRows.length > 0) {
        const favoriteCategoryId = topCategoryRows[0].category_id;
        [rows] = await db.query(
            `SELECT e.event_id, e.title, e.event_date, e.location
             FROM Events e
             WHERE e.category_id = ?
               AND e.status = 'Open'
               AND e.event_date >= CURDATE()
               AND e.event_id NOT IN (SELECT event_id FROM Registrations WHERE user_id = ?)
             ORDER BY e.event_date ASC
             LIMIT 3`,
            [favoriteCategoryId, userId]
        );
    } else {
        // no registration history to base a suggestion on yet
        [rows] = await db.query(
            `SELECT e.event_id, e.title, e.event_date, e.location
             FROM Events e
             WHERE e.status = 'Open' AND e.event_date >= CURDATE()
             ORDER BY e.event_date ASC
             LIMIT 3`
        );
    }

    return rows;
}

module.exports = {
    createRegistration,
    hasUserRegistered,
    countRegistrationsForEvent,
    getRegistrationsByUser,
    cancelRegistration,
    getRegistrationById,
    getDashboardStats,
    getRecentActivity,
    getSuggestedEvents
};