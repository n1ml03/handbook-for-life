import { Request, Response, NextFunction } from 'express';
import { ApiSuccess, ApiError, PaginatedApiResponse, formatDateForApi } from '../types/api';
import { PaginatedResult } from '../models/BaseModel';
import logger from '../config/logger';
import { formatISO, isValid } from 'date-fns';

declare global {
  namespace Express {
    interface Response {
      success<T>(data: T, message?: string, meta?: Record<string, any>): Response;
      error(error: string, statusCode?: number, details?: Record<string, unknown>): Response;
      paginated<T>(result: PaginatedResult<T>, meta?: Record<string, any>): Response;
      created<T>(data: T, message?: string, location?: string): Response;
      updated<T>(data: T, message?: string): Response;
      deleted(message?: string): Response;
      noContent(): Response;
      cached<T>(data: T, cacheInfo?: { maxAge: number; lastModified?: Date }): Response;
    }
  }
}

export const responseFormatter = (_req: Request, res: Response, next: NextFunction): void => {
  // Enhanced success response method
  res.success = function <T>(data: T, message?: string, meta?: Record<string, any>): Response {
    const response: ApiSuccess<T> & { meta?: Record<string, any> } = {
      success: true,
      data: formatResponseDates(data),
      message,
      timestamp: new Date().toISOString(),
      ...(meta && { meta })
    };

    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug('API Success Response', {
        statusCode: 200,
        dataType: typeof data,
        hasMessage: !!message,
        hasMeta: !!meta
      });
    }

    return this.json(response);
  };

  // Enhanced error response method
  res.error = function (error: string, statusCode: number = 500, details?: Record<string, unknown>): Response {
    const response: ApiError = {
      success: false,
      error,
      details,
      timestamp: new Date().toISOString(),
      statusCode,
    };

    // Log error responses
    logger.error('API Error Response', {
      statusCode,
      error,
      details
    });

    return this.status(statusCode).json(response);
  };

  // Enhanced paginated response method
  res.paginated = function <T>(result: PaginatedResult<T>, meta?: Record<string, any>): Response {
    const response: PaginatedApiResponse<T> & { meta?: Record<string, any> } = {
      success: true,
      data: formatArrayDates(result.data),
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
      ...(meta && { meta })
    };

    // Log paginated responses in development
    if (process.env.NODE_ENV === 'development') {
      logger.debug('API Paginated Response', {
        statusCode: 200,
        itemCount: result.data.length,
        page: result.pagination.page,
        totalPages: result.pagination.totalPages,
        hasMeta: !!meta
      });
    }

    return this.json(response);
  };

  // Created response (201)
  res.created = function <T>(data: T, message?: string, location?: string): Response {
    const response: ApiSuccess<T> = {
      success: true,
      data: formatResponseDates(data),
      message: message || 'Resource created successfully',
      timestamp: new Date().toISOString(),
    };

    if (location) {
      this.location(location);
    }

    logger.info('API Created Response', {
      statusCode: 201,
      location,
      dataType: typeof data
    });

    return this.status(201).json(response);
  };

  // Updated response (200)
  res.updated = function <T>(data: T, message?: string): Response {
    const response: ApiSuccess<T> = {
      success: true,
      data: formatResponseDates(data),
      message: message || 'Resource updated successfully',
      timestamp: new Date().toISOString(),
    };

    logger.info('API Updated Response', {
      statusCode: 200,
      dataType: typeof data
    });

    return this.json(response);
  };

  // Deleted response (200)
  res.deleted = function (message?: string): Response {
    const response = {
      success: true,
      message: message || 'Resource deleted successfully',
      timestamp: new Date().toISOString(),
    };

    logger.info('API Deleted Response', {
      statusCode: 200
    });

    return this.json(response);
  };

  // No content response (204)
  res.noContent = function (): Response {
    logger.debug('API No Content Response', {
      statusCode: 204
    });

    return this.status(204).send();
  };

  // Cached response with cache headers
  res.cached = function <T>(data: T, cacheInfo?: { maxAge: number; lastModified?: Date }): Response {
    if (cacheInfo) {
      this.set('Cache-Control', `public, max-age=${cacheInfo.maxAge}`);
      if (cacheInfo.lastModified) {
        this.set('Last-Modified', cacheInfo.lastModified.toUTCString());
      }
    }

    const response: ApiSuccess<T> = {
      success: true,
      data: formatResponseDates(data),
      timestamp: new Date().toISOString(),
    };

    logger.debug('API Cached Response', {
      statusCode: 200,
      maxAge: cacheInfo?.maxAge,
      hasLastModified: !!cacheInfo?.lastModified
    });

    return this.json(response);
  };

  next();
};

// Helper function to format dates in response objects
function formatResponseDates<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (obj instanceof Date) {
    return formatDateForApi(obj) as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => formatResponseDates(item)) as T;
  }
  
  const formatted = { ...obj as any };
  
  Object.keys(formatted).forEach(key => {
    const value = formatted[key];
    
    if (value instanceof Date) {
      formatted[key] = formatDateForApi(value);
    } else if (typeof value === 'object' && value !== null) {
      formatted[key] = formatResponseDates(value);
    }
  });
  
  return formatted;
}

// Helper function to format dates in arrays
function formatArrayDates<T>(arr: T[]): T[] {
  return arr.map(item => formatResponseDates(item));
}

export default responseFormatter; 