const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/matchingController');
const { requireAuth } = require('../middleware/auth');

router.get('/recommendations', requireAuth, getRecommendations);

module.exports = router;
