// ============================================================
// Smart Campus Event Planner — Main Server
// ============================================================

const express = require('express');
const session = require('express-session');
const path = require('path');
const db = require('./database/db');

const app = express();

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
// stop students from just typing admin-dashboard.html in the
// address bar and seeing it
// ------------------------------------------------------------

const adminPages = ['/admin-dashboard.html', '/create-event.html', '/manage-events.html', '/view-registrations.html', '/attendance-management.html', '/statistics.html'];
app.use((req, res, next) => {
    if (adminPages.includes(req.path) && (!req.session.userId || req.session.role !== 'admin')) {
        return res.redirect('/login.html');
    }
    next();
});

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views'))); // lets /login.html, /events.html etc. work directly

// ------------------------------------------------------------
// ------------------------------------------------------------

const authRoutes = require('./routes/authRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const eventRoutes = require('./routes/eventRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/auth', authRoutes);                 // /api/auth/register, /api/auth/login, /api/auth/logout
app.use('/api/registrations', registrationRoutes); // /api/registrations, /api/registrations/:id/cancel
app.use('/api/events', eventRoutes);               // /api/events, /api/events/:id
app.use('/api/admin', adminRoutes);                // /api/admin/dashboard-stats, /api/admin/events

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