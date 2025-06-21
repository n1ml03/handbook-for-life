import { Router } from 'express';
import { validate, validateQuery, schemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { EpisodeModel } from '../models/EpisodeModel';
import logger from '../config/logger';

const router = Router();
const episodeModel = new EpisodeModel();

// GET /api/episodes - Get all episodes with pagination and filters
router.get('/', 
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder, type, entityType, entityId } = req.query;
    
    let result;
    
    if (type) {
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

    logger.info(`Retrieved ${result.data.length} episodes for page ${page}`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/episodes/key/:unique_key - Get episode by unique key
router.get('/key/:unique_key',
  asyncHandler(async (req, res) => {
    const { unique_key } = req.params;
    
    const episode = await episodeModel.findByUniqueKey(unique_key);
    
    logger.info(`Retrieved episode: ${episode.title_en}`);

    res.json({
      success: true,
      data: episode
    });
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

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/episodes/character/:character_id - Get episodes for specific character
router.get('/character/:character_id',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const character_id = Number(req.params.character_id);
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;
    
    if (isNaN(character_id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid character ID'
      });
    }
    
    const result = await episodeModel.getCharacterEpisodes(character_id, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Retrieved ${result.data.length} episodes for character ${character_id}`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/episodes/search - Search episodes
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

    const result = await episodeModel.search(q as string, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Search for "${q}" returned ${result.data.length} episodes`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/episodes/:id - Get episode by ID
router.get('/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid episode ID'
      });
    }
    
    const episode = await episodeModel.findById(id);
    
    logger.info(`Retrieved episode: ${episode.title_en}`);

    res.json({
      success: true,
      data: episode
    });
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

// PUT /api/episodes/:id - Update episode
router.put('/:id',
  validate(schemas.updateEpisode),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid episode ID'
      });
    }
    
    const episode = await episodeModel.update(id, req.body);
    
    logger.info(`Updated episode: ${episode.title_en}`);

    res.json({
      success: true,
      data: episode,
      message: 'Episode updated successfully'
    });
  })
);

// DELETE /api/episodes/:id - Delete episode
router.delete('/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid episode ID'
      });
    }
    
    await episodeModel.delete(id);
    
    logger.info(`Deleted episode with ID: ${id}`);

    res.json({
      success: true,
      message: 'Episode deleted successfully'
    });
  })
);

export default router; 