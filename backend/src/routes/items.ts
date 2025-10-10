import { Router } from 'express';
import { validate, validateQuery, asyncHandler } from '../middleware/middleware';
import { schemas } from '../utils/ValidationSchemas';
import { ItemModel } from '../models/ItemModel';
import logger from '../config/logger';

const router = Router();
const itemModel = new ItemModel();

// GET /api/items - Get all items with pagination
// Note: category and rarity filters removed (fields no longer exist in denormalized schema)
router.get('/',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;

    const result = await itemModel.findAll({
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
    });

    logger.info(`Retrieved ${result.data.length} items for page ${page}`);

    res.paginated(result);
  })
);

// GET /api/items/key/:unique_key - Get item by unique key
router.get('/key/:unique_key',
  asyncHandler(async (req, res) => {
    const { unique_key } = req.params;

    const item = await itemModel.findByKey(unique_key);

    logger.info(`Retrieved item: ${item.name_en}`);

    res.success(item);
  })
);

// GET /api/items/currency - Get currency items
router.get('/currency',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;

    const result = await itemModel.findByType('CURRENCY', {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
    });

    logger.info(`Found ${result.data.length} currency items`);
    res.paginated(result);
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

    const result = await itemModel.searchMultiLanguage(q as string, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
    });

    logger.info(`Search for "${q}" returned ${result.data.length} items`);

    res.paginated(result);
  })
);

router.get('/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid item ID'
      });
      return;
    }
    
    const item = await itemModel.findById(id);
    
    logger.info(`Retrieved item: ${item.name_en}`);

    res.success(item);
  })
);

// POST /api/items - Create new item
router.post('/',
  validate(schemas.createItem),
  asyncHandler(async (req, res) => {
    const item = await itemModel.create(req.body);
    
    logger.info(`Created item: ${item.name_en}`);

    res.status(201).json({
      success: true,
      data: item,
      message: 'Item created successfully'
    });
  })
);

router.put('/:id',
  validate(schemas.updateItem),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid item ID'
      });
      return;
    }
    
    const item = await itemModel.update(id, req.body);
    
    logger.info(`Updated item: ${item.name_en}`);

    res.updated(item, 'Item updated successfully');
  })
);

router.delete('/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid item ID'
      });
      return;
    }
    
    await itemModel.delete(id);
    
    logger.info(`Deleted item with ID: ${id}`);

    res.deleted('Item deleted successfully');
  })
);

export default router; 