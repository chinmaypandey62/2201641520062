const express = require('express');
const URLController = require('../controllers/urlController');
const { info } = require('../utils/logger');

const router = express.Router();

// Log route setup
info('backend', 'route', 'Setting up URL routes');

// POST /shorturls - Create short URL
router.post('/shorturls', URLController.createShortURL);

// GET /shorturls/:shortcode - Get URL statistics
router.get('/shorturls/:shortcode', URLController.getURLStatistics);

// GET /api/all - Get all URLs (for debugging)
router.get('/api/all', URLController.getAllURLs);

// GET /:shortcode - Handle redirection (this should be last)
router.get('/:shortcode', URLController.handleRedirection);

info('backend', 'route', 'URL routes configured successfully');

module.exports = router;
