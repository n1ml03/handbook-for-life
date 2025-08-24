/**
 * Image utility functions for file upload and processing
 *
 * Note: This file now focuses on file upload utilities only.
 * Image display functions have been moved to services/utils.ts and use direct backend API endpoints.
 * Legacy base64 conversion functions have been removed for cleaner, more maintainable code.
 */

export interface ImageData {
  data: string; // Base64 encoded image data
  mimeType: string; // MIME type (e.g., 'image/jpeg', 'image/png')
  filename?: string; // Optional filename
}

export interface ScreenshotData {
  data: string;
  mimeType: string;
  filename: string;
}

// Note: createImageDataUrl has been removed - use direct backend API endpoints instead

/**
 * Convert a File object to ImageData format for backend storage
 */
export async function fileToImageData(file: File): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const result = reader.result as string;
      // Extract base64 data from data URL
      const base64Data = result.split(',')[1];
      
      resolve({
        data: base64Data,
        mimeType: file.type,
        filename: file.name
      });
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Convert a File object to ScreenshotData format for backend storage
 */
export async function fileToScreenshotData(file: File): Promise<ScreenshotData> {
  const imageData = await fileToImageData(file);
  return {
    data: imageData.data,
    mimeType: imageData.mimeType,
    filename: imageData.filename || file.name
  };
}

// Note: screenshotsDataToUrls has been deprecated and removed
// Use extractScreenshotUrls from services/utils.ts instead

/**
 * Validate image file type
 */
export function isValidImageType(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
}

/**
 * Validate image file size (default 5MB limit)
 */
export function isValidImageSize(file: File, maxSizeBytes: number = 5 * 1024 * 1024): boolean {
  return file.size <= maxSizeBytes;
}

/**
 * Validate image file
 */
export function validateImageFile(file: File, maxSizeBytes?: number): { isValid: boolean; error?: string } {
  if (!isValidImageType(file)) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'
    };
  }
  
  if (!isValidImageSize(file, maxSizeBytes)) {
    const maxSizeMB = (maxSizeBytes || 5 * 1024 * 1024) / (1024 * 1024);
    return {
      isValid: false,
      error: `File size too large. Maximum size is ${maxSizeMB}MB.`
    };
  }
  
  return { isValid: true };
}

/**
 * Create a placeholder image URL for missing images
 */
export function createPlaceholderImageUrl(width: number = 300, height: number = 200): string {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle" dy=".3em">
        No Image
      </text>
    </svg>
  `)}`;
}

// Note: getImageUrl has been removed - use direct backend API endpoints instead

// Note: extractImageData and addCompatibilityUrls have been removed
// Use direct backend API endpoints instead of backward compatibility functions
