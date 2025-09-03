// Configuration constants for the MoodTune application

// Spotify API Configuration
const SPOTIFY_CONFIG = {
  CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  REDIRECT_URI: process.env.REDIRECT_URI,
  SCOPES: [
    'playlist-modify-private',
    'playlist-modify-public',
    'user-read-private',
    'user-read-email'
  ]
};

// JWT Configuration
const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET,
  EXPIRES_IN: '7d'
};

// OpenAI Configuration
const OPENAI_CONFIG = {
  API_KEY: process.env.OPENAI_API_KEY,
  MOOD_ANALYSIS_MODEL: 'gpt-5-mini',
  SONG_RECOMMENDATIONS_MODEL: 'gpt-4o-mini'
};

// Server Configuration
const SERVER_CONFIG = {
  PORT: process.env.PORT || 3001,
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};

// Database Configuration
const DB_CONFIG = {
  CONNECTION_STRING: process.env.DATABASE_URL,
  SSL: { rejectUnauthorized: false }
};

module.exports = {
  SPOTIFY_CONFIG,
  JWT_CONFIG,
  OPENAI_CONFIG,
  SERVER_CONFIG,
  DB_CONFIG
};
