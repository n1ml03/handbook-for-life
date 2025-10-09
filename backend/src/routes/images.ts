/**
 * Images Routes
 * Handles image serving endpoints
 */

import { Router } from 'express';
import { asyncHandler } from '../middleware/middleware';
import logger from '../config/logger';

const router = Router();

/**
 * @swagger
 * /api/images/{type}/{id}:
 *   get:
 *     tags: [Images]
 *     summary: Get image by type and ID
 *     description: Retrieve an image from the database
 *     parameters:
 *       - name: type
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [character, swimsuit, item, bromide, skill]
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Image retrieved successfully
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:type/:id',
  asyncHandler(async (req, res) => {
    const { type, id } = req.params;
    
    logger.info(`Image request: type=${type}, id=${id}`);
    
    // Placeholder - implement image serving from database when needed
    res.status(404).json({
      success: false,
      error: 'Image not found',
      message: 'Image serving endpoint - not yet fully implemented',
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * @swagger
 * /api/images/base64/{type}/{id}:
 *   get:
 *     tags: [Images]
 *     summary: Get image as base64
 *     description: Retrieve an image from the database as base64 encoded string
 *     parameters:
 *       - name: type
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           enum: [character, swimsuit, item, bromide, skill]
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Image retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: string
 *                       description: Base64 encoded image data
 *                     mimeType:
 *                       type: string
 *                       example: image/jpeg
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/base64/:type/:id',
  asyncHandler(async (req, res) => {
    const { type, id } = req.params;
    
    logger.info(`Base64 image request: type=${type}, id=${id}`);
    
    // Placeholder - implement base64 image serving when needed
    res.status(404).json({
      success: false,
      error: 'Image not found',
      message: 'Base64 image endpoint - not yet fully implemented',
      timestamp: new Date().toISOString()
    });
  })
);

export default router;

