const express = require('express');
const router = express.Router();
const {
  createReservation, getMyReservations, updateReservation, cancelReservation, completeReservation,
} = require('../controllers/reservationController');
const { createReservationRules, updateReservationRules, cancelReservationRules, reservationFilters } = require('../validators/reservationValidator');
const { requireAuth, requireRole } = require('../middleware/auth');
const { csrfProtection } = require('../middleware/csrf');

router.get('/', requireAuth, reservationFilters, getMyReservations);
router.post('/', requireAuth, requireRole('RECEIVER'), csrfProtection, createReservationRules, createReservation);
router.patch('/:id', requireAuth, requireRole('SELLER'), csrfProtection, updateReservationRules, updateReservation);
router.delete('/:id', requireAuth, requireRole('RECEIVER'), csrfProtection, cancelReservationRules, cancelReservation);
router.post('/:id/complete', requireAuth, requireRole('SELLER'), csrfProtection, completeReservation);

module.exports = router;
