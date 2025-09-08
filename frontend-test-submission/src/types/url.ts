export interface CreateURLRequest {
  originalUrl: string;
  customShortcode?: string;
  validityMinutes?: number;
}

export interface URLData {
  shortcode: string;
  originalUrl: string;
  shortLink: string;
  expiresAt: string;
  createdAt: string;
  isActive: boolean;
  clickCount: number;
}

export interface URLStatistics {
  shortcode: string;
  originalUrl: string;
  shortLink: string;
  clickCount: number;
  createdAt: string;
  expiresAt: string;
  lastClickAt?: string;
  isActive: boolean;
  clickHistory: ClickData[];
}

export interface ClickData {
  timestamp: string;
  ipAddress: string;
  userAgent?: string;
  referrer?: string;
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  details?: string[];
}

export interface URLResponse {
  shortcode: string;
  originalUrl: string;
  shortLink: string;
  expiresAt: string;
  createdAt: string;
  isActive: boolean;
}

export interface ErrorResponse {
  error: string;
  message: string;
  details: string[];
}
