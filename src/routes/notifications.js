const express = require('express');
const router = express.Router();
const { listNotifications, markNotificationRead, markAllRead } = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');

router.get('/', requireAuth, listNotifications);
// NOTE: '/read-all' must be registered before '/:id/read', otherwise Express
// matches the literal segment "read-all" as an :id parameter.
router.patch('/read-all', requireAuth, csrfProtection, markAllRead);
router.patch('/:id/read', requireAuth, csrfProtection, markNotificationRead);

module.exports = router;
