const URLShortenerService = require('../services/urlShortenerService');
const { info, warn, error } = require('../utils/logger');

class URLController {
  
  // POST /shorturls - Create short URL
  static async createShortURL(req, res) {
    try {
      info('backend', 'controller', `POST /shorturls - Creating short URL`);
      
      const { url, validity, shortcode } = req.body;
      
      // Log request details
      info('backend', 'controller', `Create URL request received`);
      
      // Validate request body
      if (!url) {
        warn('backend', 'controller', 'Missing required field: url');
        return res.status(400).json({
          error: 'Bad Request',
          message: 'URL is required',
          details: ['The "url" field is required in the request body']
        });
      }
      
      // Call service
      const result = await URLShortenerService.createShortURL(url, validity, shortcode);
      
      if (result.success) {
        info('backend', 'controller', `Short URL created: ${result.data.shortLink}`);
        return res.status(201).json({
          shortLink: result.data.shortLink,
          expiry: result.data.expiry
        });
      } else {
        warn('backend', 'controller', `Short URL creation failed: ${result.error}`);
        
        // Determine appropriate status code
        let statusCode = 400;
        if (result.error === 'Shortcode already exists') {
          statusCode = 409; // Conflict
        } else if (result.error === 'Internal server error') {
          statusCode = 500;
        }
        
        return res.status(statusCode).json({
          error: result.error,
          message: result.details ? result.details[0] : result.error,
          details: result.details || []
        });
      }
      
    } catch (err) {
      error('backend', 'controller', `Unexpected error in createShortURL: ${err.message}`);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        details: []
      });
    }
  }
  
  // GET /shorturls/:shortcode - Get URL statistics
  static async getURLStatistics(req, res) {
    try {
      const { shortcode } = req.params;
      info('backend', 'controller', `GET /shorturls/${shortcode} - Retrieving statistics`);
      
      if (!shortcode) {
        warn('backend', 'controller', 'Missing shortcode parameter');
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Shortcode is required',
          details: ['Shortcode parameter is missing from the URL']
        });
      }
      
      // Call service
      const result = await URLShortenerService.getURLStatistics(shortcode);
      
      if (result.success) {
        info('backend', 'controller', `Statistics retrieved for ${shortcode}: ${result.data.clickCount} clicks`);
        return res.status(200).json(result.data);
      } else {
        warn('backend', 'controller', `Statistics retrieval failed for ${shortcode}: ${result.error}`);
        
        // Determine appropriate status code
        let statusCode = 400;
        if (result.error === 'Shortcode not found') {
          statusCode = 404;
        } else if (result.error === 'Internal server error') {
          statusCode = 500;
        }
        
        return res.status(statusCode).json({
          error: result.error,
          message: result.details ? result.details[0] : result.error,
          details: result.details || []
        });
      }
      
    } catch (err) {
      error('backend', 'controller', `Unexpected error in getURLStatistics: ${err.message}`);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        details: []
      });
    }
  }
  
  // GET /:shortcode - Handle redirection
  static async handleRedirection(req, res) {
    try {
      const { shortcode } = req.params;
      info('backend', 'controller', `GET /${shortcode} - Handling redirection`);
      
      if (!shortcode) {
        warn('backend', 'controller', 'Missing shortcode for redirection');
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Shortcode is required',
          details: ['Shortcode parameter is missing from the URL']
        });
      }
      
      // Extract click data from request
      const clickData = {
        referrer: req.get('Referer') || req.get('Referrer') || 'Direct',
        userAgent: req.get('User-Agent') || 'Unknown',
        ipAddress: req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'Unknown'
      };
      
      info('backend', 'controller', `Click from ${clickData.ipAddress}`);
      
      // Call service
      const result = await URLShortenerService.handleRedirection(shortcode, clickData);
      
      if (result.success) {
        info('backend', 'controller', `Redirecting ${shortcode} to: ${result.data.originalUrl}`);
        return res.redirect(302, result.data.originalUrl);
      } else {
        warn('backend', 'controller', `Redirection failed for ${shortcode}: ${result.error}`);
        
        // Determine appropriate status code
        let statusCode = 400;
        if (result.error === 'Shortcode not found') {
          statusCode = 404;
        } else if (result.error === 'URL has expired') {
          statusCode = 410; // Gone
        } else if (result.error === 'Internal server error') {
          statusCode = 500;
        }
        
        return res.status(statusCode).json({
          error: result.error,
          message: result.details ? result.details[0] : result.error,
          details: result.details || []
        });
      }
      
    } catch (err) {
      error('backend', 'controller', `Unexpected error in handleRedirection: ${err.message}`);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        details: []
      });
    }
  }
  
  // GET /api/all - Get all URLs (for debugging/admin)
  static async getAllURLs(req, res) {
    try {
      info('backend', 'controller', 'GET /api/all - Retrieving all URLs');
      
      const result = await URLShortenerService.getAllURLs();
      
      if (result.success) {
        info('backend', 'controller', `Retrieved ${result.data.length} URLs`);
        return res.status(200).json({
          urls: result.data,
          total: result.data.length
        });
      } else {
        error('backend', 'controller', `Failed to retrieve all URLs: ${result.error}`);
        return res.status(500).json({
          error: result.error,
          message: result.details ? result.details[0] : result.error,
          details: result.details || []
        });
      }
      
    } catch (err) {
      error('backend', 'controller', `Unexpected error in getAllURLs: ${err.message}`);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
        details: []
      });
    }
  }
}

module.exports = URLController;
