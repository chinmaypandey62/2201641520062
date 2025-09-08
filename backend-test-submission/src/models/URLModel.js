class URLModel {
  constructor(originalUrl, shortcode, validityMinutes = 30, customShortcode = false) {
    this.shortcode = shortcode;
    this.originalUrl = originalUrl;
    this.customShortcode = customShortcode;
    this.createdAt = new Date().toISOString();
    this.expiresAt = new Date(Date.now() + (validityMinutes * 60 * 1000)).toISOString();
    this.validityMinutes = validityMinutes;
    this.clickCount = 0;
    this.clicks = [];
    this.isActive = true;
  }

  // Check if the URL has expired
  isExpired() {
    return new Date() > new Date(this.expiresAt);
  }

  // Add a click record
  addClick(clickData) {
    const click = {
      timestamp: new Date().toISOString(),
      referrer: clickData.referrer || 'Direct',
      userAgent: clickData.userAgent || 'Unknown',
      ipAddress: clickData.ipAddress || 'Unknown',
      geoLocation: this.getGeoLocation(clickData.ipAddress)
    };
    
    this.clicks.push(click);
    this.clickCount++;
    
    return click;
  }

  // Simple geo-location based on IP (mock implementation)
  getGeoLocation(ipAddress) {
    // In a real application, you would use a geo-location service
    // For this demo, we'll return mock locations based on IP patterns
    if (!ipAddress || ipAddress === 'Unknown' || ipAddress.startsWith('127.') || ipAddress.startsWith('::1')) {
      return 'Local/Localhost';
    }
    
    // Mock geo-location data
    const mockLocations = [
      'New York, US',
      'London, UK', 
      'Tokyo, JP',
      'Sydney, AU',
      'Berlin, DE',
      'Toronto, CA',
      'Mumbai, IN',
      'São Paulo, BR'
    ];
    
    // Use IP address to consistently return same location
    const hash = ipAddress.split('.').reduce((acc, octet) => acc + parseInt(octet), 0);
    return mockLocations[hash % mockLocations.length];
  }

  // Get statistics object
  getStats() {
    return {
      shortcode: this.shortcode,
      originalUrl: this.originalUrl,
      shortLink: `${require('../../config/config').BASE_URL}/${this.shortcode}`,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      validityMinutes: this.validityMinutes,
      clickCount: this.clickCount,
      isActive: this.isActive && !this.isExpired(),
      isExpired: this.isExpired(),
      customShortcode: this.customShortcode,
      clicks: this.clicks
    };
  }

  // Deactivate the URL
  deactivate() {
    this.isActive = false;
  }

  // Convert to JSON for storage/response
  toJSON() {
    return {
      shortcode: this.shortcode,
      originalUrl: this.originalUrl,
      customShortcode: this.customShortcode,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      validityMinutes: this.validityMinutes,
      clickCount: this.clickCount,
      clicks: this.clicks,
      isActive: this.isActive
    };
  }

  // Create from JSON (for persistence)
  static fromJSON(data) {
    const url = new URLModel(data.originalUrl, data.shortcode, data.validityMinutes, data.customShortcode);
    url.createdAt = data.createdAt;
    url.expiresAt = data.expiresAt;
    url.clickCount = data.clickCount;
    url.clicks = data.clicks || [];
    url.isActive = data.isActive;
    return url;
  }
}

module.exports = URLModel;
