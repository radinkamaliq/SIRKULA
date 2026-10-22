const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { asyncHandler, ApiError } = require('../middleware/errorHandler');

/**
 * GET /api/v1/users/me — current user profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, email: true, name: true, phone: true, address: true, role: true, status: true, createdAt: true },
  });
  res.json({ success: true, data: { user } });
});

/**
 * PATCH /api/v1/users/me — update profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw Object.assign(new Error('Validation failed'), { statusCode: 400, errors: errors.array() });
  }
  const { name, phone, address } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: { ...(name ? { name } : {}), ...(phone !== undefined ? { phone } : {}), ...(address !== undefined ? { address } : {}) },
    select: { id: true, email: true, name: true, phone: true, address: true, role: true, status: true },
  });
  res.json({ success: true, message: 'Profile updated', data: { user } });
});

/**
 * POST /api/v1/users/change-password — change password after verifying current
 */
const changePassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw Object.assign(new Error('Validation failed'), { statusCode: 400, errors: errors.array() });
  }
  const { currentPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw new ApiError('User not found', 404, 'NOT_FOUND');
  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) throw new ApiError('Current password is incorrect', 401, 'INVALID_CURRENT_PASSWORD');
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: await bcrypt.hash(newPassword, saltRounds) },
  });
  res.json({ success: true, message: 'Password changed successfully' });
});

module.exports = { getProfile, updateProfile, changePassword };
