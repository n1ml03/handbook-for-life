import { Router } from 'express';
import { validate, validateQuery, schemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { GachaService } from '../services/GachaService';
import logger from '../config/logger';

const router = Router();
const gachaService = new GachaService();

/**
 * @swagger
 * /api/gachas:
 *   get:
 *     tags: [Gachas]
 *     summary: Get all gachas with pagination
 *     description: Retrieve a paginated list of all gachas with optional filtering
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *       - name: gacha_subtype
 *         in: query
 *         description: Filter by gacha subtype
 *         required: false
 *         schema:
 *           type: string
 *           enum: [TRENDY, NOSTALGIC, BIRTHDAY, ANNIVERSARY, PAID, FREE, ETC]
 *       - $ref: '#/components/parameters/IsActiveParam'
 *       - $ref: '#/components/parameters/StartDateParam'
 *       - $ref: '#/components/parameters/EndDateParam'
 *     responses:
 *       200:
 *         description: Gachas retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Gacha'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
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

/**
 * @swagger
 * /api/gachas/active:
 *   get:
 *     tags: [Gachas]
 *     summary: Get currently active gachas
 *     description: Retrieve a paginated list of gachas that are currently active (within start and end date)
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *     responses:
 *       200:
 *         description: Active gachas retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Gacha'
 *             example:
 *               success: true
 *               data: [
 *                 {
 *                   id: 201,
 *                   unique_key: 'summer_festival_2024',
 *                   name_en: 'Summer Festival Gacha 2024',
 *                   gacha_subtype: 'TRENDY',
 *                   start_date: '2024-06-01T00:00:00Z',
 *                   end_date: '2024-06-30T23:59:59Z',
 *                   is_active: true
 *                 }
 *               ]
 *               pagination: {
 *                 page: 1,
 *                 limit: 10,
 *                 total: 3,
 *                 totalPages: 1,
 *                 hasNext: false,
 *                 hasPrev: false
 *               }
 *               timestamp: '2024-06-28T10:30:00.000Z'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
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

/**
 * @swagger
 * /api/gachas/search:
 *   get:
 *     tags: [Gachas]
 *     summary: Search gachas
 *     description: Search gachas by name or other criteria
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

/**
 * @swagger
 * /api/gachas/{id}:
 *   get:
 *     tags: [Gachas]
 *     summary: Get gacha by ID
 *     description: Retrieve a specific gacha by their ID
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
        message: 'Invalid gacha ID'
      });
      return;
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
      res.status(400).json({
        success: false,
        message: 'Invalid gacha ID'
      });
      return;
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
      res.status(400).json({
        success: false,
        message: 'Invalid gacha ID'
      });
      return;
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

// GET /api/gachas/:id/validate-rates - Validate gacha drop rates
router.get('/:id/validate-rates',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid gacha ID'
      });
      return;
    }
    
    const validation = await gachaService.validateGachaDropRates(id);

    logger.info(`Validated drop rates for gacha ${id}: ${validation.message}`);

    res.json({
      success: true,
      data: validation
    });
  })
);

// POST /api/gachas - Create new gacha
router.post('/',
  validate(schemas.createGacha),
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
  validate(schemas.createGachaPool),
  asyncHandler(async (req, res) => {
    const gachaId = Number(req.params.id);
    
    if (isNaN(gachaId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid gacha ID'
      });
      return;
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
  validate(schemas.bulkCreateGachaPool),
  asyncHandler(async (req, res) => {
    const gachaId = Number(req.params.id);

    if (isNaN(gachaId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid gacha ID'
      });
      return;
    }

    const { items } = req.body;
    if (!Array.isArray(items)) {
      res.status(400).json({
        success: false,
        message: 'Items must be an array'
      });
      return;
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

/**
 * @swagger
 * /api/gachas/{id}:
 *   put:
 *     tags: [Gachas]
 *     summary: Update gacha
 *     description: Update an existing gacha
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
  validate(schemas.updateGacha),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid gacha ID'
      });
      return;
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
  validate(schemas.updateGachaPool),
  asyncHandler(async (req, res) => {
    const poolId = Number(req.params.poolId);

    if (isNaN(poolId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid pool item ID'
      });
      return;
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

/**
 * @swagger
 * /api/gachas/{id}:
 *   delete:
 *     tags: [Gachas]
 *     summary: Delete gacha
 *     description: Delete an existing gacha
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
        message: 'Invalid gacha ID'
      });
      return;
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
      res.status(400).json({
        success: false,
        message: 'Invalid pool item ID'
      });
      return;
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
