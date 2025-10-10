import { Router } from 'express';
import { validate, validateQuery, validateParams, asyncHandler } from '../middleware/middleware';
import { schemas } from '../utils/ValidationSchemas';
import { EpisodeModel } from '../models/EpisodeModel';
import logger from '../config/logger';

const router = Router();
const episodeModel = new EpisodeModel();

// GET /api/episodes - Get all episodes with pagination
// Note: Filters removed (type, entityType, entityId, search not yet implemented in simplified BaseModel)
// Note: Field names changed from title_* to name_*
router.get('/',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;

    const result = await episodeModel.findAll({
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
    });

    logger.info(`Retrieved ${result.data.length} episodes for page ${page}`);

    res.paginated(result);
  })
);

// GET /api/episodes/key/:unique_key - Get episode by unique key
router.get('/key/:unique_key',
  validateParams(schemas.uniqueKeyParam),
  asyncHandler(async (req, res) => {
    const { unique_key } = req.params;

    const episode = await episodeModel.findByKey(unique_key);

    logger.info(`Retrieved episode: ${episode.name_en}`); // Changed from title_en to name_en

    res.success(episode);
  })
);

// GET /api/episodes/main-story - Get main story episodes
router.get('/main-story',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;

    const result = await episodeModel.findByType('MAIN', {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
    });

    logger.info(`Found ${result.data.length} main story episodes`);
    res.paginated(result);
  })
);

// TODO: Character episodes filter not yet implemented (related_entity fields removed)
// GET /api/episodes/character/:id - Get episodes for specific character
router.get('/character/:id',
  validateParams(schemas.idParam),
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    logger.info(`Character episodes endpoint not yet implemented`);
    res.status(501).error('Character episodes endpoint not yet implemented', 501);
  })
);

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

    const result = await episodeModel.searchMultiLanguage(q as string, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
    });

    logger.info(`Search for "${q}" returned ${result.data.length} episodes`);

    res.paginated(result);
  })
);



router.get('/:id',
  validateParams(schemas.idParam),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    const episode = await episodeModel.findById(id);

    logger.info(`Retrieved episode: ${episode.name_en}`); // Changed from title_en to name_en

    res.success(episode);
  })
);

// POST /api/episodes - Create new episode
router.post('/',
  validate(schemas.createEpisode),
  asyncHandler(async (req, res) => {
    const episode = await episodeModel.create(req.body);

    logger.info(`Created episode: ${episode.name_en}`); // Changed from title_en to name_en

    res.status(201).json({
      success: true,
      data: episode,
      message: 'Episode created successfully'
    });
  })
);

router.put('/:id',
  validateParams(schemas.idParam),
  validate(schemas.updateEpisode),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    const episode = await episodeModel.update(id, req.body);

    logger.info(`Updated episode: ${episode.name_en}`); // Changed from title_en to name_en

    res.updated(episode, 'Episode updated successfully');
  })
);

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