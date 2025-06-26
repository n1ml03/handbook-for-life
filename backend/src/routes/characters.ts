import { Router } from 'express';
import { validate, validateQuery, validateParams, schemas } from '../middleware/validation';
import { characterSchemas } from '../utils/ValidationSchemas';
import { asyncHandler } from '../middleware/errorHandler';
import { characterService } from '../services';
import logger from '../config/logger';

const router = Router();

// GET /api/characters - Get all characters with pagination
router.get('/',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;
    
    const result = await characterService.getCharacters({
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Retrieved ${result.data.length} characters for page ${page}`);
    res.paginated(result);
  })
);

// GET /api/characters/key/:unique_key - Get character by unique key
router.get('/key/:unique_key',
  validateParams(schemas.uniqueKeyParam),
  asyncHandler(async (req, res) => {
    const { unique_key } = req.params;
    
    const character = await characterService.getCharacterByKey(unique_key);
    
    logger.info(`Retrieved character: ${character.name_en}`);
    res.success(character);
  })
);

// GET /api/characters/birthdays - Get upcoming birthdays
router.get('/birthdays',
  asyncHandler(async (req, res) => {
    const { days = 7 } = req.query;
    
    const characters = await characterService.getUpcomingBirthdays(Number(days));
    
    logger.info(`Retrieved ${characters.length} characters with upcoming birthdays`);
    res.success(characters);
  })
);

// GET /api/characters/search - Search characters
router.get('/search',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 10, sortBy, sortOrder } = req.query;
    
    if (!q) {
      res.error('Search query is required', 400);
      return;
    }

    const result = await characterService.searchCharacters(q as string, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Search for "${q}" returned ${result.data.length} characters`);
    res.paginated(result);
  })
);

// GET /api/characters/:id - Get character by ID
router.get('/:id',
  validateParams(schemas.idParam),
  asyncHandler(async (req, res) => {
    const character = await characterService.getCharacterById(req.params.id);
    
    logger.info(`Retrieved character: ${character.name_en}`);
    res.success(character);
  })
);

// POST /api/characters - Create new character
router.post('/',
  validate(schemas.createCharacter),
  asyncHandler(async (req, res) => {
    const character = await characterService.createCharacter(req.body);
    
    logger.info(`Created character: ${character.name_en}`);
    res.status(201).success(character, 'Character created successfully');
  })
);

// POST /api/characters/batch - Create multiple characters
router.post('/batch',
  validate(characterSchemas.batchCreate),
  asyncHandler(async (req, res) => {
    await characterService.createMultipleCharacters(req.body);
    
    logger.info(`Created ${req.body.length} characters in batch`);
    res.status(201).success({ created: req.body.length }, 'Characters created successfully');
  })
);

// PUT /api/characters/:id - Update character
router.put('/:id',
  validateParams(schemas.idParam),
  validate(schemas.updateCharacter),
  asyncHandler(async (req, res) => {
    const character = await characterService.updateCharacter(req.params.id, req.body);
    
    logger.info(`Updated character: ${character.name_en}`);
    res.success(character, 'Character updated successfully');
  })
);

// DELETE /api/characters/:id - Delete character
router.delete('/:id',
  validateParams(schemas.idParam),
  asyncHandler(async (req, res) => {
    await characterService.deleteCharacter(req.params.id);
    
    logger.info(`Deleted character with ID: ${req.params.id}`);
    res.success({ deleted: true }, 'Character deleted successfully');
  })
);

// GET /api/characters/:id/swimsuits - Get character swimsuits
router.get('/:id/swimsuits',
  validateParams(schemas.idParam),
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;

    const result = await characterService.getCharacterSwimsuits(req.params.id, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Retrieved ${result.data.length} swimsuits for character ${req.params.id}`);
    res.paginated(result);
  })
);

export default router;