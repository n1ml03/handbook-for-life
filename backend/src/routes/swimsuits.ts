import { Router } from 'express';
import { validate, validateQuery, validateParams, schemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { SwimsuitModel } from '../models/SwimsuitModel';
import { SwimsuitSkillService } from '../services/SwimsuitSkillService';
import logger from '../config/logger';

const router = Router();
const swimsuitModel = new SwimsuitModel();
const swimsuitSkillService = new SwimsuitSkillService();

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
      result = await swimsuitModel.findAllWithCharacters({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    }

    logger.info(`Retrieved ${result.data.length} swimsuits for page ${page}`);

    res.paginated(result);
  })
);

// GET /api/swimsuits/key/:unique_key - Get swimsuit by unique key
router.get('/key/:unique_key',
  validateParams(schemas.uniqueKeyParam),
  asyncHandler(async (req, res) => {
    const { unique_key } = req.params;

    const swimsuit = await swimsuitModel.findByUniqueKey(unique_key);

    logger.info(`Retrieved swimsuit: ${swimsuit.name_en}`);

    res.success(swimsuit);
  })
);

// GET /api/swimsuits/top-stats - Get top swimsuits by stats
router.get('/top-stats',
  asyncHandler(async (req, res) => {
    const { limit = 10 } = req.query;
    
    const swimsuits = await swimsuitModel.getTopStatsSwimsuits(Number(limit));
    
    logger.info(`Retrieved top ${swimsuits.length} swimsuits by stats`);

    res.success(swimsuits);
  })
);

/**
 * @swagger
 * /api/swimsuits/search:
 *   get:
 *     tags: [Swimsuits]
 *     summary: Search swimsuits
 *     description: Search swimsuits by name or other criteria
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
    const result = await swimsuitModel.search(searchFields, q as string, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Search for "${q}" returned ${result.data.length} swimsuits`);

    res.paginated(result);
  })
);

/**
 * @swagger
 * /api/swimsuits/{id}:
 *   get:
 *     tags: [Swimsuits]
 *     summary: Get swimsuit by ID
 *     description: Retrieve a specific swimsuit by their ID
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

/**
 * @swagger
 * /api/swimsuits/{id}:
 *   put:
 *     tags: [Swimsuits]
 *     summary: Update swimsuit
 *     description: Update an existing swimsuit
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
  validateParams(schemas.idParam),
  validate(schemas.updateSwimsuit),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    const swimsuit = await swimsuitModel.update(id, req.body);

    logger.info(`Updated swimsuit: ${swimsuit.name_en}`);

    res.updated(swimsuit, 'Swimsuit updated successfully');
  })
);

/**
 * @swagger
 * /api/swimsuits/{id}:
 *   delete:
 *     tags: [Swimsuits]
 *     summary: Delete swimsuit
 *     description: Delete an existing swimsuit
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
  validateParams(schemas.idParam),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    await swimsuitModel.delete(id);

    logger.info(`Deleted swimsuit with ID: ${id}`);

    res.deleted('Swimsuit deleted successfully');
  })
);

// ============================================================================
// SWIMSUIT SKILL ROUTES
// ============================================================================

// GET /api/swimsuits/:id/skills - Get skills for a swimsuit
router.get('/:id/skills',
  validateParams(schemas.idParam),
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;

    const result = await swimsuitSkillService.getSkillsBySwimsuitId(id, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Retrieved ${result.data.length} skills for swimsuit ${id}`);

    res.paginated(result);
  })
);

// GET /api/swimsuits/:id/skills/summary - Get skill summary for a swimsuit
router.get('/:id/skills/summary',
  validateParams(schemas.idParam),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    const summary = await swimsuitSkillService.getSwimsuitSkillSummary(id);

    logger.info(`Retrieved skill summary for swimsuit ${id}`);

    res.success(summary);
  })
);

// POST /api/swimsuits/:id/skills - Add skill to swimsuit
router.post('/:id/skills',
  validateParams(schemas.idParam),
  validate(schemas.addSwimsuitSkill),
  asyncHandler(async (req, res) => {
    const swimsuitId = Number(req.params.id);

    const skillData = { ...req.body, swimsuit_id: swimsuitId };
    const swimsuitSkill = await swimsuitSkillService.addSkillToSwimsuit(skillData);

    logger.info(`Added skill to swimsuit ${swimsuitId}`);

    res.status(201).json({
      success: true,
      data: swimsuitSkill,
      message: 'Skill added to swimsuit successfully'
    });
  })
);

// PUT /api/swimsuits/:id/skills - Set all skills for swimsuit
router.put('/:id/skills',
  validateParams(schemas.idParam),
  validate(schemas.setSwimsuitSkills),
  asyncHandler(async (req, res) => {
    const swimsuitId = Number(req.params.id);

    const { skills } = req.body;
    if (!Array.isArray(skills)) {
      res.status(400).json({
        success: false,
        message: 'Skills must be an array'
      });
      return;
    }

    const result = await swimsuitSkillService.setSwimsuitSkills(swimsuitId, skills);

    logger.info(`Set ${result.length} skills for swimsuit ${swimsuitId}`);

    res.updated(result, 'Swimsuit skills updated successfully');
  })
);

// PUT /api/swimsuits/:id/skills/:slot - Update specific skill slot
router.put('/:id/skills/:slot',
  validateParams(schemas.skillSlotParam),
  validate(schemas.updateSwimsuitSkill),
  asyncHandler(async (req, res) => {
    const swimsuitId = Number(req.params.id);
    const skillSlot = req.params.slot as any;

    const { skill_id } = req.body;
    const swimsuitSkill = await swimsuitSkillService.updateSwimsuitSkill(swimsuitId, skillSlot, skill_id);

    logger.info(`Updated skill slot ${skillSlot} for swimsuit ${swimsuitId}`);

    res.updated(swimsuitSkill, 'Swimsuit skill updated successfully');
  })
);

// DELETE /api/swimsuits/:id/skills/:slot - Remove skill from specific slot
router.delete('/:id/skills/:slot',
  validateParams(schemas.skillSlotParam),
  asyncHandler(async (req, res) => {
    const swimsuitId = Number(req.params.id);
    const skillSlot = req.params.slot as any;

    await swimsuitSkillService.removeSkillFromSwimsuit(swimsuitId, skillSlot);

    logger.info(`Removed skill from slot ${skillSlot} for swimsuit ${swimsuitId}`);

    res.deleted('Skill removed from swimsuit successfully');
  })
);

export default router;