import * as mysql from 'mysql2/promise';
import { RowDataPacket, ResultSetHeader, FieldPacket, QueryResult } from 'mysql2';
import logger from './logger';
import { QueryOptimizer } from '../services/QueryOptimizer';

// ============================================================================
// DATABASE CONFIGURATION INTERFACES
// ============================================================================

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: {
    rejectUnauthorized?: boolean;
    ca?: string;
    cert?: string;
    key?: string;
  };
  connectionLimit?: number;
  charset?: string;
  timezone?: string;
  multipleStatements?: boolean;
  supportBigNumbers?: boolean;
  bigNumberStrings?: boolean;
}

export interface ConnectionPoolStats {
  totalConnections: number;
  allConnections: number;
  freeConnections: number;
  acquiredConnections: number;
  queuedConnections: number;
}

export interface DatabaseHealthCheck {
  isHealthy: boolean;
  responseTime: number;
  error?: string;
  timestamp: Date;
  poolStats?: ConnectionPoolStats;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

// Enhanced database configuration with development-optimized connection pooling
const config: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'doaxvv_handbook',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  // Development-optimized connection pool settings (reduced for local development)
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'), // Reduced for development
  charset: 'utf8mb4',
  timezone: '+00:00',
  multipleStatements: false,
  supportBigNumbers: true,
  bigNumberStrings: true
};

// ============================================================================
// CONNECTION POOL
// ============================================================================

// Enhanced connection pool configuration with development-optimized settings
export const pool = mysql.createPool({
  ...config,
  namedPlaceholders: true, // Enable named placeholders for better security
  dateStrings: false, // Return Date objects instead of strings
  // SSL configuration (if needed)
  ssl: process.env.DB_SSL_ENABLED === 'true' ? {
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  } : undefined
});

// Enhanced pool state tracking and connection management
let poolConnected = false;
let connectionAttempts = 0;
let lastConnectionError: Error | null = null;
let connectionRetryTimer: NodeJS.Timeout | null = null;

// Configuration constants with environment variable support
const maxConnectionAttempts = parseInt(process.env.DB_MAX_CONNECTION_ATTEMPTS || '5');
const connectionRetryDelay = parseInt(process.env.DB_CONNECTION_RETRY_DELAY || '5000');
const connectionHealthCheckInterval = parseInt(process.env.DB_HEALTH_CHECK_INTERVAL || '30000'); // 30 seconds

// ============================================================================
// INITIALIZATION & CONNECTION MANAGEMENT
// ============================================================================

