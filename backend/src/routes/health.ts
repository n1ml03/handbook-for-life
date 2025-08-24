import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { serviceRegistry } from '../services/index';
import { testConnection } from '../config/database';
import logger from '../config/logger';

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Get system health status
 *     description: Returns the current health status of the API server, database, and services
 *     responses:
 *       200:
 *         description: Health check successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/HealthCheck'
 *       503:
 *         description: System is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiError'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/HealthCheck'
 */
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
      version: process.env.BUN_PACKAGE_VERSION || '1.0.0',
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

    res.success(healthStatus);
  })
);

/**
 * @swagger
 * /api/health/stats:
 *   get:
 *     tags: [Health]
 *     summary: Get system statistics
 *     description: Returns detailed statistics about all entities in the system
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Success'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/stats',
  asyncHandler(async (req, res) => {
    try {
      // Mock statistics data for now - can be enhanced with real data later
      const stats = {
        characters: {
          total: 100,
          active: 95,
          inactive: 5,
          recentlyAdded: 3,
          recentlyUpdated: 8
        },
        swimsuits: {
          total: 450,
          byRarity: {
            'SSR+': 25,
            'SSR': 80,
            'SR': 150,
            'R': 120,
            'N': 75
          },
          recentlyAdded: 5,
          recentlyUpdated: 12
        },
        skills: {
          total: 200,
          byCategory: {
            'ACTIVE': 80,
            'PASSIVE': 90,
            'POTENTIAL': 30
          },
          recentlyAdded: 2,
          recentlyUpdated: 7
        },
        items: {
          total: 300,
          byCategory: {
            'CURRENCY': 15,
            'UPGRADE_MATERIAL': 120,
            'CONSUMABLE': 80,
            'GIFT': 45,
            'ACCESSORY': 25,
            'FURNITURE': 10,
            'SPECIAL': 5
          },
          recentlyAdded: 4,
          recentlyUpdated: 9
        },
        bromides: {
          total: 180,
          byType: {
            'DECO': 120,
            'OWNER': 60
          },
          byRarity: {
            'SSR': 40,
            'SR': 80,
            'R': 60
          },
          recentlyAdded: 3,
          recentlyUpdated: 6
        },
        events: {
          total: 50,
          active: 3,
          upcoming: 5,
          ended: 42,
          byType: {
            'FESTIVAL_RANKING': 15,
            'FESTIVAL_CUMULATIVE': 12,
            'TOWER': 8,
            'ROCK_CLIMBING': 6,
            'BUTT_BATTLE': 4,
            'LOGIN_BONUS': 3,
            'STORY': 2
          },
          recentlyAdded: 1,
          recentlyUpdated: 3
        },
        gachas: {
          total: 75,
          active: 2,
          upcoming: 3,
          ended: 70,
          bySubtype: {
            'TRENDY': 20,
            'NOSTALGIC': 15,
            'BIRTHDAY': 12,
            'ANNIVERSARY': 8,
            'PAID': 10,
            'FREE': 6,
            'ETC': 4
          },
          recentlyAdded: 1,
          recentlyUpdated: 2
        },
        episodes: {
          total: 250,
          byType: {
            'MAIN': 50,
            'CHARACTER': 120,
            'EVENT': 40,
            'SWIMSUIT': 30,
            'ITEM': 10
          },
          recentlyAdded: 2,
          recentlyUpdated: 5
        },
        documents: {
          total: 35,
          recentlyAdded: 1,
          recentlyUpdated: 4
        },
        updateLogs: {
          total: 25,
          published: 22,
          draft: 3,
          recentlyAdded: 1,
          recentlyUpdated: 2
        },
        lastUpdated: new Date()
      };

      logger.info('Retrieved system statistics');

      res.success(stats);
    } catch (error) {
      logger.error('Failed to retrieve system statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve system statistics'
      });
    }
  })
);

export default router; 