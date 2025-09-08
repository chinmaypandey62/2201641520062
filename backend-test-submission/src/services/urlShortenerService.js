const URLModel = require('../models/URLModel');
const dataStore = require('./dataStore');
const ShortcodeGenerator = require('../utils/shortcodeGenerator');
const URLValidator = require('../utils/urlValidator');
const config = require('../../config/config');
const { info, warn, error } = require('../utils/logger');

class URLShortenerService {
  
  // Create a shortened URL
  static async createShortURL(originalUrl, validity, customShortcode) {
    try {
      info('backend', 'service', `Creating short URL for: ${originalUrl}`);
      
      // Validate URL
      const urlValidation = URLValidator.validateURL(originalUrl);
      if (!urlValidation.isValid) {
        warn('backend', 'service', `URL validation failed: ${urlValidation.errors.join(', ')}`);
        return {
          success: false,
          error: 'Invalid URL',
          details: urlValidation.errors
        };
      }
      
      // Validate validity period
      const validityValidation = URLValidator.validateValidity(validity);
      if (!validityValidation.isValid) {
        warn('backend', 'service', `Validity validation failed: ${validityValidation.errors.join(', ')}`);
        return {
          success: false,
          error: 'Invalid validity period',
          details: validityValidation.errors
        };
      }
      
      let shortcode;
      let isCustomShortcode = false;
      
      // Handle custom shortcode
      if (customShortcode) {
        const shortcodeValidation = ShortcodeGenerator.validateCustomShortcode(customShortcode);
        if (!shortcodeValidation.isValid) {
          warn('backend', 'service', `Custom shortcode validation failed: ${shortcodeValidation.errors.join(', ')}`);
          return {
            success: false,
            error: 'Invalid custom shortcode',
            details: shortcodeValidation.errors
          };
        }
        
        // Check if custom shortcode already exists
        const normalizedShortcode = ShortcodeGenerator.normalizeShortcode(customShortcode);
        const exists = await dataStore.shortcodeExists(normalizedShortcode);
        if (exists) {
          warn('backend', 'service', `Custom shortcode already exists: ${normalizedShortcode}`);
          return {
            success: false,
            error: 'Shortcode already exists',
            details: ['The requested shortcode is already in use']
          };
        }
        
        shortcode = normalizedShortcode;
        isCustomShortcode = true;
        info('backend', 'service', `Using custom shortcode: ${shortcode}`);
      } else {
        // Generate unique shortcode
        shortcode = await ShortcodeGenerator.generateUniqueShortcode(
          (code) => dataStore.shortcodeExists(code)
        );
        info('backend', 'service', `Generated unique shortcode: ${shortcode}`);
      }
      
      // Create URL model
      const urlModel = new URLModel(
        urlValidation.normalizedUrl,
        shortcode,
        validityValidation.normalizedValidity,
        isCustomShortcode
      );
      
      // Store in database
      const stored = await dataStore.storeURL(urlModel);
      if (!stored) {
        error('backend', 'service', `Failed to store URL: ${shortcode}`);
        return {
          success: false,
          error: 'Failed to store URL',
          details: ['Database error occurred while storing the URL']
        };
      }
      
      // Return success response
      const shortLink = `${config.BASE_URL}/${shortcode}`;
      info('backend', 'service', `Successfully created short URL: ${shortLink}`);
      
      return {
        success: true,
        data: {
          shortLink: shortLink,
          expiry: urlModel.expiresAt,
          shortcode: shortcode,
          originalUrl: urlModel.originalUrl
        }
      };
      
    } catch (err) {
      error('backend', 'service', `Unexpected error creating short URL: ${err.message}`);
      return {
        success: false,
        error: 'Internal server error',
        details: ['An unexpected error occurred']
      };
    }
  }
  
