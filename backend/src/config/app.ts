// ============================================================================
// APPLICATION CONFIGURATION
// ============================================================================

import { config } from 'dotenv';

// Load environment variables
config();

export interface AppConfig {
  // Server settings
  port: number;
  host: string;
  environment: 'development' | 'production' | 'staging' | 'test';
  
  // API settings
  apiPrefix: string;
  apiVersion: string;
  
  // Security settings
  security: {
    enableHttps: boolean;
    enableHelmet: boolean;
    enableCors: boolean;
    corsOrigins: string[];
    enableRateLimit: boolean;
    rateLimitWindow: number;
    rateLimitMax: number;
    jwtSecret: string;
    jwtExpiration: string;
    bcryptRounds: number;
  };
  
  // Database settings
  database: {
    connectionRetries: number;
    retryDelay: number;
    enableHealthCheck: boolean;
    healthCheckInterval: number;
  };
  
  // Upload settings
  upload: {
    maxFileSize: number;
    allowedMimeTypes: string[];
    uploadDir: string;
    tempDir: string;
  };
  
  // Pagination settings
  pagination: {
    defaultLimit: number;
    maxLimit: number;
    defaultPage: number;
  };
  
  // CORS settings
  cors: {
    origin: boolean | string | string[];
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
  };
  
  // Cache settings
  cache: {
    ttl: number;
    checkPeriod: number;
    maxKeys: number;
  };
  
  // Search settings
  search: {
    minQueryLength: number;
    maxResults: number;
    enableFuzzy: boolean;
  };
  
  // Logging settings
  logging: {
    level: string;
    enableFile: boolean;
    enableConsole: boolean;
    maxFileSize: number;
    maxFiles: number;
  };
}

const appConfig: AppConfig = {
  // Server settings
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',
  environment: (process.env.NODE_ENV as AppConfig['environment']) || 'development',
  
  // API settings
  apiPrefix: process.env.API_PREFIX || '/api',
  apiVersion: process.env.API_VERSION || 'v1',
  
  // Security settings
  security: {
    enableHttps: process.env.ENABLE_HTTPS === 'true',
    enableHelmet: process.env.ENABLE_HELMET !== 'false',
    enableCors: process.env.ENABLE_CORS !== 'false',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'],
    enableRateLimit: process.env.ENABLE_RATE_LIMIT === 'true',
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000', 10), // 15 minutes
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    jwtExpiration: process.env.JWT_EXPIRATION || '24h',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  },
  
  // Database settings
  database: {
    connectionRetries: parseInt(process.env.DB_CONNECTION_RETRIES || '3', 10),
    retryDelay: parseInt(process.env.DB_RETRY_DELAY || '5000', 10),
    enableHealthCheck: process.env.DB_ENABLE_HEALTH_CHECK !== 'false',
    healthCheckInterval: parseInt(process.env.DB_HEALTH_CHECK_INTERVAL || '30000', 10),
  },
  
  // Upload settings
  upload: {
    maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedMimeTypes: process.env.UPLOAD_ALLOWED_TYPES?.split(',') || [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/csv',
      'application/json'
    ],
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    tempDir: process.env.TEMP_DIR || './temp',
  },
  
  // Pagination settings
  pagination: {
    defaultLimit: parseInt(process.env.PAGINATION_DEFAULT_LIMIT || '1000', 10),
    maxLimit: parseInt(process.env.PAGINATION_MAX_LIMIT || '10000', 10),
    defaultPage: parseInt(process.env.PAGINATION_DEFAULT_PAGE || '1', 10),
  },
  
  // CORS settings
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.CORS_ORIGINS?.split(',') || false
      : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  },
  
  // Cache settings
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10), // 1 hour
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD || '600', 10), // 10 minutes
    maxKeys: parseInt(process.env.CACHE_MAX_KEYS || '1000', 10),
  },
  
  // Search settings
  search: {
    minQueryLength: parseInt(process.env.SEARCH_MIN_QUERY_LENGTH || '2', 10),
    maxResults: parseInt(process.env.SEARCH_MAX_RESULTS || '50', 10),
    enableFuzzy: process.env.SEARCH_ENABLE_FUZZY !== 'false',
  },
  
  // Logging settings
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableFile: process.env.LOG_ENABLE_FILE === 'true',
    enableConsole: process.env.LOG_ENABLE_CONSOLE !== 'false',
    maxFileSize: parseInt(process.env.LOG_MAX_FILE_SIZE || '10485760', 10), // 10MB
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5', 10),
  },
};

// ============================================================================
// VALIDATION
// ============================================================================

export interface ConfigValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateConfig(): ConfigValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate required environment variables for production
  if (appConfig.environment === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
      errors.push('JWT_SECRET must be set to a secure value in production');
    }
    
    if (!process.env.DB_PASSWORD) {
      warnings.push('DB_PASSWORD is not set, using empty password');
    }
    
    if (appConfig.cors.origin === true) {
      warnings.push('CORS is set to allow all origins in production');
    }
  }

  // Validate port range
  if (appConfig.port < 1 || appConfig.port > 65535) {
    errors.push('PORT must be between 1 and 65535');
  }

  // Validate pagination settings
  if (appConfig.pagination.maxLimit < appConfig.pagination.defaultLimit) {
    errors.push('PAGINATION_MAX_LIMIT must be greater than or equal to PAGINATION_DEFAULT_LIMIT');
  }

  // Validate file upload settings
  if (appConfig.upload.maxFileSize < 1024) {
    warnings.push('UPLOAD_MAX_FILE_SIZE is very small (< 1KB)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getFullApiPath(): string {
  return `${appConfig.apiPrefix}/${appConfig.apiVersion}`;
}

export function isDevelopment(): boolean {
  return appConfig.environment === 'development';
}

export function isProduction(): boolean {
  return appConfig.environment === 'production';
}

export function isStaging(): boolean {
  return appConfig.environment === 'staging';
}

export function getServerUrl(): string {
  const protocol = appConfig.security.enableHttps ? 'https' : 'http';
  return `${protocol}://${appConfig.host}:${appConfig.port}`;
}

export default appConfig; 