export async function initializePool(): Promise<void> {
  if (poolConnected) {
    logger.info('Database pool already initialized');
    return;
  }

  // Clear any existing retry timer
  if (connectionRetryTimer) {
    clearTimeout(connectionRetryTimer);
    connectionRetryTimer = null;
  }

  while (connectionAttempts < maxConnectionAttempts && !poolConnected) {
    try {
      connectionAttempts++;
      logger.info(`Attempting database connection (attempt ${connectionAttempts}/${maxConnectionAttempts})`, {
        host: config.host,
        database: config.database,
        port: config.port
      });

      // Test the connection with timeout
      const connection = await Promise.race([
        pool.getConnection(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout')), 30000)
        )
      ]);

      // Verify database exists and has expected schema
      await verifyDatabaseSchema(connection);

      // Test connection with a simple query
      await connection.execute('SELECT 1 as test');

      connection.release();
      poolConnected = true;
      connectionAttempts = 0; // Reset on success
      lastConnectionError = null;

      logger.info('MySQL connection pool initialized successfully', {
        host: config.host,
        database: config.database,
        connectionLimit: config.connectionLimit
      });

      // Setup connection monitoring and health checks
      setupConnectionMonitoring();
      setupPeriodicHealthCheck();

    } catch (error: any) {
      lastConnectionError = error;
      logger.error(`Database connection attempt ${connectionAttempts} failed:`, {
        error: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState
      });

      // Handle specific error types
      if (error.code === 'ER_BAD_DB_ERROR' && error.errno === 1049) {
        logger.error(`Database '${config.database}' does not exist!`);
        logger.error('Please run "bun run db:setup" to create the database and tables.');
        throw new Error(`Database '${config.database}' does not exist. Run 'bun run db:setup' to initialize the database.`);
      }

      if (error.code === 'ER_ACCESS_DENIED_ERROR') {
        logger.error('Database access denied. Check credentials in .env file.');
        throw new Error('Database access denied. Check your database credentials.');
      }

      if (error.code === 'ECONNREFUSED') {
        logger.error('Database connection refused. Make sure MySQL server is running.');
      }

      if (connectionAttempts >= maxConnectionAttempts) {
        logger.error('Max connection attempts reached. Database initialization failed.');
        logger.error('Possible solutions:');
        logger.error('1. Make sure MySQL server is running');
        logger.error('2. Check database credentials in .env file');
        logger.error('3. Run "bun run db:setup" to create database and tables');
        logger.error('4. Check network connectivity to database host');
        throw new Error(`Failed to initialize database connection pool after ${maxConnectionAttempts} attempts. Last error: ${error.message}`);
      }

      // Exponential backoff for retry delay
      const backoffDelay = connectionRetryDelay * Math.pow(2, connectionAttempts - 1);
      logger.info(`Retrying connection in ${backoffDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, Math.min(backoffDelay, 30000))); // Cap at 30 seconds
    }
  }
}

// ============================================================================
// SCHEMA VERIFICATION
// ============================================================================

async function verifyDatabaseSchema(connection: mysql.PoolConnection): Promise<void> {
  try {
    // Check if key tables exist
    const [result] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN ('characters', 'swimsuits', 'skills', 'items', 'bromides', 'episodes', 'events', 'documents')
    `, [config.database]);

    const tables = result as RowDataPacket[];
    const tableNames = tables.map((row: any) => row.TABLE_NAME);
    const expectedTables = ['characters', 'swimsuits', 'skills', 'items', 'bromides', 'episodes', 'events', 'documents'];
    
    const missingTables = expectedTables.filter(table => !tableNames.includes(table));
    
    if (missingTables.length > 0) {
      logger.warn('Some expected tables are missing from database:', { missingTables });
      logger.warn('You may need to run migrations: bun run db:migrate');
    } else {
      logger.info('Database schema verification passed');
    }

    // Check character set
    const [charsetResult] = await connection.execute(`
      SELECT DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME
      FROM INFORMATION_SCHEMA.SCHEMATA 
      WHERE SCHEMA_NAME = ?
    `, [config.database]);

    const charset = charsetResult as RowDataPacket[];
    if (charset && charset[0]) {
      const { DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME } = charset[0] as any;
      logger.info('Database charset info', {
        charset: DEFAULT_CHARACTER_SET_NAME,
        collation: DEFAULT_COLLATION_NAME
      });
    }

  } catch (error) {
    logger.warn('Schema verification failed (database may not be fully initialized):', error);
  }
}

// ============================================================================
// CONNECTION MONITORING
// ============================================================================

function setupConnectionMonitoring(): void {
  const monitoringInterval = parseInt(process.env.DB_MONITORING_INTERVAL || '60000'); // 1 minute

  setInterval(async () => {
    try {
      const stats = getPoolStats();

      // Log if connection usage is high
      const usageRatio = stats.totalConnections > 0 ? stats.acquiredConnections / stats.totalConnections : 0;
      if (usageRatio > 0.8) {
        logger.warn('High database connection usage detected', {
          ...stats,
          usageRatio: Math.round(usageRatio * 100) + '%'
        });
      }

      // Log if queue is building up
      if (stats.queuedConnections > 5) {
        logger.warn('Database connection queue building up', {
          queuedConnections: stats.queuedConnections,
          totalConnections: stats.totalConnections
        });
      }

      // Log connection pool stats (debug level)
      logger.debug('Database connection pool stats', {
        ...stats,
        usageRatio: Math.round(usageRatio * 100) + '%'
      });

    } catch (error) {
      logger.error('Error during connection monitoring:', error);
    }
  }, monitoringInterval);
}

// Setup periodic health check to detect connection issues early
function setupPeriodicHealthCheck(): void {
  setInterval(async () => {
    try {
      const healthCheck = await performHealthCheck();

      if (!healthCheck.isHealthy) {
        logger.error('Periodic health check failed', {
          error: healthCheck.error,
          responseTime: healthCheck.responseTime
        });

        // If health check fails, mark pool as disconnected and try to reconnect
        if (poolConnected) {
          logger.warn('Marking pool as disconnected due to health check failure');
          poolConnected = false;

          // Schedule reconnection attempt
          connectionRetryTimer = setTimeout(async () => {
            try {
              logger.info('Attempting to reconnect after health check failure');
              await initializePool();
            } catch (error) {
              logger.error('Failed to reconnect after health check failure:', error);
            }
          }, connectionRetryDelay);
        }
      } else if (healthCheck.responseTime > 5000) {
        logger.warn('Database response time is slow', {
          responseTime: healthCheck.responseTime
        });
      }

    } catch (error) {
      logger.error('Error during periodic health check:', error);
    }
  }, connectionHealthCheckInterval);
}

export function getPoolStats(): ConnectionPoolStats {
  const poolInfo = pool as any;
  return {
    totalConnections: poolInfo.config?.connectionLimit || config.connectionLimit || 0,
    allConnections: poolInfo._allConnections?.length || 0,
    freeConnections: poolInfo._freeConnections?.length || 0,
    acquiredConnections: poolInfo._acquiredConnections?.length || 0,
    queuedConnections: poolInfo._connectionQueue?.length || 0
  };
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export async function performHealthCheck(): Promise<DatabaseHealthCheck> {
  const startTime = Date.now();
  
  try {
    if (!poolConnected) {
      await initializePool();
    }

    // Test query with timeout
    await Promise.race([
      pool.execute('SELECT 1 as health_check, NOW() as server_time'),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), 5000)
      )
    ]);

    const responseTime = Date.now() - startTime;
    
    return {
      isHealthy: true,
      responseTime,
      timestamp: new Date(),
      poolStats: getPoolStats()
    };
    
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return {
      isHealthy: false,
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
      poolStats: getPoolStats()
    };
  }
}

