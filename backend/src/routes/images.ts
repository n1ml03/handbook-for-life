import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { executeQuery } from '../config/database';
import { AppError } from '../middleware/errorHandler';

const router = Router();

/**
 * @swagger
 * /api/images/character/{id}/profile:
 *   get:
 *     tags: [Images]
 *     summary: Get character profile image
 *     description: Retrieve a character's profile image directly from database storage
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Character ID
 *     responses:
 *       200:
 *         description: Character profile image
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *           image/gif:
 *             schema:
 *               type: string
 *               format: binary
 *           image/webp:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Character or image not found
 *       500:
 *         description: Server error
 */
router.get('/character/:id/profile',
  asyncHandler(async (req: Request, res: Response) => {
    const characterId = parseInt(req.params.id);
    
    if (isNaN(characterId)) {
      throw new AppError('Invalid character ID', 400);
    }

    const [rows] = await executeQuery(
      'SELECT profile_image_data, profile_image_mime_type FROM characters WHERE id = ?',
      [characterId]
    ) as [any[], any];

    if (rows.length === 0) {
      throw new AppError('Character not found', 404);
    }

    const character = rows[0];
    
    if (!character.profile_image_data || !character.profile_image_mime_type) {
      throw new AppError('Character profile image not found', 404);
    }

    // Set appropriate headers
    res.setHeader('Content-Type', character.profile_image_mime_type);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.setHeader('Content-Length', character.profile_image_data.length);

    // Send binary data
    res.send(character.profile_image_data);
  })
);

/**
 * @swagger
 * /api/images/swimsuit/{id}/before:
 *   get:
 *     tags: [Images]
 *     summary: Get swimsuit before malfunction image
 *     description: Retrieve a swimsuit's before malfunction image directly from database storage
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Swimsuit ID
 *     responses:
 *       200:
 *         description: Swimsuit before malfunction image
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Swimsuit or image not found
 */
router.get('/swimsuit/:id/before',
  asyncHandler(async (req: Request, res: Response) => {
    const swimsuitId = parseInt(req.params.id);
    
    if (isNaN(swimsuitId)) {
      throw new AppError('Invalid swimsuit ID', 400);
    }

    const [rows] = await executeQuery(
      'SELECT image_before_data, image_before_mime_type FROM swimsuits WHERE id = ?',
      [swimsuitId]
    ) as [any[], any];

    if (rows.length === 0) {
      throw new AppError('Swimsuit not found', 404);
    }

    const swimsuit = rows[0];
    
    if (!swimsuit.image_before_data || !swimsuit.image_before_mime_type) {
      throw new AppError('Swimsuit before image not found', 404);
    }

    // Set appropriate headers
    res.setHeader('Content-Type', swimsuit.image_before_mime_type);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Length', swimsuit.image_before_data.length);

    res.send(swimsuit.image_before_data);
  })
);

/**
 * @swagger
 * /api/images/swimsuit/{id}/after:
 *   get:
 *     tags: [Images]
 *     summary: Get swimsuit after malfunction image
 *     description: Retrieve a swimsuit's after malfunction image directly from database storage
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Swimsuit ID
 *     responses:
 *       200:
 *         description: Swimsuit after malfunction image
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Swimsuit or image not found
 */
router.get('/swimsuit/:id/after',
  asyncHandler(async (req: Request, res: Response) => {
    const swimsuitId = parseInt(req.params.id);
    
    if (isNaN(swimsuitId)) {
      throw new AppError('Invalid swimsuit ID', 400);
    }

    const [rows] = await executeQuery(
      'SELECT image_after_data, image_after_mime_type FROM swimsuits WHERE id = ?',
      [swimsuitId]
    ) as [any[], any];

    if (rows.length === 0) {
      throw new AppError('Swimsuit not found', 404);
    }

    const swimsuit = rows[0];
    
    if (!swimsuit.image_after_data || !swimsuit.image_after_mime_type) {
      throw new AppError('Swimsuit after image not found', 404);
    }

    // Set appropriate headers
    res.setHeader('Content-Type', swimsuit.image_after_mime_type);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Length', swimsuit.image_after_data.length);

    res.send(swimsuit.image_after_data);
  })
);

