'use client';

import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Link,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ContentCopy,
  Launch,
  Analytics,
  Timeline
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import URLShortenerService from '../services/urlShortenerService';
import { URLStatistics } from '../types/url';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
  },
});

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customShortcode, setCustomShortcode] = useState('');
  const [validityMinutes, setValidityMinutes] = useState('30');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statistics, setStatistics] = useState<URLStatistics | null>(null);
  const [showStats, setShowStats] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setStatistics(null);

    try {
      const response = await URLShortenerService.createShortURL({
        originalUrl,
        customShortcode: customShortcode || undefined,
        validityMinutes: parseInt(validityMinutes) || 30
      });

      if (response.success) {
        setShortUrl(response.data.shortLink);
        setSuccess('URL shortened successfully!');
        
        // Clear form
        setOriginalUrl('');
        setCustomShortcode('');
        setValidityMinutes('30');
      } else {
        setError(response.error || 'Failed to create short URL');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGetStatistics = async () => {
    if (!shortUrl) return;
    
    setLoading(true);
    setError('');

    try {
      const shortcode = shortUrl.split('/').pop();
      if (!shortcode) {
        setError('Invalid short URL');
        return;
      }

      const response = await URLShortenerService.getStatistics(shortcode);
      
      if (response.success) {
        setStatistics(response.data);
        setShowStats(true);
      } else {
        setError(response.error || 'Failed to get statistics');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to get statistics');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setSuccess('Short URL copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setError('Failed to copy to clipboard');
    }
  };

  const openInNewTab = () => {
    window.open(shortUrl, '_blank');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
            URL Shortener
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Create short, shareable links with custom shortcodes and expiry times
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Original URL"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://example.com/very-long-url"
                required
                type="url"
                variant="outlined"
              />
              
              <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <TextField
                  fullWidth
                  label="Custom Shortcode (Optional)"
                  value={customShortcode}
                  onChange={(e) => setCustomShortcode(e.target.value)}
                  placeholder="my-custom-code"
                  variant="outlined"
                  helperText="Leave empty for auto-generated"
                />
                
                <TextField
                  fullWidth
                  label="Validity (Minutes)"
                  value={validityMinutes}
                  onChange={(e) => setValidityMinutes(e.target.value)}
                  type="number"
                  variant="outlined"
                  slotProps={{ 
                    htmlInput: { min: 1, max: 10080 }
                  }}
                  helperText="1-10080 minutes (7 days max)"
                />
              </Box>
              
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading || !originalUrl}
                sx={{ py: 1.5 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Shorten URL'}
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {shortUrl && (
            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Shortened URL:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Link
                    href={shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ flexGrow: 1, wordBreak: 'break-all' }}
                  >
                    {shortUrl}
                  </Link>
                  <Tooltip title="Copy to clipboard">
                    <IconButton onClick={copyToClipboard} color="primary">
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Open in new tab">
                    <IconButton onClick={openInNewTab} color="primary">
                      <Launch />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View statistics">
                    <IconButton onClick={handleGetStatistics} color="primary">
                      <Analytics />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          )}

          {showStats && statistics && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Timeline />
                  URL Statistics
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 100px', textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {statistics.clickCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Clicks
                    </Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 100px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Chip
                      label={statistics.isActive ? 'Active' : 'Expired'}
                      color={statistics.isActive ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </Box>
                  <Box sx={{ flex: '2 1 200px' }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Created:</strong> {new Date(statistics.createdAt).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Expires:</strong> {new Date(statistics.expiresAt).toLocaleString()}
                    </Typography>
                    {statistics.lastClickAt && (
                      <Typography variant="body2" color="text.secondary">
                        <strong>Last Click:</strong> {new Date(statistics.lastClickAt).toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </Paper>

        <Paper elevation={1} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Features:
          </Typography>
          <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
            <li>Create custom shortcodes or use auto-generated ones</li>
            <li>Set custom expiry times (1 minute to 7 days)</li>
            <li>Real-time click tracking and analytics</li>
            <li>Copy to clipboard with one click</li>
            <li>Secure and validated URL processing</li>
          </Typography>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}
