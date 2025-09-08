# Logging Middleware

A reusable logging middleware package that sends structured logs to a remote test server. This middleware is designed to work with both backend (Node.js/Express) and frontend (React/Next.js) applications.

## Features

- **Framework Agnostic**: Works with Express.js, Next.js, and other JavaScript frameworks
- **Automatic Authentication**: Handles token management and renewal automatically
- **Input Validation**: Validates all parameters according to API constraints
- **Error Handling**: Graceful error handling with retry logic
- **Convenience Methods**: Easy-to-use methods for different log levels
- **Production Ready**: Includes proper error handling and logging

## Installation

```bash
npm install
```

## Setup

Before using the middleware, you need to register with the test server:

```bash
node register.js
```

This will create a `config/credentials.json` file with your authentication credentials.

## Usage

### Basic Usage

```javascript
const { Log } = require('./path/to/logging-middleware');

// Basic logging
await Log('backend', 'info', 'handler', 'User successfully authenticated');
await Log('frontend', 'error', 'component', 'Failed to render user profile');
```

### Convenience Methods

```javascript
const { debug, info, warn, error, fatal } = require('./path/to/logging-middleware');

// Using convenience methods
await info('backend', 'service', 'User registration completed');
await error('frontend', 'api', 'Failed to fetch data from server');
await debug('backend', 'utils', 'Processing validation logic');
await warn('backend', 'db', 'Database connection pool near capacity');
await fatal('backend', 'db', 'Critical database connection failure');
```

## API Reference

### Log(stack, level, package, message)

Main logging function that sends structured logs to the test server.

**Parameters:**
- `stack` (string): Either `'backend'` or `'frontend'`
- `level` (string): Log level - `'debug'`, `'info'`, `'warn'`, `'error'`, `'fatal'`
- `package` (string): Package name (see constraints below)
- `message` (string): Descriptive log message

**Returns:** Promise<boolean> - True if log was sent successfully

### Convenience Methods

- `debug(stack, package, message)` - Log with debug level
- `info(stack, package, message)` - Log with info level  
- `warn(stack, package, message)` - Log with warn level
- `error(stack, package, message)` - Log with error level
- `fatal(stack, package, message)` - Log with fatal level

## Package Constraints

### Backend Packages
- `cache`, `controller`, `cron_job`, `db`, `domain`, `handler`, `repository`, `route`, `service`

### Frontend Packages  
- `api`, `component`, `hook`, `page`, `state`, `style`

### Shared Packages (Both Backend & Frontend)
- `auth`, `config`, `middleware`, `utils`

## Examples

### Express.js Backend Integration

```javascript
const express = require('express');
const { Log, info, error } = require('./logging-middleware');

const app = express();

// Middleware logging
app.use(async (req, res, next) => {
  await info('backend', 'middleware', `${req.method} ${req.path} - Request received`);
  next();
});

// Route logging
app.get('/users', async (req, res) => {
  try {
    await info('backend', 'handler', 'Fetching users from database');
    // Your business logic here
    res.json({ users: [] });
  } catch (err) {
    await error('backend', 'handler', `Failed to fetch users: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Next.js Frontend Integration

```javascript
// pages/index.js
import { useEffect } from 'react';
import { Log, info, error } from '../logging-middleware';

export default function HomePage() {
  useEffect(() => {
    const loadPage = async () => {
      try {
        await info('frontend', 'page', 'Home page component mounted');
        // Your component logic here
      } catch (err) {
        await error('frontend', 'page', `Home page loading failed: ${err.message}`);
      }
    };
    
    loadPage();
  }, []);

  return <div>Welcome to the home page!</div>;
}
```

## Error Handling

The middleware includes comprehensive error handling:

- **Validation Errors**: Invalid parameters are caught and logged
- **Network Errors**: Automatic retry with exponential backoff
- **Authentication Errors**: Automatic token renewal
- **Graceful Degradation**: Application continues even if logging fails

## Testing

Run the example usage file to test the middleware:

```bash
npm test
```

This will execute various logging scenarios and validate the middleware functionality.

## Architecture

```
logging-middleware/
├── index.js              # Main entry point
├── lib/
│   ├── auth.js           # Authentication management
│   ├── logger.js         # Core logging functionality
│   └── validator.js      # Input validation
├── config/
│   ├── constants.js      # API configuration and constraints
│   └── credentials.json  # Generated authentication credentials
├── examples/
│   └── usage-examples.js # Usage examples and tests
└── register.js           # Registration script
```

## Best Practices

1. **Strategic Logging**: Log meaningful events, not every operation
2. **Descriptive Messages**: Use clear, actionable log messages
3. **Appropriate Levels**: Choose the right log level for each event
4. **Error Context**: Include relevant context in error messages
5. **Performance**: The middleware is designed to be non-blocking

## Security

- Credentials are stored securely in `config/credentials.json`
- Authentication tokens are managed automatically
- No sensitive data should be included in log messages

## License

MIT
