const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { validationResult } = require('express-validator');
const { ApiError, asyncHandler } = require('../middleware/errorHandler');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.SESSION_COOKIE_SECURE === 'true',
  sameSite: process.env.SESSION_COOKIE_SAMESITE || 'Lax',
  path: '/',
  maxAge: Number(process.env.SESSION_COOKIE_MAX_AGE) || 86400000,
};

/**
 * POST /api/v1/auth/register
 * Public registration limited to SELLER or RECEIVER (never ADMIN).
 */
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw Object.assign(new Error('Validation failed'), {
      statusCode: 400,
      errors: errors.array(),
    });
  }

  const { name, email, password, role } = req.body;

  // Explicitly forbid ADMIN registration via public endpoint
  if (role === 'ADMIN') {
    throw new ApiError('Admin accounts cannot be created through public registration', 403, 'ADMIN_REGISTRATION_FORBIDDEN');
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ApiError('Email already registered', 409, 'DUPLICATE_EMAIL');
    }
  } catch (err) {
    throw new ApiError('Unable to connect to the database. Please try again later.', 500, 'DATABASE_ERROR');
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  try {
    const user = await prisma.user.create({
      data: { name, email, password: passwordHash, role },
      select: { id: true, email: true, name: true, role: true, status: true, createdAt: true },
    });

    req.session.userId = user.id;
    req.session.user = user;
    req.session.role = user.role;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user, role: user.role },
    });
  } catch (err) {
    throw new ApiError('Unable to create user account. Please try again later.', 500, 'DATABASE_ERROR');
  }
});

/**
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw Object.assign(new Error('Validation failed'), {
      statusCode: 400,
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ApiError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new ApiError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (user.status === 'SUSPENDED') {
      throw new ApiError('Your account has been suspended. Contact support.', 403, 'ACCOUNT_SUSPENDED');
    }

    req.session.userId = user.id;
    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    };
    req.session.role = user.role;

    res.json({
      success: true,
      message: 'Login successful',
      data: { user: req.session.user, role: user.role },
    });
  } catch (err) {
    // Re-throw as ApiError to ensure consistent error formatting
    if (err.statusCode) {
      throw err;
    }
    throw new ApiError('Unable to connect to the database. Please try again later.', 500, 'DATABASE_ERROR');
  }
});

/**
 * POST /api/v1/auth/logout
 */
const logout = asyncHandler(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      throw new ApiError('Logout failed', 500, 'LOGOUT_FAILED');
    }
    // Clear the actual session cookie (not the default connect.sid name)
    const sessionCookieName = process.env.SESSION_COOKIE_NAME || 'sirkula_session';
    res.clearCookie(sessionCookieName, { path: '/' });
    res.json({ success: true, message: 'Logged out' });
  });
});

/**
 * GET /api/v1/auth/me
 * Return current session user.
 */
const me = asyncHandler(async (req, res) => {
  if (!req.session || !req.session.userId) {
    throw new ApiError('Not authenticated', 401, 'AUTH_REQUIRED');
  }

  const user = await prisma.user.findUnique({
    where: { id: req.session.userId },
    select: { id: true, email: true, name: true, phone: true, address: true, role: true, status: true, createdAt: true },
  });
  if (!user) {
    throw new ApiError('User not found', 404, 'USER_NOT_FOUND');
  }

  res.json({ success: true, data: { user } });
});

module.exports = { register, login, logout, me };
