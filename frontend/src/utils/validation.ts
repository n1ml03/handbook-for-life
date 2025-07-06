import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Resolver } from 'react-hook-form';

// =============================================================================
// COMMON VALIDATION SCHEMAS
// =============================================================================

/**
 * Common field validations
 */
export const commonValidations = {
  // Text fields
  requiredString: (fieldName: string) => 
    z.string()
      .min(1, `${fieldName} is required`)
      .trim(),
  
  optionalString: z.string().optional(),
  
  // Email validation
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  
  // URL validation
  url: z.string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  
  // Version validation (X.Y or X.Y.Z format)
  version: z.string()
    .regex(/^\d+\.\d+(\.\d+)?$/, 'Version must be in format X.Y or X.Y.Z (e.g., 1.0 or 1.0.1)')
    .min(1, 'Version is required'),
  
  // Unique key validation (alphanumeric, hyphens, underscores)
  uniqueKey: z.string()
    .regex(/^[a-zA-Z0-9-_]+$/, 'Unique key can only contain letters, numbers, hyphens, and underscores')
    .min(1, 'Unique key is required')
    .max(150, 'Unique key must be less than 150 characters'),
  
  // ID validation
  id: z.string().min(1, 'ID is required'),
  
  // Numeric validations
  positiveNumber: z.number().positive('Must be a positive number'),
  nonNegativeNumber: z.number().min(0, 'Must be 0 or greater'),
  
  // Date validations
  isoDate: z.string().datetime('Please enter a valid date'),
  optionalIsoDate: z.string().datetime('Please enter a valid date').optional().or(z.literal('')),
};

// =============================================================================
// DOCUMENT VALIDATION SCHEMAS
// =============================================================================

export const documentValidationSchema = z.object({
  unique_key: commonValidations.uniqueKey,
  title_en: commonValidations.requiredString('Title'),
  summary_en: commonValidations.optionalString,
  content_json_en: z.any().optional(), // TipTap JSON content
  screenshots_data: z.array(z.object({
    data: z.string().min(1, 'Image data is required'),
    mimeType: z.enum(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']),
    filename: z.string().min(1, 'Filename is required')
  })).optional(),
});

export const documentUpdateSchema = documentValidationSchema.partial();

// =============================================================================
// UPDATE LOG VALIDATION SCHEMAS
// =============================================================================

export const updateLogValidationSchema = z.object({
  version: commonValidations.version,
  title: commonValidations.requiredString('Title'),
  content: commonValidations.requiredString('Content'),
  release_date: commonValidations.optionalIsoDate,
  is_published: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
});

export const updateLogUpdateSchema = updateLogValidationSchema.partial();

// =============================================================================
// CHARACTER VALIDATION SCHEMAS
// =============================================================================

export const characterValidationSchema = z.object({
  unique_key: commonValidations.uniqueKey,
  name_en: commonValidations.requiredString('English name'),
  name_jp: commonValidations.optionalString,
  name_kr: commonValidations.optionalString,
  name_zh: commonValidations.optionalString,
  type: z.enum(['SSR', 'SR', 'R', 'N']).optional(),
  profile_image_data: z.string().optional(),
  profile_image_mime_type: z.enum(['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']).optional(),
});

export const characterUpdateSchema = characterValidationSchema.partial();

// =============================================================================
// FORM VALIDATION HELPERS
// =============================================================================

/**
 * Create a form resolver with enhanced error handling
 */
export function createFormResolver<T extends z.ZodSchema>(schema: T): Resolver<any> {
  return zodResolver(schema as any);
}

/**
 * Validate data against a schema and return formatted errors
 */
export function validateData<T>(schema: z.ZodType<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
  fieldErrors?: string[];
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data
    };
  }
  
  // Format errors for easy consumption
  const errors: Record<string, string> = {};
  const fieldErrors: string[] = [];
  
  result.error.errors.forEach(error => {
    const path = error.path.join('.');
    if (path) {
      errors[path] = error.message;
    }
    fieldErrors.push(error.message);
  });
  
  return {
    success: false,
    errors,
    fieldErrors
  };
}

/**
 * Create validation function for async operations
 */
export function createAsyncValidator<T>(schema: z.ZodType<T>) {
  return async (data: unknown): Promise<T> => {
    const result = await schema.safeParseAsync(data);
    if (!result.success) {
      throw new Error(`Validation failed: ${result.error.errors.map(e => e.message).join(', ')}`);
    }
    return result.data;
  };
}

// =============================================================================
// FORM RESOLVERS - Ready-to-use resolvers for React Hook Form
// =============================================================================

export const formResolvers = {
  document: createFormResolver(documentValidationSchema),
  documentUpdate: createFormResolver(documentUpdateSchema),
  updateLog: createFormResolver(updateLogValidationSchema),
  updateLogUpdate: createFormResolver(updateLogUpdateSchema),
  character: createFormResolver(characterValidationSchema),
  characterUpdate: createFormResolver(characterUpdateSchema),
};

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Check if a string is a valid unique key using Zod schema
 */
export function isValidUniqueKey(key: string): boolean {
  return commonValidations.uniqueKey.safeParse(key).success;
}

/**
 * Check if a string is a valid version format using Zod schema
 */
export function isValidVersion(version: string): boolean {
  return commonValidations.version.safeParse(version).success;
}

/**
 * Sanitize and validate file upload data
 */
export function validateFileUpload(file: File, maxSize: number = 10 * 1024 * 1024): {
  valid: boolean;
  error?: string;
} {
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
    };
  }
  
  // Check file type for images
  if (file.type.startsWith('image/')) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Only JPEG, PNG, GIF, and WebP images are allowed'
      };
    }
  }
  
  return { valid: true };
}
