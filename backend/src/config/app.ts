// ============================================================================
// APPLICATION CONFIGURATION
// ============================================================================

export interface AppConfig {
  // Basic app settings
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  port: number;
  host: string;
  
  // API settings
  apiPrefix: string;
  apiVersion: string;
  
  // Security settings
  security: {
    jwtSecret: string;
    jwtExpiresIn: string;
    bcryptRounds: number;
    sessionSecret: string;
    enableHttps: boolean;
    trustProxy: boolean;
  };
  
  // CORS settings
  cors: {
    origins: string[];
    methods: string[];
    allowedHeaders: string[];
    credentials: boolean;
  };
  
  // Rate limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
  };
  
  // File upload settings
  upload: {
    maxFileSize: number;
    allowedMimeTypes: string[];
    uploadDir: string;
    tempDir: string;
  };
  
  // Frontend settings
  frontend: {
    url: string;
    buildPath: string;
    staticPath: string;
  };
  
  // Health check settings
  health: {
    checkInterval: number;
    endpoints: string[];
    timeout: number;
  };
  
  // Monitoring settings
  monitoring: {
    enabled: boolean;
    metricsPath: string;
    healthPath: string;
  };
  
  // Cache settings
  cache: {
    enabled: boolean;
    defaultTtl: number;
    maxKeys: number;
    checkPeriod: number;
  };
  
  // Pagination defaults
  pagination: {
    defaultLimit: number;
    maxLimit: number;
    defaultOffset: number;
  };
  
  // Search settings
  search: {
    defaultLanguage: string;
    supportedLanguages: string[];
    fuzzyThreshold: number;
  };
}

// ============================================================================
// ENVIRONMENT PARSING UTILITIES
// ============================================================================

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

function parseArray(value: string | undefined, defaultValue: string[]): string[] {
  if (!value) return defaultValue;
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

function parseEnvironment(value: string | undefined): AppConfig['environment'] {
  const env = value?.toLowerCase();
  if (env === 'production' || env === 'staging' || env === 'development') {
    return env;
  }
  return 'development';
}

// ============================================================================
// CONFIGURATION OBJECT
// ============================================================================

export const appConfig: AppConfig = {
  // Basic app settings
  name: process.env.APP_NAME || 'DOAXVV Handbook API',
  version: process.env.APP_VERSION || '1.0.0',
  environment: parseEnvironment(process.env.NODE_ENV),
  port: parseNumber(process.env.PORT, 3001),
  host: process.env.HOST || '0.0.0.0',
  
  // API settings
  apiPrefix: process.env.API_PREFIX || '/api',
  apiVersion: process.env.API_VERSION || 'v1',
  
  // Security settings
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    bcryptRounds: parseNumber(process.env.BCRYPT_ROUNDS, 12),
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
    enableHttps: parseBoolean(process.env.ENABLE_HTTPS, false),
    trustProxy: parseBoolean(process.env.TRUST_PROXY, true),
  },
  
  // CORS settings
  cors: {
    origins: parseArray(process.env.CORS_ORIGINS, ['http://localhost:5173']),
    methods: parseArray(process.env.CORS_METHODS, ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']),
    allowedHeaders: parseArray(process.env.CORS_ALLOWED_HEADERS, [
      'Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'
    ]),
    credentials: parseBoolean(process.env.CORS_CREDENTIALS, true),
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000), // 15 minutes
    maxRequests: parseNumber(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
    skipSuccessfulRequests: parseBoolean(process.env.RATE_LIMIT_SKIP_SUCCESSFUL, false),
    skipFailedRequests: parseBoolean(process.env.RATE_LIMIT_SKIP_FAILED, false),
  },
  
  // File upload settings
  upload: {
    maxFileSize: parseNumber(process.env.MAX_FILE_SIZE, 10 * 1024 * 1024), // 10MB
    allowedMimeTypes: parseArray(process.env.ALLOWED_MIME_TYPES, [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'text/csv', 'application/json', 'application/pdf'
    ]),
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    tempDir: process.env.TEMP_DIR || './temp',
  },
  
  // Frontend settings
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
    buildPath: process.env.FRONTEND_BUILD_PATH || '../frontend/dist',
    staticPath: process.env.FRONTEND_STATIC_PATH || '/static',
  },
  
  // Health check settings
  health: {
    checkInterval: parseNumber(process.env.HEALTH_CHECK_INTERVAL, 30000), // 30 seconds
    endpoints: parseArray(process.env.HEALTH_CHECK_ENDPOINTS, ['/health', '/api/health']),
    timeout: parseNumber(process.env.HEALTH_CHECK_TIMEOUT, 5000), // 5 seconds
  },
  
  // Monitoring settings
  monitoring: {
    enabled: parseBoolean(process.env.MONITORING_ENABLED, true),
    metricsPath: process.env.METRICS_PATH || '/metrics',
    healthPath: process.env.HEALTH_PATH || '/health',
  },
  
  // Cache settings
  cache: {
    enabled: parseBoolean(process.env.CACHE_ENABLED, true),
    defaultTtl: parseNumber(process.env.CACHE_DEFAULT_TTL, 3600), // 1 hour
    maxKeys: parseNumber(process.env.CACHE_MAX_KEYS, 1000),
    checkPeriod: parseNumber(process.env.CACHE_CHECK_PERIOD, 600), // 10 minutes
  },
  
  // Pagination defaults
  pagination: {
    defaultLimit: parseNumber(process.env.PAGINATION_DEFAULT_LIMIT, 20),
    maxLimit: parseNumber(process.env.PAGINATION_MAX_LIMIT, 100),
    defaultOffset: parseNumber(process.env.PAGINATION_DEFAULT_OFFSET, 0),
  },
  
  // Search settings
  search: {
    defaultLanguage: process.env.SEARCH_DEFAULT_LANGUAGE || 'en',
    supportedLanguages: parseArray(process.env.SEARCH_SUPPORTED_LANGUAGES, ['en', 'jp', 'cn', 'tw', 'kr']),
    fuzzyThreshold: parseNumber(process.env.SEARCH_FUZZY_THRESHOLD, 0.8),
  },
};

// ============================================================================
// CONFIGURATION VALIDATION
// ============================================================================

export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate required fields
  if (!appConfig.security.jwtSecret || appConfig.security.jwtSecret === 'your-super-secret-jwt-key') {
    if (appConfig.environment === 'production') {
      errors.push('JWT_SECRET must be set in production environment');
    }
  }
  
  if (!appConfig.security.sessionSecret || appConfig.security.sessionSecret === 'your-session-secret') {
    if (appConfig.environment === 'production') {
      errors.push('SESSION_SECRET must be set in production environment');
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
  
  // Validate rate limit settings
  if (appConfig.rateLimit.windowMs <= 0) {
    errors.push('RATE_LIMIT_WINDOW_MS must be greater than 0');
  }
  
  if (appConfig.rateLimit.maxRequests <= 0) {
    errors.push('RATE_LIMIT_MAX_REQUESTS must be greater than 0');
  }
  
  // Validate file upload settings
  if (appConfig.upload.maxFileSize <= 0) {
    errors.push('MAX_FILE_SIZE must be greater than 0');
  }
  
  // Validate CORS origins in production
  if (appConfig.environment === 'production') {
    const hasLocalhost = appConfig.cors.origins.some(origin => 
      origin.includes('localhost') || origin.includes('127.0.0.1')
    );
    if (hasLocalhost) {
      errors.push('CORS_ORIGINS should not include localhost in production environment');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// ============================================================================
// CONFIGURATION UTILITIES
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

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default appConfig; 