import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import donorRoutes from './routes/donor.routes.js';
import requestRoutes from './routes/request.routes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Server logger - spying on incoming requests
app.use((req, res, next) => {
  console.log(`[HTTP Request] ${req.method} ${req.originalUrl}`);
  next();
});

// Single routes per particular file
app.use('/api/donors', donorRoutes);
app.use('/api/requests', requestRoutes);

// Optional v1 aliases for convenience
app.use('/api/v1/donors', donorRoutes);
app.use('/api/v1/requests', requestRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', server: 'BloodLink Backend' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error Handler]', err.message);
  res.status(500).json({
    success: false,
    message: err.message || 'Database error occurred'
  });
});

export default app;