/**
 * @swagger
 * /api/images/item/{id}/icon:
 *   get:
 *     tags: [Images]
 *     summary: Get item icon image
 *     description: Retrieve an item's icon image directly from database storage
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item icon image
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Item or image not found
 */
router.get('/item/:id/icon',
  asyncHandler(async (req: Request, res: Response) => {
    const itemId = parseInt(req.params.id);
    
    if (isNaN(itemId)) {
      throw new AppError('Invalid item ID', 400);
    }

    const [rows] = await executeQuery(
      'SELECT icon_data, icon_mime_type FROM items WHERE id = ?',
      [itemId]
    ) as [any[], any];

    if (rows.length === 0) {
      throw new AppError('Item not found', 404);
    }

    const item = rows[0];
    
    if (!item.icon_data || !item.icon_mime_type) {
      throw new AppError('Item icon not found', 404);
    }

    // Set appropriate headers
    res.setHeader('Content-Type', item.icon_mime_type);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Length', item.icon_data.length);

    res.send(item.icon_data);
  })
);

/**
 * @swagger
 * /api/images/bromide/{id}/art:
 *   get:
 *     tags: [Images]
 *     summary: Get bromide artwork image
 *     description: Retrieve a bromide's artwork image directly from database storage
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Bromide ID
 *     responses:
 *       200:
 *         description: Bromide artwork image
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Bromide or image not found
 */
router.get('/bromide/:id/art',
  asyncHandler(async (req: Request, res: Response) => {
    const bromideId = parseInt(req.params.id);
    
    if (isNaN(bromideId)) {
      throw new AppError('Invalid bromide ID', 400);
    }

    const [rows] = await executeQuery(
      'SELECT art_data, art_mime_type FROM bromides WHERE id = ?',
      [bromideId]
    ) as [any[], any];

    if (rows.length === 0) {
      throw new AppError('Bromide not found', 404);
    }

    const bromide = rows[0];
    
    if (!bromide.art_data || !bromide.art_mime_type) {
      throw new AppError('Bromide artwork not found', 404);
    }

    // Set appropriate headers
    res.setHeader('Content-Type', bromide.art_mime_type);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Length', bromide.art_data.length);

    res.send(bromide.art_data);
  })
);

/**
 * @swagger
 * /api/images/document/{id}/screenshot/{index}:
 *   get:
 *     tags: [Images]
 *     summary: Get document screenshot by index
 *     description: Retrieve a specific screenshot from a document by its index
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Document ID
 *       - in: path
 *         name: index
 *         required: true
 *         schema:
 *           type: integer
 *         description: Screenshot index (0-based)
 *     responses:
 *       200:
 *         description: Document screenshot image
 *         content:
 *           image/*:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Document or screenshot not found
 */
router.get('/document/:id/screenshot/:index',
  asyncHandler(async (req: Request, res: Response) => {
    const documentId = parseInt(req.params.id);
    const screenshotIndex = parseInt(req.params.index);

    if (isNaN(documentId) || isNaN(screenshotIndex)) {
      throw new AppError('Invalid document ID or screenshot index', 400);
    }

    const [rows] = await executeQuery(
      'SELECT screenshots_data FROM documents WHERE id = ?',
      [documentId]
    ) as [any[], any];

    if (rows.length === 0) {
      throw new AppError('Document not found', 404);
    }

    const document = rows[0];

    if (!document.screenshots_data) {
      throw new AppError('Document has no screenshots', 404);
    }

    let screenshots;
    try {
      screenshots = JSON.parse(document.screenshots_data);
    } catch (error) {
      throw new AppError('Invalid screenshot data format', 500);
    }

    if (!Array.isArray(screenshots) || screenshotIndex >= screenshots.length || screenshotIndex < 0) {
      throw new AppError('Screenshot not found at specified index', 404);
    }

    const screenshot = screenshots[screenshotIndex];

    if (!screenshot.data || !screenshot.mimeType) {
      throw new AppError('Invalid screenshot data', 500);
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(screenshot.data, 'base64');

    // Set appropriate headers
    res.setHeader('Content-Type', screenshot.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Content-Length', imageBuffer.length);

    if (screenshot.filename) {
      res.setHeader('Content-Disposition', `inline; filename="${screenshot.filename}"`);
    }

    res.send(imageBuffer);
  })
);

export default router;
