import { Router } from 'express';
import { validate, validateQuery, schemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { GachaService } from '../services/GachaService';
import logger from '../config/logger';

const router = Router();
const gachaService = new GachaService();

// GET /api/gachas - Get all gachas with pagination
router.get('/', 
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;
    
    const result = await gachaService.getAllGachas({
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Retrieved ${result.data.length} gachas for page ${page}`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/gachas/active - Get currently active gachas
router.get('/active',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;
    
    const result = await gachaService.getActiveGachas({
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Retrieved ${result.data.length} active gachas`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/gachas/subtype/:subtype - Get gachas by subtype
router.get('/subtype/:subtype',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { subtype } = req.params;
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;
    
    const result = await gachaService.getGachasBySubtype(subtype as any, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Retrieved ${result.data.length} gachas for subtype ${subtype}`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/gachas/key/:unique_key - Get gacha by unique key
router.get('/key/:unique_key',
  asyncHandler(async (req, res) => {
    const { unique_key } = req.params;
    
    const gacha = await gachaService.getGachaByUniqueKey(unique_key);
    
    logger.info(`Retrieved gacha: ${gacha.name_en}`);

    res.json({
      success: true,
      data: gacha
    });
  })
);

// GET /api/gachas/search - Search gachas
router.get('/search',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 10, sortBy, sortOrder } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const result = await gachaService.searchGachas(q as string, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Search for "${q}" returned ${result.data.length} gachas`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/gachas/:id - Get gacha by ID
router.get('/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid gacha ID'
      });
    }
    
    const gacha = await gachaService.getGachaById(id);
    
    logger.info(`Retrieved gacha: ${gacha.name_en}`);

    res.json({
      success: true,
      data: gacha
    });
  })
);

// GET /api/gachas/:id/pool - Get gacha pool items
router.get('/:id/pool',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid gacha ID'
      });
    }
    
    const result = await gachaService.getGachaPool(id, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Retrieved ${result.data.length} pool items for gacha ${id}`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/gachas/:id/featured - Get featured items in gacha
router.get('/:id/featured',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid gacha ID'
      });
    }
    
    const result = await gachaService.getFeaturedItems(id, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Retrieved ${result.data.length} featured items for gacha ${id}`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/gachas/:id/statistics - Get gacha statistics
router.get('/:id/statistics',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid gacha ID'
      });
    }
    
    const statistics = await gachaService.getGachaStatistics(id);

    logger.info(`Retrieved statistics for gacha ${id}`);

    res.json({
      success: true,
      data: statistics
    });
  })
);

// POST /api/gachas - Create new gacha
router.post('/',
  // validate(schemas.createGacha), // TODO: Add validation schema
  asyncHandler(async (req, res) => {
    const gacha = await gachaService.createGacha(req.body);
    
    logger.info(`Created gacha: ${gacha.name_en}`);

    res.status(201).json({
      success: true,
      data: gacha,
      message: 'Gacha created successfully'
    });
  })
);

// POST /api/gachas/:id/pool - Add item to gacha pool
router.post('/:id/pool',
  // validate(schemas.createGachaPool), // TODO: Add validation schema
  asyncHandler(async (req, res) => {
    const gachaId = Number(req.params.id);
    
    if (isNaN(gachaId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid gacha ID'
      });
    }

    const poolData = { ...req.body, gacha_id: gachaId };
    const poolItem = await gachaService.addPoolItem(poolData);
    
    logger.info(`Added pool item to gacha ${gachaId}`);

    res.status(201).json({
      success: true,
      data: poolItem,
      message: 'Pool item added successfully'
    });
  })
);

// POST /api/gachas/:id/pool/bulk - Bulk add items to gacha pool
router.post('/:id/pool/bulk',
  // validate(schemas.bulkCreateGachaPool), // TODO: Add validation schema
  asyncHandler(async (req, res) => {
    const gachaId = Number(req.params.id);
    
    if (isNaN(gachaId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid gacha ID'
      });
    }

    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items must be an array'
      });
    }

    const poolItems = await gachaService.bulkAddPoolItems(gachaId, items);
    
    logger.info(`Bulk added ${poolItems.length} pool items to gacha ${gachaId}`);

    res.status(201).json({
      success: true,
      data: poolItems,
      message: `${poolItems.length} pool items added successfully`
    });
  })
);

// PUT /api/gachas/:id - Update gacha
router.put('/:id',
  // validate(schemas.updateGacha), // TODO: Add validation schema
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid gacha ID'
      });
    }

    const gacha = await gachaService.updateGacha(id, req.body);

    logger.info(`Updated gacha: ${gacha.name_en}`);

    res.json({
      success: true,
      data: gacha,
      message: 'Gacha updated successfully'
    });
  })
);

// PUT /api/gachas/:id/pool/:poolId - Update pool item
router.put('/:id/pool/:poolId',
  // validate(schemas.updateGachaPool), // TODO: Add validation schema
  asyncHandler(async (req, res) => {
    const poolId = Number(req.params.poolId);

    if (isNaN(poolId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pool item ID'
      });
    }

    const poolItem = await gachaService.updatePoolItem(poolId, req.body);

    logger.info(`Updated pool item ${poolId}`);

    res.json({
      success: true,
      data: poolItem,
      message: 'Pool item updated successfully'
    });
  })
);

// DELETE /api/gachas/:id - Delete gacha
router.delete('/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid gacha ID'
      });
    }

    await gachaService.deleteGacha(id);

    logger.info(`Deleted gacha with ID: ${id}`);

    res.json({
      success: true,
      message: 'Gacha deleted successfully'
    });
  })
);

// DELETE /api/gachas/:id/pool/:poolId - Remove item from gacha pool
router.delete('/:id/pool/:poolId',
  asyncHandler(async (req, res) => {
    const poolId = Number(req.params.poolId);

    if (isNaN(poolId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pool item ID'
      });
    }

    await gachaService.removePoolItem(poolId);

    logger.info(`Removed pool item ${poolId}`);

    res.json({
      success: true,
      message: 'Pool item removed successfully'
    });
  })
);

export default router;
