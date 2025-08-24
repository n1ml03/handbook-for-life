import * as mysql from 'mysql2/promise';
import { executeTransaction } from '../config/database';
import { DatabaseError } from '../middleware/errorHandler';
import logger from '../config/logger';

/**
 * Advanced transaction manager for complex database operations
 */
export class TransactionManager {
  private static activeTransactions = new Map<string, {
    connection: mysql.PoolConnection;
    startTime: Date;
    operations: string[];
    context?: string;
  }>();

  /**
   * Execute a complex transaction with multiple operations
   */
  static async executeComplexTransaction<T>(
    operations: Array<{
      name: string;
      operation: (connection: mysql.PoolConnection) => Promise<any>;
      rollbackOperation?: (connection: mysql.PoolConnection, results: any[]) => Promise<void>;
    }>,
    options: {
      isolationLevel?: 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE';
      timeout?: number;
      retryOnDeadlock?: boolean;
      maxRetries?: number;
      context?: string;
    } = {}
  ): Promise<T[]> {
    const transactionId = this.generateTransactionId();
    const results: any[] = [];
    
    try {
      return await executeTransaction(async (connection) => {
        // Track transaction
        this.activeTransactions.set(transactionId, {
          connection,
          startTime: new Date(),
          operations: operations.map(op => op.name),
          context: options.context
        });

        logger.info('Starting complex transaction', {
          transactionId,
          operationCount: operations.length,
          context: options.context
        });

        // Execute operations sequentially
        for (let i = 0; i < operations.length; i++) {
          const operation = operations[i];
          
          try {
            logger.debug(`Executing transaction operation: ${operation.name}`, {
              transactionId,
              operationIndex: i + 1,
              totalOperations: operations.length
            });

            const result = await operation.operation(connection);
            results.push(result);

          } catch (error: any) {
            logger.error(`Transaction operation failed: ${operation.name}`, {
              transactionId,
              operationIndex: i + 1,
              error: error.message
            });

            // Execute rollback operations for completed operations
            await this.executeRollbackOperations(connection, operations.slice(0, i), results);
            
            throw new DatabaseError(
              `Transaction failed at operation: ${operation.name}`,
              error,
              { transactionId, failedOperation: operation.name, operationIndex: i + 1 }
            );
          }
        }

        logger.info('Complex transaction completed successfully', {
          transactionId,
          operationCount: operations.length,
          executionTime: Date.now() - this.activeTransactions.get(transactionId)!.startTime.getTime()
        });

        return results;

      }, options);

    } finally {
      this.activeTransactions.delete(transactionId);
    }
  }

  /**
   * Execute rollback operations for failed transactions
   */
  private static async executeRollbackOperations(
    connection: mysql.PoolConnection,
    completedOperations: Array<{
      name: string;
      operation: (connection: mysql.PoolConnection) => Promise<any>;
      rollbackOperation?: (connection: mysql.PoolConnection, results: any[]) => Promise<void>;
    }>,
    results: any[]
  ): Promise<void> {
    logger.info('Executing rollback operations', {
      operationCount: completedOperations.length
    });

    // Execute rollback operations in reverse order
    for (let i = completedOperations.length - 1; i >= 0; i--) {
      const operation = completedOperations[i];
      
      if (operation.rollbackOperation) {
        try {
          await operation.rollbackOperation(connection, results.slice(0, i + 1));
          logger.debug(`Rollback operation completed: ${operation.name}`);
        } catch (rollbackError) {
          logger.error(`Rollback operation failed: ${operation.name}`, rollbackError);
          // Continue with other rollback operations even if one fails
        }
      }
    }
  }

