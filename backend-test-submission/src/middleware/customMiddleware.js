const { info, warn, error } = require('../utils/logger');

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || req.connection.remoteAddress || 'Unknown';
  
  info('backend', 'middleware', `${method} ${url.substring(0, 15)} - Request from ${ip.substring(0, 10)}`);
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    const shortUrl = url.substring(0, 15);
    if (statusCode < 400) {
      info('backend', 'middleware', `${method} ${shortUrl} - ${statusCode} - ${duration}ms`);
    } else if (statusCode < 500) {
      warn('backend', 'middleware', `${method} ${shortUrl} - ${statusCode} - Client err`);
    } else {
      error('backend', 'middleware', `${method} ${shortUrl} - ${statusCode} - Server err`);
    }
    
    originalEnd.call(res, chunk, encoding);
  };
  
  next();
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  const method = req.method;
  const url = req.originalUrl || req.url;
  
  error('backend', 'middleware', `Error in ${method} ${url.substring(0, 20)}: ${err.message.substring(0, 15)}`);
  error('backend', 'middleware', `Stack: ${err.stack.substring(0, 40)}`);
  
  // Default error response
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid data format';
  } else if (err.code === 'ENOTFOUND') {
    statusCode = 400;
    message = 'Invalid URL or network error';
  }
  
  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
  }
  
  res.status(statusCode).json({
    error: message,
    message: message,
    details: process.env.NODE_ENV === 'development' ? [err.stack] : []
  });
};

// 404 handler
const notFoundHandler = (req, res) => {
  const method = req.method;
  const url = req.originalUrl || req.url;
  
  warn('backend', 'middleware', `404 - ${method} ${url.substring(0, 20)} - Not found`);
  
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    details: [`Route ${method} ${url} does not exist`]
  });
};

// CORS middleware (custom implementation)
const corsHandler = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    info('backend', 'middleware', `CORS preflight for ${req.originalUrl.substring(0, 25)}`);
    return res.status(200).end();
  }
  
  next();
};

// Rate limiting middleware (simple implementation)
const rateLimit = (() => {
  const requests = new Map();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // max requests per window
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!requests.has(ip)) {
      requests.set(ip, []);
    }
    
    const userRequests = requests.get(ip);
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(timestamp => now - timestamp < windowMs);
    requests.set(ip, validRequests);
    
    if (validRequests.length >= maxRequests) {
      warn('backend', 'middleware', `Rate limit exceeded for IP: ${ip.substring(0, 15)}`);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        details: [`Maximum ${maxRequests} requests per ${windowMs / 60000} minutes`]
      });
    }
    
    // Add current request
    validRequests.push(now);
    
    next();
  };
})();

module.exports = {
  requestLogger,
  errorHandler,
  notFoundHandler,
  corsHandler,
  rateLimit
};
