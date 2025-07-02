import sharp from 'sharp';
import logger from '@config/logger';

export interface ImageProcessingOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  sizes?: {
    thumbnail?: { width: number; height: number };
    medium?: { width: number; height: number };
    large?: { width: number; height: number };
  };
}

export interface ProcessedImage {
  original: Buffer;
  webp?: Buffer;
  thumbnail?: Buffer;
  medium?: Buffer;
  large?: Buffer;
  metadata: {
    originalSize: number;
    compressedSize?: number;
    format: string;
    width: number;
    height: number;
    compressionRatio?: number;
  };
}

export class ImageProcessingService {
  private defaultOptions: ImageProcessingOptions = {
    quality: 85,
    format: 'webp',
    sizes: {
      thumbnail: { width: 150, height: 150 },
      medium: { width: 400, height: 400 },
      large: { width: 800, height: 800 }
    }
  };

  /**
   * Process an image with compression, format conversion, and multiple sizes
   */
  async processImage(
    imageBuffer: Buffer, 
    options: ImageProcessingOptions = {}
  ): Promise<ProcessedImage> {
    try {
      const opts = { ...this.defaultOptions, ...options };
      
      // Get original image metadata
      const originalMetadata = await sharp(imageBuffer).metadata();
      const originalSize = imageBuffer.length;

      logger.info('Processing image', {
        originalFormat: originalMetadata.format,
        originalSize: originalSize,
        width: originalMetadata.width,
        height: originalMetadata.height
      });

      const result: ProcessedImage = {
        original: imageBuffer,
        metadata: {
          originalSize,
          format: originalMetadata.format || 'unknown',
          width: originalMetadata.width || 0,
          height: originalMetadata.height || 0
        }
      };

      // Convert to WebP for better compression
      if (opts.format === 'webp') {
        const webpBuffer = await sharp(imageBuffer)
          .webp({ quality: opts.quality })
          .toBuffer();
        
        result.webp = webpBuffer;
        result.metadata.compressedSize = webpBuffer.length;
        result.metadata.compressionRatio = Math.round(
          ((originalSize - webpBuffer.length) / originalSize) * 100
        );

        logger.info('WebP conversion completed', {
          originalSize,
          webpSize: webpBuffer.length,
          compressionRatio: result.metadata.compressionRatio
        });
      }

      // Generate different sizes
      if (opts.sizes) {
        // Thumbnail
        if (opts.sizes.thumbnail) {
          result.thumbnail = await this.resizeImage(
            imageBuffer, 
            opts.sizes.thumbnail.width, 
            opts.sizes.thumbnail.height,
            opts.quality
          );
        }

        // Medium
        if (opts.sizes.medium) {
          result.medium = await this.resizeImage(
            imageBuffer, 
            opts.sizes.medium.width, 
            opts.sizes.medium.height,
            opts.quality
          );
        }

        // Large
        if (opts.sizes.large) {
          result.large = await this.resizeImage(
            imageBuffer, 
            opts.sizes.large.width, 
            opts.sizes.large.height,
            opts.quality
          );
        }
      }

      logger.info('Image processing completed successfully', {
        hasWebp: !!result.webp,
        hasThumbnail: !!result.thumbnail,
        hasMedium: !!result.medium,
        hasLarge: !!result.large
      });

      return result;

    } catch (error) {
      logger.error('Error processing image:', error);
      throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Resize image to specific dimensions
   */
  private async resizeImage(
    imageBuffer: Buffer, 
    width: number, 
    height: number, 
    quality: number = 85
  ): Promise<Buffer> {
    return sharp(imageBuffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality })
      .toBuffer();
  }

  /**
   * Optimize image without changing dimensions
   */
  async optimizeImage(imageBuffer: Buffer, quality: number = 85): Promise<Buffer> {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      
      // Choose the best format based on the original
      if (metadata.format === 'png' && metadata.channels === 4) {
        // Keep PNG for images with transparency
        return sharp(imageBuffer)
          .png({ quality, compressionLevel: 9 })
          .toBuffer();
      } else {
        // Convert to WebP for better compression
        return sharp(imageBuffer)
          .webp({ quality })
          .toBuffer();
      }
    } catch (error) {
      logger.error('Error optimizing image:', error);
      throw new Error(`Image optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get image metadata
   */
  async getImageMetadata(imageBuffer: Buffer) {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      return {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        channels: metadata.channels,
        hasAlpha: metadata.hasAlpha,
        size: imageBuffer.length
      };
    } catch (error) {
      logger.error('Error getting image metadata:', error);
      throw new Error(`Failed to get image metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate image format and size
   */
  async validateImage(imageBuffer: Buffer, maxSizeBytes: number = 10 * 1024 * 1024): Promise<boolean> {
    // Check file size (default 10MB limit)
    if (imageBuffer.length > maxSizeBytes) {
      throw new Error(`Image too large. Maximum size is ${maxSizeBytes / (1024 * 1024)}MB`);
    }

    // Check if it's a valid image by trying to get metadata
    try {
      await sharp(imageBuffer).metadata();
      return true;
    } catch (error) {
      throw new Error('Invalid image format');
    }
  }
}