// ============================================================================
// QUERY EXECUTION
// ============================================================================

export async function executeQuery(
  query: string,
  params?: any[]
): Promise<[QueryResult, FieldPacket[]]> {
  if (!poolConnected) {
    await initializePool();
  }

  const startTime = Date.now();
  let connection: mysql.PoolConnection | null = null;

  try {
    // Get connection with timeout
    connection = await Promise.race([
      pool.getConnection(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Connection acquisition timeout')),
          parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000'))
      )
    ]);

    // Execute query with timeout
    const queryTimeout = parseInt(process.env.DB_QUERY_TIMEOUT || '30000');
    const result = await Promise.race([
      connection.execute(query, params),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Query execution timeout')), queryTimeout)
      )
    ]);

    const executionTime = Date.now() - startTime;

    // Track query performance
    QueryOptimizer.trackQueryPerformance(query, executionTime, 'executeQuery');

    // Development query logging
    if (process.env.DB_ENABLE_QUERY_LOGGING === 'true' && process.env.NODE_ENV === 'development') {
      logger.debug('SQL Query Executed', {
        query: query.trim(),
        params: params || [],
        executionTime: `${executionTime}ms`,
        rowsAffected: Array.isArray(result[0]) ? result[0].length : (result[0] as any)?.affectedRows || 0
      });
    }

    // Log slow queries
    const slowQueryThreshold = parseInt(process.env.DB_SLOW_QUERY_THRESHOLD || '1000');
    if (executionTime > slowQueryThreshold) {
      logger.warn('Slow query detected', {
        query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
        executionTime,
        params: params?.length || 0,
        paramsPreview: params ? JSON.stringify(params).substring(0, 200) : 'none'
      });
    }

    return result;

  } catch (error: any) {
    const executionTime = Date.now() - startTime;

    // Enhanced error logging with more context
    logger.error('Query execution failed', {
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      executionTime,
      error: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      params: params?.length || 0
    });

    // Handle specific database errors
    if (error.code === 'ER_LOCK_WAIT_TIMEOUT') {
      throw new Error('Database lock wait timeout - operation took too long');
    } else if (error.code === 'ER_LOCK_DEADLOCK') {
      throw new Error('Database deadlock detected - please retry the operation');
    } else if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      // Mark pool as disconnected and attempt reconnection
      poolConnected = false;
      throw new Error('Database connection lost - please retry');
    }

    throw error;

  } finally {
    // Ensure connection is always released to prevent leaks
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        logger.error('Error releasing database connection:', releaseError);
      }
    }
  }
}

