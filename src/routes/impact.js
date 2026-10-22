const express = require('express');
const router = express.Router();
const { getStats } = require('../controllers/impactController');
const { requireAuth } = require('../middleware/auth');

router.get('/stats', requireAuth, getStats);

module.exports = router;
