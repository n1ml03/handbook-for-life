import { Router } from 'express';
import { validate, validateQuery, schemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { CharacterModel } from '../models/CharacterModel';
import logger from '../config/logger';

const router = Router();
const characterModel = new CharacterModel();

// GET /api/characters - Get all characters with pagination
router.get('/', 
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;
    
    const result = await characterModel.findAll({
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Retrieved ${result.data.length} characters for page ${page}`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/characters/key/:unique_key - Get character by unique key
router.get('/key/:unique_key',
  asyncHandler(async (req, res) => {
    const { unique_key } = req.params;
    
    const character = await characterModel.findByUniqueKey(unique_key);
    
    logger.info(`Retrieved character: ${character.name_en}`);

    res.json({
      success: true,
      data: character
    });
  })
);

// GET /api/characters/birthdays - Get upcoming birthdays
router.get('/birthdays',
  asyncHandler(async (req, res) => {
    const { days = 7 } = req.query;
    
    const characters = await characterModel.findUpcomingBirthdays(Number(days));
    
    logger.info(`Retrieved ${characters.length} characters with upcoming birthdays`);

    res.json({
      success: true,
      data: characters
    });
  })
);

// GET /api/characters/search - Search characters
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

    const result = await characterModel.search(q as string, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Search for "${q}" returned ${result.data.length} characters`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/characters/:id - Get character by ID
router.get('/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid character ID'
      });
    }
    
    const character = await characterModel.findById(id);
    
    logger.info(`Retrieved character: ${character.name_en}`);

    res.json({
      success: true,
      data: character
    });
  })
);

// POST /api/characters - Create new character
router.post('/',
  validate(schemas.createCharacter),
  asyncHandler(async (req, res) => {
    const character = await characterModel.create(req.body);
    
    logger.info(`Created character: ${character.name_en}`);

    res.status(201).json({
      success: true,
      data: character,
      message: 'Character created successfully'
    });
  })
);

// PUT /api/characters/:id - Update character
router.put('/:id',
  validate(schemas.updateCharacter),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid character ID'
      });
    }
    
    const character = await characterModel.update(id, req.body);
    
    logger.info(`Updated character: ${character.name_en}`);

    res.json({
      success: true,
      data: character,
      message: 'Character updated successfully'
    });
  })
);

// DELETE /api/characters/:id - Delete character
router.delete('/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid character ID'
      });
    }
    
    await characterModel.delete(id);
    
    logger.info(`Deleted character with ID: ${id}`);

    res.json({
      success: true,
      message: 'Character deleted successfully'
    });
  })
);

export default router; 