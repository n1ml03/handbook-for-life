import { Router } from 'express';
import { validate, validateQuery, schemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { DocumentModel } from '../models/DocumentModel';
import logger from '../config/logger';

const router = Router();
const documentModel = new DocumentModel();

// GET /api/documents - Get all documents with pagination and filters
router.get('/', 
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder, published } = req.query;
    
    let result;
    
    if (published === 'true') {
      result = await documentModel.findPublished({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    } else {
      result = await documentModel.findAll({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    }

    logger.info(`Retrieved ${result.data.length} documents for page ${page}`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/documents/key/:unique_key - Get document by unique key
router.get('/key/:unique_key',
  asyncHandler(async (req, res) => {
    const { unique_key } = req.params;
    
    const document = await documentModel.findByKey(unique_key);
    
    logger.info(`Retrieved document: ${document.title_en}`);

    res.json({
      success: true,
      data: document
    });
  })
);

// GET /api/documents/published - Get only published documents
router.get('/published',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;
    
    const result = await documentModel.findPublished({
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Retrieved ${result.data.length} published documents`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/documents/search - Search documents
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

    const result = await documentModel.search(q as string, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Search for "${q}" returned ${result.data.length} documents`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/documents/:id - Get document by ID
router.get('/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid document ID'
      });
      return;
    }
    
    const document = await documentModel.findById(id);
    
    logger.info(`Retrieved document: ${document.title_en}`);

    res.json({
      success: true,
      data: document
    });
  })
);

// POST /api/documents - Create new document
router.post('/',
  validate(schemas.createDocument),
  asyncHandler(async (req, res) => {
    const document = await documentModel.create(req.body);
    
    logger.info(`Created document: ${document.title_en}`);

    res.status(201).json({
      success: true,
      data: document,
      message: 'Document created successfully'
    });
  })
);

// PUT /api/documents/:id - Update document
router.put('/:id',
  validate(schemas.updateDocument),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid document ID'
      });
      return;
    }
    
    const document = await documentModel.update(id, req.body);
    
    logger.info(`Updated document: ${document.title_en}`);

    res.json({
      success: true,
      data: document,
      message: 'Document updated successfully'
    });
  })
);

// PUT /api/documents/:id/toggle-publish - Toggle publish status
router.put('/:id/toggle-publish',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid document ID'
      });
      return;
    }
    
    const document = await documentModel.togglePublishStatus(id);
    
    logger.info(`Toggled publish status for document: ${document.title_en} - ${document.is_published ? 'Published' : 'Unpublished'}`);

    res.json({
      success: true,
      data: document,
      message: `Document ${document.is_published ? 'published' : 'unpublished'} successfully`
    });
  })
);

// DELETE /api/documents/:id - Delete document
router.delete('/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid document ID'
      });
      return;
    }
    
    await documentModel.delete(id);
    
    logger.info(`Deleted document with ID: ${id}`);

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  })
);

export default router; 