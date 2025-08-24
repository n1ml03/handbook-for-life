import { Router } from 'express';
import { validate, validateQuery, validateParams, schemas } from '../middleware/validation';
import { characterSchemas } from '../utils/ValidationSchemas';
import { asyncHandler } from '../middleware/errorHandler';
import { characterService } from '../services';
import logger from '../config/logger';

const router = Router();

/**
 * @swagger
 * /api/characters:
 *   get:
 *     tags: [Characters]
 *     summary: Get all characters with pagination
 *     description: Retrieve a paginated list of all characters
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *     responses:
 *       200:
 *         description: Characters retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Character'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
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

/**
 * @swagger
 * /api/characters/key/{unique_key}:
 *   get:
 *     tags: [Characters]
 *     summary: Get character by unique key
 *     description: Retrieve a specific character by their unique key
 *     parameters:
 *       - $ref: '#/components/parameters/UniqueKeyParam'
 *     responses:
 *       200:
 *         description: Character retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Character'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/key/:unique_key',
  validateParams(schemas.uniqueKeyParam),
  asyncHandler(async (req, res) => {
    const { unique_key } = req.params;
    
    const character = await characterService.getCharacterByKey(unique_key);
    
    logger.info(`Retrieved character: ${character.name_en}`);
    res.success(character);
  })
);

/**
 * @swagger
 * /api/characters/birthdays:
 *   get:
 *     tags: [Characters]
 *     summary: Get characters with upcoming birthdays
 *     description: Retrieve characters whose birthdays are within the specified number of days
 *     parameters:
 *       - name: days
 *         in: query
 *         description: Number of days to look ahead for birthdays
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 7
 *         example: 30
 *     responses:
 *       200:
 *         description: Characters with upcoming birthdays retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Character'
 *                           - type: object
 *                             properties:
 *                               days_until_birthday:
 *                                 type: integer
 *                                 description: Number of days until birthday
 *             example:
 *               success: true
 *               data: [
 *                 {
 *                   id: 1,
 *                   unique_key: 'kasumi',
 *                   name_en: 'Kasumi',
 *                   birthday: '1999-02-17',
 *                   days_until_birthday: 5
 *                 },
 *                 {
 *                   id: 3,
 *                   unique_key: 'ayane',
 *                   name_en: 'Ayane',
 *                   birthday: '1998-09-07',
 *                   days_until_birthday: 12
 *                 }
 *               ]
 *               message: 'Found 2 characters with birthdays in the next 30 days'
 *               timestamp: '2024-06-28T10:30:00.000Z'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/birthdays',
  asyncHandler(async (req, res) => {
    const { days = 7 } = req.query;
    
    const characters = await characterService.getUpcomingBirthdays(Number(days));
    
    logger.info(`Retrieved ${characters.length} characters with upcoming birthdays`);
    res.success(characters);
  })
);

/**
 * @swagger
 * /api/characters/search:
 *   get:
 *     tags: [Characters]
 *     summary: Search characters
 *     description: Search characters by name or other criteria
 *     parameters:
 *       - $ref: '#/components/parameters/SearchParam'
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Character'
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

/**
 * @swagger
 * /api/characters/{id}:
 *   get:
 *     tags: [Characters]
 *     summary: Get character by ID
 *     description: Retrieve a specific character by their ID
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Character retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Character'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id',
  validateParams(schemas.idParam),
  asyncHandler(async (req, res) => {
    const character = await characterService.getCharacterById(req.params.id);
    
    logger.info(`Retrieved character: ${character.name_en}`);
    res.success(character);
  })
);

/**
 * @swagger
 * /api/characters:
 *   post:
 *     tags: [Characters]
 *     summary: Create new character
 *     description: Create a new character with provided details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [unique_key, name_jp, name_en, is_active]
 *             properties:
 *               unique_key:
 *                 type: string
 *                 description: Character unique key
 *               name_jp:
 *                 type: string
 *                 description: Character name in Japanese
 *               name_en:
 *                 type: string
 *                 description: Character name in English
 *               name_cn:
 *                 type: string
 *                 description: Character name in Chinese
 *               name_tw:
 *                 type: string
 *                 description: Character name in Traditional Chinese
 *               name_kr:
 *                 type: string
 *                 description: Character name in Korean
 *               birthday:
 *                 type: string
 *                 format: date
 *                 description: Character birthday
 *               height:
 *                 type: number
 *                 description: Character height in cm
 *               measurements:
 *                 type: string
 *                 description: Character measurements
 *               blood_type:
 *                 type: string
 *                 description: Character blood type
 *               voice_actor_jp:
 *                 type: string
 *                 description: Japanese voice actor name
 *               profile_image_url:
 *                 type: string
 *                 format: uri
 *                 description: Profile image URL
 *               is_active:
 *                 type: boolean
 *                 description: Whether character is active
 *     responses:
 *       201:
 *         description: Character created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Character'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/',
  validate(schemas.createCharacter),
  asyncHandler(async (req, res) => {
    const character = await characterService.createCharacter(req.body);
    
    logger.info(`Created character: ${character.name_en}`);
    res.created(character, 'Character created successfully', `/api/characters/${character.id}`);
  })
);

/**
 * @swagger
 * /api/characters/batch:
 *   post:
 *     tags: [Characters]
 *     summary: Create multiple characters in batch
 *     description: Create multiple characters at once. This is useful for bulk imports or initial data setup.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required: [unique_key, name_jp, name_en, is_active]
 *               properties:
 *                 unique_key:
 *                   type: string
 *                   description: Character unique key
 *                 name_jp:
 *                   type: string
 *                   description: Character name in Japanese
 *                 name_en:
 *                   type: string
 *                   description: Character name in English
 *                 name_cn:
 *                   type: string
 *                   description: Character name in Chinese
 *                 name_tw:
 *                   type: string
 *                   description: Character name in Traditional Chinese
 *                 name_kr:
 *                   type: string
 *                   description: Character name in Korean
 *                 birthday:
 *                   type: string
 *                   format: date
 *                   description: Character birthday
 *                 height:
 *                   type: number
 *                   description: Character height in cm
 *                 is_active:
 *                   type: boolean
 *                   description: Whether character is active
 *           example:
 *             - unique_key: 'marie_rose'
 *               name_jp: 'マリー・ローズ'
 *               name_en: 'Marie Rose'
 *               name_cn: '玛丽萝丝'
 *               name_tw: '瑪莉蘿絲'
 *               name_kr: '마리 로즈'
 *               birthday: '2000-05-02'
 *               height: 147
 *               is_active: true
 *             - unique_key: 'honoka'
 *               name_jp: 'ほのか'
 *               name_en: 'Honoka'
 *               birthday: '1998-11-15'
 *               height: 162
 *               is_active: true
 *     responses:
 *       201:
 *         description: Characters created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/BatchCreateResponse'
 *             example:
 *               success: true
 *               data:
 *                 created: 2
 *                 failed: 0
 *                 errors: []
 *               message: 'Batch character creation completed'
 *               timestamp: '2024-06-28T10:30:00.000Z'
 *       400:
 *         description: Validation error or batch operation failed
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiError'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/BatchCreateResponse'
 *             example:
 *               success: false
 *               error: 'Batch creation completed with errors'
 *               data:
 *                 created: 1
 *                 failed: 1
 *                 errors: [
 *                   {
 *                     index: 1,
 *                     error: 'Character with unique_key already exists'
 *                   }
 *                 ]
 *               timestamp: '2024-06-28T10:30:00.000Z'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
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

/**
 * @swagger
 * /api/characters/{id}/swimsuits:
 *   get:
 *     tags: [Characters]
 *     summary: Get character swimsuits
 *     description: Retrieve a paginated list of swimsuits for a specific character
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *     responses:
 *       200:
 *         description: Character swimsuits retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Swimsuit'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
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

/**
 * @swagger
 * /api/characters/{id}/skills:
 *   get:
 *     tags: [Characters]
 *     summary: Get character skills
 *     description: Retrieve a paginated list of skills for a specific character
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *     responses:
 *       200:
 *         description: Character skills retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Skill'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// GET /api/characters/:id/skills - Get character skills
router.get('/:id/skills',
  validateParams(schemas.idParam),
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;

    const result = await characterService.getCharacterSkills(req.params.id, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Retrieved ${result.data.length} skills for character ${req.params.id}`);
    res.paginated(result);
  })
);

export default router;