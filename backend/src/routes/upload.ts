import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../config/logger';
import {
  validateImageData,
  generateImageFilename
} from '../utils/imageUtils';
import { ImageMimeType } from '../types/database';
import { ImageProcessingService } from '../services/ImageProcessingService';

const router = Router();

// Initialize image processing service
const imageProcessingService = new ImageProcessingService();

// Configuration for image uploads
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (increased for better quality)

// Allowed file types
const allowedMimes: ImageMimeType[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// Helper function to validate file (updated to use imageUtils)
const validateFile = (buffer: Buffer, _filename: string): { isValid: boolean; error?: string; mimeType?: ImageMimeType } => {
  const validation = validateImageData(buffer, MAX_FILE_SIZE);

  if (!validation.isValid) {
    return { isValid: false, error: validation.error };
  }

  const mimeType = validation.mimeType;
  if (!mimeType || !allowedMimes.includes(mimeType)) {
    return { isValid: false, error: 'Only image files (JPEG, PNG, GIF, WebP) are allowed' };
  }

  return { isValid: true, mimeType };
};

// Helper function to create image response data
const createImageResponse = (buffer: Buffer, mimeType: ImageMimeType, filename: string) => {
  const generatedFilename = generateImageFilename(filename, mimeType);
  const base64Data = buffer.toString('base64');
  
  // Create a data URL that can be used as URL by frontend
  const dataUrl = `data:${mimeType};base64,${base64Data}`;
  
  return {
    filename: generatedFilename,
    originalName: filename,
    size: buffer.length,
    mimeType,
    data: base64Data,
    url: dataUrl // Add URL field for frontend compatibility
  };
};

// Helper function to create optimized image response data
const createOptimizedImageResponse = (
  processedImage: any,
  mimeType: ImageMimeType,
  filename: string
) => {
  const baseFilename = generateImageFilename(filename, mimeType);

  return {
    original: {
      filename: baseFilename,
      originalName: filename,
      size: processedImage.metadata.originalSize,
      mimeType,
      data: processedImage.original.toString('base64')
    },
    optimized: processedImage.webp ? {
      filename: baseFilename.replace(/\.[^.]+$/, '.webp'),
      size: processedImage.metadata.compressedSize,
      mimeType: 'image/webp' as ImageMimeType,
      data: processedImage.webp.toString('base64'),
      compressionRatio: processedImage.metadata.compressionRatio
    } : null,
    sizes: {
      thumbnail: processedImage.thumbnail ? {
        filename: baseFilename.replace(/\.[^.]+$/, '_thumb.webp'),
        size: processedImage.thumbnail.length,
        data: processedImage.thumbnail.toString('base64')
      } : null,
      medium: processedImage.medium ? {
        filename: baseFilename.replace(/\.[^.]+$/, '_medium.webp'),
        size: processedImage.medium.length,
        data: processedImage.medium.toString('base64')
      } : null,
      large: processedImage.large ? {
        filename: baseFilename.replace(/\.[^.]+$/, '_large.webp'),
        size: processedImage.large.length,
        data: processedImage.large.toString('base64')
      } : null
    },
    metadata: processedImage.metadata
  };
};

// Helper function to parse multipart data
const parseMultipartData = (req: Request): Promise<{ fields: any; files: any[] }> => {
  return new Promise((resolve, reject) => {
    const boundary = req.headers['content-type']?.split('boundary=')[1];
    if (!boundary) {
      reject(new Error('No boundary found in content-type'));
      return;
    }

    const chunks: Buffer[] = [];
    
    req.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks);
        const boundaryBuffer = Buffer.from(`--${boundary}`);
        const parts = [];
        
        let start = 0;
        let pos = buffer.indexOf(boundaryBuffer, start);
        
        while (pos !== -1) {
          if (start < pos) {
            parts.push(buffer.subarray(start, pos));
          }
          start = pos + boundaryBuffer.length;
          pos = buffer.indexOf(boundaryBuffer, start);
        }
        
        const fields: any = {};
        const files: any[] = [];
        
        for (const part of parts) {
          if (part.length < 4) continue;
          
          const headerEnd = part.indexOf('\r\n\r\n');
          if (headerEnd === -1) continue;
          
          const headerText = part.subarray(0, headerEnd).toString();
          const content = part.subarray(headerEnd + 4);
          
          // Remove trailing CRLF
          const actualContent = content.subarray(0, content.length - 2);
          
          const dispositionMatch = headerText.match(/Content-Disposition: form-data; name="([^"]+)"(?:; filename="([^"]+)")?/);
          if (!dispositionMatch) continue;
          
          const fieldName = dispositionMatch[1];
          const filename = dispositionMatch[2];
          
          if (filename) {
            // It's a file
            files.push({
              fieldName,
              filename,
              buffer: actualContent,
              size: actualContent.length
            });
          } else {
            // It's a regular field
            fields[fieldName] = actualContent.toString();
          }
        }
        
        resolve({ fields, files });
      } catch (error) {
        reject(error);
      }
    });
    
    req.on('error', reject);
  });
};

