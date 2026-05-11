const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Load environment
require('dotenv').config();
const config = require('./config/env');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const orgRoutes = require('./routes/organizations');
const announcementRoutes = require('./routes/announcements');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');
const aiRoutes = require('./routes/ai');
const enrollmentRoutes = require('./routes/enrollments');

// Import cron jobs
const startExpiryJob = require('./jobs/expiryJob');
const startSchedulerJob = require('./jobs/schedulerJob');

const app = express();
const allowedOrigins = config.clientUrl.split(',').map((origin) => origin.trim());

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api/auth', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/org', orgRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/enrollments', enrollmentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = config.port;

const start = async () => {
  await connectDB();

  // Start cron jobs
  startExpiryJob();
  startSchedulerJob();

  app.listen(PORT, () => {
    console.log(`\n🚀 AnnounceHub API running on port ${PORT}`);
    console.log(`📍 Environment: ${config.nodeEnv}`);
    console.log(`🔗 http://localhost:${PORT}/api/health\n`);
  });
};

start();
