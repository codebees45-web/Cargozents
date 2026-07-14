require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { testConnection } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const genericRoutes = require('./routes/genericRoutes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'DB Wrapper Service is running' });
});
app.use('/api/auth', genericRoutes);
app.use('/api/shipments', genericRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 6000;

const startServer = async () => {
  await testConnection();
  app.listen(PORT, () => {
    console.log(`[SERVER] DB Wrapper Service running on port ${PORT}`);
  });
};

startServer();