// Middleware to skip body parsing for upload routes
const skipBodyParser = (req: Request, _res: Response, next: any) => {
  req.body = undefined;
  next();
};

/**
 * @swagger
 * /api/upload/screenshot:
 *   post:
 *     tags: [Upload]
 *     summary: Upload a screenshot file
 *     description: Upload a single screenshot image (JPEG, PNG, GIF, WebP). Maximum file size is 5MB.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Screenshot image file (max 5MB)
 *           encoding:
 *             file:
 *               contentType: image/jpeg, image/png, image/gif, image/webp
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/FileUpload'
 *             example:
 *               success: true
 *               data:
 *                 filename: 'screenshot-1640995200000-123456789.jpg'
 *                 originalName: 'my-screenshot.jpg'
 *                 size: 1024768
 *                 url: '/uploads/screenshots/screenshot-1640995200000-123456789.jpg'
 *                 mimeType: 'image/jpeg'
 *               message: 'Screenshot uploaded successfully'
 *               timestamp: '2024-06-28T10:30:00.000Z'
 *       400:
 *         description: Invalid file or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               no_file:
 *                 summary: No file uploaded
 *                 value:
 *                   success: false
 *                   error: 'No file uploaded'
 *                   timestamp: '2024-06-28T10:30:00.000Z'
 *               invalid_type:
 *                 summary: Invalid file type
 *                 value:
 *                   success: false
 *                   error: 'Only image files (JPEG, PNG, GIF, WebP) are allowed'
 *                   timestamp: '2024-06-28T10:30:00.000Z'
 *               file_too_large:
 *                 summary: File too large
 *                 value:
 *                   success: false
 *                   error: 'File size must be less than 5MB'
 *                   timestamp: '2024-06-28T10:30:00.000Z'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/screenshot',
  skipBodyParser,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { files } = await parseMultipartData(req);
      
      if (files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
        return;
      }

      const file = files[0];
      const validation = validateFile(file.buffer, file.filename);
      
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          message: validation.error
        });
        return;
      }

      // Create image response data (no longer saving to disk)
      const imageData = createImageResponse(file.buffer, validation.mimeType!, file.filename);

      logger.info(`Processed screenshot: ${imageData.filename}, size: ${imageData.size} bytes`);

      res.status(200).json({
        success: true,
        data: imageData,
        message: 'Screenshot processed successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Upload failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  })
);

/**
 * @swagger
 * /api/upload/screenshots:
 *   post:
 *     tags: [Upload]
 *     summary: Upload multiple screenshot files
 *     description: Upload multiple screenshot images (JPEG, PNG, GIF, WebP). Maximum file size is 5MB per file.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               screenshots:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Multiple screenshot image files (max 5MB each)
 *           encoding:
 *             screenshots:
 *               contentType: image/jpeg, image/png, image/gif, image/webp
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiSuccess'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FileUpload'
 *             example:
 *               success: true
 *               data:
 *                 - filename: 'screenshot-1640995200000-123456789.jpg'
 *                   originalName: 'screenshot1.jpg'
 *                   size: 1024768
 *                   url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgAB...'
 *                   mimeType: 'image/jpeg'
 *                 - filename: 'screenshot-1640995201000-987654321.png'
 *                   originalName: 'screenshot2.png'
 *                   size: 2048576
 *                   url: 'data:image/png;base64,iVBORw0KGgoAAAANSU...'
 *                   mimeType: 'image/png'
 *               message: 'Screenshots uploaded successfully'
 *               timestamp: '2024-06-28T10:30:00.000Z'
 *       400:
 *         description: Invalid files or validation error
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/screenshots',
  skipBodyParser,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { files } = await parseMultipartData(req);
      
      if (files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
        return;
      }

      const processedFiles: any[] = [];
      const errors: string[] = [];

      // Process each file
      for (const file of files) {
        try {
          const validation = validateFile(file.buffer, file.filename);
          
          if (!validation.isValid) {
            errors.push(`${file.filename}: ${validation.error}`);
            continue;
          }

          // Create image response data
          const imageData = createImageResponse(file.buffer, validation.mimeType!, file.filename);
          processedFiles.push(imageData);

          logger.info(`Processed screenshot: ${imageData.filename}, size: ${imageData.size} bytes`);
        } catch (error) {
          logger.error(`Error processing file ${file.filename}:`, error);
          errors.push(`${file.filename}: Processing failed`);
        }
      }

      // Check if any files were processed successfully
      if (processedFiles.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No valid files could be processed',
          errors: errors
        });
        return;
      }

      // Return successful files (even if some failed)
      const response: any = {
        success: true,
        data: processedFiles,
        message: `${processedFiles.length} screenshot(s) processed successfully`,
        timestamp: new Date().toISOString()
      };

      // Include errors if some files failed
      if (errors.length > 0) {
        response.warnings = errors;
        response.message += ` (${errors.length} file(s) failed)`;
      }

      res.status(200).json(response);
    } catch (error) {
      logger.error('Multiple upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Upload failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  })
);



// GET /api/upload/files - List uploaded files (deprecated - images now stored in database)
router.get('/files',
  asyncHandler(async (_req: Request, res: Response) => {
    res.success([], 'File listing is deprecated. Images are now stored directly in the database. Use the respective entity endpoints to retrieve image data.');
  })
);

// DELETE /api/upload/files/:filename - Delete uploaded file (handles data URLs)
router.delete('/files/:filename',
  asyncHandler(async (req: Request, res: Response) => {
    const { filename } = req.params;
    
    // Since files are now stored as base64 data URLs in memory/database
    // and not as physical files, we just return success
    // The actual deletion will be handled by the frontend state management
    logger.info(`File deletion requested for: ${filename}`);
    
    res.status(200).json({
      success: true,
      message: 'File reference removed successfully. Note: Files are stored as data URLs and managed in application state.',
      timestamp: new Date().toISOString()
    });
  })
);

/**
 * @swagger
 * /api/upload/optimized:
 *   post:
 *     summary: Upload and optimize image with multiple formats and sizes
 *     description: Upload an image and automatically generate optimized versions including WebP conversion, compression, and multiple sizes (thumbnail, medium, large)
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload and optimize
 *               quality:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 85
 *                 description: Compression quality (1-100)
 *     responses:
 *       200:
 *         description: Image uploaded and optimized successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     original:
 *                       type: object
 *                       properties:
 *                         filename:
 *                           type: string
 *                         size:
 *                           type: number
 *                         mimeType:
 *                           type: string
 *                         data:
 *                           type: string
 *                           description: Base64 encoded image data
 *                     optimized:
 *                       type: object
 *                       properties:
 *                         filename:
 *                           type: string
 *                         size:
 *                           type: number
 *                         compressionRatio:
 *                           type: number
 *                         data:
 *                           type: string
 *                           description: Base64 encoded optimized image data
 *                     sizes:
 *                       type: object
 *                       properties:
 *                         thumbnail:
 *                           type: object
 *                         medium:
 *                           type: object
 *                         large:
 *                           type: object
 *                     metadata:
 *                       type: object
 *                       properties:
 *                         originalSize:
 *                           type: number
 *                         compressedSize:
 *                           type: number
 *                         compressionRatio:
 *                           type: number
 *                         width:
 *                           type: number
 *                         height:
 *                           type: number
 *                 message:
 *                   type: string
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid file or validation error
 *       500:
 *         description: Internal server error
 */
