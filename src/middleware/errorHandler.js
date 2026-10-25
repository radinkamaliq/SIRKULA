/**
 * Centralized error handler.
 *
 * Never exposes stack traces or DB internals to the client in production.
 * Consistent JSON response shape: { success: false, error, code }
 */

class ApiError extends Error {
  constructor(message, statusCode = 500, code = 'SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

function errorHandler(err, req, res, next) {
  // `statusCode` is the convention used across the app, but `status` is
  // accepted too so plain error objects stay useful.
  let statusCode = err.statusCode || err.status || 500;
  let code = err.code || 'SERVER_ERROR';
  let message = err.message || 'Internal server error';

  // Prisma known error codes -> friendly messages
  if (err.code === 'P2002') {
    statusCode = 409;
    code = 'DUPLICATE_RECORD';
    message = 'A record with this value already exists.';
  } else if (err.code === 'P2003') {
    statusCode = 400;
    code = 'FOREIGN_KEY_CONSTRAINT';
    message = 'Referenced record does not exist.';
  } else if (err.code === 'P2025') {
    statusCode = 404;
    code = 'RECORD_NOT_FOUND';
    message = 'Requested record was not found.';
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
  }

  // Validation errors from express-validator come as array
  if (err.errors && Array.isArray(err.errors)) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = err.errors.map((e) => e.msg).join(', ');
  }

  // Database connection/unavailable errors -> friendly message regardless of environment
  if (err.code === 'P1001' || err.code === 'P1002' || err.code === 'P1182' || err.code === 'P1003' || err.code === 'P2001') {
    // P1001: Connection pool exhausted
    // P1002: Connection lookup timeout
    // P1182: Statement timeout
    // P1003: Connection rejected
    // P2001: Transaction already committed/rejected
    statusCode = 503;
    code = 'DATABASE_UNAVAILABLE';
    message = 'Database service is temporarily unavailable. Please try again later.';
    err.isOperational = true; // Mark as operational so production hides details
  }

  // Mark ApiError operational errors as such (already set in controllers)
  if (err instanceof ApiError) {
    err.isOperational = true;
  }

  // Production: hide unexpected error details
  const isProduction = process.env.NODE_ENV === 'production';
  if (!err.isOperational && isProduction) {
    message = 'Something went wrong.';
  }

  // Always suppress stack traces and internal details from the client response
  // Stack traces are only logged server-side, never sent to the client
  const response = {
    success: false,
    error: message,
    code,
  };

  // Never include stack traces or detailed error information in the client response
  // Server-side logging is handled by the catch middleware

  res.status(statusCode).json(response);
}

function notFound(req, res, next) {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: `Route ${req.method} ${req.originalUrl} not found`,
      code: 'NOT_FOUND',
    });
  }
  res.status(404).sendFile(require('path').resolve(__dirname, '../../public/404.html'));
}

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = { errorHandler, notFound, asyncHandler, ApiError };
