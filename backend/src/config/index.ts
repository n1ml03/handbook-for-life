// ============================================================================
// CENTRAL CONFIGURATION EXPORTS
// ============================================================================

// Database configuration
export { 
  default as databaseConfig,
  pool as databasePool,
  initializePool,
  closeDatabase,
  testConnection,
  executeQuery,
  executeTransaction,
  getConnection,
  performHealthCheck,
  getPoolStats,
  type DatabaseConfig,
  type ConnectionPoolStats,
  type DatabaseHealthCheck
} from './database';

// Database utilities with proper typing
export {
  selectQuery,
  insertQuery,
  updateQuery,
  deleteQuery,
  countQuery,
  selectOne,
  existsQuery,
  findById,
  findByUniqueKey,
  deleteById,
  existsById,
  getTableCount,
  paginatedQuery,
  bulkInsert,
  upsert,
  buildMultiLanguageSearch,
  buildDateRangeFilter,
  checkTableHealth,
  type PaginationParams,
  type PaginatedResult
} from './database-utils';

// Logger configuration
export {
  default as logger,
  EnhancedLogger,
  type LoggerConfig,
  type LogEntry,
  type LogLevel
} from './logger';

// Application configuration
export {
  default as appConfig,
  validateConfig,
  getFullApiPath,
  isDevelopment,
  isProduction,
  isStaging,
  getServerUrl,
  type AppConfig
} from './app';

// ============================================================================
// CONFIGURATION INITIALIZATION
// ============================================================================

import logger from './logger';
import { validateConfig } from './app';
import { initializePool } from './database';

/**
 * Initialize all configurations and perform validation
 */
export async function initializeConfigurations(): Promise<void> {
  logger.info('Initializing application configurations...');
  
  try {
    // Validate application config
    const configValidation = validateConfig();
    if (!configValidation.isValid) {
      logger.error('Configuration validation failed:', { errors: configValidation.errors });
      throw new Error(`Configuration validation failed: ${configValidation.errors.join(', ')}`);
    }
    logger.info('Application configuration validated successfully');
    
    // Initialize database connection pool
    await initializePool();
    logger.info('Database connection pool initialized');
    
    logger.info('All configurations initialized successfully');
    
  } catch (error) {
    logger.error('Failed to initialize configurations:', error);
    throw error;
  }
}

/**
 * Graceful shutdown of all configurations
 */
export async function shutdownConfigurations(): Promise<void> {
  logger.info('Shutting down configurations...');
  
  try {
    // Close database connections
    const { closeDatabase } = await import('./database');
    await closeDatabase();
    
    // Shutdown logger (flush pending logs)
    await logger.shutdown();
    
    console.log('All configurations shut down successfully');
    
  } catch (error) {
    console.error('Error during configuration shutdown:', error);
    throw error;
  }
}

// ============================================================================
// ENVIRONMENT-SPECIFIC CONFIGURATIONS
// ============================================================================

import appConfigDefault from './app';

export const config = {
  // Re-export main configs for convenience
  app: appConfigDefault,
  
  // Environment helpers
  env: {
    isDevelopment: appConfigDefault.environment === 'development',
    isProduction: appConfigDefault.environment === 'production',
    isStaging: appConfigDefault.environment === 'staging',
    name: appConfigDefault.environment
  },
  
  // Server settings
  server: {
    port: appConfigDefault.port,
    host: appConfigDefault.host,
    url: `${appConfigDefault.security.enableHttps ? 'https' : 'http'}://${appConfigDefault.host}:${appConfigDefault.port}`,
    apiPath: `${appConfigDefault.apiPrefix}/${appConfigDefault.apiVersion}`
  },
  
  // Common settings for easy access
  pagination: appConfigDefault.pagination,
  cors: appConfigDefault.cors,
  security: appConfigDefault.security,
  upload: appConfigDefault.upload,
  cache: appConfigDefault.cache,
  search: appConfigDefault.search
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default config; 