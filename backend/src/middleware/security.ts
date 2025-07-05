import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import logger from '../config/logger';

/**
 * Security middleware for API protection
 */

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

// Different rate limits for different endpoints
export const rateLimits = {
  // General API rate limit
  general: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // 100 requests per window
    'Too many requests from this IP, please try again later'
  ),
  
  // Stricter limit for write operations
  mutations: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    20, // 20 requests per window
    'Too many write operations from this IP, please try again later'
  ),
  
  // Very strict limit for upload operations
  uploads: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    5, // 5 requests per window
    'Too many upload requests from this IP, please try again later'
  ),
  
  // Moderate limit for search operations
  search: createRateLimit(
    1 * 60 * 1000, // 1 minute
    30, // 30 requests per window
    'Too many search requests, please slow down'
  )
};

/**
 * Input sanitization middleware
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      const sanitizedBody = sanitizeObject(req.body);
      // Clear and reassign properties to avoid readonly assignment error
      Object.keys(req.body).forEach(key => delete req.body[key]);
      Object.assign(req.body, sanitizedBody);
    }
    
    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      const sanitizedQuery = sanitizeObject(req.query);
      // Clear and reassign properties to avoid readonly assignment error
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

/**
 * Recursively sanitize object properties
 */
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
      // Sanitize key names to prevent prototype pollution
      const sanitizedKey = sanitizeString(key);
      if (sanitizedKey && !['__proto__', 'constructor', 'prototype'].includes(sanitizedKey)) {
        sanitized[sanitizedKey] = sanitizeObject(value);
      }
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Sanitize string input
 */
function sanitizeString(str: string): string {
  if (typeof str !== 'string') {
    return str;
  }
  
  // Remove potential XSS vectors
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Security headers middleware using helmet
 */
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
  crossOriginEmbedderPolicy: false, // Disable for API
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

/**
 * Request validation middleware
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  // Check for required headers
  const userAgent = req.get('user-agent');
  if (!userAgent) {
    logger.warn('Request without User-Agent header', { ip: req.ip, url: req.url });
  }
  
  // Validate Content-Type for POST/PUT requests
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
  
  // Log suspicious requests
  const suspiciousPatterns = [
    /\.\./,  // Path traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /exec\(/i,  // Code injection
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

/**
 * API key validation middleware (for future use)
 */
export const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  // Skip API key validation in development
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

/**
 * CORS configuration for production
 */
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    logger.warn('CORS blocked request', { origin, ip: origin });
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'X-API-Key'],
  exposedHeaders: ['X-Request-ID', 'X-RateLimit-Limit', 'X-RateLimit-Remaining']
};

/**
 * Request logging middleware for security monitoring
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();

  // Log incoming request using enhanced logger
  logger.logApiRequest(req);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.logRequest(req, res, duration);
  });

  next();
};
