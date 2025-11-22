/**
 * Error Handler Middleware
 * Centralized error handling for the entire application
 *
 * ERROR HANDLING STRATEGY:
 * - Catch errors at the route level with try/catch
 * - Pass errors to this middleware for consistent formatting
 * - Return structured error responses to clients
 * - Log errors for debugging in development
 * - Never expose sensitive info in production
 */

import { logError } from '../utils/logger.js';

/**
 * Error handler middleware
 * Should be used as the last middleware in Express app
 * app.use(errorHandler)
 *
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();

  // Determine error type and status code
  let status = 500;
  let errorType = 'InternalServerError';
  let message = 'An unexpected error occurred';

  // Map error types to status codes
  if (err.message.includes('validation') || err.message.includes('required')) {
    status = 400;
    errorType = 'ValidationError';
    message = err.message || 'Validation failed';
  }

  if (err.message.includes('authentication') || err.message.includes('unauthorized')) {
    status = 401;
    errorType = 'AuthenticationError';
    message = 'Invalid or missing API key';
  }

  if (err.message.includes('insufficient_quota') || err.message.includes('quota')) {
    status = 429;
    errorType = 'RateLimitError';
    message = 'API quota exceeded or rate limited. Try again later.';
  }

  if (err.message.includes('rate_limit')) {
    status = 429;
    errorType = 'RateLimitError';
    message = 'Rate limit exceeded. Please wait before retrying.';
  }

  if (err.message.includes('invalid_api_key')) {
    status = 401;
    errorType = 'InvalidAPIKey';
    message = 'Invalid API key provided';
  }

  // Log error for debugging
  logError(`[${req.method} ${req.path}] ${errorType}: ${err.message}`, err);

  // Build response
  const response = {
    error: errorType,
    message: message,
    timestamp: timestamp,
    path: req.path,
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
    response.details = err.message;
  }

  res.status(status).json(response);
};

export { errorHandler };
