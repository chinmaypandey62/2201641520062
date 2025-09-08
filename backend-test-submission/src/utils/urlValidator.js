const validator = require('validator');
const config = require('../../config/config');
const { debug, warn } = require('./logger');

class URLValidator {
  
  // Validate URL format and accessibility
  static validateURL(url) {
    const errors = [];
    
    if (!url || typeof url !== 'string') {
      errors.push('URL is required and must be a string');
      return { isValid: false, errors, normalizedUrl: null };
    }
    
    // Trim whitespace
    const trimmedUrl = url.trim();
    
    if (trimmedUrl.length === 0) {
      errors.push('URL cannot be empty');
      return { isValid: false, errors, normalizedUrl: null };
    }
    
    // Length validation
    if (trimmedUrl.length > config.MAX_URL_LENGTH) {
      errors.push(`URL must be less than ${config.MAX_URL_LENGTH} characters`);
    }
    
    // Add protocol if missing
    let normalizedUrl = trimmedUrl;
    const protocolRegex = /^https?:\/\//;
    if (!protocolRegex.exec(normalizedUrl)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    // Validate URL format
    if (!validator.isURL(normalizedUrl, {
      protocols: ['http', 'https'],
      require_protocol: true,
      require_valid_protocol: true,
      allow_underscores: true,
      allow_trailing_dot: false,
      allow_protocol_relative_urls: false
    })) {
      errors.push('Invalid URL format');
    }
    
    // Check for localhost/internal URLs in production
    if (config.NODE_ENV === 'production') {
      const localhostPatterns = [
        /localhost/i,
        /127\.0\.0\.1/,
        /0\.0\.0\.0/,
        /::1/,
        /10\.\d+\.\d+\.\d+/,
        /192\.168\.\d+\.\d+/,
        /172\.(1[6-9]|2\d|3[01])\.\d+\.\d+/
      ];
      
      const hasLocalhost = localhostPatterns.some(pattern => pattern.test(normalizedUrl));
      if (hasLocalhost) {
        errors.push('Localhost and internal URLs are not allowed in production');
      }
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /file:/i,
      /ftp:/i
    ];
    
    const hasSuspicious = suspiciousPatterns.some(pattern => pattern.test(normalizedUrl));
    if (hasSuspicious) {
      errors.push('URL contains potentially unsafe protocol');
    }
    
    const isValid = errors.length === 0;
    
    if (isValid) {
      debug('backend', 'utils', `URL validated successfully: ${normalizedUrl}`);
    } else {
      warn('backend', 'utils', `Invalid URL "${url}": ${errors.join(', ')}`);
    }
    
    return {
      isValid,
      errors,
      normalizedUrl: isValid ? normalizedUrl : null
    };
  }

  // Validate validity period (in minutes)
  static validateValidity(validity) {
    const errors = [];
    
    // If not provided, use default
    if (validity === undefined || validity === null) {
      debug('backend', 'utils', `Using default validity: ${config.DEFAULT_VALIDITY_MINUTES} minutes`);
      return {
        isValid: true,
        errors: [],
        normalizedValidity: config.DEFAULT_VALIDITY_MINUTES
      };
    }
    
    // Convert to number if it's a string
    let numericValidity = validity;
    if (typeof validity === 'string') {
      numericValidity = parseInt(validity, 10);
    }
    
    // Check if it's a valid number
    if (isNaN(numericValidity) || !Number.isInteger(numericValidity)) {
      errors.push('Validity must be an integer number of minutes');
      return { isValid: false, errors, normalizedValidity: null };
    }
    
    // Range validation
    if (numericValidity <= 0) {
      errors.push('Validity must be greater than 0 minutes');
    }
    
    if (numericValidity > 525600) { // 1 year in minutes
      errors.push('Validity cannot exceed 525600 minutes (1 year)');
    }
    
    const isValid = errors.length === 0;
    
    if (isValid) {
      debug('backend', 'utils', `Validity validated successfully: ${numericValidity} minutes`);
    } else {
      warn('backend', 'utils', `Validity validation failed for "${validity}": ${errors.join(', ')}`);
    }
    
    return {
      isValid,
      errors,
      normalizedValidity: isValid ? numericValidity : null
    };
  }

  // Extract domain from URL for analytics
  static extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      warn('backend', 'utils', `Failed to extract domain from URL: ${url} - ${error.message}`);
      return 'unknown';
    }
  }

  // Check if URL is accessible (basic check)
  static async checkURLAccessibility(url, timeout = 5000) {
    try {
      debug('backend', 'utils', `Checking URL accessibility: ${url}`);
      
      // For this demo, we'll just return true
      // In a real application, you might want to make a HEAD request
      // to check if the URL is accessible
      
      return true;
    } catch (error) {
      warn('backend', 'utils', `URL accessibility check failed for ${url}: ${error.message}`);
      return false;
    }
  }
}

module.exports = URLValidator;
