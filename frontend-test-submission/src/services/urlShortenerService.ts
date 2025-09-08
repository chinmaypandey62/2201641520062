import axios, { AxiosResponse } from 'axios';
import { CreateURLRequest, APIResponse, URLResponse, URLStatistics } from '../types/url';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class URLShortenerService {
  private readonly api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request error:', error);
        return Promise.reject(new Error(error.message || 'Request failed'));
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        console.log(`Response from ${response.config.url}:`, response.status);
        return response;
      },
      (error) => {
        console.error('Response error:', error.response?.data || error.message);
        return Promise.reject(new Error(error.response?.data?.message || error.message || 'Response failed'));
      }
    );
  }

  async createShortURL(data: CreateURLRequest): Promise<APIResponse<URLResponse>> {
    try {
      const response: AxiosResponse<APIResponse<URLResponse>> = await this.api.post('/shorturls', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error(error.message || 'Failed to create short URL');
    }
  }

  async getStatistics(shortcode: string): Promise<APIResponse<URLStatistics>> {
    try {
      const response: AxiosResponse<APIResponse<URLStatistics>> = await this.api.get(`/shorturls/${shortcode}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error(error.message || 'Failed to get statistics');
    }
  }

  async getAllURLs(): Promise<APIResponse<URLStatistics[]>> {
    try {
      const response: AxiosResponse<APIResponse<URLStatistics[]>> = await this.api.get('/api/all');
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      throw new Error(error.message || 'Failed to get all URLs');
    }
  }

  async redirectToURL(shortcode: string): Promise<void> {
    try {
      // This will trigger a redirect in the browser
      window.location.href = `${API_BASE_URL}/${shortcode}`;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to redirect');
    }
  }

  // Utility method to validate URL
  validateURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Utility method to format shortcode
  formatShortcode(shortcode: string): string {
    return shortcode.toLowerCase().replace(/[^a-z0-9-_]/g, '');
  }
}

export default new URLShortenerService();
