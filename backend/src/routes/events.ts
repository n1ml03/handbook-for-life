import { Router } from 'express';
import { validate, validateQuery, schemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { EventModel } from '../models/EventModel';
import logger from '../config/logger';

const router = Router();
const eventModel = new EventModel();

// GET /api/events - Get all events with pagination and filters
router.get('/', 
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder, type, active, upcoming } = req.query;
    
    let result;
    
    if (type) {
      result = await eventModel.findByType(type as any, {
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    } else if (active === 'true') {
      result = await eventModel.findActiveEvents({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    } else if (upcoming === 'true') {
      result = await eventModel.findUpcomingEvents({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    } else {
      result = await eventModel.findAll({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    }

    logger.info(`Retrieved ${result.data.length} events for page ${page}`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/events/key/:unique_key - Get event by unique key
router.get('/key/:unique_key',
  asyncHandler(async (req, res) => {
    const { unique_key } = req.params;
    
    const event = await eventModel.findByUniqueKey(unique_key);
    
    logger.info(`Retrieved event: ${event.name_en}`);

    res.json({
      success: true,
      data: event
    });
  })
);

// GET /api/events/active - Get active events
router.get('/active',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;
    
    const result = await eventModel.findActiveEvents({
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Retrieved ${result.data.length} active events`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/events/upcoming - Get upcoming events
router.get('/upcoming',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;
    
    const result = await eventModel.findUpcomingEvents({
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Retrieved ${result.data.length} upcoming events`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/events/search - Search events
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

    const result = await eventModel.search(q as string, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Search for "${q}" returned ${result.data.length} events`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/events/:id - Get event by ID
router.get('/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
      return;
    }

    const event = await eventModel.findById(id);

    logger.info(`Retrieved event: ${event.name_en}`);

    res.json({
      success: true,
      data: event
    });
  })
);

// POST /api/events - Create new event
router.post('/',
  validate(schemas.createEvent),
  asyncHandler(async (req, res) => {
    const event = await eventModel.create(req.body);
    
    logger.info(`Created event: ${event.name_en}`);

    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully'
    });
  })
);

// PUT /api/events/:id - Update event
router.put('/:id',
  validate(schemas.updateEvent),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
      return;
    }

    const event = await eventModel.update(id, req.body);

    logger.info(`Updated event: ${event.name_en}`);

    res.json({
      success: true,
      data: event,
      message: 'Event updated successfully'
    });
  })
);

// DELETE /api/events/:id - Delete event
router.delete('/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid event ID'
      });
      return;
    }

    await eventModel.delete(id);

    logger.info(`Deleted event with ID: ${id}`);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  })
);

export default router; 