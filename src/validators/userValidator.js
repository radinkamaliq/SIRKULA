const { body, param } = require('express-validator');

const profileUpdateRules = [
  body('name')
    .trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim().isLength({ max: 30 }).withMessage('Phone too long'),
  body('address')
    .optional({ checkFalsy: true })
    .trim().isLength({ max: 200 }).withMessage('Address too long'),
];

const adminUserStatusRules = [
  param('id').trim().notEmpty().withMessage('User ID is required'),
  body('status')
    .trim().notEmpty().withMessage('Status is required')
    .isIn(['ACTIVE', 'SUSPENDED']).withMessage('Status must be ACTIVE or SUSPENDED'),
];

module.exports = { profileUpdateRules, adminUserStatusRules };