router.post('/optimized',
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
      logger.info('Processing optimized image upload');

      const { fields, files } = await parseMultipartData(req);

      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No image file provided',
          timestamp: new Date().toISOString()
        });
        return;
      }

      const file = files[0];
      const quality = fields.quality ? parseInt(fields.quality) : 85;

      // Validate quality parameter
      if (quality < 1 || quality > 100) {
        res.status(400).json({
          success: false,
          error: 'Quality must be between 1 and 100',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Validate file
      const validation = validateFile(file.buffer, file.filename);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: validation.error,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Process image with optimization
      const processedImage = await imageProcessingService.processImage(file.buffer, {
        quality,
        format: 'webp',
        sizes: {
          thumbnail: { width: 150, height: 150 },
          medium: { width: 400, height: 400 },
          large: { width: 800, height: 800 }
        }
      });

      // Create response with all optimized versions
      const responseData = createOptimizedImageResponse(
        processedImage,
        validation.mimeType!,
        file.filename
      );

      logger.info('Optimized image upload completed', {
        originalSize: processedImage.metadata.originalSize,
        compressedSize: processedImage.metadata.compressedSize,
        compressionRatio: processedImage.metadata.compressionRatio,
        filename: file.filename
      });

      res.json({
        success: true,
        data: responseData,
        message: 'Image uploaded and optimized successfully',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error in optimized image upload:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process image upload',
        errorId: `err_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        timestamp: new Date().toISOString()
      });
    }
  })
);

export default router;