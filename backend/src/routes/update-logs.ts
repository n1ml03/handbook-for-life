import { Router } from 'express';
import { validate, validateQuery, asyncHandler } from '../middleware';
import { schemas } from '../utils/ValidationSchemas';
import { UpdateLogModel } from '../models/UpdateLogModel';
import logger from '../config/logger';

const router = Router();
const updateLogModel = new UpdateLogModel();

// GET /api/update-logs - Get all update logs with optional pagination and filtering
router.get('/', 
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
      sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
    };

    const result = await updateLogModel.findAll(options);

    logger.info(`Retrieved ${result.data.length} update logs for page ${page}`);

    res.paginated(result);
  })
);



// GET /api/update-logs/:id - Get a specific update log
router.get('/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateLog = await updateLogModel.findById(parseInt(id));

    logger.info(`Retrieved update log: ${updateLog.title}`);

    res.success(updateLog);
  })
);

// POST /api/update-logs - Create a new update log
router.post('/',
  validate(schemas.updateLogSchemas.create),
  asyncHandler(async (req, res) => {
    const {
      version,
      title,
      content,
      description,
      date,
      tags,
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
      technical_details: technical_details || [],
      bug_fixes: bug_fixes || [],
      screenshots: screenshots || [],
      metrics: metrics || {
        performanceImprovement: '0%',
        userSatisfaction: '0%',
        bugReports: 0
      }
    };

    const updateLog = await updateLogModel.create(newUpdateLog);

    logger.info(`Created update log: ${updateLog.title}`);

    res.status(201).json({
      success: true,
      data: updateLog,
      message: 'Update log created successfully',
      timestamp: new Date().toISOString()
    });
  })
);

router.put('/:id',
  validate(schemas.updateLogSchemas.update),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // Convert date string to Date object if provided
    if (updates.date) {
      updates.date = new Date(updates.date);
    }

    const updateLog = await updateLogModel.update(parseInt(id), updates);

    logger.info(`Updated update log: ${updateLog.title}`);

    res.updated(updateLog, 'Update log updated successfully');
  })
);

router.delete('/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    await updateLogModel.delete(parseInt(id));

    logger.info(`Deleted update log with ID: ${id}`);

    res.deleted('Update log deleted successfully');
  })
);

export default router;