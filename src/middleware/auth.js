/**
 * Authentication & authorization middleware.
 *
 * Session-based auth: req.session.user holds { id, email, name, role, status }.
 * Role enforcement happens here (backend), not only in the frontend.
 */

const { ApiError } = require('./errorHandler');
const prisma = require('../lib/prisma');

/**
 * Require an authenticated user. Sets req.user (full User record from DB).
 */
async function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return next(new ApiError('Authentication required', 401, 'AUTH_REQUIRED'));
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { id: true, email: true, name: true, role: true, status: true },
    });

    if (!user) {
      // Session references a deleted user — destroy session
      req.session.destroy(() => {});
      return next(new ApiError('User not found. Please log in again.', 401, 'USER_NOT_FOUND'));
    }

    if (user.status === 'SUSPENDED') {
      return next(new ApiError('Your account has been suspended. Contact support.', 403, 'ACCOUNT_SUSPENDED'));
    }

    req.user = user;
    // Mirror on session for convenience
    req.session.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Require specific roles. Usage: requireRole('ADMIN'), requireRole('SELLER','RECEIVER')
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.session || !req.session.userId) {
      return next(new ApiError('Authentication required', 401, 'AUTH_REQUIRED'));
    }
    if (!allowedRoles.includes(req.session.user.role)) {
      return next(new ApiError('Insufficient permissions', 403, 'FORBIDDEN'));
    }
    next();
  };
}

/**
 * Optional auth: populates req.user if logged in, but doesn't require it.
 */
async function optionalAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return next();
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: { id: true, email: true, name: true, role: true, status: true },
    });
    req.user = user || null;
    if (user) req.session.user = user;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
}

module.exports = { requireAuth, requireRole, optionalAuth };
