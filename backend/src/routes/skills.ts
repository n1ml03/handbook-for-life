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

// GET /api/skills/search - Search skills
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

// GET /api/skills/:id - Get skill by ID
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

// PUT /api/skills/:id - Update skill
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

// DELETE /api/skills/:id - Delete skill
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