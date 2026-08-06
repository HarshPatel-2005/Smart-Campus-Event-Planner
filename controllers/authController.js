// ============================================================
// authController.js — register / login / logout logic
// Owner: You (Person 1)
// ============================================================

const bcrypt = require('bcrypt');
const User = require('../models/User');

// ------------------------------------------------------------
// POST /api/auth/register
// Matches register.html's fields: first-name, last-name, email,
// password, confirm-password, role
// ------------------------------------------------------------
async function registerUser(req, res) {
    try {
        const { firstName, lastName, email, password, confirmPassword, role } = req.body;

        // --- Validation (Section 7.1 / Section 9) ---
        if (!firstName || !lastName || !email || !password || !role) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format.' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters.' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match.' });
        }

        if (role !== 'student' && role !== 'admin') {
            return res.status(400).json({ error: 'Invalid role.' });
        }

        // Duplicate email check
        const existingUser = await User.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        // Hash the password — never store plain text (Section 7.2)
        const passwordHash = await bcrypt.hash(password, 10);

        const fullName = `${firstName} ${lastName}`;
        const userId = await User.createUser({ fullName, email, passwordHash, role });

        res.status(201).json({ message: 'Account created successfully.', userId });

    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
}

// ------------------------------------------------------------
// POST /api/auth/login
// Matches login.html's fields: email, password
// ------------------------------------------------------------
async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await User.findUserByEmail(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const passwordMatches = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatches) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Create the session
        req.session.userId = user.user_id;
        req.session.role = user.role;
        req.session.fullName = user.full_name;

        res.json({
            message: 'Logged in successfully.',
            user: {
                id: user.user_id,
                fullName: user.full_name,
                role: user.role
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }
}

// ------------------------------------------------------------
// GET /api/auth/logout
// ------------------------------------------------------------
function logoutUser(req, res) {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ error: 'Could not log out.' });
        }
        res.json({ message: 'Logged out successfully.' });
    });
}

// ------------------------------------------------------------
// GET /api/auth/me
// Lets the frontend check "am I logged in, and as who?"
// Useful for showing the right navbar (student vs admin, logged in vs not)
// ------------------------------------------------------------
async function getCurrentUser(req, res) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not logged in.' });
    }
    const user = await User.findUserById(req.session.userId);
    res.json({ user });
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser
};