// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

/* -----------------------------
   CORS & body parser (MUST come before any routes)
-------------------------------- */
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://192.168.0.134:3000', // add your LAN IP if you open from another device
];

const corsOptions = {
  origin: function (origin, cb) {
    // Allow curl/Postman or same-origin (no Origin header)
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    // Block unknown origins in dev (returning false means CORS will fail)
    return cb(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

/* -----------------------------
   Lazy route loader
-------------------------------- */
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

/* -----------------------------
   Routes
-------------------------------- */
const historyRoutes = require('./routes/historyRoutes');

const appointmentRoutes = tryRequire('./routes/appointmentRoutes');
const ownerRoutes = tryRequire('./routes/ownerRoutes');
const petRoutes = tryRequire('./routes/petRoutes');
const authRoutes = tryRequire('./routes/authRoutes');
const taskRoutes = tryRequire('./routes/taskRoutes');

// History routes (both paths to avoid FE mismatch)
app.use('/history', historyRoutes);
app.use('/api/history', historyRoutes);

if (appointmentRoutes) {
  app.use('/appointments', appointmentRoutes);
  console.log('[route] /appointments mounted');
}

if (ownerRoutes) {
  app.use('/owners', ownerRoutes);
  console.log('[route] /owners mounted');
}

if (petRoutes) {
  app.use('/pets', petRoutes);
  console.log('[route] /pets mounted');
}

if (authRoutes) {
  app.use('/auth', authRoutes);
  app.use('/api/auth', authRoutes);
  console.log('[route] /api/auth & /auth mounted');
}

if (taskRoutes) {
  app.use('/tasks', taskRoutes);
  app.use('/api/tasks', taskRoutes);
  console.log('[route] /api/tasks & /tasks mounted');
}

// Health check
app.get('/', (_req, res) => {
  res.send('API is running');
});

/* -----------------------------
   Start server
-------------------------------- */
const PORT = process.env.PORT || 5001;
const isTest = process.env.NODE_ENV === 'test';

async function start() {
  try {
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