// Enhanced transaction execution with comprehensive error handling
export async function executeTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>,
  options: {
    timeout?: number;
    isolationLevel?: 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE';
    retryOnDeadlock?: boolean;
    maxRetries?: number;
  } = {}
): Promise<T> {
  if (!poolConnected) {
    await initializePool();
  }

  const {
    timeout = parseInt(process.env.DB_TRANSACTION_TIMEOUT || '30000'),
    isolationLevel,
    retryOnDeadlock = true,
    maxRetries = 3
  } = options;

  let connection: mysql.PoolConnection | null = null;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      // Get connection with timeout
      connection = await Promise.race([
        pool.getConnection(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Connection acquisition timeout for transaction')),
            parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000'))
        )
      ]);

      // Set isolation level if specified
      if (isolationLevel) {
        await connection.execute(`SET TRANSACTION ISOLATION LEVEL ${isolationLevel}`);
      }

      // Begin transaction
      await connection.beginTransaction();

      // Execute callback with timeout
      const result = await Promise.race([
        callback(connection),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Transaction execution timeout')), timeout)
        )
      ]);

      // Commit transaction
      await connection.commit();

      logger.debug('Transaction completed successfully', {
        retryCount,
        isolationLevel,
        timeout
      });

      return result;

    } catch (error: any) {
      // Rollback transaction if connection exists
      if (connection) {
        try {
          await connection.rollback();
          logger.debug('Transaction rolled back successfully');
        } catch (rollbackError) {
          logger.error('Error during transaction rollback:', rollbackError);
        }
      }

      // Handle deadlock retry logic
      if (error.code === 'ER_LOCK_DEADLOCK' && retryOnDeadlock && retryCount < maxRetries) {
        retryCount++;
        const retryDelay = Math.min(100 * Math.pow(2, retryCount), 1000); // Exponential backoff, max 1 second

        logger.warn('Transaction deadlock detected, retrying', {
          retryCount,
          maxRetries,
          retryDelay,
          error: error.message
        });

        // Release current connection before retry
        if (connection) {
          connection.release();
          connection = null;
        }

        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }

      // Enhanced error logging
      logger.error('Transaction failed', {
        error: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        retryCount,
        isolationLevel,
        timeout
      });

      // Handle specific transaction errors
      if (error.code === 'ER_LOCK_WAIT_TIMEOUT') {
        throw new Error('Transaction lock wait timeout - operation took too long');
      } else if (error.code === 'ER_LOCK_DEADLOCK') {
        throw new Error('Transaction deadlock detected after maximum retries');
      }

      throw error;

    } finally {
      // Ensure connection is always released
      if (connection) {
        try {
          connection.release();
        } catch (releaseError) {
          logger.error('Error releasing transaction connection:', releaseError);
        }
      }
    }
  }

  throw new Error('Transaction failed after maximum retries');
}

