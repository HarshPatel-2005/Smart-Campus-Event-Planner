// ============================================================
// database/db.js — the shared MySQL connection pool
// Both app.js and every model import from here.
// This lives in database/ alongside schema.sql, no new folder added.
// ============================================================

const mysql = require('mysql2/promise');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Anihetapate2005!',
    database: 'campus_event_planner',
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = db;