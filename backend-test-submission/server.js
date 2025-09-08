const express = require('express');
const helmet = require('helmet');
const cron = require('node-cron');
const config = require('./config/config');
const urlRoutes = require('./src/routes/urlRoutes');
const { 
  requestLogger, 
  errorHandler, 
  notFoundHandler, 
  corsHandler, 
  rateLimit 
} = require('./src/middleware/customMiddleware');
const URLShortenerService = require('./src/services/urlShortenerService');
const { info, warn, error } = require('./src/utils/logger');

// Create Express app
const app = express();

// Log server startup
info('backend', 'config', 'Starting URL Shortener Microservice');
info('backend', 'config', `Environment: ${config.NODE_ENV}`);
info('backend', 'config', `Base URL: ${config.BASE_URL}`);

// Trust proxy (for proper IP detection behind proxies)
app.set('trust proxy', true);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API responses
  hsts: config.NODE_ENV === 'production'
}));

// CORS handling
app.use(corsHandler);

// Rate limiting
app.use(rateLimit);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req, res) => {
  info('backend', 'handler', 'Health check requested');
  res.status(200).json({
    status: 'healthy',
    service: 'URL Shortener Microservice',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint with service info
app.get('/', (req, res) => {
  info('backend', 'handler', 'Root endpoint accessed');
  res.status(200).json({
    service: 'URL Shortener Microservice',
    version: '1.0.0',
    description: 'HTTP URL Shortener with analytics capabilities',
    endpoints: {
      'POST /shorturls': 'Create a shortened URL',
      'GET /shorturls/:shortcode': 'Get URL statistics',
      'GET /:shortcode': 'Redirect to original URL',
      'GET /health': 'Health check',
      'GET /api/all': 'Get all URLs (debugging)'
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

// Mount URL routes
app.use('/', urlRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Schedule cleanup task every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  info('backend', 'cron_job', 'Running scheduled cleanup');
  try {
    const result = await URLShortenerService.cleanupExpiredURLs();
    if (result.success) {
      info('backend', 'cron_job', `Cleanup done: ${result.data.removedCount} URLs removed`);
    } else {
      warn('backend', 'cron_job', `Cleanup failed: ${result.error}`);
    }
  } catch (err) {
    error('backend', 'cron_job', `Cleanup error: ${err.message}`);
  }
});

// Graceful shutdown handler
const gracefulShutdown = () => {
  info('backend', 'config', 'Received shutdown signal, shutting down gracefully');
  
  server.close(() => {
    info('backend', 'config', 'HTTP server closed');
    process.exit(0);
  });
  
  // Force close after 30 seconds
  setTimeout(() => {
    error('backend', 'config', 'Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  error('backend', 'config', `Uncaught Exception: ${err.message}`);
  error('backend', 'config', `Stack: ${err.stack}`);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  error('backend', 'config', `Unhandled Rejection at: ${promise}, reason: ${reason}`);
  process.exit(1);
});

// Start server
const server = app.listen(config.PORT, config.HOST, () => {
  info('backend', 'config', `Server started on ${config.HOST}:${config.PORT}`);
  info('backend', 'config', `URL Shortener ready for requests`);
  info('backend', 'config', `Cleanup interval: ${config.CLEANUP_INTERVAL / 60000} minutes`);
});

module.exports = app;
