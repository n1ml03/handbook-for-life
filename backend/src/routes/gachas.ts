import { Router } from 'express';
import { validate, validateQuery, asyncHandler } from '../middleware';
import { schemas } from '../utils/ValidationSchemas';
import { GachaModel } from '../models/GachaModel';
import logger from '../config/logger';

const router = Router();
const gachaModel = new GachaModel();

router.get('/',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;

    const result = await gachaModel.findAll({
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
    });

    logger.info(`Retrieved ${result.data.length} gachas for page ${page}`);

    res.paginated(result);
  })
);

router.get('/active',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;

    const result = await gachaModel.findActive({
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
    });

    logger.info(`Retrieved ${result.data.length} active gachas`);

    res.paginated(result);
  })
);

// GET /api/gachas/subtype/:subtype - Get gachas by subtype (removed - not implemented in service)

// GET /api/gachas/key/:unique_key - Get gacha by unique key
router.get('/key/:unique_key',
  asyncHandler(async (req, res) => {
    const { unique_key } = req.params;

    const gacha = await gachaModel.findByKey(unique_key);

    logger.info(`Retrieved gacha: ${gacha.name_en}`);

    res.success(gacha);
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

    // Search not implemented in service yet - return all gachas for now
    const result = await gachaModel.findAll({
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
    });

    logger.info(`Search for "${q}" returned ${result.data.length} gachas`);

    res.paginated(result);
  })
);

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

    const gacha = await gachaModel.findById(id);

    logger.info(`Retrieved gacha: ${gacha.name_en}`);

    res.success(gacha);
  })
);

// Pool and featured items routes removed - not implemented in service yet

// POST /api/gachas - Create new gacha
router.post('/',
  validate(schemas.createGacha),
  asyncHandler(async (req, res) => {
    const gacha = await gachaModel.create(req.body);

    logger.info(`Created gacha: ${gacha.name_en}`);

    res.status(201).json({
      success: true,
      data: gacha,
      message: 'Gacha created successfully'
    });
  })
);

// Pool item routes removed - not implemented in service yet

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

    const gacha = await gachaModel.update(id, req.body);

    logger.info(`Updated gacha: ${gacha.name_en}`);

    res.updated(gacha, 'Gacha updated successfully');
  })
);

// Pool item update route removed - not implemented in service yet

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

    await gachaModel.delete(id);

    logger.info(`Deleted gacha with ID: ${id}`);

    res.deleted('Gacha deleted successfully');
  })
);

// Pool item delete route removed - not implemented in service yet

export default router;
