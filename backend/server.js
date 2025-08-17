// backend/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const connectDB = require('./config/db'); // your Mongo connection helper

const app = express();

const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

/* -------------------------------------------
   CORS (allow specific origins incl. EC2 IP)
-------------------------------------------- */
const ALLOWED_ORIGINS = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://192.168.0.134:3000',

  // EC2 Public IP (frontend, direct API, and optional http/https)
  'http://3.107.84.70',
  'http://3.107.84.70:3000',
  'http://3.107.84.70:5001',
  'https://3.107.84.70',
]);

const corsOptions = {
  origin(origin, cb) {
    // Allow non-browser clients (curl/Postman) or same-origin requests
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.has(origin)) return cb(null, true);

    // For assignment/demo, you may relax in non-production:
    if (NODE_ENV !== 'production') return cb(null, true);

    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/* -------------------------------------------
   Parsers
-------------------------------------------- */
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

/* -------------------------------------------
   Lazy route loader (keeps app running even if
   some route modules are missing)
-------------------------------------------- */
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

/* -------------------------------------------
   Routes (mount both short and /api/* paths
   where useful to avoid FE path mismatch)
-------------------------------------------- */
const historyRoutes = tryRequire('./routes/historyRoutes');
const appointmentRoutes = tryRequire('./routes/appointmentRoutes');
const ownerRoutes = tryRequire('./routes/ownerRoutes');
const petRoutes = tryRequire('./routes/petRoutes');
const authRoutes = tryRequire('./routes/authRoutes');
const taskRoutes = tryRequire('./routes/taskRoutes');

// History
if (historyRoutes) {
  app.use('/history', historyRoutes);
  app.use('/api/history', historyRoutes);
  console.log('[route] /history & /api/history mounted');
}

// Appointments
if (appointmentRoutes) {
  app.use('/appointments', appointmentRoutes);
  app.use('/api/appointments', appointmentRoutes);
  console.log('[route] /appointments & /api/appointments mounted');
}

// Owners
if (ownerRoutes) {
  app.use('/owners', ownerRoutes);
  app.use('/api/owners', ownerRoutes);
  console.log('[route] /owners & /api/owners mounted');
}

// Pets
if (petRoutes) {
  app.use('/pets', petRoutes);
  app.use('/api/pets', petRoutes);
  console.log('[route] /pets & /api/pets mounted');
}

// Auth
if (authRoutes) {
  app.use('/auth', authRoutes);
  app.use('/api/auth', authRoutes);
  console.log('[route] /auth & /api/auth mounted');
}

// Tasks
if (taskRoutes) {
  app.use('/tasks', taskRoutes);
  app.use('/api/tasks', taskRoutes);
  console.log('[route] /tasks & /api/tasks mounted');
}

/* -------------------------------------------
   Health checks / root
-------------------------------------------- */
app.get('/', (_req, res) => {
  res.send('Backend is running on EC2 with PM2 🚀');
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: NODE_ENV });
});

/* -------------------------------------------
   Start server (bind 0.0.0.0 for external access)
-------------------------------------------- */
async function start() {
  try {
    if (NODE_ENV !== 'test') {
      await connectDB();
      console.log('[db] MongoDB connected');
    } else {
      console.log('[db] test mode: skipping DB connect');
    }

    if (NODE_ENV !== 'test') {
      const server = app.listen(PORT, '0.0.0.0', () =>
        console.log(`[http] Listening on 0.0.0.0:${PORT} (${NODE_ENV})`)
      );

      // Graceful shutdown
      mongoose.connection.on('error', (err) => {
        console.error('[db] error:', err);
      });
      process.on('SIGINT', () => {
        mongoose.connection.close(() => {
          console.log('[db] connection closed');
          server.close(() => process.exit(0));
        });
      });
    }
  } catch (err) {
    console.error('[start] fatal:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
