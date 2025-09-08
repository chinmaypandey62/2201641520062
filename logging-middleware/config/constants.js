// API Configuration and Constraints
const API_CONFIG = {
  BASE_URL: 'http://20.244.56.144/evaluation-service',
  ENDPOINTS: {
    REGISTER: '/register',
    AUTH: '/auth',
    LOGS: '/logs'
  },
  TIMEOUT: 5000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// Valid values for logging parameters
const LOG_CONSTRAINTS = {
  STACK: ['backend', 'frontend'],
  LEVEL: ['debug', 'info', 'warn', 'error', 'fatal'],
  PACKAGE: {
    BACKEND_ONLY: ['cache', 'controller', 'cron_job', 'db', 'domain', 'handler', 'repository', 'route', 'service'],
    FRONTEND_ONLY: ['api', 'component', 'hook', 'page', 'state', 'style'],
    BOTH: ['auth', 'config', 'middleware', 'utils']
  }
};

// Get all valid packages for a given stack
const getValidPackages = (stack) => {
  if (stack === 'backend') {
    return [...LOG_CONSTRAINTS.PACKAGE.BACKEND_ONLY, ...LOG_CONSTRAINTS.PACKAGE.BOTH];
  } else if (stack === 'frontend') {
    return [...LOG_CONSTRAINTS.PACKAGE.FRONTEND_ONLY, ...LOG_CONSTRAINTS.PACKAGE.BOTH];
  }
  return [];
};

module.exports = {
  API_CONFIG,
  LOG_CONSTRAINTS,
  getValidPackages
};
