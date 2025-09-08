const Logger = require('./lib/logger');

// Create a singleton instance
const loggerInstance = new Logger();

/**
 * Main logging function that sends logs to the test server
 * @param {string} stack - Either 'backend' or 'frontend'
 * @param {string} level - Log level: 'debug', 'info', 'warn', 'error', 'fatal'
 * @param {string} packageName - Package name according to stack constraints
 * @param {string} message - Descriptive log message
 * @returns {Promise<boolean>} - True if log was sent successfully, false otherwise
 */
async function Log(stack, level, packageName, message) {
  return await loggerInstance.log(stack, level, packageName, message);
}

// Convenience functions for different log levels
const LoggerAPI = {
  // Main function
  Log,
  
  // Convenience methods
  debug: (stack, packageName, message) => loggerInstance.debug(stack, packageName, message),
  info: (stack, packageName, message) => loggerInstance.info(stack, packageName, message),
  warn: (stack, packageName, message) => loggerInstance.warn(stack, packageName, message),
  error: (stack, packageName, message) => loggerInstance.error(stack, packageName, message),
  fatal: (stack, packageName, message) => loggerInstance.fatal(stack, packageName, message),
  
  // Access to underlying logger instance for advanced usage
  getInstance: () => loggerInstance
};

// Export both as default and named exports for flexibility
module.exports = LoggerAPI;
module.exports.Log = Log;
module.exports.default = LoggerAPI;
