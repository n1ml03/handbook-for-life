import { Request, Response, NextFunction } from 'express';
import { ApiSuccess, ApiError, PaginatedApiResponse, formatDateForApi } from '../types/api';
import { PaginatedResult } from '../models/BaseModel';

declare global {
  namespace Express {
    interface Response {
      success<T>(data: T, message?: string): Response;
      error(error: string, statusCode?: number, details?: Record<string, unknown>): Response;
      paginated<T>(result: PaginatedResult<T>): Response;
    }
  }
}

export const responseFormatter = (req: Request, res: Response, next: NextFunction): void => {
  // Success response method
  res.success = function <T>(data: T, message?: string): Response {
    const response: ApiSuccess<T> = {
      success: true,
      data: formatResponseDates(data),
      message,
      timestamp: new Date().toISOString(),
    };
    
    return this.json(response);
  };

  // Error response method
  res.error = function (error: string, statusCode: number = 500, details?: Record<string, unknown>): Response {
    const response: ApiError = {
      success: false,
      error,
      details,
      timestamp: new Date().toISOString(),
      statusCode,
    };
    
    return this.status(statusCode).json(response);
  };

  // Paginated response method
  res.paginated = function <T>(result: PaginatedResult<T>): Response {
    const response: PaginatedApiResponse<T> = {
      success: true,
      data: formatArrayDates(result.data),
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
    
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