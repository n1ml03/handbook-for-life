import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { serviceRegistry } from '../services/index';
import { testConnection } from '../config/database';
import logger from '../config/logger';

const router = Router();

// GET /api/health - Health check endpoint
router.get('/',
  asyncHandler(async (req, res, next) => {
    const startTime = Date.now();

    // Check database connectivity
    const dbConnected = await testConnection();

    // Check all services
    const servicesHealth = await serviceRegistry.performHealthCheck();

    const responseTime = Date.now() - startTime;
    const isSystemHealthy = dbConnected && servicesHealth.isHealthy;

    const healthStatus = {
      status: isSystemHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: dbConnected ? 'connected' : 'disconnected'
      },
      services: servicesHealth.services,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
        external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100
      }
    };

    if (!isSystemHealthy) {
      const allErrors = servicesHealth.services.flatMap(s => s.errors);
      logger.warn('Health check failed', { errors: allErrors, dbConnected });
      res.status(503).json({
        success: false,
        ...healthStatus
      });
      return;
    }

    logger.info('Health check successful', { responseTime });

    res.json({
      success: true,
      ...healthStatus
    });
  })
);

export default router; 