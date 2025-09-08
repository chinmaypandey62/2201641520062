const { LOG_CONSTRAINTS, getValidPackages } = require('../config/constants');

class LogValidator {
  
  static validateLogParams(stack, level, packageName, message) {
    const errors = [];

    // Validate stack
    if (!stack || typeof stack !== 'string') {
      errors.push('Stack is required and must be a string');
    } else if (!LOG_CONSTRAINTS.STACK.includes(stack.toLowerCase())) {
      errors.push(`Stack must be one of: ${LOG_CONSTRAINTS.STACK.join(', ')}`);
    }

    // Validate level
    if (!level || typeof level !== 'string') {
      errors.push('Level is required and must be a string');
    } else if (!LOG_CONSTRAINTS.LEVEL.includes(level.toLowerCase())) {
      errors.push(`Level must be one of: ${LOG_CONSTRAINTS.LEVEL.join(', ')}`);
    }

    // Validate package
    if (!packageName || typeof packageName !== 'string') {
      errors.push('Package is required and must be a string');
    } else if (stack && typeof stack === 'string') {
      const validPackages = getValidPackages(stack.toLowerCase());
      if (!validPackages.includes(packageName.toLowerCase())) {
        errors.push(`Package '${packageName}' is not valid for stack '${stack}'. Valid packages: ${validPackages.join(', ')}`);
      }
    }

    // Validate message
    if (!message || typeof message !== 'string') {
      errors.push('Message is required and must be a string');
    } else if (message.trim().length === 0) {
      errors.push('Message cannot be empty');
    }

    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  static normalizeParams(stack, level, packageName, message) {
    return {
      stack: stack ? stack.toLowerCase().trim() : null,
      level: level ? level.toLowerCase().trim() : null,
      package: packageName ? packageName.toLowerCase().trim() : null,
      message: message ? message.trim() : null
    };
  }

  static validateAndNormalize(stack, level, packageName, message) {
    // First normalize the inputs
    const normalized = this.normalizeParams(stack, level, packageName, message);
    
    // Then validate
    const validation = this.validateLogParams(
      normalized.stack, 
      normalized.level, 
      normalized.package, 
      normalized.message
    );

    return {
      ...validation,
      normalizedParams: normalized
    };
  }
}

module.exports = LogValidator;
