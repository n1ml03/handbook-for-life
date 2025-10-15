import { Router } from 'express';
import { validate, validateQuery, validateParams, asyncHandler } from '../middleware';
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

// GET /api/characters/:id/swimsuits - Get character swimsuits
// NOTE: This must be defined BEFORE the generic /:id route
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

// GET /api/characters/:id/skills - Get character skills (from embedded swimsuit skills)
// NOTE: This must be defined BEFORE the generic /:id route
router.get('/:id/skills',
  validateParams(schemas.idParam),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // First get the character to retrieve their unique_key
    const character = await characterModel.findById(Number(id));

    // Get all swimsuits for this character (no pagination, get all)
    const swimsuitsResult = await swimsuitModel.findByCharacterKey(character.unique_key, {
      page: 1,
      limit: 1000, // Get all swimsuits for the character
      sortBy: 'id',
      sortOrder: 'ASC'
    });

    // Extract unique skills from all swimsuits
    const skillsMap = new Map<string, any>();

    swimsuitsResult.data.forEach(swimsuit => {
      // Process skill 1
      if (swimsuit.skill_key_1) {
        skillsMap.set(swimsuit.skill_key_1, {
          skill_id: swimsuit.skill_id_1,
          skill_key: swimsuit.skill_key_1,
          name_jp: swimsuit.skill_name_jp_1,
          name_en: swimsuit.skill_name_en_1,
          name_cn: swimsuit.skill_name_cn_1,
          name_tw: swimsuit.skill_name_tw_1,
          name_kr: swimsuit.skill_name_kr_1,
          description: swimsuit.skill_des_1,
          description_jp: swimsuit.skill_des_jp_1,
          description_en: swimsuit.skill_des_en_1,
          description_cn: swimsuit.skill_des_cn_1,
          description_tw: swimsuit.skill_des_tw_1,
          description_kr: swimsuit.skill_des_kr_1,
        });
      }

      // Process skill 2
      if (swimsuit.skill_key_2) {
        skillsMap.set(swimsuit.skill_key_2, {
          skill_id: swimsuit.skill_id_2,
          skill_key: swimsuit.skill_key_2,
          name_jp: swimsuit.skill_name_jp_2,
          name_en: swimsuit.skill_name_en_2,
          name_cn: swimsuit.skill_name_cn_2,
          name_tw: swimsuit.skill_name_tw_2,
          name_kr: swimsuit.skill_name_kr_2,
          description: swimsuit.skill_des_2,
          description_jp: swimsuit.skill_des_jp_2,
          description_en: swimsuit.skill_des_en_2,
          description_cn: swimsuit.skill_des_cn_2,
          description_tw: swimsuit.skill_des_tw_2,
          description_kr: swimsuit.skill_des_kr_2,
        });
      }

      // Process skill 3
      if (swimsuit.skill_key_3) {
        skillsMap.set(swimsuit.skill_key_3, {
          skill_id: swimsuit.skill_id_3,
          skill_key: swimsuit.skill_key_3,
          name_jp: swimsuit.skill_name_jp_3,
          name_en: swimsuit.skill_name_en_3,
          name_cn: swimsuit.skill_name_cn_3,
          name_tw: swimsuit.skill_name_tw_3,
          name_kr: swimsuit.skill_name_kr_3,
          description: swimsuit.skill_des_3,
          description_jp: swimsuit.skill_des_jp_3,
          description_en: swimsuit.skill_des_en_3,
          description_cn: swimsuit.skill_des_cn_3,
          description_tw: swimsuit.skill_des_tw_3,
          description_kr: swimsuit.skill_des_kr_3,
        });
      }
    });

    // Convert map to array
    const skills = Array.from(skillsMap.values());

    logger.info(`Found ${skills.length} unique skills for character ${character.name_en || character.name_jp}`);
    res.success(skills);
  })
);

// GET /api/characters/:id - Get character by ID
// NOTE: This must be defined AFTER more specific routes like /:id/swimsuits and /:id/skills
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

export default router;