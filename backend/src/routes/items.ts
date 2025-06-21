import { Router } from 'express';
import { validate, validateQuery, schemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { ItemModel } from '../models/ItemModel';
import logger from '../config/logger';

const router = Router();
const itemModel = new ItemModel();

// GET /api/items - Get all items with pagination and filters
router.get('/', 
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder, category, rarity } = req.query;
    
    let result;
    
    if (category) {
      result = await itemModel.findByCategory(category as any, {
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    } else if (rarity) {
      result = await itemModel.findByRarity(rarity as any, {
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    } else {
      result = await itemModel.findAll({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    }

    logger.info(`Retrieved ${result.data.length} items for page ${page}`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/items/key/:unique_key - Get item by unique key
router.get('/key/:unique_key',
  asyncHandler(async (req, res) => {
    const { unique_key } = req.params;
    
    const item = await itemModel.findByUniqueKey(unique_key);
    
    logger.info(`Retrieved item: ${item.name_en}`);

    res.json({
      success: true,
      data: item
    });
  })
);

// GET /api/items/currency - Get currency items
router.get('/currency',
  asyncHandler(async (req, res) => {
    const items = await itemModel.getCurrencyItems();
    
    logger.info(`Retrieved ${items.length} currency items`);

    res.json({
      success: true,
      data: items
    });
  })
);

// GET /api/items/search - Search items
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

    const result = await itemModel.search(q as string, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Search for "${q}" returned ${result.data.length} items`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/items/:id - Get item by ID
router.get('/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID'
      });
    }
    
    const item = await itemModel.findById(id);
    
    logger.info(`Retrieved item: ${item.name_en}`);

    res.json({
      success: true,
      data: item
    });
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

// PUT /api/items/:id - Update item
router.put('/:id',
  validate(schemas.updateItem),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID'
      });
    }
    
    const item = await itemModel.update(id, req.body);
    
    logger.info(`Updated item: ${item.name_en}`);

    res.json({
      success: true,
      data: item,
      message: 'Item updated successfully'
    });
  })
);

// DELETE /api/items/:id - Delete item
router.delete('/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID'
      });
    }
    
    await itemModel.delete(id);
    
    logger.info(`Deleted item with ID: ${id}`);

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  })
);

export default router; 