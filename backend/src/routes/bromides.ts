import { Router } from 'express';
import { validate, validateQuery, asyncHandler } from '../middleware';
import { schemas } from '../utils/ValidationSchemas';
import { BromideModel } from '../models/BromideModel';
import logger from '../config/logger';

const router = Router();
const bromideModel = new BromideModel();

// GET /api/bromides - Get all bromides with pagination and filters
router.get('/', 
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder, type, rarity } = req.query;
    
    let result;
    
    if (type) {
      result = await bromideModel.findByType(type as any, {
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
      });
    } else if (rarity) {
      result = await bromideModel.findByRarity(rarity as any, {
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
      });
    } else {
      result = await bromideModel.findAll({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
      });
    }

    logger.info(`Retrieved ${result.data.length} bromides for page ${page}`);

    res.paginated(result);
  })
);

// GET /api/bromides/key/:unique_key - Get bromide by unique key
router.get('/key/:unique_key',
  asyncHandler(async (req, res) => {
    const { unique_key } = req.params;
    
    const bromide = await bromideModel.findByUniqueKey(unique_key);
    
    logger.info(`Retrieved bromide: ${bromide.name_en}`);

    res.success(bromide);
  })
);

router.get('/search',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 10, sortBy, sortOrder } = req.query;
    
    if (!q) {
      res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
      return;
    }

    const searchFields = ['name_jp', 'name_en', 'name_cn', 'name_tw', 'name_kr', 'unique_key'];
    const result = await bromideModel.search(searchFields, q as string, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
    });

    logger.info(`Search for "${q}" returned ${result.data.length} bromides`);

    res.paginated(result);
  })
);

router.get('/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid bromide ID'
      });
      return;
    }
    
    const bromide = await bromideModel.findById(id);
    
    logger.info(`Retrieved bromide: ${bromide.name_en}`);

    res.success(bromide);
  })
);

// POST /api/bromides - Create new bromide
router.post('/',
  validate(schemas.createBromide),
  asyncHandler(async (req, res) => {
    const bromide = await bromideModel.create(req.body);
    
    logger.info(`Created bromide: ${bromide.name_en}`);

    res.status(201).json({
      success: true,
      data: bromide,
      message: 'Bromide created successfully'
    });
  })
);

router.put('/:id',
  validate(schemas.updateBromide),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid bromide ID'
      });
      return;
    }
    
    const bromide = await bromideModel.update(id, req.body);
    
    logger.info(`Updated bromide: ${bromide.name_en}`);

    res.updated(bromide, 'Bromide updated successfully');
  })
);

router.delete('/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid bromide ID'
      });
      return;
    }
    
    await bromideModel.delete(id);
    
    logger.info(`Deleted bromide with ID: ${id}`);

    res.deleted('Bromide deleted successfully');
  })
);

export default router; 