  /**
   * Execute a batch insert operation with transaction
   */
  static async executeBatchInsert<T>(
    tableName: string,
    records: T[],
    options: {
      batchSize?: number;
      onProgress?: (completed: number, total: number) => void;
      validateRecord?: (record: T) => boolean;
      context?: string;
    } = {}
  ): Promise<{ inserted: number; failed: number; errors: any[] }> {
    const { batchSize = 100, onProgress, validateRecord, context } = options;
    const errors: any[] = [];
    let inserted = 0;
    let failed = 0;

    if (records.length === 0) {
      return { inserted: 0, failed: 0, errors: [] };
    }

    // Validate records if validator provided
    const validRecords = validateRecord 
      ? records.filter(record => {
          const isValid = validateRecord(record);
          if (!isValid) {
            failed++;
            errors.push({ record, error: 'Validation failed' });
          }
          return isValid;
        })
      : records;

    logger.info('Starting batch insert operation', {
      tableName,
      totalRecords: records.length,
      validRecords: validRecords.length,
      batchSize,
      context
    });

    // Process records in batches
    for (let i = 0; i < validRecords.length; i += batchSize) {
      const batch = validRecords.slice(i, i + batchSize);
      
      try {
        await executeTransaction(async (connection) => {
          // Build batch insert query
          const fields = Object.keys(batch[0] as any);
          const placeholders = fields.map(() => '?').join(', ');
          const valuesPlaceholder = `(${placeholders})`;
          const allValuesPlaceholder = batch.map(() => valuesPlaceholder).join(', ');
          
          const query = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES ${allValuesPlaceholder}`;
          
          // Flatten all values
          const values = batch.flatMap(record => 
            fields.map(field => (record as any)[field])
          );

          await connection.execute(query, values);
          inserted += batch.length;

          logger.debug('Batch insert completed', {
            tableName,
            batchSize: batch.length,
            totalInserted: inserted
          });
        });

        // Report progress
        if (onProgress) {
          onProgress(inserted, validRecords.length);
        }

      } catch (error: any) {
        logger.error('Batch insert failed', {
          tableName,
          batchStartIndex: i,
          batchSize: batch.length,
          error: error.message
        });

        failed += batch.length;
        errors.push({
          batchStartIndex: i,
          batchSize: batch.length,
          error: error.message
        });
      }
    }

    logger.info('Batch insert operation completed', {
      tableName,
      totalRecords: records.length,
      inserted,
      failed,
      errorCount: errors.length
    });

    return { inserted, failed, errors };
  }

  /**
   * Execute a safe update operation with backup
   */
  static async executeSafeUpdate(
    tableName: string,
    updateQuery: string,
    updateParams: any[],
    whereClause: string,
    whereParams: any[],
    options: {
      createBackup?: boolean;
      maxAffectedRows?: number;
      context?: string;
    } = {}
  ): Promise<{ affectedRows: number; backupCreated: boolean }> {
    const { createBackup = true, maxAffectedRows = 1000, context } = options;
    let backupCreated = false;

    return await executeTransaction(async (connection) => {
      // First, check how many rows will be affected
      const countQuery = `SELECT COUNT(*) as count FROM ${tableName} WHERE ${whereClause}`;
      const [countResult] = await connection.execute(countQuery, whereParams);
      const affectedCount = (countResult as any[])[0].count;

      if (affectedCount > maxAffectedRows) {
        throw new DatabaseError(
          `Update would affect ${affectedCount} rows, which exceeds the maximum of ${maxAffectedRows}`,
          new Error('Too many rows affected'),
          { tableName, affectedCount, maxAffectedRows, context }
        );
      }

      // Create backup if requested
      if (createBackup && affectedCount > 0) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupTableName = `${tableName}_backup_${timestamp}`;
        
        const backupQuery = `
          CREATE TABLE ${backupTableName} AS 
          SELECT * FROM ${tableName} WHERE ${whereClause}
        `;
        
        await connection.execute(backupQuery, whereParams);
        backupCreated = true;

        logger.info('Backup table created for safe update', {
          originalTable: tableName,
          backupTable: backupTableName,
          rowCount: affectedCount,
          context
        });
      }

      // Execute the update
      const fullUpdateQuery = `UPDATE ${tableName} SET ${updateQuery} WHERE ${whereClause}`;
      const [updateResult] = await connection.execute(fullUpdateQuery, [...updateParams, ...whereParams]);
      const actualAffectedRows = (updateResult as any).affectedRows;

      logger.info('Safe update completed', {
        tableName,
        expectedRows: affectedCount,
        actualAffectedRows,
        backupCreated,
        context
      });

      return { affectedRows: actualAffectedRows, backupCreated };
    });
  }

  /**
   * Generate unique transaction ID using nanoid
   */
  private static generateTransactionId(): string {
    const { generateId } = require('../utils/id');
    return `txn_${generateId()}`;
  }

  /**
   * Get active transaction statistics
   */
  static getActiveTransactionStats(): {
    count: number;
    transactions: Array<{
      id: string;
      startTime: Date;
      duration: number;
      operations: string[];
      context?: string;
    }>;
  } {
    const now = new Date();
    const transactions = Array.from(this.activeTransactions.entries()).map(([id, info]) => ({
      id,
      startTime: info.startTime,
      duration: now.getTime() - info.startTime.getTime(),
      operations: info.operations,
      context: info.context
    }));

    return {
      count: transactions.length,
      transactions
    };
  }

  /**
   * Check for long-running transactions
   */
  static checkLongRunningTransactions(thresholdMs: number = 30000): void {
    const stats = this.getActiveTransactionStats();
    const longRunning = stats.transactions.filter(t => t.duration > thresholdMs);

    if (longRunning.length > 0) {
      logger.warn('Long-running transactions detected', {
        count: longRunning.length,
        threshold: thresholdMs,
        transactions: longRunning.map(t => ({
          id: t.id,
          duration: t.duration,
          operations: t.operations,
          context: t.context
        }))
      });
    }
  }
}

export default TransactionManager;
