import * as mysql from 'mysql2/promise';
import { RowDataPacket, ResultSetHeader, FieldPacket, QueryResult } from 'mysql2';
import logger from './logger';

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
  timeout?: number;
  reconnect?: boolean;
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

// Simplified database configuration for local development
const config: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'doaxvv_handbook',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  connectionLimit: 10, // Reduced for local development
  timeout: 20000,
  reconnect: true,
  charset: 'utf8mb4',
  timezone: '+00:00',
  multipleStatements: false,
  supportBigNumbers: true,
  bigNumberStrings: true
};

// ============================================================================
// CONNECTION POOL
// ============================================================================

export const pool = mysql.createPool({
  ...config,
  namedPlaceholders: true, // Enable named placeholders for better security
  dateStrings: false, // Return Date objects instead of strings
});

// Pool state tracking
let poolConnected = false;
let connectionAttempts = 0;
const maxConnectionAttempts = parseInt(process.env.DB_MAX_CONNECTION_ATTEMPTS || '5');
const connectionRetryDelay = parseInt(process.env.DB_CONNECTION_RETRY_DELAY || '5000');

// ============================================================================
// INITIALIZATION & CONNECTION MANAGEMENT
// ============================================================================

export async function initializePool(): Promise<void> {
  if (poolConnected) {
    logger.info('Database pool already initialized');
    return;
  }

  while (connectionAttempts < maxConnectionAttempts && !poolConnected) {
    try {
      connectionAttempts++;
      logger.info(`Attempting database connection (attempt ${connectionAttempts}/${maxConnectionAttempts})`);

      // Test the connection
      const connection = await pool.getConnection();
      
      // Verify database exists and has expected schema
      await verifyDatabaseSchema(connection);
      
      connection.release();
      poolConnected = true;
      connectionAttempts = 0; // Reset on success
      
      logger.info('MySQL connection pool initialized successfully', {
        host: config.host,
        database: config.database,
        connectionLimit: config.connectionLimit
      });

      // Setup connection monitoring
      setupConnectionMonitoring();
      
    } catch (error: any) {
      logger.error(`Database connection attempt ${connectionAttempts} failed:`, error);
      
      // Check if this is a "database doesn't exist" error
      if (error.code === 'ER_BAD_DB_ERROR' && error.errno === 1049) {
        logger.error(`Database '${config.database}' does not exist!`);
        logger.error('Please run "bun run db:setup" to create the database and tables.');
        throw new Error(`Database '${config.database}' does not exist. Run 'bun run db:setup' to initialize the database.`);
      }
      
      if (connectionAttempts >= maxConnectionAttempts) {
        logger.error('Max connection attempts reached. Database initialization failed.');
        logger.error('Possible solutions:');
        logger.error('1. Make sure MySQL server is running');
        logger.error('2. Check database credentials in .env file');
        logger.error('3. Run "bun run db:setup" to create database and tables');
        throw new Error('Failed to initialize database connection pool');
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, connectionRetryDelay));
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
      if (stats.acquiredConnections / stats.totalConnections > 0.8) {
        logger.warn('High database connection usage detected', stats);
      }
      
      // Log connection pool stats (debug level)
      logger.info('Database connection pool stats', stats);
      
    } catch (error) {
      logger.error('Error during connection monitoring:', error);
    }
  }, monitoringInterval);
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
  
  try {
    const result = await pool.execute(query, params);
    const executionTime = Date.now() - startTime;
    
    // Log slow queries
    const slowQueryThreshold = parseInt(process.env.DB_SLOW_QUERY_THRESHOLD || '1000');
    if (executionTime > slowQueryThreshold) {
      logger.warn('Slow query detected', {
        query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
        executionTime,
        params: params?.length || 0
      });
    }
    
    return result;
    
  } catch (error) {
    const executionTime = Date.now() - startTime;
    
    logger.error('Query execution failed', {
      query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
      executionTime,
      error: error instanceof Error ? error.message : error
    });
    
    throw error;
  }
}

// Enhanced query execution with transaction support
export async function executeTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>
): Promise<T> {
  if (!poolConnected) {
    await initializePool();
  }

  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const result = await callback(connection);
    
    await connection.commit();
    return result;
    
  } catch (error) {
    await connection.rollback();
    logger.error('Transaction failed and rolled back:', error);
    throw error;
    
  } finally {
    connection.release();
  }
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
      
      // Wait for existing connections to finish (with timeout)
      await Promise.race([
        pool.end(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Pool close timeout')), 10000)
        )
      ]);
      
      poolConnected = false;
      logger.info('Database connection pool closed successfully');
    }
  } catch (error) {
    logger.error('Error closing database pool:', error);
    throw error;
  }
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
// EXPORTS
// ============================================================================

export { config as databaseConfig };
export default pool;