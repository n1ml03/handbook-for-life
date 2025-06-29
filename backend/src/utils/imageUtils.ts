import { ImageMimeType, ImageData, ImageUpload, ScreenshotData } from '../types/database';
import logger from '../config/logger';

/**
 * Utility functions for handling image data conversion between different formats
 */

/**
 * Convert Buffer to base64 string
 */
export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}

/**
 * Convert base64 string to Buffer
 */
export function base64ToBuffer(base64: string): Buffer {
  return Buffer.from(base64, 'base64');
}

/**
 * Validate image MIME type
 */
export function isValidImageMimeType(mimeType: string): mimeType is ImageMimeType {
  const validTypes: ImageMimeType[] = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(mimeType as ImageMimeType);
}

/**
 * Get file extension from MIME type
 */
export function getFileExtensionFromMimeType(mimeType: ImageMimeType): string {
  const extensions: Record<ImageMimeType, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp'
  };
  return extensions[mimeType] || 'jpg';
}

/**
 * Detect MIME type from buffer (basic detection)
 */
export function detectMimeTypeFromBuffer(buffer: Buffer): ImageMimeType | null {
  if (buffer.length < 4) return null;

  // Check for common image file signatures
  const signature = buffer.subarray(0, 4);
  
  // PNG signature: 89 50 4E 47
  if (signature[0] === 0x89 && signature[1] === 0x50 && signature[2] === 0x4E && signature[3] === 0x47) {
    return 'image/png';
  }
  
  // JPEG signature: FF D8 FF
  if (signature[0] === 0xFF && signature[1] === 0xD8 && signature[2] === 0xFF) {
    return 'image/jpeg';
  }
  
  // GIF signature: 47 49 46 38
  if (signature[0] === 0x47 && signature[1] === 0x49 && signature[2] === 0x46 && signature[3] === 0x38) {
    return 'image/gif';
  }
  
  // WebP signature: check for RIFF and WEBP
  if (buffer.length >= 12) {
    const riff = buffer.subarray(0, 4);
    const webp = buffer.subarray(8, 12);
    if (riff.toString() === 'RIFF' && webp.toString() === 'WEBP') {
      return 'image/webp';
    }
  }
  
  return null;
}

/**
 * Validate image data and size
 */
export function validateImageData(buffer: Buffer, maxSizeBytes: number = 5 * 1024 * 1024): {
  isValid: boolean;
  error?: string;
  mimeType?: ImageMimeType;
} {
  if (buffer.length === 0) {
    return { isValid: false, error: 'Image data is empty' };
  }
  
  if (buffer.length > maxSizeBytes) {
    return { isValid: false, error: `Image size exceeds maximum allowed size of ${maxSizeBytes} bytes` };
  }
  
  const mimeType = detectMimeTypeFromBuffer(buffer);
  if (!mimeType) {
    return { isValid: false, error: 'Invalid or unsupported image format' };
  }
  
  return { isValid: true, mimeType };
}

/**
 * Convert ImageUpload to database-ready format
 */
export function prepareImageForDatabase(upload: ImageUpload): {
  data: Buffer;
  mimeType: ImageMimeType;
} {
  let buffer: Buffer;
  
  if (Buffer.isBuffer(upload.data)) {
    buffer = upload.data;
  } else {
    // Assume it's a base64 string
    buffer = base64ToBuffer(upload.data);
  }
  
  const validation = validateImageData(buffer);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Invalid image data');
  }
  
  return {
    data: buffer,
    mimeType: upload.mimeType
  };
}

/**
 * Convert database image data to API response format
 */
export function prepareImageForResponse(data: Buffer | null, mimeType: string | null, filename?: string): ImageData | null {
  if (!data || !mimeType || !isValidImageMimeType(mimeType)) {
    return null;
  }
  
  return {
    data: bufferToBase64(data),
    mimeType: mimeType as ImageMimeType,
    filename,
    size: data.length
  };
}

/**
 * Convert screenshot array for database storage
 */
export function prepareScreenshotsForDatabase(screenshots: ScreenshotData[]): string {
  return JSON.stringify(screenshots);
}

/**
 * Convert database screenshot data to API response format
 */
export function prepareScreenshotsForResponse(screenshotsJson: string | null): ScreenshotData[] {
  if (!screenshotsJson) {
    return [];
  }
  
  try {
    const parsed = JSON.parse(screenshotsJson);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    logger.warn('Failed to parse screenshots JSON:', error);
    return [];
  }
}

/**
 * Generate a unique filename for an image
 */
export function generateImageFilename(originalName?: string, mimeType?: ImageMimeType): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = mimeType ? getFileExtensionFromMimeType(mimeType) : 'jpg';
  
  if (originalName) {
    const baseName = originalName.replace(/\.[^/.]+$/, ''); // Remove extension
    const safeName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_'); // Sanitize
    return `${safeName}_${timestamp}_${random}.${extension}`;
  }
  
  return `image_${timestamp}_${random}.${extension}`;
}

/**
 * Calculate image data size in human-readable format
 */
export function formatImageSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Compress image data (basic implementation - in production, use a proper image processing library)
 */
export function compressImageIfNeeded(buffer: Buffer, maxSizeBytes: number = 1024 * 1024): Buffer {
  // This is a placeholder - in a real implementation, you would use a library like sharp
  // to actually compress the image while maintaining quality
  if (buffer.length <= maxSizeBytes) {
    return buffer;
  }
  
  logger.warn(`Image size ${buffer.length} bytes exceeds recommended size ${maxSizeBytes} bytes. Consider implementing image compression.`);
  return buffer;
}
