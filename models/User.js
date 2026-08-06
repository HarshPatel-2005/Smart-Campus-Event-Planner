// ============================================================
// User.js — database queries for the Users table
// Owner: You (Person 1)
// ============================================================

const db = require('../database/db');

// Insert a new user (called from authController.registerUser)
async function createUser({ fullName, email, passwordHash, role }) {
    const [result] = await db.query(
        'INSERT INTO Users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [fullName, email, passwordHash, role]
    );
    return result.insertId;
}

// Look up a user by email (used for login + duplicate email check on register)
async function findUserByEmail(email) {
    const [rows] = await db.query(
        'SELECT * FROM Users WHERE email = ?',
        [email]
    );
    return rows[0]; // undefined if no match
}

// Look up a user by ID (used to re-fetch the logged-in user from session)
async function findUserById(userId) {
    const [rows] = await db.query(
        'SELECT user_id, full_name, email, role, created_at FROM Users WHERE user_id = ?',
        [userId]
    );
    return rows[0];
}

module.exports = {
    createUser,
    findUserByEmail,
    findUserById
};