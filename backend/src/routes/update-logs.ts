import { Router } from 'express';
import { validate, validateQuery, schemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { UpdateLogService } from '../services/UpdateLogService';
import logger from '../config/logger';

const router = Router();
const updateLogService = new UpdateLogService();

// GET /api/update-logs - Get all update logs with optional pagination and filtering
router.get('/', 
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      sortBy = 'date',
      sortOrder = 'desc',
      published
    } = req.query;

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    };

    let result;
    if (published === 'true') {
      result = await updateLogService.getPublishedUpdateLogs(options);
    } else {
      result = await updateLogService.getUpdateLogs(options);
    }

    logger.info(`Retrieved ${result.data.length} update logs for page ${page}`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/update-logs/published - Get only published update logs
router.get('/published', 
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const {
      page = 1,
      limit = 10,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    };

    const result = await updateLogService.getPublishedUpdateLogs(options);
    
    logger.info(`Retrieved ${result.data.length} published update logs`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/update-logs/:id - Get a specific update log
router.get('/:id', 
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateLog = await updateLogService.getUpdateLogById(id);
    
    logger.info(`Retrieved update log: ${updateLog.title}`);

    res.json({
      success: true,
      data: updateLog
    });
  })
);

// POST /api/update-logs - Create a new update log
router.post('/', 
  validate(schemas.createUpdateLog),
  asyncHandler(async (req, res) => {
    const {
      version,
      title,
      content,
      description,
      date,
      tags,
      is_published,
      technical_details,
      bug_fixes,
      screenshots,
      metrics
    } = req.body;

    if (!version || !title || !content || !date) {
      res.status(400).json({
        success: false,
        message: 'Version, title, content, and date are required'
      });
      return;
    }

    const newUpdateLog = {
      version,
      title,
      content,
      description: description || '',
      date: new Date(date),
      tags: tags || [],
      is_published: is_published !== undefined ? is_published : true,
      technical_details: technical_details || [],
      bug_fixes: bug_fixes || [],
      screenshots: screenshots || [],
      metrics: metrics || {
        performanceImprovement: '0%',
        userSatisfaction: '0%',
        bugReports: 0
      }
    };

    const updateLog = await updateLogService.createUpdateLog(newUpdateLog);
    
    logger.info(`Created update log: ${updateLog.title}`);

    res.status(201).json({
      success: true,
      data: updateLog,
      message: 'Update log created successfully'
    });
  })
);

// PUT /api/update-logs/:id - Update an update log
router.put('/:id', 
  validate(schemas.updateUpdateLog),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Convert date string to Date object if provided
    if (updates.date) {
      updates.date = new Date(updates.date);
    }

    const updateLog = await updateLogService.updateUpdateLog(id, updates);
    
    logger.info(`Updated update log: ${updateLog.title}`);

    res.json({
      success: true,
      data: updateLog,
      message: 'Update log updated successfully'
    });
  })
);

// DELETE /api/update-logs/:id - Delete an update log
router.delete('/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    await updateLogService.deleteUpdateLog(id);

    logger.info(`Deleted update log with ID: ${id}`);

    res.json({
      success: true,
      message: 'Update log deleted successfully'
    });
  })
);

export default router;