import { Router } from 'express';
import { validate, validateQuery, schemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { SwimsuitModel } from '../models/SwimsuitModel';
import logger from '../config/logger';

const router = Router();
const swimsuitModel = new SwimsuitModel();

// GET /api/swimsuits - Get all swimsuits with pagination and filters
router.get('/', 
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder, characterId, rarity, suitType, limited, malfunction } = req.query;
    
    let result;
    
    if (characterId) {
      result = await swimsuitModel.findByCharacterId(Number(characterId), {
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    } else if (rarity) {
      result = await swimsuitModel.findByRarity(rarity as any, {
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    } else if (suitType) {
      result = await swimsuitModel.findBySuitType(suitType as any, {
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    } else if (limited === 'true') {
      result = await swimsuitModel.findLimitedSwimsuits({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    } else if (malfunction === 'true') {
      result = await swimsuitModel.findWithMalfunction({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    } else {
      result = await swimsuitModel.findAll({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    }

    logger.info(`Retrieved ${result.data.length} swimsuits for page ${page}`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/swimsuits/key/:unique_key - Get swimsuit by unique key
router.get('/key/:unique_key',
  asyncHandler(async (req, res) => {
    const { unique_key } = req.params;
    
    const swimsuit = await swimsuitModel.findByUniqueKey(unique_key);
    
    logger.info(`Retrieved swimsuit: ${swimsuit.name_en}`);

    res.json({
      success: true,
      data: swimsuit
    });
  })
);

// GET /api/swimsuits/top-stats - Get top swimsuits by stats
router.get('/top-stats',
  asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;
    
    const swimsuits = await swimsuitModel.getTopStatsSwimsuits(Number(limit));
    
    logger.info(`Retrieved top ${swimsuits.length} swimsuits by stats`);

    res.json({
      success: true,
      data: swimsuits
    });
  })
);

// GET /api/swimsuits/search - Search swimsuits
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

    const result = await swimsuitModel.search(q as string, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Search for "${q}" returned ${result.data.length} swimsuits`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/swimsuits/:id - Get swimsuit by ID
router.get('/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid swimsuit ID'
      });
    }
    
    const swimsuit = await swimsuitModel.findById(id);
    
    logger.info(`Retrieved swimsuit: ${swimsuit.name_en}`);

    res.json({
      success: true,
      data: swimsuit
    });
  })
);

// POST /api/swimsuits - Create new swimsuit
router.post('/',
  validate(schemas.createSwimsuit),
  asyncHandler(async (req, res) => {
    const swimsuit = await swimsuitModel.create(req.body);
    
    logger.info(`Created swimsuit: ${swimsuit.name_en}`);

    res.status(201).json({
      success: true,
      data: swimsuit,
      message: 'Swimsuit created successfully'
    });
  })
);

// PUT /api/swimsuits/:id - Update swimsuit
router.put('/:id',
  validate(schemas.updateSwimsuit),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid swimsuit ID'
      });
    }
    
    const swimsuit = await swimsuitModel.update(id, req.body);
    
    logger.info(`Updated swimsuit: ${swimsuit.name_en}`);

    res.json({
      success: true,
      data: swimsuit,
      message: 'Swimsuit updated successfully'
    });
  })
);

// DELETE /api/swimsuits/:id - Delete swimsuit
router.delete('/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid swimsuit ID'
      });
    }
    
    await swimsuitModel.delete(id);
    
    logger.info(`Deleted swimsuit with ID: ${id}`);

    res.json({
      success: true,
      message: 'Swimsuit deleted successfully'
    });
  })
);

export default router; 