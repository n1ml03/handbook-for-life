/**
 * Consolidated Utilities Export
 * Central export point for all utility functions
 */

// ID generation and image utilities
export {
  generateId,
  generateIdWithLength,
  generateCustomId,
  generateNumericId,
  generatePrefixedId,
  bufferToBase64,
  base64ToBuffer,
  isValidImageMimeType,
  getFileExtensionFromMimeType,
  detectMimeTypeFromBuffer,
  validateImageData,
  prepareImageForDatabase,
  prepareImageForResponse,
  prepareScreenshotsForDatabase,
  prepareScreenshotsForResponse,
  generateImageFilename,
  formatImageSize,
  compressImageIfNeeded
} from './utils';

// Validation schemas
export { schemas } from './ValidationSchemas';

