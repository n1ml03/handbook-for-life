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
  
  // Security settings (simplified for local development)
  security: {
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
  
  // Rate limiting (disabled for local development)
  
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
  
  // Cache settings (disabled for local development)
  cache: {
    enabled: boolean;
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
  
  // Security settings (simplified for local development)
  security: {
    enableHttps: false,
    trustProxy: false,
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
  
  // Rate limiting (disabled for local development)
  
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
  
  // Cache settings (disabled for local development)
  cache: {
    enabled: false,
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
  
  // Basic validation for local development
  
  // Validate port range
  if (appConfig.port < 1 || appConfig.port > 65535) {
    errors.push('PORT must be between 1 and 65535');
  }
  
  // Validate pagination settings
  if (appConfig.pagination.maxLimit < appConfig.pagination.defaultLimit) {
    errors.push('PAGINATION_MAX_LIMIT must be greater than or equal to PAGINATION_DEFAULT_LIMIT');
  }
  
  // Rate limiting validation removed for local development
  
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