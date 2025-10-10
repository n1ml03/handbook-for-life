import { Router } from 'express';
import { validate, validateQuery, validateParams, asyncHandler } from '../middleware/middleware';
import { schemas } from '../utils/ValidationSchemas';
import { CharacterModel } from '../models/CharacterModel';
import { SwimsuitModel } from '../models/SwimsuitModel';
import logger from '../config/logger';

const characterModel = new CharacterModel();
const swimsuitModel = new SwimsuitModel();

const router = Router();
router.get('/',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;

    const result = await characterModel.findAll({
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
    });

    logger.info(`Retrieved ${result.data.length} characters for page ${page}`);
    res.paginated(result);
  })
);
router.get('/key/:unique_key',
  validateParams(schemas.uniqueKeyParam),
  asyncHandler(async (req, res) => {
    const { unique_key } = req.params;

    const character = await characterModel.findByKey(unique_key);

    logger.info(`Retrieved character: ${character.name_en}`);
    res.success(character);
  })
);
router.get('/birthdays',
  asyncHandler(async (req, res) => {
    const { month, day, page = 1, limit = 10, sortBy, sortOrder } = req.query;

    const result = await characterModel.findByBirthday(
      month ? Number(month) : undefined,
      day ? Number(day) : undefined,
      {
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
      }
    );

    logger.info(`Found ${result.data.length} characters with birthdays matching criteria`);
    res.paginated(result);
  })
);

router.get('/search',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 10, sortBy, sortOrder } = req.query;

    if (!q) {
      res.error('Search query is required', 400);
      return;
    }

    const result = await characterModel.searchMultiLanguage(q as string, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
    });

    logger.info(`Search for "${q}" returned ${result.data.length} characters`);
    res.paginated(result);
  })
);

router.get('/:id',
  validateParams(schemas.idParam),
  asyncHandler(async (req, res) => {
    const character = await characterModel.findById(Number(req.params.id));

    logger.info(`Retrieved character: ${character.name_en}`);
    res.success(character);
  })
);

router.post('/',
  validate(schemas.createCharacter),
  asyncHandler(async (req, res) => {
    const character = await characterModel.create(req.body);

    logger.info(`Created character: ${character.name_en}`);
    res.created(character, 'Character created successfully', `/api/characters/${character.id}`);
  })
);

// TODO: Implement batch create
router.post('/batch',
  asyncHandler(async (req, res) => {
    // Batch create not yet implemented in simplified BaseModel
    logger.info(`Batch create not yet implemented`);
    res.status(501).error('Batch create not yet implemented', 501);
  })
);

// PUT /api/characters/:id - Update character
router.put('/:id',
  validateParams(schemas.idParam),
  validate(schemas.updateCharacter),
  asyncHandler(async (req, res) => {
    const character = await characterModel.update(Number(req.params.id), req.body);

    logger.info(`Updated character: ${character.name_en}`);
    res.success(character, 'Character updated successfully');
  })
);

// DELETE /api/characters/:id - Delete character
router.delete('/:id',
  validateParams(schemas.idParam),
  asyncHandler(async (req, res) => {
    await characterModel.delete(Number(req.params.id));

    logger.info(`Deleted character with ID: ${req.params.id}`);
    res.success({ deleted: true }, 'Character deleted successfully');
  })
);

// GET /api/characters/:id/swimsuits - Get character swimsuits
router.get('/:id/swimsuits',
  validateParams(schemas.idParam),
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;

    // First get the character to retrieve their unique_key
    const character = await characterModel.findById(Number(id));

    // Query swimsuits by character_key
    const result = await swimsuitModel.findByCharacterKey(character.unique_key, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
    });

    logger.info(`Found ${result.data.length} swimsuits for character ${character.name_en || character.name_jp}`);
    res.paginated(result);
  })
);

// TODO: Skills are now embedded in swimsuits - this endpoint may not be needed
// GET /api/characters/:id/skills - Get character skills
router.get('/:id/skills',
  validateParams(schemas.idParam),
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    logger.info(`Character skills endpoint not yet implemented (skills are now embedded in swimsuits)`);
    res.status(501).error('Character skills endpoint not yet implemented', 501);
  })
);

export default router;