import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

/**
 * Response validation middleware to ensure API consistency
 */
export interface ResponseValidationOptions {
  enforceStandardFormat?: boolean;
  logResponses?: boolean;
  validateStatusCodes?: boolean;
  requireTimestamp?: boolean;
  requireSuccessField?: boolean;
}

const defaultOptions: ResponseValidationOptions = {
  enforceStandardFormat: true,
  logResponses: process.env.NODE_ENV === 'development',
  validateStatusCodes: true,
  requireTimestamp: true,
  requireSuccessField: true
};

/**
 * Middleware to validate and standardize API responses
 */
export const responseValidator = (options: ResponseValidationOptions = {}) => {
  const config = { ...defaultOptions, ...options };

  return (_req: Request, res: Response, next: NextFunction): void => {
    // Store original json method
    const originalJson = res.json;

    // Override json method to validate responses
    res.json = function (body: any): Response {
      try {
        // Validate response structure
        const validationResult = validateResponseStructure(body, res.statusCode, config);
        
        if (!validationResult.isValid) {
          logger.warn('Response validation failed', {
            statusCode: res.statusCode,
            errors: validationResult.errors,
            body: typeof body === 'object' ? JSON.stringify(body).substring(0, 200) : body
          });

          // In development, throw error to catch issues early
          if (process.env.NODE_ENV === 'development' && config.enforceStandardFormat) {
            throw new Error(`Response validation failed: ${validationResult.errors.join(', ')}`);
          }
        }

        // Log response if enabled
        if (config.logResponses) {
          logResponse(res.statusCode, body, validationResult);
        }

        // Call original json method
        return originalJson.call(this, body);

      } catch (error) {
        logger.error('Response validation error', error);
        
        // Fallback to original method if validation fails
        return originalJson.call(this, body);
      }
    };

    next();
  };
};

/**
 * Validate response structure according to API standards
 */
function validateResponseStructure(
  body: any, 
  statusCode: number, 
  config: ResponseValidationOptions
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Skip validation for certain status codes
  if (statusCode === 204 || statusCode === 304) {
    return { isValid: true, errors: [] };
  }

  // Check if body exists for non-204 responses
  if (!body) {
    errors.push('Response body is required for non-204 status codes');
    return { isValid: false, errors };
  }

  // Validate success field
  if (config.requireSuccessField && typeof body.success !== 'boolean') {
    errors.push('Response must include a boolean "success" field');
  }

  // Validate timestamp
  if (config.requireTimestamp && !body.timestamp) {
    errors.push('Response must include a "timestamp" field');
  } else if (body.timestamp && !isValidTimestamp(body.timestamp)) {
    errors.push('Timestamp must be a valid ISO 8601 string');
  }

  // Validate status code consistency
  if (config.validateStatusCodes) {
    const statusValidation = validateStatusCodeConsistency(body, statusCode);
    if (!statusValidation.isValid) {
      errors.push(...statusValidation.errors);
    }
  }

  // Validate success responses
  if (body.success === true) {
    const successValidation = validateSuccessResponse(body, statusCode);
    if (!successValidation.isValid) {
      errors.push(...successValidation.errors);
    }
  }

  // Validate error responses
  if (body.success === false) {
    const errorValidation = validateErrorResponse(body, statusCode);
    if (!errorValidation.isValid) {
      errors.push(...errorValidation.errors);
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate success response structure
 */
function validateSuccessResponse(body: any, statusCode: number): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Success responses should have 2xx status codes
  if (statusCode < 200 || statusCode >= 300) {
    errors.push(`Success response should have 2xx status code, got ${statusCode}`);
  }

  // Success responses should have data field (except for delete operations)
  if (statusCode !== 204 && !body.hasOwnProperty('data') && statusCode !== 200) {
    // Allow 200 responses without data for delete operations
    if (!body.message || !body.message.toLowerCase().includes('deleted')) {
      errors.push('Success response should include a "data" field');
    }
  }

  // Validate pagination structure if present
  if (body.pagination) {
    const paginationValidation = validatePaginationStructure(body.pagination);
    if (!paginationValidation.isValid) {
      errors.push(...paginationValidation.errors);
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate error response structure
 */
function validateErrorResponse(body: any, statusCode: number): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Error responses should have 4xx or 5xx status codes
  if (statusCode < 400) {
    errors.push(`Error response should have 4xx or 5xx status code, got ${statusCode}`);
  }

  // Error responses should have error field
  if (!body.error) {
    errors.push('Error response must include an "error" field');
  }

  // Error field should be a string
  if (body.error && typeof body.error !== 'string') {
    errors.push('Error field must be a string');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate pagination structure
 */
function validatePaginationStructure(pagination: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const requiredFields = ['page', 'limit', 'total', 'totalPages', 'hasNext', 'hasPrev'];

  for (const field of requiredFields) {
    if (!pagination.hasOwnProperty(field)) {
      errors.push(`Pagination must include "${field}" field`);
    }
  }

  // Validate field types
  if (typeof pagination.page !== 'number' || pagination.page < 1) {
    errors.push('Pagination page must be a positive number');
  }

  if (typeof pagination.limit !== 'number' || pagination.limit < 1) {
    errors.push('Pagination limit must be a positive number');
  }

  if (typeof pagination.total !== 'number' || pagination.total < 0) {
    errors.push('Pagination total must be a non-negative number');
  }

  if (typeof pagination.totalPages !== 'number' || pagination.totalPages < 0) {
    errors.push('Pagination totalPages must be a non-negative number');
  }

  if (typeof pagination.hasNext !== 'boolean') {
    errors.push('Pagination hasNext must be a boolean');
  }

  if (typeof pagination.hasPrev !== 'boolean') {
    errors.push('Pagination hasPrev must be a boolean');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate status code consistency with response body
 */
function validateStatusCodeConsistency(body: any, statusCode: number): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // If body has statusCode field, it should match actual status code
  if (body.statusCode && body.statusCode !== statusCode) {
    errors.push(`Response statusCode field (${body.statusCode}) doesn't match actual status code (${statusCode})`);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validate timestamp format
 */
function isValidTimestamp(timestamp: any): boolean {
  if (typeof timestamp !== 'string') return false;
  
  try {
    const date = new Date(timestamp);
    return date.toISOString() === timestamp;
  } catch {
    return false;
  }
}

/**
 * Log response for monitoring
 */
function logResponse(statusCode: number, body: any, validationResult: { isValid: boolean; errors: string[] }): void {
  const logData = {
    statusCode,
    isValid: validationResult.isValid,
    hasData: !!body.data,
    hasPagination: !!body.pagination,
    hasError: !!body.error,
    bodySize: JSON.stringify(body).length,
    validationErrors: validationResult.errors
  };

  if (validationResult.isValid) {
    logger.debug('API Response validated successfully', logData);
  } else {
    logger.warn('API Response validation issues', logData);
  }
}

export default responseValidator;
