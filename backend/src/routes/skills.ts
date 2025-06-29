import { Router } from 'express';
import { validate, validateQuery, validateParams, schemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { SkillModel } from '../models/SkillModel';
import logger from '../config/logger';

const router = Router();
const skillModel = new SkillModel();

// GET /api/skills - Get all skills with pagination and filters
router.get('/',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder, category, effectType } = req.query;
    
    let result;
    
    if (category) {
      result = await skillModel.findByCategory(category as any, {
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    } else if (effectType) {
      result = await skillModel.findByEffectType(effectType as string, {
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    } else {
      result = await skillModel.findAll({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    }

    logger.info(`Retrieved ${result.data.length} skills for page ${page}`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/skills/key/:unique_key - Get skill by unique key
router.get('/key/:unique_key',
  validateParams(schemas.uniqueKeyParam),
  asyncHandler(async (req, res) => {
    const { unique_key } = req.params;

    const skill = await skillModel.findByUniqueKey(unique_key);

    logger.info(`Retrieved skill: ${skill.name_en}`);

    res.json({
      success: true,
      data: skill
    });
  })
);

/**
 * @swagger
 * /api/skills/search:
 *   get:
 *     tags: [Skills]
 *     summary: Search skills
 *     description: Search skills by name or other criteria
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
    const result = await skillModel.search(searchFields, q as string, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Search for "${q}" returned ${result.data.length} skills`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

/**
 * @swagger
 * /api/skills/{id}:
 *   get:
 *     tags: [Skills]
 *     summary: Get skill by ID
 *     description: Retrieve a specific skill by their ID
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

    const skill = await skillModel.findById(id);

    logger.info(`Retrieved skill: ${skill.name_en}`);

    res.json({
      success: true,
      data: skill
    });
  })
);

// POST /api/skills - Create new skill
router.post('/',
  validate(schemas.createSkill),
  asyncHandler(async (req, res) => {
    const skill = await skillModel.create(req.body);
    
    logger.info(`Created skill: ${skill.name_en}`);

    res.status(201).json({
      success: true,
      data: skill,
      message: 'Skill created successfully'
    });
  })
);

/**
 * @swagger
 * /api/skills/{id}:
 *   put:
 *     tags: [Skills]
 *     summary: Update skill
 *     description: Update an existing skill
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
  validate(schemas.updateSkill),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    const skill = await skillModel.update(id, req.body);

    logger.info(`Updated skill: ${skill.name_en}`);

    res.json({
      success: true,
      data: skill,
      message: 'Skill updated successfully'
    });
  })
);

/**
 * @swagger
 * /api/skills/{id}:
 *   delete:
 *     tags: [Skills]
 *     summary: Delete skill
 *     description: Delete an existing skill
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

    await skillModel.delete(id);

    logger.info(`Deleted skill with ID: ${id}`);

    res.json({
      success: true,
      message: 'Skill deleted successfully'
    });
  })
);

export default router; 