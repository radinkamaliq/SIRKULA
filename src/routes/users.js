const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword } = require('../controllers/userController');
const { profileUpdateRules } = require('../validators/userValidator');
const { changePasswordRules } = require('../validators/authValidator');
const { requireAuth } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');

router.get('/me', requireAuth, getProfile);
router.patch('/me', requireAuth, csrfProtection, profileUpdateRules, updateProfile);
router.patch('/change-password', requireAuth, csrfProtection, changePasswordRules, changePassword);

module.exports = router;
