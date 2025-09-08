const fs = require('fs');
const path = require('path');
const URLModel = require('../models/URLModel');
const { info, warn, error } = require('../utils/logger');

class DataStore {
  constructor() {
    this.urls = new Map(); // In-memory storage: shortcode -> URLModel
    this.dataFile = path.join(__dirname, '../../data/urls.json');
    this.loadFromFile();
  }

  // Load data from file if it exists
  loadFromFile() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
        data.forEach(urlData => {
          const url = URLModel.fromJSON(urlData);
          this.urls.set(url.shortcode, url);
        });
        info('backend', 'db', `Loaded ${this.urls.size} URLs from storage`);
      } else {
        info('backend', 'db', 'No data file found, starting with empty store');
      }
    } catch (err) {
      error('backend', 'db', `Failed to load data from file: ${err.message}`);
    }
  }

  // Save data to file
  saveToFile() {
    try {
      const dataDir = path.dirname(this.dataFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const data = Array.from(this.urls.values()).map(url => url.toJSON());
      fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2));
      info('backend', 'db', `Saved ${data.length} URLs to storage`);
    } catch (err) {
      error('backend', 'db', `Failed to save data to file: ${err.message}`);
    }
  }

  // Store a new URL
  async storeURL(urlModel) {
    try {
      this.urls.set(urlModel.shortcode, urlModel);
      this.saveToFile();
      info('backend', 'db', `Stored URL: ${urlModel.shortcode}`);
      return true;
    } catch (err) {
      error('backend', 'db', `Failed to store URL: ${err.message}`);
      return false;
    }
  }

  // Get URL by shortcode
  async getURL(shortcode) {
    try {
      const url = this.urls.get(shortcode);
      if (url) {
        info('backend', 'db', `Retrieved URL for shortcode: ${shortcode}`);
        return url;
      } else {
        warn('backend', 'db', `Shortcode not found: ${shortcode}`);
        return null;
      }
    } catch (err) {
      error('backend', 'db', `Failed to retrieve URL for ${shortcode}: ${err.message}`);
      return null;
    }
  }

  // Check if shortcode exists
  async shortcodeExists(shortcode) {
    return this.urls.has(shortcode);
  }

  // Get all URLs
  async getAllURLs() {
    try {
      const allUrls = Array.from(this.urls.values());
      info('backend', 'db', `Retrieved ${allUrls.length} URLs from store`);
      return allUrls;
    } catch (err) {
      error('backend', 'db', `Failed to retrieve all URLs: ${err.message}`);
      return [];
    }
  }

  // Update URL (for click tracking)
  async updateURL(shortcode, urlModel) {
    try {
      if (this.urls.has(shortcode)) {
        this.urls.set(shortcode, urlModel);
        this.saveToFile();
        return true;
      }
      return false;
    } catch (err) {
      error('backend', 'db', `Failed to update URL ${shortcode}: ${err.message}`);
      return false;
    }
  }

  // Clean up expired URLs
  async cleanupExpiredURLs() {
    try {
      let removedCount = 0;
      
      for (const [shortcode, url] of this.urls.entries()) {
        if (url.isExpired()) {
          this.urls.delete(shortcode);
          removedCount++;
        }
      }
      
      if (removedCount > 0) {
        this.saveToFile();
        info('backend', 'db', `Cleaned up ${removedCount} expired URLs`);
      }
      
      return removedCount;
    } catch (err) {
      error('backend', 'db', `Failed to cleanup expired URLs: ${err.message}`);
      return 0;
    }
  }

  // Get statistics
  async getStats() {
    try {
      const total = this.urls.size;
      const active = Array.from(this.urls.values()).filter(url => !url.isExpired()).length;
      const expired = total - active;
      const totalClicks = Array.from(this.urls.values()).reduce((sum, url) => sum + url.clickCount, 0);
      
      info('backend', 'db', `Stats: ${total} total, ${active} active, ${expired} expired`);
      
      return {
        totalUrls: total,
        activeUrls: active,
        expiredUrls: expired,
        totalClicks: totalClicks
      };
    } catch (err) {
      error('backend', 'db', `Failed to generate statistics: ${err.message}`);
      return null;
    }
  }
}

module.exports = new DataStore();