// ============================================================================
// CONNECTION UTILITIES
// ============================================================================

export async function getConnection(): Promise<mysql.PoolConnection> {
  if (!poolConnected) {
    await initializePool();
  }
  return await pool.getConnection();
}

export async function testConnection(): Promise<boolean> {
  try {
    const healthCheck = await performHealthCheck();
    if (!healthCheck.isHealthy) {
      logger.error('Database health check failed:', { 
        error: healthCheck.error,
        responseTime: healthCheck.responseTime
      });
    } else {
      logger.info('Database health check passed:', {
        responseTime: healthCheck.responseTime
      });
    }
    return healthCheck.isHealthy;
  } catch (error) {
    logger.error('Database connection test failed:', error);
    return false;
  }
}

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

export async function closeDatabase(): Promise<void> {
  try {
    if (poolConnected) {
      logger.info('Closing database connection pool...');

      // Clear any pending timers
      if (connectionRetryTimer) {
        clearTimeout(connectionRetryTimer);
        connectionRetryTimer = null;
      }

      // Log current pool stats before closing
      const finalStats = getPoolStats();
      logger.info('Final connection pool stats before closing', finalStats);

      // Check for potential connection leaks
      if (finalStats.acquiredConnections > 0) {
        logger.warn('Potential connection leaks detected', {
          acquiredConnections: finalStats.acquiredConnections,
          totalConnections: finalStats.totalConnections
        });
      }

      // Wait for existing connections to finish (with timeout)
      const closeTimeout = parseInt(process.env.DB_CLOSE_TIMEOUT || '15000'); // 15 seconds
      await Promise.race([
        pool.end(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Pool close timeout')), closeTimeout)
        )
      ]);

      poolConnected = false;
      connectionAttempts = 0;
      lastConnectionError = null;

      logger.info('Database connection pool closed successfully');
    } else {
      logger.info('Database pool was not connected, nothing to close');
    }
  } catch (error) {
    logger.error('Error closing database pool:', error);

    // Force close if graceful close fails
    try {
      // Force end the pool without waiting for connections
      (pool as any)._closed = true;
      logger.warn('Forced database pool closure completed');
    } catch (destroyError) {
      logger.error('Error during forced pool closure:', destroyError);
    }

    throw error;
  }
}

// Connection leak detection utility
export function detectConnectionLeaks(): ConnectionPoolStats & { hasLeaks: boolean; leakWarning?: string } {
  const stats = getPoolStats();
  const hasLeaks = stats.acquiredConnections > stats.totalConnections * 0.9; // More than 90% acquired

  let leakWarning: string | undefined;
  if (hasLeaks) {
    leakWarning = `Potential connection leak detected: ${stats.acquiredConnections}/${stats.totalConnections} connections acquired`;
  }

  return {
    ...stats,
    hasLeaks,
    leakWarning
  };
}

// Handle process termination
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing database connections...');
  await closeDatabase();
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing database connections...');
  await closeDatabase();
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Get database connection status
export function getConnectionStatus(): {
  isConnected: boolean;
  connectionAttempts: number;
  lastError: string | null;
  poolStats: ConnectionPoolStats;
} {
  return {
    isConnected: poolConnected,
    connectionAttempts,
    lastError: lastConnectionError?.message || null,
    poolStats: getPoolStats()
  };
}

// Force reconnection (useful for testing or recovery)
export async function forceReconnect(): Promise<void> {
  logger.info('Forcing database reconnection...');

  try {
    // Mark as disconnected
    poolConnected = false;
    connectionAttempts = 0;

    // Clear any retry timers
    if (connectionRetryTimer) {
      clearTimeout(connectionRetryTimer);
      connectionRetryTimer = null;
    }

    // Attempt to reinitialize
    await initializePool();

    logger.info('Forced reconnection completed successfully');
  } catch (error) {
    logger.error('Forced reconnection failed:', error);
    throw error;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { config as databaseConfig };
export default pool;