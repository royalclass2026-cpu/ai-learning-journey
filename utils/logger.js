/**
 * Logger Utility Module
 * Provides structured logging with color support and timestamps
 * Color codes are applied using chalk for better console output visibility
 */

import chalk from 'chalk';

/**
 * Format current timestamp in ISO format
 * @returns {string} ISO formatted timestamp
 */
const formatTimestamp = () => new Date().toISOString();

/**
 * Log info level message
 * @param {string} message - Message to log
 */
const logInfo = (message) => {
  console.log(chalk.cyan(`[INFO] ${formatTimestamp()} - ${message}`));
};

/**
 * Log success level message with checkmark emoji
 * @param {string} message - Message to log
 */
const logSuccess = (message) => {
  console.log(chalk.green(`✓ [SUCCESS] ${formatTimestamp()} - ${message}`));
};

/**
 * Log error level message with X emoji
 * @param {string} message - Message to log
 * @param {Error} error - Error object (optional)
 */
const logError = (message, error = null) => {
  console.error(chalk.red(`✗ [ERROR] ${formatTimestamp()} - ${message}`));
  if (error) {
    console.error(chalk.red(`  Stack: ${error.stack}`));
  }
};

/**
 * Log warning level message with warning emoji
 * @param {string} message - Message to log
 */
const logWarning = (message) => {
  console.log(chalk.yellow(`⚠ [WARNING] ${formatTimestamp()} - ${message}`));
};

/**
 * Log request information with timestamp
 * @param {string} method - HTTP method
 * @param {string} path - Request path
 */
const logRequest = (method, path) => {
  const colors = {
    GET: chalk.blue,
    POST: chalk.green,
    PUT: chalk.yellow,
    DELETE: chalk.red,
    PATCH: chalk.magenta,
  };
  const colorFn = colors[method] || chalk.white;
  console.log(chalk.gray(`📝 [${formatTimestamp()}] ${colorFn(method)} ${path}`));
};

export { logInfo, logSuccess, logError, logWarning, logRequest, formatTimestamp };
