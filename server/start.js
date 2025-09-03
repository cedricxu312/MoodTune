#!/usr/bin/env node

/**
 * MoodTune Server Startup Script
 * Provides better error handling and startup information
 */

require('dotenv').config();

// Check required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'OPENAI_API_KEY',
  'SPOTIFY_CLIENT_ID',
  'SPOTIFY_CLIENT_SECRET',
  'REDIRECT_URI'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease check your .env file and ensure all required variables are set.');
  process.exit(1);
}

console.log('✅ Environment variables validated');

// Test database connection before starting server
async function testDatabase() {
  try {
    const db = require('./db');
    await db.query('SELECT NOW()');
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Please check your DATABASE_URL and ensure PostgreSQL is running.');
    process.exit(1);
  }
}

// Start the server
async function startServer() {
  try {
    // Test database first
    await testDatabase();
    
    // Import and start the server
    const app = require('./index');
    
    console.log('\n🎉 MoodTune server started successfully!');
    console.log('📚 API Documentation: Check the README.md file');
    console.log('🔍 Health Check: http://localhost:3001/health');
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();
