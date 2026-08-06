// ============================================================
// authRoutes.js — URL routes for register / login / logout
// Owner: You (Person 1)
// ============================================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/logout', authController.logoutUser);
router.get('/me', authController.getCurrentUser);

module.exports = router;