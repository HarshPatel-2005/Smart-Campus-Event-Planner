// ============================================================
// Smart Campus Event Planner — Main Server
// Deliverable 2
// ============================================================
// Your existing pages (student-dashboard.html, my-registration.html)
// already use main.js to inject data client-side with hard-coded
// arrays. Instead of switching to a templating engine and rewriting
// every HTML file, this server serves your existing static pages
// AS-IS, and exposes a JSON API underneath. main.js then swaps its
// hard-coded arrays for fetch() calls to these endpoints.
// ============================================================

const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();

// ------------------------------------------------------------
// Database connection
// EDIT these values to match your local MySQL setup.
// Both of you use this same `db` object in your models, e.g.:
//   const { db } = require('../app');
//   const [rows] = await db.query('SELECT * FROM Events');
// ------------------------------------------------------------
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: process.env.DB_PASSWORD || '',              // put your local MySQL password here
    database: 'campus_event_planner',
    waitForConnections: true,
    connectionLimit: 10
});

// ------------------------------------------------------------
// Core middleware
// ------------------------------------------------------------
app.use(express.json());                         // parse JSON bodies (for fetch() POSTs)
app.use(express.urlencoded({ extended: true }));  // parse form submissions

app.use(session({
    secret: 'change-this-to-something-random',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 4 } // 4 hour session
}));

// ------------------------------------------------------------
// Serve your existing frontend as-is
// ------------------------------------------------------------
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views'))); // lets /login.html, /events.html etc. work directly

// ------------------------------------------------------------
// API routes
// YOU own: auth + registrations
// PERSON 2 owns: events + admin
// (uncomment each line once that routes file exists)
// ------------------------------------------------------------
// const authRoutes = require('./routes/authRoutes');
// const registrationRoutes = require('./routes/registrationRoutes');
// const eventRoutes = require('./routes/eventRoutes');
// const adminRoutes = require('./routes/adminRoutes');

// app.use('/api/auth', authRoutes);                 // /api/auth/register, /api/auth/login, /api/auth/logout
// app.use('/api/registrations', registrationRoutes); // /api/registrations, /api/registrations/:id/cancel
// app.use('/api/events', eventRoutes);               // /api/events, /api/events/:id
// app.use('/api/admin', adminRoutes);                // /api/admin/dashboard-stats, /api/admin/events

// ------------------------------------------------------------
// Fallback: home page
// ------------------------------------------------------------
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// ------------------------------------------------------------
// Start server
// ------------------------------------------------------------
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

module.exports = { db };