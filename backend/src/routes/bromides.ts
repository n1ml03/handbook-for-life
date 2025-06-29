import { Router } from 'express';
import { validate, validateQuery, schemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
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
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    } else if (rarity) {
      result = await bromideModel.findByRarity(rarity as any, {
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    } else {
      result = await bromideModel.findAll({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    }

    logger.info(`Retrieved ${result.data.length} bromides for page ${page}`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/bromides/key/:unique_key - Get bromide by unique key
router.get('/key/:unique_key',
  asyncHandler(async (req, res) => {
    const { unique_key } = req.params;
    
    const bromide = await bromideModel.findByUniqueKey(unique_key);
    
    logger.info(`Retrieved bromide: ${bromide.name_en}`);

    res.json({
      success: true,
      data: bromide
    });
  })
);

/**
 * @swagger
 * /api/bromides/search:
 *   get:
 *     tags: [Bromides]
 *     summary: Search bromides
 *     description: Search bromides by name or other criteria
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
    const result = await bromideModel.search(searchFields, q as string, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Search for "${q}" returned ${result.data.length} bromides`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

/**
 * @swagger
 * /api/bromides/{id}:
 *   get:
 *     tags: [Bromides]
 *     summary: Get bromide by ID
 *     description: Retrieve a specific bromide by their ID
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
        message: 'Invalid bromide ID'
      });
      return;
    }
    
    const bromide = await bromideModel.findById(id);
    
    logger.info(`Retrieved bromide: ${bromide.name_en}`);

    res.json({
      success: true,
      data: bromide
    });
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

/**
 * @swagger
 * /api/bromides/{id}:
 *   put:
 *     tags: [Bromides]
 *     summary: Update bromide
 *     description: Update an existing bromide
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

    res.json({
      success: true,
      data: bromide,
      message: 'Bromide updated successfully'
    });
  })
);

/**
 * @swagger
 * /api/bromides/{id}:
 *   delete:
 *     tags: [Bromides]
 *     summary: Delete bromide
 *     description: Delete an existing bromide
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
        message: 'Invalid bromide ID'
      });
      return;
    }
    
    await bromideModel.delete(id);
    
    logger.info(`Deleted bromide with ID: ${id}`);

    res.json({
      success: true,
      message: 'Bromide deleted successfully'
    });
  })
);

export default router; 