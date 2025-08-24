import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import logger from '../config/logger';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import appConfig from '../config/app';

/**
 * Security middleware for API protection
 */

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
  // General API rate limit
  general: appConfig.security.enableRateLimit ? createRateLimit(
    appConfig.security.rateLimitWindow, // Use config window
    appConfig.security.rateLimitMax, // Use config max
    'Too many requests from this IP, please try again later'
  ) : createNoOpMiddleware(),
  
  // Stricter limit for write operations
  mutations: appConfig.security.enableRateLimit ? createRateLimit(
    appConfig.security.rateLimitWindow, // Use config window
    Math.floor(appConfig.security.rateLimitMax * 0.2), // 20% of general limit
    'Too many write operations from this IP, please try again later'
  ) : createNoOpMiddleware(),
  
  // Very strict limit for upload operations
  uploads: appConfig.security.enableRateLimit ? createRateLimit(
    appConfig.security.rateLimitWindow, // Use config window
    Math.floor(appConfig.security.rateLimitMax * 0.05), // 5% of general limit
    'Too many upload requests from this IP, please try again later'
  ) : createNoOpMiddleware(),
  
  // Moderate limit for search operations
  search: appConfig.security.enableRateLimit ? createRateLimit(
    1 * 60 * 1000, // 1 minute
    30, // 30 requests per window
    'Too many search requests, please slow down'
  ) : createNoOpMiddleware()
};

// Helper function to get current rate limiting status
export const getRateLimitingStatus = () => {
  return {
    enabled: appConfig.security.enableRateLimit,
    window: appConfig.security.rateLimitWindow,
    max: appConfig.security.rateLimitMax,
    environment: appConfig.environment
  };
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
 * Sanitize string input using DOMPurify for robust HTML sanitization
 */
function sanitizeString(str: string): string {
  if (typeof str !== 'string') {
    return str;
  }

  // First pass: Basic sanitization for non-HTML content
  let sanitized = str
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();

  // Second pass: Use DOMPurify for HTML content detection and sanitization
  // Only apply DOMPurify if the string contains HTML-like content
  if (/<[^>]*>/g.test(sanitized)) {
    try {
      sanitized = purify.sanitize(sanitized, {
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false
      });
    } catch (error) {
      logger.warn('DOMPurify sanitization error:', error);
      // Fallback to basic sanitization if DOMPurify fails
      sanitized = sanitized
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, ''); // Remove all HTML tags as fallback
    }
  }

  return sanitized;
}

/**
 * Sanitize rich text content (for TipTap editor content)
 * More permissive than regular string sanitization
 */
export function sanitizeRichText(content: any): any {
  if (typeof content === 'string') {
    try {
      // Use DOMPurify with more permissive settings for rich text
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
      return content; // Return original if sanitization fails
    }
  }

  // Handle TipTap JSON content
  if (typeof content === 'object' && content !== null) {
    return sanitizeObject(content);
  }

  return content;
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
 * CORS configuration for development and production with network access support
 */
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // Get allowed origins from environment
    const corsOrigins = process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) || [];

    // In development, allow configured origins plus common development patterns
    if (process.env.NODE_ENV === 'development') {
      // Allow configured CORS origins
      if (corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow localhost and 127.0.0.1 on any port for development
      if (origin.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/)) {
        return callback(null, true);
      }

      // Allow local network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x) for network access
      if (origin.match(/^https?:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)(:\d+)?$/)) {
        return callback(null, true);
      }

      // Log and allow other origins in development for debugging
      logger.info('CORS allowing development origin', { origin });
      return callback(null, true);
    }

    // In production, strictly check against allowed origins
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