  // Get URL statistics
  static async getURLStatistics(shortcode) {
    try {
      info('backend', 'service', `Retrieving statistics for shortcode: ${shortcode}`);
      
      if (!shortcode || typeof shortcode !== 'string') {
        warn('backend', 'service', 'Invalid shortcode provided for statistics');
        return {
          success: false,
          error: 'Invalid shortcode',
          details: ['Shortcode is required and must be a string']
        };
      }
      
      const normalizedShortcode = ShortcodeGenerator.normalizeShortcode(shortcode);
      const urlModel = await dataStore.getURL(normalizedShortcode);
      
      if (!urlModel) {
        warn('backend', 'service', `Shortcode not found for statistics: ${normalizedShortcode}`);
        return {
          success: false,
          error: 'Shortcode not found',
          details: ['The requested shortcode does not exist']
        };
      }
      
      // Get comprehensive statistics
      const stats = urlModel.getStats();
      info('backend', 'service', `Stats for ${normalizedShortcode}: ${stats.clickCount} clicks`);
      
      return {
        success: true,
        data: stats
      };
      
    } catch (err) {
      error('backend', 'service', `Unexpected error retrieving statistics: ${err.message}`);
      return {
        success: false,
        error: 'Internal server error',
        details: ['An unexpected error occurred']
      };
    }
  }
  
  // Handle URL redirection and click tracking
  static async handleRedirection(shortcode, clickData) {
    try {
      info('backend', 'service', `Handling redirection for shortcode: ${shortcode}`);
      
      if (!shortcode || typeof shortcode !== 'string') {
        warn('backend', 'service', 'Invalid shortcode provided for redirection');
        return {
          success: false,
          error: 'Invalid shortcode',
          details: ['Shortcode is required and must be a string']
        };
      }
      
      const normalizedShortcode = ShortcodeGenerator.normalizeShortcode(shortcode);
      const urlModel = await dataStore.getURL(normalizedShortcode);
      
      if (!urlModel) {
        warn('backend', 'service', `Shortcode not found for redirection: ${normalizedShortcode}`);
        return {
          success: false,
          error: 'Shortcode not found',
          details: ['The requested shortcode does not exist']
        };
      }
      
      // Check if URL has expired
      if (urlModel.isExpired()) {
        warn('backend', 'service', `Expired URL accessed: ${normalizedShortcode}`);
        return {
          success: false,
          error: 'URL has expired',
          details: ['This shortened URL has expired and is no longer valid']
        };
      }
      
      // Track the click
      const clickRecord = urlModel.addClick(clickData);
      await dataStore.updateURL(normalizedShortcode, urlModel);
      
      info('backend', 'service', `Click tracked: ${normalizedShortcode} (${urlModel.clickCount} total)`);
      info('backend', 'service', `Redirecting to: ${urlModel.originalUrl}`);
      
      return {
        success: true,
        data: {
          originalUrl: urlModel.originalUrl,
          clickRecord: clickRecord,
          totalClicks: urlModel.clickCount
        }
      };
      
    } catch (err) {
      error('backend', 'service', `Unexpected error handling redirection: ${err.message}`);
      return {
        success: false,
        error: 'Internal server error',
        details: ['An unexpected error occurred']
      };
    }
  }
  
  // Get all URLs (for admin/debugging)
  static async getAllURLs() {
    try {
      info('backend', 'service', 'Retrieving all URLs');
      const urls = await dataStore.getAllURLs();
      const urlStats = urls.map(url => url.getStats());
      
      info('backend', 'service', `Retrieved ${urlStats.length} URLs`);
      return {
        success: true,
        data: urlStats
      };
      
    } catch (err) {
      error('backend', 'service', `Error retrieving all URLs: ${err.message}`);
      return {
        success: false,
        error: 'Internal server error',
        details: ['An unexpected error occurred']
      };
    }
  }
  
  // Clean up expired URLs
  static async cleanupExpiredURLs() {
    try {
      info('backend', 'service', 'Starting cleanup of expired URLs');
      const removedCount = await dataStore.cleanupExpiredURLs();
      info('backend', 'service', `Cleanup done: ${removedCount} URLs removed`);
      
      return {
        success: true,
        data: {
          removedCount: removedCount
        }
      };
      
    } catch (err) {
      error('backend', 'service', `Error during cleanup: ${err.message}`);
      return {
        success: false,
        error: 'Cleanup failed',
        details: ['An error occurred during cleanup']
      };
    }
  }
}

module.exports = URLShortenerService;
