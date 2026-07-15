// Load environment variables FIRST
const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { Server } = require("socket.io");

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
const orderRoutes = require("./routes/orderRoutes");
// NEW: Import subscription routes
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const agencyRoutes = require('./routes/agencyRoutes');
const shipmentAnalyticsRoutes = require('./routes/shipmentAnalyticsRoutes');
const pricingRoutes = require("./routes/pricingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const path = require("path");

const mapsRoutes = require("./routes/mapsRoutes");

const logger = require("./utils/logger");

const app = express();
let server = null;

// CLIENT_URL can contain a comma-separated list of deployed frontend origins.
// In development, Vite may move from 5173 to another local port when 5173 is
// occupied, so allow local browser origins without weakening production CORS.
const allowedOrigins = new Set(
  (process.env.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

const isAllowedOrigin = (origin) => {
  if (!origin || allowedOrigins.has(origin)) return true;

  return (
    process.env.NODE_ENV !== "production" &&
    /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
  );
};

const shutdown = (signal) => {
  logger.info(`${signal} received — shutting down`);
  const finish = () => process.exit(0);

  if (!server) return finish();

  server.close(() => {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 0) return finish();
    mongoose.connection.close().then(finish).catch(finish);
  });

  // Force-exit if the port does not release (common on Windows + nodemon).
  setTimeout(finish, 2000).unref();
};

const http = require("http");

const listenOnPort = (port) =>
  new Promise((resolve, reject) => {
    const maxAttempts = process.env.NODE_ENV === 'production' ? 1 : 8;
    let attempt = 0;

    const tryListen = () => {
      attempt += 1;
      const srv = http.createServer(app);

      const io = new Server(srv, {
        cors: {
          origin: (process.env.CLIENT_URL || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          credentials: true,
        },
      });

      app.set("io", io);

      io.on("connection", (socket) => {
        logger.info(`Socket Connected: ${socket.id}`);

        socket.on("join-booking", (bookingId) => {
          socket.join(bookingId);
          logger.info(`${socket.id} joined booking ${bookingId}`);
        });

        socket.on("driver-location", (payload) => {
          io.to(payload.bookingId).emit("location-update", payload);
        });

        socket.on("booking-status", (payload) => {
          io.to(payload.bookingId).emit("status-update", payload);
        });

        socket.on("disconnect", () => {
          logger.info(`Socket Disconnected: ${socket.id}`);
        });
      });

      srv.once('error', (err) => {
        srv.close();
        if (err.code === 'EADDRINUSE' && attempt < maxAttempts) {
          logger.warn(`Port ${port} busy — retrying in 1s (${attempt}/${maxAttempts})`);
          setTimeout(tryListen, 1000).unref();
          return;
        }
        reject(err);
      });

      srv.listen(port, () => resolve(srv));
    };

    tryListen();
  });

const startServer = async () => {
  try {
    await connectDB();
    if (process.env.WHATSAPP_ENABLED === 'true') {
      initWhatsApp();
    } else {
      logger.info('WhatsApp client is disabled (set WHATSAPP_ENABLED=true to enable)');
    }

    const PORT = process.env.PORT || 5000;
    server = await listenOnPort(PORT);
    logger.info(`Server running on port ${PORT}`);
    console.log(`Server running on port ${PORT}`);
  } catch (err) {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${process.env.PORT || 5000} is still in use. Close other backend terminals and run npm run dev again.`);
      console.error(`Port ${process.env.PORT || 5000} is still in use. Close other backend terminals and run npm run dev again.`);
    } else {
      logger.error(`Startup failed: ${err.message}`);
      console.error(`Startup failed: ${err.message}`);
    }
    process.exit(1);
  }
};

// Middleware
app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error(`CORS origin not allowed: ${origin}`));
    },
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
app.use('/api/shipment-analytics', shipmentAnalyticsRoutes);
app.use("/api/pricing", pricingRoutes);
app.use("/api/maps", mapsRoutes);
app.use("/api/payments", paymentRoutes);
app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);


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

// nodemon sends SIGUSR2 on restart — release the port before the new process starts.
process.once('SIGUSR2', () => {
  if (!server) return process.kill(process.pid, 'SIGUSR2');
  server.close(() => {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 0) return process.kill(process.pid, 'SIGUSR2');
    mongoose.connection.close().finally(() => process.kill(process.pid, 'SIGUSR2'));
  });
});

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

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

import http from "http";
import app from "./app.js";
import { Server } from "socket.io";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

export const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});

io.on("connection", (socket) => {

    console.log("Socket Connected:", socket.id);

    socket.on("disconnect", () => {

        console.log("Socket Disconnected");

    });

});

server.listen(PORT, () => {

    console.log(`Server running on ${PORT}`);

});
