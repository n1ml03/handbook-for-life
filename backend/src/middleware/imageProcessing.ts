import { Request, Response, NextFunction } from 'express';
import { 
  prepareImageForResponse,
  base64ToBuffer,
  isValidImageMimeType,
  validateImageData
} from '../utils/imageUtils';
import { ImageMimeType } from '../types/database';
import logger from '../config/logger';

/**
 * Middleware to process image data in request bodies
 * Converts base64 image data to Buffer for database storage
 */
export const processImageData = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Process character profile image
    if (req.body.profile_image_data && req.body.profile_image_mime_type) {
      const imageBuffer = base64ToBuffer(req.body.profile_image_data);
      const validation = validateImageData(imageBuffer);
      
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Invalid profile image data',
          details: validation.error
        });
        return;
      }
      
      if (!isValidImageMimeType(req.body.profile_image_mime_type)) {
        res.status(400).json({
          success: false,
          error: 'Invalid profile image MIME type'
        });
        return;
      }
      
      req.body.profile_image_data = imageBuffer;
    }

    // Process swimsuit before image
    if (req.body.image_before_data && req.body.image_before_mime_type) {
      const imageBuffer = base64ToBuffer(req.body.image_before_data);
      const validation = validateImageData(imageBuffer);
      
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Invalid before image data',
          details: validation.error
        });
        return;
      }
      
      if (!isValidImageMimeType(req.body.image_before_mime_type)) {
        res.status(400).json({
          success: false,
          error: 'Invalid before image MIME type'
        });
        return;
      }
      
      req.body.image_before_data = imageBuffer;
    }

    // Process swimsuit after image
    if (req.body.image_after_data && req.body.image_after_mime_type) {
      const imageBuffer = base64ToBuffer(req.body.image_after_data);
      const validation = validateImageData(imageBuffer);
      
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Invalid after image data',
          details: validation.error
        });
        return;
      }
      
      if (!isValidImageMimeType(req.body.image_after_mime_type)) {
        res.status(400).json({
          success: false,
          error: 'Invalid after image MIME type'
        });
        return;
      }
      
      req.body.image_after_data = imageBuffer;
    }

    // Process item icon
    if (req.body.icon_data && req.body.icon_mime_type) {
      const imageBuffer = base64ToBuffer(req.body.icon_data);
      const validation = validateImageData(imageBuffer);
      
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Invalid icon image data',
          details: validation.error
        });
        return;
      }
      
      if (!isValidImageMimeType(req.body.icon_mime_type)) {
        res.status(400).json({
          success: false,
          error: 'Invalid icon image MIME type'
        });
        return;
      }
      
      req.body.icon_data = imageBuffer;
    }

    // Process bromide art
    if (req.body.art_data && req.body.art_mime_type) {
      const imageBuffer = base64ToBuffer(req.body.art_data);
      const validation = validateImageData(imageBuffer);
      
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Invalid art image data',
          details: validation.error
        });
        return;
      }
      
      if (!isValidImageMimeType(req.body.art_mime_type)) {
        res.status(400).json({
          success: false,
          error: 'Invalid art image MIME type'
        });
        return;
      }
      
      req.body.art_data = imageBuffer;
    }

    // Process document screenshots
    if (req.body.screenshots_data && Array.isArray(req.body.screenshots_data)) {
      for (let i = 0; i < req.body.screenshots_data.length; i++) {
        const screenshot = req.body.screenshots_data[i];
        
        if (screenshot.data && screenshot.mimeType) {
          const imageBuffer = base64ToBuffer(screenshot.data);
          const validation = validateImageData(imageBuffer);
          
          if (!validation.isValid) {
            res.status(400).json({
              success: false,
              error: `Invalid screenshot ${i + 1} data`,
              details: validation.error
            });
            return;
          }
          
          if (!isValidImageMimeType(screenshot.mimeType)) {
            res.status(400).json({
              success: false,
              error: `Invalid screenshot ${i + 1} MIME type`
            });
            return;
          }
          
          // Keep as base64 for JSON storage in database
          // No conversion needed for screenshots
        }
      }
    }

    next();
  } catch (error) {
    logger.error('Image processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process image data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Middleware to convert database image data to API response format
 * Converts Buffer image data to base64 for API responses
 */
export const formatImageResponse = (req: Request, res: Response, next: NextFunction): void => {
  // Store original json method
  const originalJson = res.json;
  
  // Override json method to process image data
  res.json = function(data: any) {
    try {
      if (data && data.data) {
        // Handle single entity response
        if (data.data.profile_image_data) {
          const imageData = prepareImageForResponse(
            data.data.profile_image_data,
            data.data.profile_image_mime_type
          );
          data.data.profile_image = imageData;
          delete data.data.profile_image_data;
          delete data.data.profile_image_mime_type;
        }

        if (data.data.image_before_data) {
          const imageData = prepareImageForResponse(
            data.data.image_before_data,
            data.data.image_before_mime_type
          );
          data.data.image_before = imageData;
          delete data.data.image_before_data;
          delete data.data.image_before_mime_type;
        }

        if (data.data.image_after_data) {
          const imageData = prepareImageForResponse(
            data.data.image_after_data,
            data.data.image_after_mime_type
          );
          data.data.image_after = imageData;
          delete data.data.image_after_data;
          delete data.data.image_after_mime_type;
        }

        if (data.data.icon_data) {
          const imageData = prepareImageForResponse(
            data.data.icon_data,
            data.data.icon_mime_type
          );
          data.data.icon = imageData;
          delete data.data.icon_data;
          delete data.data.icon_mime_type;
        }

        if (data.data.art_data) {
          const imageData = prepareImageForResponse(
            data.data.art_data,
            data.data.art_mime_type
          );
          data.data.art = imageData;
          delete data.data.art_data;
          delete data.data.art_mime_type;
        }

        // Handle array response (pagination)
        if (Array.isArray(data.data)) {
          data.data = data.data.map((item: any) => {
            if (item.profile_image_data) {
              const imageData = prepareImageForResponse(
                item.profile_image_data,
                item.profile_image_mime_type
              );
              item.profile_image = imageData;
              delete item.profile_image_data;
              delete item.profile_image_mime_type;
            }

            if (item.image_before_data) {
              const imageData = prepareImageForResponse(
                item.image_before_data,
                item.image_before_mime_type
              );
              item.image_before = imageData;
              delete item.image_before_data;
              delete item.image_before_mime_type;
            }

            if (item.image_after_data) {
              const imageData = prepareImageForResponse(
                item.image_after_data,
                item.image_after_mime_type
              );
              item.image_after = imageData;
              delete item.image_after_data;
              delete item.image_after_mime_type;
            }

            if (item.icon_data) {
              const imageData = prepareImageForResponse(
                item.icon_data,
                item.icon_mime_type
              );
              item.icon = imageData;
              delete item.icon_data;
              delete item.icon_mime_type;
            }

            if (item.art_data) {
              const imageData = prepareImageForResponse(
                item.art_data,
                item.art_mime_type
              );
              item.art = imageData;
              delete item.art_data;
              delete item.art_mime_type;
            }

            return item;
          });
        }
      }
    } catch (error) {
      logger.error('Image response formatting error:', error);
    }
    
    // Call original json method
    return originalJson.call(this, data);
  };
  
  next();
};
