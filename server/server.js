import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import volunteerRoutes from './routes/volunteerRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or dev origins
      callback(null, true);
    },
    credentials: true
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Readiness Check Middleware for API routes
app.use((req, res, next) => {
  // If requesting API and DB is disconnected (readyState !== 1), fail fast with friendly message
  if (req.path.startsWith('/api/') && req.path !== '/api/health' && mongoose.connection.readyState !== 1) {
    console.warn(`[DB Middleware Warning] Request to ${req.path} rejected because DB readyState is ${mongoose.connection.readyState}`);
    return res.status(503).json({
      success: false,
      message: 'Database service is currently unavailable. Please try again shortly.'
    });
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    dbConnected: mongoose.connection.readyState === 1,
    app: 'No Food Waste Connect API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/assignments', assignmentRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route Not Found - ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Server Error]', err);
  
  // Never leak raw backend / database errors in HTTP response
  const statusCode = err.status || err.statusCode || 500;
  const userMessage = statusCode === 500
    ? 'An unexpected error occurred on the server. Please try again later.'
    : (err.message || 'Request failed.');

  res.status(statusCode).json({
    success: false,
    message: userMessage
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[Server] No Food Waste Connect running on port ${PORT} (ES Modules)`);
});

export default app;
