import { Router } from 'express';
import { validate, validateQuery } from '../middleware/validation';
import { schemas } from '../utils/ValidationSchemas';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { DocumentService } from '../services/DocumentService';
import logger from '../config/logger';

const router = Router();
const documentService = new DocumentService();

// GET /api/documents - Get all documents with pagination and filters
router.get('/', 
  validateQuery(schemas.documentSchemas.query),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder, category } = req.query;
    
    let result;
    
    // Handle different query types with optimized queries
    if (category) {
      result = await documentService.getDocumentsByCategory(category as string, {
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
      totalItems: result.pagination.total,
      requestId: (req as any).id
    });

    res.paginated(result);
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

    res.success(document);
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

    res.paginated(result);
  })
);

/**
 * @swagger
 * /api/documents/search:
 *   get:
 *     tags: [Documents]
 *     summary: Search documents
 *     description: Search documents by name or other criteria
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

    res.paginated(result);
  })
);

// GET /api/documents/stats/summary - Get document statistics
router.get('/stats/summary',
  asyncHandler(async (req, res) => {
    const stats = await documentService.getDocumentStats();

    logger.info('Retrieved document statistics', {
      total: stats.total,
      categories: Object.keys(stats.byCategory).length,
      requestId: (req as any).id
    });

    res.success(stats);
  })
);

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     tags: [Documents]
 *     summary: Get document by ID
 *     description: Retrieve a specific document by their ID
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

    res.success(document);
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

/**
 * @swagger
 * /api/documents/{id}:
 *   put:
 *     tags: [Documents]
 *     summary: Update document
 *     description: Update an existing document
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

    res.updated(document, 'Document updated successfully');
  })
);



/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     tags: [Documents]
 *     summary: Delete document
 *     description: Delete an existing document
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

    res.deleted('Document deleted successfully');
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