// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

dotenv.config();

const app = express(); //

// --- Global middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/appointments', require('./routes/appointmentRoutes'));
app.use('/pets', require('./routes/petRoutes'));
app.use('/owners', require('./routes/ownerRoutes'));

// (optional) health check
app.get('/', (req, res) => {
  res.send('Backend server is running 🚀');
});
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// --- Fix Mongoose deprecation ---
mongoose.set('strictQuery', false);

// --- Start server only when run directly ---
if (require.main === module) {
  const PORT = process.env.PORT || 5001;

  connectDB()
    .then(() => {
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error('Failed to connect to MongoDB:', err);
      process.exit(1);
    });

  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
}

// Export the app object for testing
module.exports = app;
