# MoodTune Server

A clean, modular Node.js/Express server for the MoodTune application that generates personalized music playlists based on user moods using AI and Spotify integration.

## 🏗️ Architecture

The server follows a clean, modular architecture with clear separation of concerns:

```
server/
├── config/          # Configuration constants
├── middleware/      # Express middleware functions
├── routes/          # API route handlers
├── services/        # Business logic and external API integrations
├── db/             # Database connection and utilities
├── prompts.js      # AI prompt templates
└── index.js        # Main application entry point
```

## 🚀 Features

- **User Authentication**: JWT-based auth with bcrypt password hashing
- **Mood Processing**: AI-powered mood analysis using OpenAI GPT
- **Music Recommendations**: Intelligent song suggestions based on mood
- **Spotify Integration**: Seamless playlist creation and track management
- **Database Storage**: PostgreSQL for user data, moods, and track history
- **Modular Design**: Clean separation of concerns for maintainability

## 📋 Prerequisites

- Node.js 16+ 
- PostgreSQL database
- Environment variables configured (see `.env` setup below)

## 🔧 Environment Setup

Create a `.env` file in the server root with:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/moodtune

# JWT
JWT_SECRET=your-super-secret-jwt-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Spotify
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
REDIRECT_URI=http://localhost:3001/callback

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## 🗄️ Database Setup

Run these SQL commands to create the required tables:

```sql
-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create moods table
CREATE TABLE moods (
    id SERIAL PRIMARY KEY,
    mood VARCHAR(255) NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create tracks table
CREATE TABLE tracks (
    id SERIAL PRIMARY KEY,
    mood_id INTEGER REFERENCES moods(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    url TEXT
);
```

## 📦 Installation

```bash
# Install dependencies
npm install

# Test database connection
node test-db.js

# Start the server
npm start
```

## 🛣️ API Endpoints

### Authentication
- `POST /api/signup` - User registration
- `POST /api/login` - User authentication
- `GET /api/profile` - Get user profile (protected)
- `PUT /api/profile` - Update user profile (protected)
- `POST /api/change-password` - Change password (protected)

### Moods
- `POST /api/mood` - Process mood and get recommendations
- `GET /api/history` - Get user mood history (protected)
- `GET /api/mood/:id` - Get specific mood (protected)
- `DELETE /api/mood/:id` - Delete mood (protected)

### Spotify
- `GET /create-playlist` - Redirect to Spotify OAuth
- `GET /callback` - Handle OAuth callback
- `POST /api/store-playlist-data` - Store playlist data
- `GET /api/spotify-status` - Check Spotify service status

### Health
- `GET /health` - Server health check

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

Some endpoints allow anonymous access (like mood processing), while others require authentication.

## 🧠 AI Integration

The server uses OpenAI's GPT models for:
1. **Mood Analysis**: Uses **GPT-5-mini** for understanding and categorizing user moods
2. **Song Recommendations**: Uses **GPT-4o-mini** for generating relevant music suggestions
3. **Playlist Metadata**: Creating engaging playlist names and descriptions

## 🎵 Spotify Integration

- **Client Credentials Flow**: For server-to-server API calls (searching tracks)
- **Authorization Code Flow**: For user-specific operations (creating playlists)
- **Playlist Management**: Automatic creation and track addition

## 🏛️ Code Structure

### Services
- **`authService.js`**: User authentication and management
- **`moodService.js`**: Mood processing and database operations
- **`openaiService.js`**: AI integration and response parsing
- **`spotifyService.js`**: Spotify API interactions

### Middleware
- **`auth.js`**: JWT verification and authentication middleware

### Routes
- **`auth.js`**: Authentication endpoints
- **`mood.js`**: Mood-related endpoints
- **`spotify.js`**: Spotify integration endpoints

### Configuration
- **`constants.js`**: Centralized configuration values

## 🧪 Testing

```bash
# Test database connection
node test-db.js

# Test specific services
node testt.js
```

## 🚨 Error Handling

The server includes comprehensive error handling:
- Input validation
- Database error handling
- External API error handling
- Global error middleware
- Environment-aware error responses

## 🔄 Data Flow

1. **User Input**: User submits mood via `/api/mood`
2. **AI Processing**: OpenAI analyzes mood and generates recommendations
3. **Spotify Search**: Server searches for tracks on Spotify
4. **Database Storage**: Mood and tracks are saved to database
5. **Playlist Creation**: User can create Spotify playlist via OAuth flow
6. **History Tracking**: Authenticated users can view their mood history

## 🚀 Deployment

For production deployment:
1. Set `NODE_ENV=production`
2. Use environment-specific database URLs
3. Configure proper CORS origins
4. Set up SSL/TLS
5. Use process manager (PM2, Docker, etc.)

## 🤝 Contributing

1. Follow the modular architecture
2. Add proper error handling
3. Include JSDoc comments
4. Test thoroughly
5. Update this README

## 📄 License

This project is part of the MoodTune application.
