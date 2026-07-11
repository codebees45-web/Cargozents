// Load environment variables FIRST
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const { initWhatsApp } = require("./utils/whatsappClient");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const shipmentRoutes = require("./routes/shipmentRoutes");
const driverRoutes = require("./routes/driverRoutes");
const adminRoutes = require("./routes/adminRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
// NEW: Import subscription routes
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const agencyRoutes = require('./routes/agencyRoutes');
const truckRoutes = require('./routes/truckRoutes');

const logger = require("./utils/logger");

const app = express();
let server = null;

const startServer = async () => {
  try {
    await connectDB();
    initWhatsApp();

    const PORT = process.env.PORT || 5000;
    server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      console.log(`Server running on port ${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use. Please stop the existing process or use a different PORT.`);
        console.error(`Port ${PORT} is already in use. Please stop the existing process or use a different PORT.`);
      } else {
        logger.error(`Server error: ${err.message}`);
        console.error(`Server error: ${err.message}`);
      }
      process.exit(1);
    });
  } catch (err) {
    logger.error(`Startup failed: ${err.message}`);
    console.error(`Startup failed: ${err.message}`);
    process.exit(1);
  }
};

// Middleware
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: '15mb' }));

app.use(morgan("dev"));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CargoZent API is running",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/shipments", shipmentRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use('/api/agency', agencyRoutes);
app.use('/api/trucks', truckRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler
app.use(errorHandler);

startServer();

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled promise rejection: ${reason}`);
  console.error('Unhandled promise rejection:', reason);
  if (server && server.close) server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught exception: ${err.message}`);
  console.error('Uncaught exception:', err);
  if (server && server.close) server.close(() => process.exit(1));
});

module.exports = app;