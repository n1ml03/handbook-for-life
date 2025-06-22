import { Router } from 'express';
import { validate, validateQuery, schemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { ShopService } from '../services/ShopService';
import logger from '../config/logger';

const router = Router();
const shopService = new ShopService();

// GET /api/shop-listings - Get all shop listings with pagination
router.get('/', 
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;
    
    const result = await shopService.getAllShopListings({
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Retrieved ${result.data.length} shop listings for page ${page}`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/shop-listings/active - Get currently active shop listings
router.get('/active',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;
    
    const result = await shopService.getActiveShopListings({
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Retrieved ${result.data.length} active shop listings`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/shop-listings/type/:shopType - Get shop listings by type
router.get('/type/:shopType',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const { shopType } = req.params;
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;
    
    const result = await shopService.getShopListingsByType(shopType as any, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Retrieved ${result.data.length} shop listings for type ${shopType}`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/shop-listings/item/:itemId - Get shop listings by item
router.get('/item/:itemId',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const itemId = Number(req.params.itemId);
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;
    
    if (isNaN(itemId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid item ID'
      });
      return;
    }

    const result = await shopService.getShopListingsByItem(itemId, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Retrieved ${result.data.length} shop listings for item ${itemId}`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/shop-listings/currency/:currencyId - Get shop listings by currency
router.get('/currency/:currencyId',
  validateQuery(schemas.pagination),
  asyncHandler(async (req, res) => {
    const currencyId = Number(req.params.currencyId);
    const { page = 1, limit = 10, sortBy, sortOrder } = req.query;

    if (isNaN(currencyId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid currency ID'
      });
      return;
    }
    
    const result = await shopService.getShopListingsByCurrency(currencyId, {
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    });

    logger.info(`Retrieved ${result.data.length} shop listings for currency ${currencyId}`);

    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  })
);

// GET /api/shop-listings/statistics - Get shop statistics
router.get('/statistics',
  asyncHandler(async (req, res) => {
    const statistics = await shopService.getShopStatistics();

    logger.info('Retrieved shop statistics');

    res.json({
      success: true,
      data: statistics
    });
  })
);

// GET /api/shop-listings/summary - Get shop summary
router.get('/summary',
  asyncHandler(async (req, res) => {
    const summary = await shopService.getShopSummary();

    logger.info('Retrieved shop summary');

    res.json({
      success: true,
      data: summary
    });
  })
);

// GET /api/shop-listings/:id - Get shop listing by ID
router.get('/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid shop listing ID'
      });
      return;
    }
    
    const listing = await shopService.getShopListingById(id);
    
    logger.info(`Retrieved shop listing: ${listing.id}`);

    res.json({
      success: true,
      data: listing
    });
  })
);

// POST /api/shop-listings - Create new shop listing
router.post('/',
  validate(schemas.createShopListing),
  asyncHandler(async (req, res) => {
    const listing = await shopService.createShopListing(req.body);

    logger.info(`Created shop listing: ${listing.id}`);

    res.status(201).json({
      success: true,
      data: listing,
      message: 'Shop listing created successfully'
    });
  })
);

// POST /api/shop-listings/bulk - Bulk create shop listings
router.post('/bulk',
  validate(schemas.bulkCreateShopListings),
  asyncHandler(async (req, res) => {
    const { listings } = req.body;

    const results = await shopService.bulkCreateShopListings(listings);

    logger.info(`Bulk created ${results.length} shop listings`);

    res.status(201).json({
      success: true,
      data: results,
      message: `${results.length} shop listings created successfully`
    });
  })
);

// POST /api/shop-listings/validate - Validate shop listing data
router.post('/validate',
  validate(schemas.createShopListing),
  asyncHandler(async (req, res) => {
    const validation = await shopService.validateShopListing(req.body);

    logger.info(`Validated shop listing data: ${validation.isValid ? 'valid' : 'invalid'}`);

    res.json({
      success: true,
      data: validation
    });
  })
);

// PUT /api/shop-listings/:id - Update shop listing
router.put('/:id',
  validate(schemas.updateShopListing),
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid shop listing ID'
      });
      return;
    }

    const listing = await shopService.updateShopListing(id, req.body);

    logger.info(`Updated shop listing: ${listing.id}`);

    res.json({
      success: true,
      data: listing,
      message: 'Shop listing updated successfully'
    });
  })
);

// DELETE /api/shop-listings/:id - Delete shop listing
router.delete('/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    
    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'Invalid shop listing ID'
      });
      return;
    }
    
    await shopService.deleteShopListing(id);
    
    logger.info(`Deleted shop listing with ID: ${id}`);

    res.json({
      success: true,
      message: 'Shop listing deleted successfully'
    });
  })
);

export default router;
