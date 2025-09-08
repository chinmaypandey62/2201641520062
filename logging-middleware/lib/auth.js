const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const { API_CONFIG } = require('../config/constants');

class AuthManager {
  constructor() {
    this.token = null;
    this.tokenExpiry = null;
    this.credentials = null;
    this.loadCredentials();
  }

  loadCredentials() {
    try {
      const credentialsPath = path.join(__dirname, '../config/credentials.json');
      if (fs.existsSync(credentialsPath)) {
        this.credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
      } else {
        throw new Error('Credentials file not found. Please run registration first.');
      }
    } catch (error) {
      console.error('Error loading credentials:', error.message);
      throw error;
    }
  }

  async getValidToken() {
    // Check if we have a valid token
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    // Get new token
    return await this.authenticate();
  }

  async authenticate() {
    try {
      if (!this.credentials) {
        throw new Error('No credentials available for authentication');
      }

      const authData = {
        email: this.credentials.email,
        name: this.credentials.name,
        rollNo: this.credentials.rollNo,
        accessCode: this.credentials.accessCode,
        clientID: this.credentials.clientID,
        clientSecret: this.credentials.clientSecret
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData),
        timeout: API_CONFIG.TIMEOUT
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Authentication failed: ${response.status} - ${errorData}`);
      }

      const data = await response.json();
      
      // Store token and expiry
      this.token = data.access_token;
      this.tokenExpiry = data.expires_in * 1000; // Convert to milliseconds
      
      console.log('Authentication successful. Token expires at:', new Date(this.tokenExpiry));
      
      return this.token;
    } catch (error) {
      console.error('Authentication error:', error.message);
      throw error;
    }
  }

  getAuthHeader() {
    if (!this.token) {
      throw new Error('No valid token available');
    }
    return `Bearer ${this.token}`;
  }

  // Clear token to force re-authentication
  clearToken() {
    this.token = null;
    this.tokenExpiry = null;
  }
}

module.exports = AuthManager;
