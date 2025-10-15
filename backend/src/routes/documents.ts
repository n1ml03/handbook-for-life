import { Router } from 'express';
import { validate, validateQuery, asyncHandler, AppError } from '../middleware';
import { schemas } from '../utils/ValidationSchemas';
import { DocumentModel } from '../models/DocumentModel';
import logger from '../config/logger';
import appConfig from '../config/app';

const router = Router();
const documentModel = new DocumentModel();

// GET /api/documents - Get all documents with pagination and filters
router.get('/',
  validateQuery(schemas.documentSchemas.query),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = appConfig.pagination.defaultLimit, sortBy, sortOrder, category, document_type } = req.query;

    let result;

    // Handle different query types with optimized queries
    if (document_type) {
      result = await documentModel.findByType(document_type as string, {
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
      });
    } else if (category) {
      result = await documentModel.findByType(category as string, {
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
      });
    } else {
      result = await documentModel.findAll({
        page: Number(page),
        limit: Number(limit),
        sortBy: sortBy as string,
        sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
      });
    }

    logger.info(`Retrieved ${result.data.length} documents for page ${page}`, {
      category,
      document_type,
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

    const document = await documentModel.findByKey(unique_key);

    logger.info(`Retrieved document: ${document.title_en}`, {
      uniqueKey: unique_key,
      documentId: document.id,
      requestId: (req as any).id
    });

    res.success(document);
  })
);

// GET /api/documents/:id/pdf - Get PDF binary data
router.get('/:id/pdf',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (isNaN(numericId) || numericId <= 0) {
      throw new AppError('Invalid document ID', 400);
    }

    const document = await documentModel.findById(numericId);

    if (!document.has_pdf_file || !document.pdf_data_binary) {
      throw new AppError('PDF not found for this document', 404);
    }

    logger.info(`Serving PDF for document: ${document.title_en}`, {
      documentId: document.id,
      pdfSize: document.pdf_size,
      requestId: (req as any).id
    });

    // Set proper headers for PDF binary response
    res.setHeader('Content-Type', document.pdf_mime_type || 'application/pdf');
    res.setHeader('Content-Length', document.pdf_size || document.pdf_data_binary.length);
    res.setHeader('Content-Disposition', `inline; filename="${document.pdf_filename || `document-${document.id}.pdf`}"`);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
    res.setHeader('Accept-Ranges', 'bytes'); // Enable range requests for streaming

    // Send binary data directly
    res.send(document.pdf_data_binary);
  })
);



// GET /api/documents/categories/:category - Get documents by category
router.get('/categories/:category',
  validateQuery(schemas.documentSchemas.query),
  asyncHandler(async (req, res) => {
    const { category } = req.params;
    const { page = 1, limit = appConfig.pagination.defaultLimit, sortBy, sortOrder } = req.query;

    if (!category?.trim()) {
      throw new AppError('Category is required', 400);
    }

    const result = await documentModel.findByType(category, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
    });

    logger.info(`Retrieved ${result.data.length} documents for category: ${category}`, {
      totalItems: result.pagination.total,
      requestId: (req as any).id
    });

    res.paginated(result);
  })
);

// GET /api/documents/types/:document_type - Get documents by type
router.get('/types/:document_type',
  validateQuery(schemas.documentSchemas.query),
  asyncHandler(async (req, res) => {
    const { document_type } = req.params;
    const { page = 1, limit = appConfig.pagination.defaultLimit, sortBy, sortOrder } = req.query;

    if (!document_type?.trim()) {
      throw new AppError('Document type is required', 400);
    }

    const result = await documentModel.findByType(document_type, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
    });

    logger.info(`Retrieved ${result.data.length} documents for type: ${document_type}`, {
      totalItems: result.pagination.total,
      requestId: (req as any).id
    });

    res.paginated(result);
  })
);

router.get('/search',
  validateQuery(schemas.documentSchemas.query),
  asyncHandler(async (req, res) => {
    const { q, page = 1, limit = appConfig.pagination.defaultLimit, sortBy, sortOrder } = req.query;

    if (!q || typeof q !== 'string' || !q.trim()) {
      throw new AppError('Search query is required', 400);
    }

    const sanitizedQuery = q.trim();

    if (sanitizedQuery.length < 2) {
      throw new AppError('Search query must be at least 2 characters long', 400);
    }

    const searchFields = ['title_en', 'summary_en', 'unique_key'];
    const result = await documentModel.search(searchFields, sanitizedQuery, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: (sortOrder as string)?.toUpperCase() as 'ASC' | 'DESC'
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
    const stats = await documentModel.getStats();

    logger.info('Retrieved document statistics', {
      total: stats.total,
      categories: Object.keys(stats.byCategory).length,
      requestId: (req as any).id
    });

    res.success(stats);
  })
);

router.get('/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate ID format
    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) {
      throw new AppError('Invalid document ID', 400);
    }

    const document = await documentModel.findById(numericId);
    
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

    const document = await documentModel.create(documentData);

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

router.put('/:id',
  validate(schemas.documentSchemas.update),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) {
      throw new AppError('Invalid document ID', 400);
    }

    const document = await documentModel.update(numericId, updates);

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



router.delete('/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) {
      throw new AppError('Invalid document ID', 400);
    }

    await documentModel.delete(numericId);

    logger.info('Deleted document', {
      documentId: numericId,
      requestId: (req as any).id
    });

    res.deleted('Document deleted successfully');
  })
);

export default router; 