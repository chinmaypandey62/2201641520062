# Full Stack URL Shortener

A modern, full-stack URL shortener application built with Express.js backend and Next.js frontend, featuring custom shortcodes, analytics, expiry management, and comprehensive logging.

## Project Overview

This application consists of two main components:
- **Backend**: Express.js microservice with comprehensive API endpoints
- **Frontend**: Next.js application with Material UI for beautiful user interface
- **Logging Middleware**: Custom reusable logging package with authentication

## Features

### Backend Features
- **URL Shortening**: Create short URLs with auto-generated or custom shortcodes
- **Custom Shortcodes**: Support for user-defined shortcodes (3-20 characters)
- **Expiry Management**: Configurable URL expiration (1 minute to 7 days)
- **Click Analytics**: Real-time tracking with IP, user-agent, and referrer data
- **Data Persistence**: File-based storage with in-memory caching
- **Automatic Cleanup**: Scheduled removal of expired URLs
- **Security**: Input validation, rate limiting, CORS protection
- **Comprehensive Logging**: Integration with custom logging middleware

### Frontend Features
- **Modern UI**: Material UI components with responsive design
- **Real-time Validation**: Form validation and error handling
- **Analytics Dashboard**: View click statistics and URL details
- **Copy to Clipboard**: One-click URL copying functionality
- **Direct Testing**: Open shortened URLs in new tabs
- **TypeScript**: Full type safety and autocomplete

### Logging Middleware Features
- **Authentication**: Secure API authentication with token management
- **Retry Logic**: Automatic retry with exponential backoff
- **Error Handling**: Comprehensive error capture and reporting
- **Reusable Package**: Can be integrated into any Node.js application

## 🏗️ Architecture

```
📦 Full Stack URL Shortener
├── 📁 backend-test-submission/        # Express.js Backend
│   ├── 📁 src/
│   │   ├── 📁 controllers/           # Request handlers
│   │   ├── 📁 services/              # Business logic
│   │   ├── 📁 models/                # Data models
│   │   ├── 📁 middleware/            # Custom middleware
│   │   ├── 📁 routes/                # API routes
│   │   └── 📁 utils/                 # Utilities & validation
│   ├── 📁 config/                    # Configuration files
│   ├── 📁 data/                      # Data storage
│   └── 📄 server.js                  # Main entry point
├── 📁 frontend-test-submission/       # Next.js Frontend
│   ├── 📁 src/
│   │   ├── 📁 app/                   # Next.js App Router
│   │   ├── 📁 components/            # React components
│   │   ├── 📁 services/              # API service layer
│   │   └── 📁 types/                 # TypeScript types
│   └── 📄 package.json
└── 📁 logging-middleware/            # Reusable Logging Package
    ├── 📁 lib/                       # Core logging functionality
    ├── 📁 config/                    # Configuration
    └── 📄 index.js                   # Package entry point
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: Custom token-based auth
- **Storage**: File-based JSON with in-memory caching
- **Validation**: Custom URL and shortcode validation
- **Security**: CORS, Rate limiting, Input sanitization
- **Scheduling**: node-cron for cleanup tasks

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **UI Library**: Material UI (MUI)
- **HTTP Client**: Axios
- **Styling**: CSS-in-JS with MUI theme system

### Logging
- **Custom Middleware**: Proprietary logging solution
- **Authentication**: Token-based API authentication
- **Retry Logic**: Exponential backoff with max attempts
- **Error Handling**: Comprehensive error capture

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd full-stack-url-shortener
   ```

2. **Set up the Backend**
   ```bash
   cd backend-test-submission
   npm install
   ```

3. **Set up the Frontend**
   ```bash
   cd ../frontend-test-submission
   npm install
   ```

4. **Configure Logging Middleware**
   ```bash
   cd ../logging-middleware
   npm install
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend-test-submission
   node server.js
   ```
   Backend will be available at: `http://localhost:3001`

2. **Start the Frontend Development Server**
   ```bash
   cd frontend-test-submission
   npm run dev
   ```
   Frontend will be available at: `http://localhost:3000`

## 📡 API Documentation

### Base URL
```
http://localhost:3001
```

### Endpoints

