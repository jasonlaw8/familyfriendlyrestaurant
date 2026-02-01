/**
 * Bay Area Family Eats - Backend API Server
 * Main entry point for the Express application
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import routes
import restaurantsRouter from './routes/restaurants.js';
import reviewsRouter from './routes/reviews.js';
import filtersRouter from './routes/filters.js';
import contactRouter from './routes/contact.js';
import statsRouter from './routes/stats.js';

// Import database connection
import { getDatabase, closeDatabase } from './db/connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for development
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory
app.use(express.static(join(__dirname, '..')));

// API Routes
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/filters', filtersRouter);
app.use('/api/contact', contactRouter);
app.use('/api/stats', statsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  try {
    const db = getDatabase();
    const result = db.prepare('SELECT 1 as ok').get();
    res.json({
      status: 'healthy',
      database: result.ok === 1 ? 'connected' : 'error',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '..', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down gracefully...');
  closeDatabase();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🍽️  Bay Area Family Eats API Server                     ║
║                                                           ║
║   Server running at: http://localhost:${PORT}               ║
║                                                           ║
║   API Endpoints:                                          ║
║   • GET  /api/restaurants      - List restaurants         ║
║   • GET  /api/restaurants/:slug - Get restaurant details  ║
║   • GET  /api/restaurants/featured - Featured restaurants ║
║   • GET  /api/reviews          - List reviews             ║
║   • POST /api/reviews          - Submit a review          ║
║   • GET  /api/filters          - Get filter options       ║
║   • POST /api/contact          - Submit contact form      ║
║   • POST /api/contact/newsletter/subscribe                ║
║   • GET  /api/stats            - Get statistics           ║
║   • GET  /api/health           - Health check             ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
