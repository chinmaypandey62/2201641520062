const config = {
  // Server configuration
  PORT: process.env.PORT || 5000,
  HOST: process.env.HOST || 'localhost',
  
  // URL shortener configuration
  DEFAULT_VALIDITY_MINUTES: 30,
  MAX_SHORTCODE_LENGTH: 20,
  MIN_SHORTCODE_LENGTH: 3,
  
  // Base URL for shortened links
  BASE_URL: process.env.BASE_URL || 'http://localhost:5000',
  
  // Cleanup interval for expired URLs (in milliseconds)
  CLEANUP_INTERVAL: 5 * 60 * 1000, // 5 minutes
  
  // Shortcode generation
  SHORTCODE_CHARSET: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  DEFAULT_SHORTCODE_LENGTH: 6,
  
  // Rate limiting and validation
  MAX_URL_LENGTH: 2048,
  
  // CORS configuration
  CORS_ORIGINS: ['http://localhost:3000'], // Frontend origin
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development'
};

module.exports = config;
