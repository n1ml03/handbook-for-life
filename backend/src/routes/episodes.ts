import { Router } from 'express';
import { validate, validateQuery, validateParams, schemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { EpisodeModel } from '../models/EpisodeModel';
import logger from '../config/logger';

const router = Router();
const episodeModel = new EpisodeModel();

// GET /api/episodes - Get all episodes with pagination and filters
router.get('/', 
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder, type, entityType, entityId, search } = req.query;
    
    let result;
    
    if (search) {
      // Handle search queries
      const searchFields = ['title_jp', 'title_en', 'title_cn', 'title_tw', 'title_kr', 'unique_key'];
      result = await episodeModel.search(searchFields, search as string, {
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    } else if (type) {
      result = await episodeModel.findByType(type as any, {
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    } else if (entityType && entityId) {
      result = await episodeModel.findByRelatedEntity(entityType as string, Number(entityId), {
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    } else {
      result = await episodeModel.findAll({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    }

    logger.info(`Retrieved ${result.data.length} episodes for page ${page}${search ? ` (search: "${search}")` : ''}`);

    res.paginated(result);
  })
);

// GET /api/episodes/key/:unique_key - Get episode by unique key
router.get('/key/:unique_key',
  validateParams(schemas.uniqueKeyParam),
  asyncHandler(async (req, res) => {
    const { unique_key } = req.params;

    const episode = await episodeModel.findByUniqueKey(unique_key);

    logger.info(`Retrieved episode: ${episode.title_en}`);

    res.success(episode);
  })
);

// GET /api/episodes/main-story - Get main story episodes
router.get('/main-story',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;
    
    const result = await episodeModel.getMainStoryEpisodes({
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Retrieved ${result.data.length} main story episodes`);

    res.paginated(result);
  })
);

// GET /api/episodes/character/:id - Get episodes for specific character
router.get('/character/:id',
  validateParams(schemas.idParam),
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;

    const result = await episodeModel.getCharacterEpisodes(id, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Retrieved ${result.data.length} episodes for character ${id}`);

    res.paginated(result);
  })
);

/**
 * @swagger
 * /api/episodes/search:
 *   get:
 *     tags: [Episodes]
 *     summary: Search episodes
 *     description: Search episodes by name or other criteria
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

    const searchFields = ['title_jp', 'title_en', 'title_cn', 'title_tw', 'title_kr', 'unique_key'];
    const result = await episodeModel.search(searchFields, q as string, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Search for "${q}" returned ${result.data.length} episodes`);

    res.paginated(result);
  })
);



/**
 * @swagger
 * /api/episodes/{id}:
 *   get:
 *     tags: [Episodes]
 *     summary: Get episode by ID
 *     description: Retrieve a specific episode by their ID
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

    const episode = await episodeModel.findById(id);

    logger.info(`Retrieved episode: ${episode.title_en}`);

    res.success(episode);
  })
);

// POST /api/episodes - Create new episode
router.post('/',
  validate(schemas.createEpisode),
  asyncHandler(async (req, res) => {
    const episode = await episodeModel.create(req.body);
    
    logger.info(`Created episode: ${episode.title_en}`);

    res.status(201).json({
      success: true,
      data: episode,
      message: 'Episode created successfully'
    });
  })
);

/**
 * @swagger
 * /api/episodes/{id}:
 *   put:
 *     tags: [Episodes]
 *     summary: Update episode
 *     description: Update an existing episode
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
  validate(schemas.updateEpisode),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    const episode = await episodeModel.update(id, req.body);

    logger.info(`Updated episode: ${episode.title_en}`);

    res.updated(episode, 'Episode updated successfully');
  })
);

/**
 * @swagger
 * /api/episodes/{id}:
 *   delete:
 *     tags: [Episodes]
 *     summary: Delete episode
 *     description: Delete an existing episode
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

    await episodeModel.delete(id);

    logger.info(`Deleted episode with ID: ${id}`);

    res.deleted('Episode deleted successfully');
  })
);

export default router; 