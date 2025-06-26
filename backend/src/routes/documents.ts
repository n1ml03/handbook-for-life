import { Router } from 'express';
import { validate, validateQuery, schemas } from '../utils/ValidationSchemas';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { DocumentService } from '../services/DocumentService';
import logger from '../config/logger';

const router = Router();
const documentService = new DocumentService();

// GET /api/documents - Get all documents with pagination and filters
router.get('/', 
  validateQuery(schemas.documentSchemas.query),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder, published, category } = req.query;
    
    let result;
    
    // Handle different query types with optimized queries
    if (category) {
      result = await documentService.getDocumentsByCategory(category as string, {
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    } else if (published === 'true') {
      result = await documentService.getPublishedDocuments({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    } else {
      result = await documentService.getDocuments({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc'
      });
    }

    logger.info(`Retrieved ${result.data.length} documents for page ${page}`, {
      category,
      published,
      totalItems: result.pagination.total,
      requestId: (req as any).id
    });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    });
  })
);

// GET /api/documents/key/:unique_key - Get document by unique key
router.get('/key/:unique_key',
  asyncHandler(async (req, res) => {
    const { unique_key } = req.params;
    
    if (!unique_key?.trim()) {
      throw new AppError('Unique key is required', 400);
    }
    
    const document = await documentService.getDocumentByKey(unique_key);
    
    logger.info(`Retrieved document: ${document.title_en}`, {
      uniqueKey: unique_key,
      documentId: document.id,
      requestId: (req as any).id
    });

    res.json({
      success: true,
      data: document,
      timestamp: new Date().toISOString()
    });
  })
);

// GET /api/documents/published - Get only published documents
router.get('/published',
  validateQuery(schemas.documentSchemas.query),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;
    
    const result = await documentService.getPublishedDocuments({
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Retrieved ${result.data.length} published documents`, {
      totalItems: result.pagination.total,
      requestId: (req as any).id
    });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    });
  })
);

// GET /api/documents/categories/:category - Get documents by category
router.get('/categories/:category',
  validateQuery(schemas.documentSchemas.query),
  asyncHandler(async (req, res) => {
    const { category } = req.params;
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;
    
    if (!category?.trim()) {
      throw new AppError('Category is required', 400);
    }
    
    const result = await documentService.getDocumentsByCategory(category, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Retrieved ${result.data.length} documents for category: ${category}`, {
      totalItems: result.pagination.total,
      requestId: (req as any).id
    });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    });
  })
);

// GET /api/documents/search - Search documents
router.get('/search',
  validateQuery(schemas.documentSchemas.query),
  asyncHandler(async (req, res) => {
    const { q, page = 1, limit = 10, sortBy, sortOrder } = req.query;
    
    if (!q || typeof q !== 'string' || !q.trim()) {
      throw new AppError('Search query is required', 400);
    }

    const sanitizedQuery = q.trim();
    
    if (sanitizedQuery.length < 2) {
      throw new AppError('Search query must be at least 2 characters long', 400);
    }

    const result = await documentService.searchDocuments(sanitizedQuery, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Search for "${sanitizedQuery}" returned ${result.data.length} documents`, {
      query: sanitizedQuery,
      totalResults: result.pagination.total,
      requestId: (req as any).id
    });

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    });
  })
);

// GET /api/documents/stats/summary - Get document statistics
router.get('/stats/summary',
  asyncHandler(async (req, res) => {
    const stats = await documentService.getDocumentStats();

    logger.info('Retrieved document statistics', {
      total: stats.total,
      published: stats.published,
      categories: Object.keys(stats.byCategory).length,
      requestId: (req as any).id
    });

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  })
);

// GET /api/documents/:id - Get document by ID
router.get('/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    // Validate ID format
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) {
      throw new AppError('Invalid document ID', 400);
    }
    
    const document = await documentService.getDocumentById(numericId);
    
    logger.info(`Retrieved document: ${document.title_en}`, {
      documentId: document.id,
      requestId: (req as any).id
    });

    res.json({
      success: true,
      data: document,
      timestamp: new Date().toISOString()
    });
  })
);

// POST /api/documents - Create new document
router.post('/',
  validate(schemas.documentSchemas.create),
  asyncHandler(async (req, res) => {
    const documentData = req.body;
    
    const document = await documentService.createDocument(documentData);
    
    logger.info('Created new document', {
      documentId: document.id,
      uniqueKey: document.unique_key,
      title: document.title_en,
      requestId: (req as any).id
    });

    res.status(201).json({
      success: true,
      data: document,
      message: 'Document created successfully',
      timestamp: new Date().toISOString()
    });
  })
);

// PUT /api/documents/:id - Update document
router.put('/:id',
  validate(schemas.documentSchemas.update),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) {
      throw new AppError('Invalid document ID', 400);
    }
    
    const document = await documentService.updateDocument(numericId, updates);
    
    logger.info('Updated document', {
      documentId: document.id,
      uniqueKey: document.unique_key,
      title: document.title_en,
      updatedFields: Object.keys(updates),
      requestId: (req as any).id
    });

    res.json({
      success: true,
      data: document,
      message: 'Document updated successfully',
      timestamp: new Date().toISOString()
    });
  })
);

// PATCH /api/documents/:id/publish - Toggle publish status
router.patch('/:id/publish',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) {
      throw new AppError('Invalid document ID', 400);
    }
    
    const document = await documentService.togglePublishStatus(numericId);
    
    logger.info('Toggled document publish status', {
      documentId: document.id,
      newStatus: document.is_published ? 'published' : 'unpublished',
      title: document.title_en,
      requestId: (req as any).id
    });

    res.json({
      success: true,
      data: document,
      message: `Document ${document.is_published ? 'published' : 'unpublished'} successfully`,
      timestamp: new Date().toISOString()
    });
  })
);

// DELETE /api/documents/:id - Delete document
router.delete('/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) {
      throw new AppError('Invalid document ID', 400);
    }
    
    await documentService.deleteDocument(numericId);
    
    logger.info('Deleted document', {
      documentId: numericId,
      requestId: (req as any).id
    });

    res.json({
      success: true,
      message: 'Document deleted successfully',
      timestamp: new Date().toISOString()
    });
  })
);

// GET /api/documents/health - Service health check
router.get('/health',
  asyncHandler(async (req, res) => {
    const health = await documentService.healthCheck();
    
    const statusCode = health.isHealthy ? 200 : 503;
    
    res.status(statusCode).json({
      success: health.isHealthy,
      data: health,
      timestamp: new Date().toISOString()
    });
  })
);

export default router; 