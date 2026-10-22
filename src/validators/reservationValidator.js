const { body, param, query } = require('express-validator');

const createReservationRules = [
  body('listingId').trim().notEmpty().withMessage('Listing ID is required'),
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isDecimal({ min: 0.0001 }).withMessage('Quantity must be greater than zero'),
  body('notes')
    .optional({ checkFalsy: true })
    .trim().isLength({ max: 500 }).withMessage('Notes too long'),
];

const updateReservationRules = [
  param('id').trim().notEmpty().withMessage('Reservation ID is required'),
  body('status')
    .trim().notEmpty().withMessage('Status is required')
    .isIn(['APPROVED', 'REJECTED']).withMessage('Status must be APPROVED or REJECTED'),
  body('pickupInstructions')
    .optional({ checkFalsy: true })
    .trim().isLength({ max: 500 }),
];

const cancelReservationRules = [
  param('id').trim().notEmpty().withMessage('Reservation ID is required'),
];

const reservationFilters = [
  query('status').optional().trim().isIn(['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED']),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
];

module.exports = {
  createReservationRules,
  updateReservationRules,
  cancelReservationRules,
  reservationFilters,
};
