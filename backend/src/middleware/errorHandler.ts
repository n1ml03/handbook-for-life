import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

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

// Utility functions for database error handling
function getDatabaseErrorStatusCode(error: any): number {
  switch (error.code) {
    case 'ER_DUP_ENTRY':
    case 'ER_DUP_UNIQUE':
      return 409; // Conflict
    case 'ER_NO_REFERENCED_ROW_2':
    case 'ER_ROW_IS_REFERENCED_2':
      return 400; // Bad Request
    case 'ER_ACCESS_DENIED_ERROR':
      return 401; // Unauthorized
    case 'ER_BAD_DB_ERROR':
    case 'ER_NO_SUCH_TABLE':
      return 500; // Internal Server Error
    case 'ER_LOCK_WAIT_TIMEOUT':
    case 'ER_LOCK_DEADLOCK':
      return 503; // Service Unavailable
    case 'PROTOCOL_CONNECTION_LOST':
    case 'ECONNREFUSED':
      return 503; // Service Unavailable
    default:
      return 500; // Internal Server Error
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

// Database-specific error class
export class DatabaseError extends AppError {
  constructor(
    message: string,
    originalError: any,
    context?: Record<string, any>
  ) {
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

// Validation error class
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
  const errorId = generateErrorId();

  // Enhanced error logging with more context
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

  // Log error with appropriate level
  if (error.isOperational && statusCode < 500) {
    logger.warn(`Operational error: ${error.message}`, logContext);
  } else {
    logger.error(`System error: ${error.message}`, logContext);
  }

  // Handle specific error types
  if (error instanceof DatabaseError) {
    // Database errors are already processed
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ValidationError) {
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

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
  }

  // Prepare response
  const response: any = {
    success: false,
    error: message,
    errorId,
    timestamp: new Date().toISOString()
  };

  // Add development-only information
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

// Generate unique error ID for tracking using nanoid
import { generateId } from '../utils/id';

function generateErrorId(): string {
  return `err_${generateId()}`;
}

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
      // Add context to error if provided
      if (context && error instanceof Error) {
        error.message = `${context}: ${error.message}`;
      }

      // Convert database errors to DatabaseError instances
      if (error.code && (error.errno || error.sqlState)) {
        const dbError = new DatabaseError(
          error.message,
          error,
          { context, route: `${req.method} ${req.path}` }
        );
        next(dbError);
      } else {
        next(error);
      }
    });
  };
};

// Specialized async handler for database operations
export const dbAsyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
  operation?: string
) => {
  return asyncHandler(fn, operation ? `Database ${operation}` : 'Database operation');
};

// Request timeout handler
export const timeoutHandler = (timeoutMs: number = 30000) => {
  return (_req: Request, res: Response, next: NextFunction): void => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        const error = new AppError('Request timeout', 408, true, 'REQUEST_TIMEOUT');
        next(error);
      }
    }, timeoutMs);

    // Clear timeout when response is finished
    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));

    next();
  };
};