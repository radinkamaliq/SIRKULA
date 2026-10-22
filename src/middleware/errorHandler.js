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

  // Production: hide unexpected error details
  const isProduction = process.env.NODE_ENV === 'production';
  if (!err.isOperational && isProduction) {
    message = 'Something went wrong.';
  }

  const response = {
    success: false,
    error: message,
    code,
  };

  if (!isProduction && process.env.NODE_ENV !== 'test') {
    response.stack = err.stack;
    response.details = err.details || null;
  }

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
