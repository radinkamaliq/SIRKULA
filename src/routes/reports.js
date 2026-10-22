const express = require('express');
const router = express.Router();
const { createReport, getMyReports } = require('../controllers/reportController');
const { requireAuth } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');

router.post('/', requireAuth, csrfProtection, createReport);
router.get('/mine', requireAuth, getMyReports);

module.exports = router;
