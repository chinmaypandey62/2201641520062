const crypto = require('crypto');
const config = require('../../config/config');
const { debug, warn } = require('./logger');

class ShortcodeGenerator {
  
  // Generate a random shortcode
  static generateShortcode(length = config.DEFAULT_SHORTCODE_LENGTH) {
    const charset = config.SHORTCODE_CHARSET;
    let result = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      result += charset[randomIndex];
    }
    
    debug('backend', 'utils', `Generated shortcode: ${result}`);
    return result;
  }

  // Generate a unique shortcode (checking against existing ones)
  static async generateUniqueShortcode(checkExistsFn, maxAttempts = 10) {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const shortcode = this.generateShortcode();
      const exists = await checkExistsFn(shortcode);
      
      if (!exists) {
        debug('backend', 'utils', `Unique shortcode: ${shortcode} (${attempts + 1} tries)`);
        return shortcode;
      }
      
      attempts++;
      debug('backend', 'utils', `Shortcode collision detected: ${shortcode}, attempt ${attempts}`);
    }
    
    // If we still haven't found a unique one, try with longer length
    const longerShortcode = this.generateShortcode(config.DEFAULT_SHORTCODE_LENGTH + 2);
    const exists = await checkExistsFn(longerShortcode);
    
    if (!exists) {
      warn('backend', 'utils', `Longer shortcode after ${maxAttempts} tries: ${longerShortcode}`);
      return longerShortcode;
    }
    
    // Last resort: use timestamp-based shortcode
    const timestampShortcode = this.generateTimestampShortcode();
    warn('backend', 'utils', `Timestamp shortcode: ${timestampShortcode}`);
    return timestampShortcode;
  }

  // Generate a timestamp-based shortcode (fallback)
  static generateTimestampShortcode() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    return timestamp + random;
  }

  // Validate custom shortcode
  static validateCustomShortcode(shortcode) {
    const errors = [];
    
    if (!shortcode || typeof shortcode !== 'string') {
      errors.push('Shortcode must be a non-empty string');
      return { isValid: false, errors };
    }
    
    // Length validation
    if (shortcode.length < config.MIN_SHORTCODE_LENGTH) {
      errors.push(`Shortcode must be at least ${config.MIN_SHORTCODE_LENGTH} characters long`);
    }
    
    if (shortcode.length > config.MAX_SHORTCODE_LENGTH) {
      errors.push(`Shortcode must be at most ${config.MAX_SHORTCODE_LENGTH} characters long`);
    }
    
    // Character validation (alphanumeric only)
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(shortcode)) {
      errors.push('Shortcode must contain only alphanumeric characters');
    }
    
    // Reserved words/patterns
    const reservedWords = ['api', 'admin', 'www', 'shorturls', 'stats', 'health'];
    if (reservedWords.includes(shortcode.toLowerCase())) {
      errors.push('Shortcode cannot be a reserved word');
    }
    
    const isValid = errors.length === 0;
    
    if (isValid) {
      debug('backend', 'utils', `Custom shortcode validated successfully: ${shortcode}`);
    } else {
      warn('backend', 'utils', `Invalid shortcode "${shortcode}": ${errors.join(', ')}`);
    }
    
    return { isValid, errors };
  }

  // Normalize shortcode (trim, lowercase for comparison)
  static normalizeShortcode(shortcode) {
    if (!shortcode || typeof shortcode !== 'string') {
      return null;
    }
    return shortcode.trim();
  }
}

module.exports = ShortcodeGenerator;
