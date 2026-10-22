const express = require('express');
const router = express.Router();
const { register, login, logout, me } = require('../controllers/authController');
const { registerRules, loginRules } = require('../validators/authValidator');
const { requireAuth } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');

// Public
router.post('/register', csrfProtection, registerRules, register);
router.post('/login', csrfProtection, loginRules, login);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, me);

module.exports = router;
