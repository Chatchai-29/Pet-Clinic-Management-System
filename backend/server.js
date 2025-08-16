// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// --- Global middleware (keep existing) ---
app.use(cors());
app.use(express.json());

// --- Helper: safely require optional route modules ---
function tryRequire(modulePath) {
  try {
    return require(modulePath);
  } catch (err) {
    if (err && err.code === 'MODULE_NOT_FOUND') {
      console.warn(`[warn] Route module not found: ${modulePath} (skipped)`);
      return null;
    }
    throw err;
  }
}

// --- Mount business routes (keep your originals) ---
const appointmentRoutes = tryRequire('./routes/appointmentRoutes');
if (appointmentRoutes) {
  app.use('/appointments', appointmentRoutes);
  console.log('[route] /appointments mounted');
}

const ownerRoutes = tryRequire('./routes/ownerRoutes');
if (ownerRoutes) {
  app.use('/owners', ownerRoutes);
  console.log('[route] /owners mounted');
}

const petRoutes = tryRequire('./routes/petRoutes');
if (petRoutes) {
  app.use('/pets', petRoutes);
  console.log('[route] /pets mounted');
}

const authRoutes = tryRequire('./routes/authRoutes');
if (authRoutes) {
  app.use('/api/auth', authRoutes);
  app.use('/auth', authRoutes);
  console.log('[route] /api/auth & /auth mounted');
}

const taskRoutes = tryRequire('./routes/taskRoutes');
if (taskRoutes) {
  app.use('/api/tasks', taskRoutes);
  app.use('/tasks', taskRoutes);
  console.log('[route] /api/tasks & /tasks mounted');
}

// --- Health check ---
app.get('/', (_req, res) => {
  res.send('API is running');
});

// --- DB connect + server start ---
const PORT = process.env.PORT || 5001;
const isTest = process.env.NODE_ENV === 'test';

async function start() {
  try {
    // Skip DB connection entirely when running tests (CI)
    if (!isTest) {
      await connectDB();
      console.log('MongoDB connected successfully');
    } else {
      console.log('Test mode: skip DB connection & listening');
    }

    if (!isTest) {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    }

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    process.on('SIGINT', () => {
      mongoose.connection.close(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
