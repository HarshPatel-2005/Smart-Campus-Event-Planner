// ============================================================
// User.js — database queries for the Users table
// ============================================================

const db = require('../database/db');

// Insert a new user 
async function createUser({ fullName, email, passwordHash, role }) {
    const [result] = await db.query(
        'INSERT INTO Users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [fullName, email, passwordHash, role]
    );
    return result.insertId;
}

// Look up a user by email
async function findUserByEmail(email) {
    const [rows] = await db.query(
        'SELECT * FROM Users WHERE email = ?',
        [email]
    );
    return rows[0]; // undefined if no match
}

// Look up a user by ID
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