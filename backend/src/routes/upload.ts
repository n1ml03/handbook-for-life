import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../config/logger';

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads', 'screenshots');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Allowed file types
const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const maxFileSize = 5 * 1024 * 1024; // 5MB

// Helper function to get mime type from buffer
const getMimeType = (buffer: Buffer): string | null => {
  const header = buffer.subarray(0, 12);
  
  // JPEG
  if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) {
    return 'image/jpeg';
  }
  
  // PNG
  if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
    return 'image/png';
  }
  
  // GIF
  if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46) {
    return 'image/gif';
  }
  
  // WebP
  if (header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50) {
    return 'image/webp';
  }
  
  return null;
};

// Helper function to validate file
const validateFile = (buffer: Buffer, filename: string): { isValid: boolean; error?: string } => {
  const mimeType = getMimeType(buffer);
  
  if (!mimeType || !allowedMimes.includes(mimeType)) {
    return { isValid: false, error: 'Only image files (JPEG, PNG, GIF, WebP) are allowed' };
  }
  
  if (buffer.length > maxFileSize) {
    return { isValid: false, error: 'File size must be less than 5MB' };
  }
  
  return { isValid: true };
};

// Helper function to generate unique filename
const generateFilename = (originalName: string): string => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const extension = path.extname(originalName);
  const basename = path.basename(originalName, extension);
  return `${basename}-${uniqueSuffix}${extension}`;
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

// POST /api/upload/screenshot - Upload single screenshot
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

      const filename = generateFilename(file.filename);
      const filePath = path.join(uploadsDir, filename);
      
      // Save file to disk
      fs.writeFileSync(filePath, file.buffer);

      const fileInfo = {
        filename,
        originalName: file.filename,
        size: file.size,
        url: `/uploads/screenshots/${filename}`,
        mimeType: getMimeType(file.buffer)
      };

      logger.info(`Uploaded screenshot: ${fileInfo.filename}`);

      res.json({
        success: true,
        data: fileInfo,
        message: 'Screenshot uploaded successfully'
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

      if (file.size > maxFileSize) {
        res.status(400).json({
          success: false,
          message: 'File size must be less than 5MB'
        });
        return;
      }

      const filename = generateFilename(file.filename);
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

// GET /api/upload/files - List uploaded files
router.get('/files',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { type = 'screenshots' } = req.query;
      const uploadType = type as string;
      
      if (!['screenshots', 'csv'].includes(uploadType)) {
        res.status(400).json({
          success: false,
          message: 'Invalid upload type. Must be "screenshots" or "csv"'
        });
        return;
      }

      const targetDir = path.join(process.cwd(), 'uploads', uploadType);
      
      if (!fs.existsSync(targetDir)) {
        res.json({
          success: true,
          data: [],
          message: 'No files found'
        });
        return;
      }

      const files = fs.readdirSync(targetDir)
        .filter(file => !file.startsWith('.'))
        .map(file => {
          const filePath = path.join(targetDir, file);
          const stats = fs.statSync(filePath);
          
          return {
            filename: file,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            url: `/uploads/${uploadType}/${file}`
          };
        })
        .sort((a, b) => b.created.getTime() - a.created.getTime());

      res.json({
        success: true,
        data: files,
        total: files.length,
        message: `Found ${files.length} files`
      });
    } catch (error) {
      logger.error('List files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to list files',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  })
);

// DELETE /api/upload/files/:filename - Delete uploaded file
router.delete('/files/:filename',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      const { type = 'screenshots' } = req.query;
      const uploadType = type as string;
      
      if (!['screenshots', 'csv'].includes(uploadType)) {
        res.status(400).json({
          success: false,
          message: 'Invalid upload type. Must be "screenshots" or "csv"'
        });
        return;
      }

      const filePath = path.join(process.cwd(), 'uploads', uploadType, filename);
      
      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          message: 'File not found'
        });
        return;
      }

      // Security check - ensure file is within uploads directory
      const normalizedPath = path.normalize(filePath);
      const uploadsPath = path.normalize(path.join(process.cwd(), 'uploads'));
      
      if (!normalizedPath.startsWith(uploadsPath)) {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
        return;
      }

      fs.unlinkSync(filePath);
      
      logger.info(`Deleted file: ${filename}`);

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      logger.error('Delete file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete file',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  })
);

export default router; 