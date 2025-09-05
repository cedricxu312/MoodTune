const { Pool } = require('pg');
require('dotenv').config();

// Enhanced connection pool configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  // Connection pool settings
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
});

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Handle pool connection events
pool.on('connect', (client) => {
  console.log('🔌 New database client connected');
});

pool.on('remove', (client) => {
  console.log('🔌 Database client removed from pool');
});

module.exports = {
  query: async (text, params, retries = 3) => {
    let client;
    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        client = await pool.connect();
        const res = await client.query(text, params);
        return res;
      } catch (error) {
        lastError = error;
        console.error(`Database query attempt ${attempt} failed:`, error.message);
        
        // If it's a connection error and we have retries left, wait and retry
        if (attempt < retries && (
          error.code === 'ECONNRESET' || 
          error.code === 'ENOTFOUND' || 
          error.message.includes('Connection terminated') ||
          error.message.includes('Connection lost')
        )) {
          console.log(`Retrying database query in ${attempt * 1000}ms...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          continue;
        }
        
        // If we're out of retries or it's not a connection error, throw
        throw error;
      } finally {
        if (client) {
          client.release(); // Ensure connection is released
        }
      }
    }
    
    // If we get here, all retries failed
    throw lastError;
  },

  // Test database connectivity
  testConnection: async () => {
    try {
      const client = await pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error.message);
      return false;
    }
  },

  // Get pool status
  getPoolStatus: () => {
    return {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount
    };
  },

  // Close all connections (useful for graceful shutdown)
  close: async () => {
    await pool.end();
  }
};
