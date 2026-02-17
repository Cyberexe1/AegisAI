/**
 * MongoDB Connection Pool Manager
 * 
 * Provides singleton database connection with connection pooling
 * to prevent connection exhaustion and improve performance.
 */

const { MongoClient } = require('mongodb');

let client = null;
let db = null;

/**
 * Get database connection (creates pool on first call)
 * @returns {Promise<Db>} MongoDB database instance
 */
async function getDatabase() {
  if (!db) {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
      const dbName = process.env.MONGODB_DATABASE || 'credit_risk_db';

      client = new MongoClient(uri, {
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await client.connect();
      db = client.db(dbName);
      
      console.log(`✓ MongoDB connected: ${dbName}`);
    } catch (error) {
      console.error('MongoDB connection error:', error);
      throw error;
    }
  }
  
  return db;
}

/**
 * Close database connection gracefully
 */
async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('✓ MongoDB connection closed');
  }
}

/**
 * Check if database is connected
 * @returns {boolean}
 */
function isConnected() {
  return db !== null && client !== null;
}

module.exports = {
  getDatabase,
  closeDatabase,
  isConnected
};
