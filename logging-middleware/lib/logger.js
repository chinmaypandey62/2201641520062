const fetch = require('node-fetch');
const AuthManager = require('./auth');
const LogValidator = require('./validator');
const { API_CONFIG } = require('../config/constants');

class Logger {
  constructor() {
    this.authManager = new AuthManager();
    this.logQueue = [];
    this.isProcessingQueue = false;
  }

  async log(stack, level, packageName, message) {
    try {
      // Validate and normalize inputs
      const validation = LogValidator.validateAndNormalize(stack, level, packageName, message);
      
      if (!validation.isValid) {
        const errorMsg = `Validation failed: ${validation.errors.join(', ')}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      const logData = {
        stack: validation.normalizedParams.stack,
        level: validation.normalizedParams.level,
        package: validation.normalizedParams.package,
        message: validation.normalizedParams.message
      };

      // Add to queue for processing
      return await this.sendLogToAPI(logData);
      
    } catch (error) {
      console.error('Logging error:', error.message);
      // Don't throw error to prevent breaking application flow
      return false;
    }
  }

  async sendLogToAPI(logData) {
    let attempts = 0;
    
    while (attempts < API_CONFIG.RETRY_ATTEMPTS) {
      try {
        // Get valid authentication token
        await this.authManager.getValidToken();
        
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGS}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': this.authManager.getAuthHeader()
          },
          body: JSON.stringify(logData),
          timeout: API_CONFIG.TIMEOUT
        });

        if (response.ok) {
          await response.json();
          console.log(`Log sent successfully: [${logData.level.toUpperCase()}] ${logData.message}`);
          return true;
        } else if (response.status === 401) {
          // Token might be expired, clear it and retry
          this.authManager.clearToken();
          attempts++;
          console.warn(`Authentication failed, retrying... (${attempts}/${API_CONFIG.RETRY_ATTEMPTS})`);
          await this.delay(API_CONFIG.RETRY_DELAY);
          continue;
        } else {
          const errorText = await response.text();
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
        
      } catch (error) {
        attempts++;
        console.error(`Log attempt ${attempts} failed:`, error.message);
        
        if (attempts >= API_CONFIG.RETRY_ATTEMPTS) {
          console.error('Max retry attempts reached. Log failed to send.');
          return false;
        }
        
        await this.delay(API_CONFIG.RETRY_DELAY * attempts); // Exponential backoff
      }
    }
    
    return false;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Convenience methods for different log levels
  async debug(stack, packageName, message) {
    return await this.log(stack, 'debug', packageName, message);
  }

  async info(stack, packageName, message) {
    return await this.log(stack, 'info', packageName, message);
  }

  async warn(stack, packageName, message) {
    return await this.log(stack, 'warn', packageName, message);
  }

  async error(stack, packageName, message) {
    return await this.log(stack, 'error', packageName, message);
  }

  async fatal(stack, packageName, message) {
    return await this.log(stack, 'fatal', packageName, message);
  }
}

module.exports = Logger;
