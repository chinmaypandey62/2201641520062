# URL Shortener Microservice

A robust HTTP URL Shortener Microservice built with Express.js that provides core URL shortening functionality along with comprehensive analytical capabilities.

## Features

- **URL Shortening**: Convert long URLs into short, shareable links
- **Custom Shortcodes**: Support for user-defined shortcodes
- **Analytics**: Comprehensive click tracking and statistics
- **Expiry Management**: Configurable URL validity periods
- **Error Handling**: Robust error handling with proper HTTP status codes
- **Logging**: Extensive logging using custom middleware
- **Rate Limiting**: Built-in protection against abuse
- **CORS Support**: Cross-origin resource sharing enabled
- **Auto Cleanup**: Automatic removal of expired URLs

## Quick Start

### Prerequisites
- Node.js (>=14.0.0)
- npm or yarn

### Installation
```bash
npm install
```

### Running the Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001` by default.

## API Endpoints

### 1. Create Short URL
**POST** `/shorturls`

Create a new shortened URL.

**Request Body:**
```json
{
  "url": "https://example.com/very-long-url",
  "validity": 30,
  "shortcode": "custom123"
}
```

**Parameters:**
- `url` (string, required): The original URL to be shortened
- `validity` (integer, optional): Validity period in minutes (default: 30)
- `shortcode` (string, optional): Custom shortcode (auto-generated if not provided)

**Response (201):**
```json
{
  "shortLink": "http://localhost:3001/custom123",
  "expiry": "2025-01-01T00:30:00Z"
}
```

### 2. Get URL Statistics
**GET** `/shorturls/:shortcode`

Retrieve comprehensive statistics for a shortened URL.

**Response (200):**
```json
{
  "shortcode": "custom123",
  "originalUrl": "https://example.com/very-long-url",
  "shortLink": "http://localhost:3001/custom123",
  "createdAt": "2025-01-01T00:00:00Z",
  "expiresAt": "2025-01-01T00:30:00Z",
  "validityMinutes": 30,
  "clickCount": 5,
  "isActive": true,
  "isExpired": false,
  "customShortcode": true,
  "clicks": [
    {
      "timestamp": "2025-01-01T00:05:00Z",
      "referrer": "https://google.com",
      "userAgent": "Mozilla/5.0...",
      "ipAddress": "192.168.1.1",
      "geoLocation": "New York, US"
    }
  ]
}
```

### 3. URL Redirection
**GET** `/:shortcode`

Redirect to the original URL and track the click.

**Response:** 302 redirect to the original URL

### 4. Health Check
**GET** `/health`

Check service health status.

**Response (200):**
```json
{
  "status": "healthy",
  "service": "URL Shortener Microservice",
  "timestamp": "2025-01-01T00:00:00Z",
  "version": "1.0.0"
}
```

### 5. Service Information
**GET** `/`

Get service information and available endpoints.

## Configuration

The service can be configured through environment variables or by modifying `config/config.js`:

```javascript
{
  PORT: 3001,                    // Server port
  HOST: 'localhost',             // Server host
  DEFAULT_VALIDITY_MINUTES: 30,  // Default URL validity
  BASE_URL: 'http://localhost:3001', // Base URL for short links
  MAX_SHORTCODE_LENGTH: 20,      // Maximum shortcode length
  MIN_SHORTCODE_LENGTH: 3        // Minimum shortcode length
}
```

## Error Handling

The API returns appropriate HTTP status codes and detailed error messages:

- **400**: Bad Request (validation errors)
- **404**: Not Found (shortcode doesn't exist)
- **409**: Conflict (shortcode already exists)
- **410**: Gone (URL has expired)
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error

**Error Response Format:**
```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "details": ["Additional error details"]
}
```

## Logging

The service uses a custom logging middleware that extensively logs:

- Request/response cycles with timing
- Business logic operations
- Error conditions and stack traces
- Authentication events
- Database operations
- Cleanup operations

Log levels: `debug`, `info`, `warn`, `error`, `fatal`

## Analytics Features

### Click Tracking
- Timestamp of each click
- Referrer information
- User agent details
- IP address (anonymized)
- Geo-location (coarse-grained)

### Statistics
- Total click count
- Click history with metadata
- URL creation and expiry information
- Active/expired status

## Data Persistence

- **Storage**: File-based JSON storage with in-memory caching
- **Location**: `data/urls.json`
- **Backup**: Automatic persistence on data changes
- **Recovery**: Automatic loading on service restart

## Security Features

- **Input Validation**: Comprehensive validation of all inputs
- **Rate Limiting**: Protection against abuse (100 requests/15 minutes per IP)
- **CORS**: Configured for frontend integration
- **Helmet**: Security headers for production
- **URL Sanitization**: Prevention of malicious URLs

## Performance

- **In-Memory Cache**: Fast access to URL mappings
- **Async Operations**: Non-blocking operations
- **Cleanup Jobs**: Automatic removal of expired URLs
- **Response Times**: Sub-millisecond response times for cached data

## Architecture

```
backend/
├── src/
│   ├── controllers/        # API endpoint handlers
│   ├── services/          # Business logic
│   ├── middleware/        # Custom middleware
│   ├── models/           # Data models
│   ├── utils/            # Helper utilities
│   └── routes/           # Route definitions
├── config/               # Configuration
├── data/                 # Data storage
└── server.js            # Entry point
```

## Development

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests (placeholder)
```

### Code Quality
- ESLint configuration for code quality
- Production-grade error handling
- Comprehensive logging
- Input validation and sanitization

## Deployment

The service is designed for easy deployment:

1. **Environment Variables**: Configure via environment
2. **Health Checks**: Built-in health endpoint
3. **Graceful Shutdown**: Proper cleanup on termination
4. **Process Management**: PM2 compatible

## License

MIT