#### Create Short URL
```http
POST /shorturls
Content-Type: application/json

{
  "originalUrl": "https://example.com/very-long-url",
  "customShortcode": "my-code",     // Optional
  "validityMinutes": 1440           // Optional (default: 30)
}
```

#### Get URL Statistics
```http
GET /shorturls/{shortcode}
```

#### Handle Redirection
```http
GET /{shortcode}
```

#### Get All URLs (Debug)
```http
GET /api/all
```

### Response Format
```json
{
  "success": true,
  "data": {
    "shortcode": "abc123",
    "originalUrl": "https://example.com",
    "shortLink": "http://localhost:3001/abc123",
    "clickCount": 5,
    "createdAt": "2025-09-08T09:30:00.000Z",
    "expiresAt": "2025-09-08T10:00:00.000Z",
    "isActive": true
  }
}
```

## Usage Examples

### Creating a Short URL
1. Open the frontend at `http://localhost:3000`
2. Enter your long URL in the "Original URL" field
3. Optionally specify a custom shortcode
4. Set the validity period (default: 30 minutes)
5. Click "Shorten URL"

### Viewing Analytics
1. After creating a short URL, click the analytics icon
2. View real-time statistics including:
   - Total click count
   - Creation and expiry timestamps
   - Last click timestamp
   - Active/expired status

### Using Short URLs
1. Copy the generated short URL using the copy icon
2. Share the URL or test it by clicking the "open" icon
3. Each access is tracked and recorded

## 🔧 Configuration

### Backend Configuration
Edit `backend-test-submission/config/config.js`:
```javascript
{
  PORT: 3001,
  HOST: 'localhost',
  DEFAULT_VALIDITY_MINUTES: 30,
  MAX_SHORTCODE_LENGTH: 20,
  MIN_SHORTCODE_LENGTH: 3,
  BASE_URL: 'http://localhost:3001',
  CLEANUP_INTERVAL: 300000, // 5 minutes
  CORS_ORIGINS: ['http://localhost:3000']
}
```

### Frontend Configuration
Create `frontend-test-submission/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Testing

### Manual Testing
1. **URL Creation**: Test with various URL formats
2. **Custom Shortcodes**: Try different shortcode patterns
3. **Expiry**: Test with short expiry times (1-2 minutes)
4. **Analytics**: Create URLs and access them multiple times
5. **Validation**: Test with invalid URLs and shortcodes

### API Testing
Use tools like Postman or curl to test API endpoints:
```bash
# Create a short URL
curl -X POST http://localhost:3001/shorturls \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://example.com", "validityMinutes": 60}'

# Get statistics
curl http://localhost:3001/shorturls/abc123

# Test redirection
curl -L http://localhost:3001/abc123
```

## 🔒 Security Features

- **Input Validation**: All inputs are validated and sanitized
- **Rate Limiting**: Prevents abuse with configurable limits
- **CORS Protection**: Restricts cross-origin requests
- **URL Validation**: Ensures only valid URLs are processed
- **Automatic Cleanup**: Expired URLs are automatically removed
- **Logging**: All activities are logged for monitoring

## Monitoring & Logging

The application includes comprehensive logging:
- **Request/Response Logging**: All API calls are logged
- **Error Tracking**: Errors are captured with full context
- **Analytics Logging**: URL creation and access events
- **System Logging**: Server startup, cleanup, and maintenance

## Deployment

### Production Considerations
1. **Environment Variables**: Set production URLs and secrets
2. **Database**: Consider upgrading to PostgreSQL or MongoDB
3. **Caching**: Implement Redis for better performance
4. **Load Balancing**: Use nginx or similar for high availability
5. **SSL**: Enable HTTPS for production deployment
6. **Monitoring**: Set up application monitoring and alerting

## Future Enhancements

- [ ] User authentication and URL management
- [ ] Bulk URL shortening
- [ ] Advanced analytics dashboard
- [ ] QR code generation
- [ ] Custom domains support
- [ ] API rate limiting per user
- [ ] URL preview functionality
- [ ] Geographic analytics
- [ ] URL categories and tags

## 📄 License

This project is developed as a demonstration of full-stack development capabilities.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built with ❤️ using modern web technologies**
