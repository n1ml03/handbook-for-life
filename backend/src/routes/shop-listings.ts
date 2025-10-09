/**
 * Shop Listings Routes
 * Handles shop listing endpoints
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/middleware';
import logger from '../config/logger';

const router = Router();

/**
 * @swagger
 * /api/shop-listings:
 *   get:
 *     tags: [Shop Listings]
 *     summary: Get all shop listings
 *     description: Retrieve all shop listings with pagination
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Shop listings retrieved successfully
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/',
  asyncHandler(async (req, res) => {
    // Placeholder - implement when shop_listings table is ready
    logger.info('Shop listings endpoint called');
    
    res.success({
      message: 'Shop listings endpoint - not yet implemented',
      data: []
    });
  })
);

/**
 * @swagger
 * /api/shop-listings/{id}:
 *   get:
 *     tags: [Shop Listings]
 *     summary: Get shop listing by ID
 *     description: Retrieve a single shop listing by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Shop listing retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    logger.info(`Shop listing ${id} endpoint called`);
    
    res.success({
      message: 'Shop listing endpoint - not yet implemented',
      data: null
    });
  })
);

export default router;

