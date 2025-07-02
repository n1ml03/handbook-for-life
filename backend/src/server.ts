import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { config } from 'dotenv';
import { Server } from 'http';

// Load environment variables
config();

import logger  from './config/logger';
import { testConnection, closeDatabase } from './config/database';
import { errorHandler, notFound } from './middleware/errorHandler';
import { responseFormatter } from './middleware/responseFormatter';
import { responseValidator } from './middleware/responseValidator';
import { swaggerUi, specs } from './config/swagger';
import { CacheService } from './services/CacheService';
import {
  rateLimits,
  sanitizeInput,
  securityHeaders,
  validateRequest,
  securityLogger,
  corsOptions
} from './middleware/security';

// Import routes
import healthRoutes from '@routes/health';
import charactersRoutes from '@routes/characters';
import skillsRoutes from '@routes/skills';
import swimsuitsRoutes from '@routes/swimsuits';
import itemsRoutes from '@routes/items';
import episodesRoutes from '@routes/episodes';
import documentsRoutes from '@routes/documents';
import updateLogsRoutes from '@routes/update-logs';
import eventsRoutes from '@routes/events';
import bromidesRoutes from '@routes/bromides';
import gachasRoutes from '@routes/gachas';
import shopListingsRoutes from '@routes/shop-listings';
import uploadRoutes from '@routes/upload';
import imageRoutes from '@routes/images';
import dashboardRoutes from '@routes/dashboard';

const app = express();
const PORT = process.env.PORT || 3001;

// Compression middleware - enable gzip compression for JSON responses
app.use(compression({
  filter: (req, res) => {
    // Only compress JSON responses for API endpoints
    if (req.headers['x-no-compression']) {
      return false;
    }

    // Compress JSON responses and API endpoints
    const contentType = res.getHeader('content-type');
    if (contentType && contentType.toString().includes('application/json')) {
      return true;
    }

    // Compress API routes
    if (req.url.startsWith('/api/')) {
      return true;
    }

    return compression.filter(req, res);
  },
  level: 6, // Good balance between compression ratio and speed
  threshold: 1024, // Only compress responses larger than 1KB
}));

// Response formatting middleware (must be early to provide res.error, res.success, etc.)
app.use(responseFormatter);

// Security headers
app.use(securityHeaders);

// Security logging
app.use(securityLogger);

// Request validation and sanitization
app.use(validateRequest);
app.use(sanitizeInput);

// CORS configuration with security options
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(responseValidator({
  enforceStandardFormat: process.env.NODE_ENV === 'development',
  logResponses: process.env.NODE_ENV === 'development',
  validateStatusCodes: true,
  requireTimestamp: true,
  requireSuccessField: true
}));

// Static file serving removed - images now served directly from database via /api/images endpoints

// Request ID middleware for tracking
app.use((req: any, res, next) => {
  req.id = Math.random().toString(36).substring(2, 11);
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Swagger UI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'DOAXVV Handbook API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 1,
    defaultModelRendering: 'example',
    displayOperationId: false,
    tryItOutEnabled: true
  }
}));

// OpenAPI spec endpoint
app.get('/api-docs.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json(specs);
});

// API routes (health check has no additional rate limiting)
app.use('/api/health', healthRoutes);

// Authentication routes removed for local development

// API routes with appropriate rate limiting
app.use('/api/health', healthRoutes);
app.use('/api/characters', rateLimits.general, charactersRoutes);
app.use('/api/skills', rateLimits.general, skillsRoutes);
app.use('/api/swimsuits', rateLimits.general, swimsuitsRoutes);
app.use('/api/items', rateLimits.general, itemsRoutes);
app.use('/api/episodes', rateLimits.general, episodesRoutes);
app.use('/api/events', rateLimits.general, eventsRoutes);
app.use('/api/bromides', rateLimits.general, bromidesRoutes);
app.use('/api/gachas', rateLimits.general, gachasRoutes);
app.use('/api/shop-listings', rateLimits.general, shopListingsRoutes);
app.use('/api/documents', rateLimits.mutations, documentsRoutes);
app.use('/api/update-logs', rateLimits.general, updateLogsRoutes);
app.use('/api/upload', rateLimits.uploads, uploadRoutes);
app.use('/api/images', rateLimits.general, imageRoutes);
app.use('/api/dashboard', rateLimits.general, dashboardRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.success({
    message: 'DOAXVV Handbook API Server',
    version: '2.0.0',
    documentation: '/api-docs',
    endpoints: {
      health: '/api/health',
      characters: '/api/characters',
      skills: '/api/skills',
      swimsuits: '/api/swimsuits',
      items: '/api/items',
      episodes: '/api/episodes',
      documents: '/api/documents',
      updateLogs: '/api/update-logs',
      events: '/api/events',
      bromides: '/api/bromides',
      gachas: '/api/gachas',
      shopListings: '/api/shop-listings',
      upload: '/api/upload',
      images: '/api/images',
      dashboard: '/api/dashboard'
    }
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Server instance (will be set after starting)
let server: Server;

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      
      try {
        await closeDatabase();
        logger.info('Database connection closed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30000);
  } else {
    process.exit(0);
  }
};

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      logger.error('Failed to connect to database. Exiting...');
      process.exit(1);
    }

    // Initialize cache service
    CacheService.initialize();

    server = app.listen(PORT, () => {
      logger.info(`\n🚀 DOAXVV Handbook API Server Started\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🌍 Server running on: http://localhost:${PORT}\n📊 Health check: http://localhost:${PORT}/api/health\n📚 API Documentation: http://localhost:${PORT}/api-docs\n🗃️  Database: Connected to MySQL\n📝 Logging: Console output\n⚡ Environment: ${process.env.NODE_ENV || 'development'}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n      `);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;