/**
 * Shop Listings Routes
 * Handles shop listing endpoints
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/middleware';
import logger from '../config/logger';

const router = Router();

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

