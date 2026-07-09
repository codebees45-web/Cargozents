const mongoose = require('mongoose');
const dns = require('dns');
const logger = require('../utils/logger');

// Node's built-in DNS resolver sometimes fails to resolve Mongo Atlas SRV
// records on Windows/certain networks even though the OS resolver works fine.
// Forcing Node to use a public DNS server fixes this.
dns.setServers(['8.8.8.8', '1.1.1.1']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;