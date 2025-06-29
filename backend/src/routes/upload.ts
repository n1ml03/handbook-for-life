import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../config/logger';
import * as fs from 'fs';
import * as path from 'path';
import {
  validateImageData,
  generateImageFilename
} from '../utils/imageUtils';
import { ImageMimeType } from '../types/database';

const router = Router();

// Configuration for image uploads
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Allowed file types
const allowedMimes: ImageMimeType[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// Helper function to validate file (updated to use imageUtils)
const validateFile = (buffer: Buffer, filename: string): { isValid: boolean; error?: string; mimeType?: ImageMimeType } => {
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
  return {
    filename: generateImageFilename(filename, mimeType),
    originalName: filename,
    size: buffer.length,
    mimeType,
    data: buffer.toString('base64') // Return base64 for API response
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
const skipBodyParser = (req: Request, res: Response, next: any) => {
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
      const { fields, files } = await parseMultipartData(req);
      
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

      res.json({
        success: true,
        data: imageData,
        message: 'Screenshot processed successfully. Use this data to save to your database.'
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

// POST /api/upload/csv - Upload CSV file
router.post('/csv',
  skipBodyParser,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { fields, files } = await parseMultipartData(req);
      
      if (files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
        return;
      }

      const file = files[0];
      
      // Validate CSV file
      if (!file.filename.toLowerCase().endsWith('.csv')) {
        res.status(400).json({
          success: false,
          message: 'Only CSV files are allowed'
        });
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        res.status(400).json({
          success: false,
          message: 'File size must be less than 5MB'
        });
        return;
      }

      const filename = generateImageFilename(file.filename);
      const filePath = path.join(process.cwd(), 'uploads', 'csv', filename);
      
      // Ensure CSV directory exists
      const csvDir = path.dirname(filePath);
      if (!fs.existsSync(csvDir)) {
        fs.mkdirSync(csvDir, { recursive: true });
      }
      
      // Save file to disk
      fs.writeFileSync(filePath, file.buffer);

      const fileInfo = {
        filename,
        originalName: file.filename,
        size: file.size,
        path: filePath,
        url: `/uploads/csv/${filename}`
      };

      logger.info(`Uploaded CSV: ${fileInfo.filename}`);

      res.json({
        success: true,
        data: fileInfo,
        message: 'CSV file uploaded successfully'
      });
    } catch (error) {
      logger.error('CSV upload error:', error);
      res.status(500).json({
        success: false,
        message: 'CSV upload failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  })
);

// GET /api/upload/files - List uploaded files (deprecated - images now stored in database)
router.get('/files',
  asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      data: [],
      message: 'File listing is deprecated. Images are now stored directly in the database. Use the respective entity endpoints to retrieve image data.'
    });
  })
);

// DELETE /api/upload/files/:filename - Delete uploaded file (deprecated - images now stored in database)
router.delete('/files/:filename',
  asyncHandler(async (req: Request, res: Response) => {
    res.status(410).json({
      success: false,
      message: 'File deletion is deprecated. Images are now stored directly in the database. Use the respective entity endpoints to update or delete image data.'
    });
  })
);

export default router; 