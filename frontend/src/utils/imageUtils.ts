/**
 * Image utility functions for handling binary image data and URL conversion
 * Provides compatibility between backend binary storage and frontend URL display
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

/**
 * Convert binary image data to a data URL for display in the frontend
 */
export function createImageDataUrl(imageData: ImageData): string {
  if (!imageData.data || !imageData.mimeType) {
    throw new Error('Invalid image data: missing data or mimeType');
  }
  
  // Check if data is already a data URL
  if (imageData.data.startsWith('data:')) {
    return imageData.data;
  }
  
  // Create data URL from base64 data
  return `data:${imageData.mimeType};base64,${imageData.data}`;
}

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

/**
 * Convert screenshot data array to URL array for backward compatibility
 */
export function screenshotsDataToUrls(screenshotsData?: ScreenshotData[]): string[] {
  if (!screenshotsData || !Array.isArray(screenshotsData)) {
    return [];
  }
  
  return screenshotsData.map(screenshot => createImageDataUrl(screenshot));
}

/**
 * Convert URL array to screenshot data array (for form submissions)
 * Note: This is a placeholder - actual implementation would need to fetch and convert URLs
 */
export function urlsToScreenshotsData(urls: string[]): ScreenshotData[] {
  // This is a simplified implementation for backward compatibility
  // In practice, you'd need to fetch the URLs and convert them to base64
  return urls.map((_, index) => ({
    data: '', // Would need to fetch and convert
    mimeType: 'image/jpeg', // Would need to detect
    filename: `screenshot_${index + 1}.jpg`
  }));
}

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

/**
 * Get image URL for display, with fallback to placeholder
 */
export function getImageUrl(imageData?: ImageData, placeholderSize?: { width: number; height: number }): string {
  if (imageData && imageData.data && imageData.mimeType) {
    try {
      return createImageDataUrl(imageData);
    } catch (error) {
      console.warn('Failed to create image data URL:', error);
    }
  }
  
  const { width = 300, height = 200 } = placeholderSize || {};
  return createPlaceholderImageUrl(width, height);
}

/**
 * Extract image data from entity for backward compatibility
 */
export function extractImageData(entity: any, imageField: string): ImageData | undefined {
  const dataField = `${imageField}_data`;
  const mimeTypeField = `${imageField}_mime_type`;
  
  if (entity[dataField] && entity[mimeTypeField]) {
    return {
      data: entity[dataField],
      mimeType: entity[mimeTypeField]
    };
  }
  
  return undefined;
}

/**
 * Create backward-compatible URL fields for entities
 */
export function addCompatibilityUrls<T extends Record<string, any>>(entity: T, imageFields: string[]): T {
  const result = { ...entity };
  
  imageFields.forEach(field => {
    const imageData = extractImageData(entity, field);
    if (imageData) {
      (result as any)[`${field}_url`] = getImageUrl(imageData);
    }
  });
  
  return result;
}
