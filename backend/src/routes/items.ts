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

    res.paginated(result);
  })
);

// GET /api/items/key/:unique_key - Get item by unique key
router.get('/key/:unique_key',
  asyncHandler(async (req, res) => {
    const { unique_key } = req.params;
    
    const item = await itemModel.findByUniqueKey(unique_key);
    
    logger.info(`Retrieved item: ${item.name_en}`);

    res.success(item);
  })
);

// GET /api/items/currency - Get currency items
router.get('/currency',
  asyncHandler(async (_req, res) => {
    const items = await itemModel.getCurrencyItems();
    
    logger.info(`Retrieved ${items.length} currency items`);

    res.success(items);
  })
);

/**
 * @swagger
 * /api/items/search:
 *   get:
 *     tags: [Items]
 *     summary: Search items
 *     description: Search items by name or other criteria
 *     parameters:
 *       - $ref: '#/components/parameters/SearchParam'
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/PaginatedSuccess'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
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
    const result = await itemModel.search(searchFields, q as string, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Search for "${q}" returned ${result.data.length} items`);

    res.paginated(result);
  })
);

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     tags: [Items]
 *     summary: Get item by ID
 *     description: Retrieve a specific item by their ID
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
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

/**
 * @swagger
 * /api/items/{id}:
 *   put:
 *     tags: [Items]
 *     summary: Update item
 *     description: Update an existing item
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
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

/**
 * @swagger
 * /api/items/{id}:
 *   delete:
 *     tags: [Items]
 *     summary: Delete item
 *     description: Delete an existing item
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
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