// Event.js
// all the database stuff for events lives here, same pattern as User.js and Registration.js

const db = require('../database/db');

// used by create-event.html to fill the category dropdown from the db instead of hardcoding it
async function getAllCategories() {
    const [rows] = await db.query('SELECT * FROM Categories ORDER BY category_name ASC');
    return rows;
}

// creates a new event, called from eventController.createEvent
async function createEvent({ title, description, categoryId, eventDate, startTime, endTime, location, capacity, status, organizerId, organizerName }) {
    const [result] = await db.query(
        `INSERT INTO Events 
            (title, description, category_id, event_date, start_time, end_time, location, capacity, status, organizer_id, organizer_name)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description, categoryId, eventDate, startTime, endTime, location, capacity, status, organizerId, organizerName]
    );
    return result.insertId;
}

// grabs every event, joined with category name and a live registration count
// so events.html can show status/category without extra queries per card
// supports optional filters (category, search keyword) since Section 3.1 wants filtering
async function getAllEvents({ category, search } = {}) {
    let sql = `
        SELECT e.*, c.category_name,
            (SELECT COUNT(*) FROM Registrations r WHERE r.event_id = e.event_id AND r.status = 'Registered') AS registered_count
        FROM Events e
        LEFT JOIN Categories c ON e.category_id = c.category_id
        WHERE 1=1
    `;
    const params = [];

    if (category) {
        sql += ' AND c.category_name = ?';
        params.push(category);
    }

    if (search) {
        sql += ' AND e.title LIKE ?';
        params.push(`%${search}%`);
    }

    sql += ' ORDER BY e.event_date ASC';

    const [rows] = await db.query(sql, params);
    return rows;
}

// this is the one Person 1's registrationController relies on to check
// status/capacity/date before letting someone register
async function getEventById(eventId) {
    const [rows] = await db.query(
        `SELECT e.*, c.category_name,
            (SELECT COUNT(*) FROM Registrations r WHERE r.event_id = e.event_id AND r.status = 'Registered') AS registered_count
         FROM Events e
         LEFT JOIN Categories c ON e.category_id = c.category_id
         WHERE e.event_id = ?`,
        [eventId]
    );
    return rows[0];
}

// for the edit form on manage-events.html
async function updateEvent(eventId, { title, description, categoryId, eventDate, startTime, endTime, location, capacity, status }) {
    await db.query(
        `UPDATE Events SET
            title = ?, description = ?, category_id = ?, event_date = ?,
            start_time = ?, end_time = ?, location = ?, capacity = ?, status = ?
         WHERE event_id = ?`,
        [title, description, categoryId, eventDate, startTime, endTime, location, capacity, status, eventId]
    );

    // if someone edits the status dropdown to Cancelled instead of using the
    // dedicated cancel button, the registrations still need to know about it
    if (status === 'Cancelled') {
        await cascadeCancelRegistrations(eventId);
    }
}

// just flips the status, used for the Cancel button on manage-events.html
// (doesn't delete anything, keeps the event around but marks it cancelled)
async function updateEventStatus(eventId, status) {
    await db.query('UPDATE Events SET status = ? WHERE event_id = ?', [status, eventId]);

    if (status === 'Cancelled') {
        await cascadeCancelRegistrations(eventId);
    }
}

// when an event gets cancelled, everyone who was registered for it needs
// their registration marked cancelled too, otherwise their dashboard and
// my-registrations page have no idea the event underneath them is gone
async function cascadeCancelRegistrations(eventId) {
    await db.query(
        `UPDATE Registrations SET status = 'Cancelled' WHERE event_id = ? AND status = 'Registered'`,
        [eventId]
    );
}

// actually removes the event, used for the Delete button
async function deleteEvent(eventId) {
    await db.query('DELETE FROM Events WHERE event_id = ?', [eventId]);
}

// everything the admin dashboard cards need, all in one query so we're not
// hitting the db 6 times for 6 numbers
async function getDashboardStats() {
    const [[totals]] = await db.query(`
        SELECT
            COUNT(*) AS total_events,
            SUM(CASE WHEN status = 'Full' THEN 1 ELSE 0 END) AS full_events,
            SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled_events
        FROM Events
    `);

    const [[registrationTotals]] = await db.query(`
        SELECT COUNT(*) AS total_registrations
        FROM Registrations
        WHERE status = 'Registered' OR status = 'Attended'
    `);

    const [[popular]] = await db.query(`
        SELECT c.category_name, COUNT(*) AS event_count
        FROM Events e
        JOIN Categories c ON e.category_id = c.category_id
        GROUP BY c.category_name
        ORDER BY event_count DESC
        LIMIT 1
    `);

    // attendance rate = attended registrations / total registrations that should've shown up
    const [[attendance]] = await db.query(`
        SELECT
            SUM(CASE WHEN status = 'Attended' THEN 1 ELSE 0 END) AS attended,
            SUM(CASE WHEN status IN ('Attended', 'Missed') THEN 1 ELSE 0 END) AS total_expected
        FROM Registrations
    `);

    let avgAttendance = 0;
    if (attendance.total_expected > 0) {
        avgAttendance = Math.round((attendance.attended / attendance.total_expected) * 100);
    }

    return {
        totalEvents: totals.total_events || 0,
        totalRegistrations: registrationTotals.total_registrations || 0,
        fullEvents: totals.full_events || 0,
        cancelledEvents: totals.cancelled_events || 0,
        mostPopularCategory: popular ? popular.category_name : 'N/A',
        avgAttendance: avgAttendance
    };
}

// list of students registered for one specific event, for the admin's
// "view registrations" / attendance marking screen
async function getRegistrationsForEvent(eventId) {
    const [rows] = await db.query(
        `SELECT r.registration_id, r.status, r.attended, r.registration_date,
                u.user_id, u.full_name, u.email
         FROM Registrations r
         JOIN Users u ON r.user_id = u.user_id
         WHERE r.event_id = ?
         ORDER BY r.registration_date ASC`,
        [eventId]
    );
    return rows;
}

// public numbers for the homepage stats box — no login needed for these,
// just general counts across the whole platform
async function getSiteStats() {
    const [[eventsRow]] = await db.query('SELECT COUNT(*) AS total_events FROM Events');
    const [[regRow]] = await db.query(
        `SELECT COUNT(*) AS total_registrations FROM Registrations WHERE status = 'Registered' OR status = 'Attended'`
    );
    const [[orgRow]] = await db.query('SELECT COUNT(DISTINCT organizer_id) AS total_organizers FROM Events');
    const [[catRow]] = await db.query('SELECT COUNT(*) AS total_categories FROM Categories');

    return {
        eventsPosted: eventsRow.total_events || 0,
        registrations: regRow.total_registrations || 0,
        clubsAndOrganizations: orgRow.total_organizers || 0,
        categories: catRow.total_categories || 0
    };
}

// per-event numbers for the statistics page — how full each event got,
// how many showed up vs no-showed, not just the site-wide totals the
// dashboard cards show
async function getPerEventStats() {
    const [rows] = await db.query(`
        SELECT e.event_id, e.title, e.capacity, e.status,
            (SELECT COUNT(*) FROM Registrations r WHERE r.event_id = e.event_id AND r.status IN ('Registered', 'Attended', 'Missed')) AS total_signups,
            (SELECT COUNT(*) FROM Registrations r WHERE r.event_id = e.event_id AND r.status = 'Attended') AS attended_count,
            (SELECT COUNT(*) FROM Registrations r WHERE r.event_id = e.event_id AND r.status = 'Missed') AS missed_count
        FROM Events e
        ORDER BY e.event_date DESC
    `);

    // do the percentage math here instead of in the controller, keeps
    // the raw numbers and the derived numbers together in one place
    return rows.map((row) => {
        const percentFilled = row.capacity > 0 ? Math.round((row.total_signups / row.capacity) * 100) : 0;
        const attendanceBase = row.attended_count + row.missed_count;
        const attendanceRate = attendanceBase > 0 ? Math.round((row.attended_count / attendanceBase) * 100) : null;

        return {
            eventId: row.event_id,
            title: row.title,
            capacity: row.capacity,
            status: row.status,
            totalSignups: row.total_signups,
            percentFilled: percentFilled,
            attendanceRate: attendanceRate // null means nobody's attendance has been marked yet
        };
    });
}

module.exports = {
    getAllCategories,
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    updateEventStatus,
    deleteEvent,
    getDashboardStats,
    getRegistrationsForEvent,
    getSiteStats,
    getPerEventStats
};