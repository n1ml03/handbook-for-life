/**
 * Consolidated Middleware Module
 * Combines error handling, response formatting, validation middleware, and security
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import logger from '../config/logger';
import { generateId } from '../utils/utils';
import { ApiSuccess, ApiError as ApiErrorResponse, PaginatedApiResponse, formatDateForApi } from '../types';
import { PaginatedResult } from '../models/BaseModel';
import appConfig from '../config/app';

// ============================================================================
// ERROR HANDLING
// ============================================================================

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
  errno?: number;
  sqlState?: string;
}

export class AppError extends Error implements ApiError {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
    context?: Record<string, any>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Database error utilities
function getDatabaseErrorStatusCode(error: any): number {
  switch (error.code) {
    case 'ER_DUP_ENTRY':
    case 'ER_DUP_UNIQUE':
      return 409;
    case 'ER_NO_REFERENCED_ROW_2':
    case 'ER_ROW_IS_REFERENCED_2':
      return 400;
    case 'ER_ACCESS_DENIED_ERROR':
      return 401;
    case 'ER_BAD_DB_ERROR':
    case 'ER_NO_SUCH_TABLE':
      return 500;
    case 'ER_LOCK_WAIT_TIMEOUT':
    case 'ER_LOCK_DEADLOCK':
    case 'PROTOCOL_CONNECTION_LOST':
    case 'ECONNREFUSED':
      return 503;
    default:
      return 500;
  }
}

function getDatabaseErrorMessage(error: any, fallbackMessage: string): string {
  switch (error.code) {
    case 'ER_DUP_ENTRY':
      return 'A record with this information already exists';
    case 'ER_NO_REFERENCED_ROW_2':
      return 'Referenced record does not exist';
    case 'ER_ROW_IS_REFERENCED_2':
      return 'Cannot delete record as it is referenced by other records';
    case 'ER_ACCESS_DENIED_ERROR':
      return 'Database access denied';
    case 'ER_BAD_DB_ERROR':
      return 'Database not found';
    case 'ER_NO_SUCH_TABLE':
      return 'Required database table not found';
    case 'ER_LOCK_WAIT_TIMEOUT':
      return 'Operation timed out due to database lock';
    case 'ER_LOCK_DEADLOCK':
      return 'Operation failed due to database deadlock';
    case 'PROTOCOL_CONNECTION_LOST':
      return 'Database connection lost';
    case 'ECONNREFUSED':
      return 'Unable to connect to database';
    default:
      return fallbackMessage || 'Database operation failed';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, originalError: any, context?: Record<string, any>) {
    const statusCode = getDatabaseErrorStatusCode(originalError);
    const userMessage = getDatabaseErrorMessage(originalError, message);
    super(userMessage, statusCode, true, originalError.code, {
      ...context,
      errno: originalError.errno,
      sqlState: originalError.sqlState,
      originalMessage: originalError.message
    });
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string, value?: any) {
    super(message, 400, true, 'VALIDATION_ERROR', {
      field,
      value: typeof value === 'object' ? JSON.stringify(value) : value
    });
  }
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let { statusCode = 500, message } = error;
  const errorId = `err_${generateId()}`;

  const logContext = {
    errorId,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent') || '',
    body: req.method !== 'GET' ? req.body : undefined,
    params: req.params,
    query: req.query,
    code: error.code,
    errno: (error as any).errno,
    sqlState: (error as any).sqlState,
    isOperational: error.isOperational,
    timestamp: new Date().toISOString()
  };

  if (error.isOperational && statusCode < 500) {
    logger.warn(`Operational error: ${error.message}`, logContext);
  } else {
    logger.error(`System error: ${error.message}`, logContext);
  }

  // Handle specific error types
  if (error instanceof DatabaseError || error instanceof ValidationError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (error.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File too large';
  } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Unexpected file field';
  } else if (error.message?.includes('timeout')) {
    statusCode = 408;
    message = 'Request timeout';
  } else if (error.message?.includes('Connection acquisition timeout')) {
    statusCode = 503;
    message = 'Service temporarily unavailable';
  }

  const isDevelopment = process.env.NODE_ENV === 'development';
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
  }

  const response: any = {
    success: false,
    error: message,
    errorId,
    timestamp: new Date().toISOString()
  };

  if (isDevelopment) {
    response.stack = error.stack;
    response.details = {
      code: error.code,
      errno: (error as any).errno,
      sqlState: (error as any).sqlState,
      context: (error as any).context
    };
  }

  res.status(statusCode).json(response);
};

export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new AppError(`Not found - ${req.originalUrl}`, 404);
  next(error);
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
  context?: string
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      if (context && error instanceof Error) {
        error.message = `${context}: ${error.message}`;
      }
      if (error.code && (error.errno || error.sqlState)) {
        const dbError = new DatabaseError(error.message, error, { context, route: `${req.method} ${req.path}` });
        next(dbError);
      } else {
        next(error);
      }
    });
  };
};

export const dbAsyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
  operation?: string
) => {
  return asyncHandler(fn, operation ? `Database ${operation}` : 'Database operation');
};

export const timeoutHandler = (timeoutMs: number = 30000) => {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        const error = new AppError('Request timeout', 408, true, 'REQUEST_TIMEOUT');
        next(error);
      }
    }, timeoutMs);
    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));
    next();
  };
};

// ============================================================================
// RESPONSE FORMATTING
// ============================================================================

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

function formatResponseDates<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return formatDateForApi(obj) as T;
  if (Array.isArray(obj)) return obj.map(item => formatResponseDates(item)) as T;
  
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

function formatArrayDates<T>(arr: T[]): T[] {
  return arr.map(item => formatResponseDates(item));
}

export const responseFormatter = (_req: Request, res: Response, next: NextFunction): void => {
  res.success = function <T>(data: T, message?: string, meta?: Record<string, any>): Response {
    const response: ApiSuccess<T> & { meta?: Record<string, any> } = {
      success: true,
      data: formatResponseDates(data),
      message,
      timestamp: new Date().toISOString(),
      ...(meta && { meta })
    };
    return this.json(response);
  };

  res.error = function (error: string, statusCode: number = 500, details?: Record<string, unknown>): Response {
    const response: ApiErrorResponse = {
      success: false,
      error,
      details,
      timestamp: new Date().toISOString(),
      statusCode,
    };
    logger.error('API Error Response', { statusCode, error, details });
    return this.status(statusCode).json(response);
  };

  res.paginated = function <T>(result: PaginatedResult<T>, meta?: Record<string, any>): Response {
    const response: PaginatedApiResponse<T> & { meta?: Record<string, any> } = {
      success: true,
      data: formatArrayDates(result.data),
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
      ...(meta && { meta })
    };
    return this.json(response);
  };

  res.created = function <T>(data: T, message?: string, location?: string): Response {
    const response: ApiSuccess<T> = {
      success: true,
      data: formatResponseDates(data),
      message: message || 'Resource created successfully',
      timestamp: new Date().toISOString(),
    };
    if (location) this.location(location);
    return this.status(201).json(response);
  };

  res.updated = function <T>(data: T, message?: string): Response {
    const response: ApiSuccess<T> = {
      success: true,
      data: formatResponseDates(data),
      message: message || 'Resource updated successfully',
      timestamp: new Date().toISOString(),
    };
    return this.json(response);
  };

  res.deleted = function (message?: string): Response {
    const response = {
      success: true,
      message: message || 'Resource deleted successfully',
      timestamp: new Date().toISOString(),
    };
    return this.json(response);
  };

  res.noContent = function (): Response {
    return this.status(204).send();
  };

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
    return this.json(response);
  };

  next();
};

// ============================================================================
// VALIDATION
// ============================================================================

export const validate = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      logger.warn('Validation error:', {
        errors: result.error.errors,
        body: req.body,
        url: req.url,
        method: req.method
      });
      res.error('Validation error', 400, {
        field: result.error.errors[0]?.path?.join('.'),
        message: result.error.errors[0]?.message,
        code: result.error.errors[0]?.code,
        allErrors: result.error.errors.map(err => ({
          field: err.path?.join('.'),
          message: err.message,
          code: err.code
        }))
      });
      return;
    }
    req.body = result.data;
    next();
  };
};

export const validateParams = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      logger.warn('Parameter validation error:', result.error.errors[0]?.message);
      res.error('Parameter validation error', 400, {
        field: result.error.errors[0]?.path?.join('.'),
        message: result.error.errors[0]?.message,
        code: result.error.errors[0]?.code
      });
      return;
    }
    req.params = result.data;
    next();
  };
};

export const validateQuery = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      logger.warn('Query validation error:', result.error.errors[0]?.message);
      res.error('Query validation error', 400, {
        field: result.error.errors[0]?.path?.join('.'),
        message: result.error.errors[0]?.message,
        code: result.error.errors[0]?.code
      });
      return;
    }
    Object.assign(req.query, result.data);
    next();
  };
};

export const validateRequestSize = (req: Request, res: Response, next: NextFunction): void => {
  const maxBodySize = 10 * 1024 * 1024; // 10MB
  const maxQueryLength = 2048; // 2KB

  if (req.headers['content-length']) {
    const contentLength = parseInt(req.headers['content-length']);
    if (contentLength > maxBodySize) {
      res.status(413).json({
        success: false,
        error: 'Request body too large',
        message: 'Request body exceeds maximum allowed size'
      });
      return;
    }
  }

  const queryString = req.url.split('?')[1] || '';
  if (queryString.length > maxQueryLength) {
    res.status(414).json({
      success: false,
      error: 'Query string too long',
      message: 'Query string exceeds maximum allowed length'
    });
    return;
  }

  next();
};

// ============================================================================
// RESPONSE VALIDATOR
// ============================================================================

export interface ResponseValidatorOptions {
  enforceStandardFormat?: boolean;
  logResponses?: boolean;
  validateStatusCodes?: boolean;
  requireTimestamp?: boolean;
  requireSuccessField?: boolean;
}

export function responseValidator(options: ResponseValidatorOptions = {}) {
  const {
    enforceStandardFormat = false,
    logResponses = false,
    validateStatusCodes = true,
    requireTimestamp = true,
    requireSuccessField = true
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const originalJson = res.json.bind(res);

    res.json = function (body: any): Response {
      if (enforceStandardFormat && process.env.NODE_ENV === 'development') {
        const warnings: string[] = [];

        if (requireSuccessField && typeof body.success !== 'boolean') {
          warnings.push('Response missing "success" field');
        }

        if (requireTimestamp && !body.timestamp) {
          warnings.push('Response missing "timestamp" field');
        }

        if (validateStatusCodes) {
          const statusCode = res.statusCode;
          const isSuccess = body.success === true;

          if (statusCode >= 200 && statusCode < 300 && !isSuccess) {
            warnings.push(`Status code ${statusCode} but success=false`);
          }

          if (statusCode >= 400 && isSuccess) {
            warnings.push(`Status code ${statusCode} but success=true`);
          }
        }

        if (warnings.length > 0) {
          logger.warn('Response validation warnings', {
            url: req.url,
            method: req.method,
            statusCode: res.statusCode,
            warnings,
            body: JSON.stringify(body).substring(0, 200)
          });
        }
      }

      if (logResponses && process.env.NODE_ENV === 'development') {
        logger.debug('API Response', {
          url: req.url,
          method: req.method,
          statusCode: res.statusCode,
          bodyPreview: JSON.stringify(body).substring(0, 200)
        });
      }

      return originalJson(body);
    };

    next();
  };
}

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

// Initialize DOMPurify with JSDOM for server-side HTML sanitization
const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

// Configure DOMPurify for strict sanitization
purify.setConfig({
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'],
  ALLOWED_ATTR: ['class', 'id'],
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  SANITIZE_DOM: true,
  SANITIZE_NAMED_PROPS: true,
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: false
});

// Rate limiting configurations
export const createRateLimit = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: 'Too many requests',
      message,
      retryAfter: Math.ceil(windowMs / 1000),
      timestamp: new Date().toISOString()
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        url: req.url,
        method: req.method
      });

      res.status(429).json({
        success: false,
        error: 'Too many requests',
        message,
        retryAfter: Math.ceil(windowMs / 1000),
        timestamp: new Date().toISOString()
      });
    }
  });
};

// Middleware that passes through if rate limiting is disabled
const createNoOpMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    next();
  };
};

// Different rate limits for different endpoints
export const rateLimits = {
  general: appConfig.security.enableRateLimit ? createRateLimit(
    appConfig.security.rateLimitWindow,
    appConfig.security.rateLimitMax,
    'Too many requests from this IP, please try again later'
  ) : createNoOpMiddleware(),

  mutations: appConfig.security.enableRateLimit ? createRateLimit(
    appConfig.security.rateLimitWindow,
    Math.floor(appConfig.security.rateLimitMax * 0.2),
    'Too many write operations from this IP, please try again later'
  ) : createNoOpMiddleware(),

  uploads: appConfig.security.enableRateLimit ? createRateLimit(
    appConfig.security.rateLimitWindow,
    Math.floor(appConfig.security.rateLimitMax * 0.05),
    'Too many upload requests from this IP, please try again later'
  ) : createNoOpMiddleware(),

  search: appConfig.security.enableRateLimit ? createRateLimit(
    1 * 60 * 1000,
    30,
    'Too many search requests, please slow down'
  ) : createNoOpMiddleware()
};

export const getRateLimitingStatus = () => {
  return {
    enabled: appConfig.security.enableRateLimit,
    window: appConfig.security.rateLimitWindow,
    max: appConfig.security.rateLimitMax,
    environment: appConfig.environment
  };
};

export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (req.body && typeof req.body === 'object') {
      const sanitizedBody = sanitizeObject(req.body);
      Object.keys(req.body).forEach(key => delete req.body[key]);
      Object.assign(req.body, sanitizedBody);
    }

    if (req.query && typeof req.query === 'object') {
      const sanitizedQuery = sanitizeObject(req.query);
      Object.keys(req.query).forEach(key => delete req.query[key]);
      Object.assign(req.query, sanitizedQuery);
    }

    next();
  } catch (error) {
    logger.error('Input sanitization error:', error);
    res.error('Invalid input data', 400, {
      message: 'Request contains invalid or potentially harmful data'
    });
  }
};

function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = sanitizeString(key);
      if (sanitizedKey && !['__proto__', 'constructor', 'prototype'].includes(sanitizedKey)) {
        sanitized[sanitizedKey] = sanitizeObject(value);
      }
    }
    return sanitized;
  }

  return obj;
}

function sanitizeString(str: string): string {
  if (typeof str !== 'string') {
    return str;
  }

  let sanitized = str
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();

  if (/<[^>]*>/g.test(sanitized)) {
    try {
      sanitized = purify.sanitize(sanitized, {
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false
      });
    } catch (error) {
      logger.warn('DOMPurify sanitization error:', error);
      sanitized = sanitized
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '');
    }
  }

  return sanitized;
}

export function sanitizeRichText(content: any): any {
  if (typeof content === 'string') {
    try {
      return purify.sanitize(content, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'em', 'u', 's', 'sub', 'sup',
          'ol', 'ul', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          'blockquote', 'code', 'pre', 'a', 'img', 'table', 'thead',
          'tbody', 'tr', 'td', 'th', 'hr', 'div', 'span'
        ],
        ALLOWED_ATTR: [
          'href', 'src', 'alt', 'title', 'class', 'id', 'style',
          'target', 'rel', 'colspan', 'rowspan'
        ],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false
      });
    } catch (error) {
      logger.warn('Rich text sanitization error:', error);
      return content;
    }
  }

  if (typeof content === 'object' && content !== null) {
    return sanitizeObject(content);
  }

  return content;
}

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const userAgent = req.get('user-agent');
  if (!userAgent) {
    logger.warn('Request without User-Agent header', { ip: req.ip, url: req.url });
  }

  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('content-type');
    if (contentType && !contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
      res.error('Unsupported Content-Type', 415, {
        expected: 'application/json or multipart/form-data',
        received: contentType
      });
      return;
    }
  }

  const suspiciousPatterns = [
    /\.\./,
    /<script/i,
    /union.*select/i,
    /exec\(/i,
  ];

  const url = req.url.toLowerCase();
  const body = JSON.stringify(req.body || {}).toLowerCase();

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(body)) {
      logger.warn('Suspicious request detected', {
        ip: req.ip,
        userAgent: req.get('user-agent'),
        url: req.url,
        method: req.method,
        pattern: pattern.toString()
      });
      break;
    }
  }

  next();
};

export const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  if (process.env.NODE_ENV === 'development') {
    next();
    return;
  }

  const apiKey = req.get('x-api-key');
  const validApiKeys = process.env.API_KEYS?.split(',') || [];

  if (!apiKey || !validApiKeys.includes(apiKey)) {
    logger.warn('Invalid or missing API key', {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      hasApiKey: !!apiKey
    });

    res.error('Invalid or missing API key', 401, {
      message: 'A valid API key is required to access this resource'
    });
    return;
  }

  next();
};

export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      return callback(null, true);
    }

    const corsOrigins = process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) || [];

    if (process.env.NODE_ENV === 'development') {
      if (corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (origin.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/)) {
        return callback(null, true);
      }

      if (origin.match(/^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/)) {
        return callback(null, true);
      }

      logger.info('CORS allowing development origin', { origin });
      return callback(null, true);
    }

    if (corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    logger.warn('CORS blocked request', { origin, allowedOrigins: corsOrigins });
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-API-Key'],
  exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining']
};

export const securityLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  logger.logApiRequest(req);

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.logRequest(req, res, duration);
  });

  next();
};

export default {
  errorHandler,
  notFound,
  asyncHandler,
  dbAsyncHandler,
  timeoutHandler,
  responseFormatter,
  responseValidator,
  validate,
  validateParams,
  validateQuery,
  validateRequestSize,
  AppError,
  DatabaseError,
  ValidationError
};
