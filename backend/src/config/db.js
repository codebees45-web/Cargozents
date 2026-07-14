const mongoose = require('mongoose');
const dns = require('dns');
const logger = require('../utils/logger');

// Node's built-in DNS resolver sometimes fails to resolve Mongo Atlas SRV
// records on Windows/certain networks even though the OS resolver works fine.
// Forcing Node to use a public DNS server fixes this.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const MONGO_OPTIONS = {
  serverSelectionTimeoutMS: 60000,
  connectTimeoutMS: 60000,
  socketTimeoutMS: 45000,
  family: 4,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retries help on flaky Windows/Atlas connections during local dev.
const connectDB = async (retries = 3, delayMs = 4000) => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not set in environment');
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, MONGO_OPTIONS);
      logger.info(`MongoDB connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      logger.error(`MongoDB connection attempt ${attempt}/${retries} failed: ${err.message}`);
      if (attempt === retries) throw err;
      await sleep(delayMs);
    }
  }
};

module.exports = connectDB;
