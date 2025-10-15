import { Router } from 'express';
import { validate, validateQuery, validateParams, asyncHandler } from '../middleware';
import { schemas } from '../utils/ValidationSchemas';
import { SwimsuitModel } from '../models/SwimsuitModel';
import logger from '../config/logger';

const router = Router();
const swimsuitModel = new SwimsuitModel();

// GET /api/swimsuits - Get all swimsuits with pagination
// Note: Filters removed (characterId, rarity, suitType, limited, malfunction not yet implemented)
// Note: Skills are now embedded in swimsuit records (skill_id_1/2/3, skill_key_1/2/3, skill_name_*_1/2/3, skill_des_*_1/2/3)
// Note: character_id changed to character_key (string reference)
router.get('/',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;

    const result = await swimsuitModel.findAll({
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
    });

    logger.info(`Retrieved ${result.data.length} swimsuits for page ${page}`);

    res.paginated(result);
  })
);

// GET /api/swimsuits/key/:unique_key - Get swimsuit by unique key
router.get('/key/:unique_key',
  validateParams(schemas.uniqueKeyParam),
  asyncHandler(async (req, res) => {
    const { unique_key } = req.params;

    const swimsuit = await swimsuitModel.findByKey(unique_key);

    logger.info(`Retrieved swimsuit: ${swimsuit.name_en}`);

    res.success(swimsuit);
  })
);

// GET /api/swimsuits/top-stats - Get top swimsuits by stats
router.get('/top-stats',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { stat = 'total', page = 1, limit = 10 } = req.query;

    const result = await swimsuitModel.getTopByStats(
      stat as 'pow' | 'tec' | 'stm' | 'apl' | 'total',
      {
        page: Number(page),
        limit: Number(limit)
      }
    );

    logger.info(`Found ${result.data.length} top swimsuits sorted by ${stat}`);
    res.paginated(result);
  })
);

router.get('/search',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 10, sortBy, sortOrder } = req.query;

    if (!q) {
      res.error('Search query is required', 400, {
        field: 'q',
        required: true,
        example: '?q=kasumi'
      });
      return;
    }

    const result = await swimsuitModel.searchMultiLanguage(q as string, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
    });

    logger.info(`Search for "${q}" returned ${result.data.length} swimsuits`);

    res.paginated(result);
  })
);

router.get('/:id',
  validateParams(schemas.idParam),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    const swimsuit = await swimsuitModel.findById(id);

    logger.info(`Retrieved swimsuit: ${swimsuit.name_en}`);

    res.success(swimsuit);
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

router.put('/:id',
  validateParams(schemas.idParam),
  validate(schemas.updateSwimsuit),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    const swimsuit = await swimsuitModel.update(id, req.body);

    logger.info(`Updated swimsuit: ${swimsuit.name_en}`);

    res.updated(swimsuit, 'Swimsuit updated successfully');
  })
);

router.delete('/:id',
  validateParams(schemas.idParam),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    await swimsuitModel.delete(id);

    logger.info(`Deleted swimsuit with ID: ${id}`);

    res.deleted('Swimsuit deleted successfully');
  })
);

// ============================================================================
// SWIMSUIT SKILL ROUTES - REMOVED
// ============================================================================
// Note: Skills are now embedded directly in swimsuit records as:
// - skill_id_1/2/3, skill_key_1/2/3
// - skill_name_jp/en/cn/tw/kr_1/2/3
// - skill_des_1/2/3, skill_des_jp/en/cn/tw/kr_1/2/3
//
// To update skills, use PUT /api/swimsuits/:id with the embedded skill fields

export default router;