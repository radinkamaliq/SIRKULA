/**
 * CSRF protection for cookie-authenticated state-changing requests.
 *
 * Strategy: double-submit cookie. The CSRF token is sent as a cookie
 * (XSRF-TOKEN) and must be echoed back via the X-XSRF-TOKEN header on
 * POST/PUT/PATCH/DELETE requests. The cookie is HttpOnly=false so the
 * frontend can read it to set the header (same-origin only).
 *
 * Safe methods (GET, HEAD, OPTIONS) are exempt.
 */

function csrfProtection(req, res, next) {
  const unsafeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  if (!unsafeMethods.includes(req.method)) {
    // Issue/refresh the CSRF cookie on safe responses
    if (!req.cookies || !req.cookies.XSRF_TOKEN) {
      res.cookie('XSRF_TOKEN', generateToken(), {
        httpOnly: false, // readable by frontend JS to set the header
        secure: process.env.SESSION_COOKIE_SECURE === 'true',
        sameSite: process.env.SESSION_COOKIE_SAMESITE || 'Lax',
        path: '/',
      });
    }
    return next();
  }

  // State-changing request: require matching token
  const cookieToken = req.cookies && req.cookies.XSRF_TOKEN;
  const headerToken = req.headers['x-xsrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.status(403).json({
      success: false,
      error: 'CSRF token mismatch',
      code: 'CSRF_MISMATCH',
    });
  }

  next();
}

function generateToken() {
  return require('crypto').randomBytes(24).toString('hex');
}

module.exports = { csrfProtection };
