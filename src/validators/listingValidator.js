const { body, param, query } = require('express-validator');

const ALLOWED_CATEGORIES = [
  'Bakery', 'Produce', 'Prepared Food', 'Dairy', 'Pantry', 'Beverages', 'Meat', 'Other',
];
const ALLOWED_CONDITIONS = ['Fresh', 'Near-expiry', 'Packaged', 'Frozen'];
const ALLOWED_UNITS = ['pieces', 'kg', 'liter', 'packs', 'cans', 'bags', 'boxes'];

const createListingRules = [
  body('title')
    .trim().notEmpty().withMessage('Title is required')
    .isLength({ max: 120 }).withMessage('Title too long'),
  body('description')
    .optional({ checkFalsy: true })
    .trim().isLength({ max: 1000 }).withMessage('Description too long'),
  body('category')
    .trim().notEmpty().withMessage('Category is required')
    .isIn(ALLOWED_CATEGORIES).withMessage('Invalid category'),
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isDecimal({ min: 0 }).withMessage('Quantity must be a non-negative number'),
  body('unit')
    .trim().notEmpty().withMessage('Unit is required')
    .isIn(ALLOWED_UNITS).withMessage('Invalid unit'),
  body('condition')
    .trim().notEmpty().withMessage('Condition is required')
    .isIn(ALLOWED_CONDITIONS).withMessage('Invalid condition'),
  body('price')
    .optional({ checkFalsy: true })
    .isDecimal({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('pickupLocation')
    .trim().notEmpty().withMessage('Pickup location is required')
    .isLength({ max: 200 }).withMessage('Pickup location too long'),
  body('pickupLat')
    .optional({ checkFalsy: true })
    .isDecimal().withMessage('Invalid latitude'),
  body('pickupLng')
    .optional({ checkFalsy: true })
    .isDecimal().withMessage('Invalid longitude'),
  body('pickupDeadline')
    .notEmpty().withMessage('Pickup deadline is required')
    .isISO8601().withMessage('Pickup deadline must be a valid date')
    .custom((value) => {
      const d = new Date(value);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      if (d < now) throw new Error('Pickup deadline cannot be in the past');
      return true;
    }),
];

const updateListingRules = [
  param('id').trim().notEmpty().withMessage('Listing ID is required'),
  body('title').optional().trim().isLength({ max: 120 }),
  body('description').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
  body('category').optional().trim().isIn(ALLOWED_CATEGORIES),
  body('quantity').optional().isDecimal({ min: 0 }),
  body('unit').optional().trim().isIn(ALLOWED_UNITS),
  body('condition').optional().trim().isIn(ALLOWED_CONDITIONS),
  body('price').optional({ nullable: true }).isDecimal({ min: 0 }),
  body('pickupLocation').optional().trim().isLength({ max: 200 }),
  body('pickupLat').optional({ checkFalsy: true }).isDecimal(),
  body('pickupLng').optional({ checkFalsy: true }).isDecimal(),
  body('pickupDeadline').optional().isISO8601(),
  body('status').optional().trim().isIn(['AVAILABLE', 'RESERVED', 'UNAVAILABLE', 'EXPIRED']),
];

const listingIdParam = [param('id').trim().notEmpty().withMessage('Listing ID is required')];

const marketplaceFilters = [
  query('q').optional().trim().isLength({ max: 100 }),
  query('category').optional().trim().isLength({ max: 50 }),
  query('location').optional().trim().isLength({ max: 100 }),
  query('status').optional().trim().isIn(['AVAILABLE', 'RESERVED', 'UNAVAILABLE', 'EXPIRED']),
  query('sort').optional().trim().isIn(['newest', 'nearest', 'deadline']),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100').toInt(),
  query('lat').optional().isDecimal(),
  query('lng').optional().isDecimal(),
];

module.exports = {
  createListingRules,
  updateListingRules,
  listingIdParam,
  marketplaceFilters,
  ALLOWED_CATEGORIES,
  ALLOWED_CONDITIONS,
  ALLOWED_UNITS,
};
