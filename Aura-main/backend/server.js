require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const seedInitialData = require('./config/seed');
const getCorsMiddleware = require('./middleware/cors');
const { errorHandler } = require('./middleware/errorHandler');
const initScheduler = require('./utils/scheduler');

// Routes
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const recurringRoutes = require('./routes/recurringRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(getCorsMiddleware());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root healthcheck
app.get('/', (req, res) => {
  res.json({
    status: 'UP',
    message: 'AURA Finance API (Node.js/Express) is operational',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/recurring-transactions', recurringRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use(errorHandler);

// Start Server
async function startServer() {
  await connectDB();
  await seedInitialData();
  initScheduler();

  const server = app.listen(PORT, () => {
    console.log(`[Server] AURA REST API listening on port ${PORT}`);
  });

  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
