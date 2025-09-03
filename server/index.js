require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import configuration
const { SERVER_CONFIG } = require('./config/constants');

// Import middleware
const { authenticateToken } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const moodRoutes = require('./routes/mood');
const spotifyRoutes = require('./routes/spotify');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: SERVER_CONFIG.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

// Apply authentication middleware globally
app.use(authenticateToken);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    message: 'MoodTune API is running'
  });
});

// API Routes
app.use('/api', authRoutes);
app.use('/api', moodRoutes);
app.use('/', spotifyRoutes); // Spotify routes are at root level for OAuth

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  // Don't expose internal errors to client
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : error.message;
  
  res.status(500).json({ 
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// Start server
const PORT = SERVER_CONFIG.PORT;
app.listen(PORT, () => {
  console.log(`🚀 MoodTune server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
