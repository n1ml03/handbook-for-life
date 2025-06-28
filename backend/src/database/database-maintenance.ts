#!/usr/bin/env bun
import { executeQuery, initializePool } from '../config/database';
import logger from '../config/logger';
import { EventModel } from '../models/EventModel';

/**
 * Database maintenance script to ensure data integrity and performance
 */
class DatabaseMaintenance {
  private eventModel: EventModel;

  constructor() {
    this.eventModel = new EventModel();
  }

  /**
   * Run all maintenance tasks
   */
  async runMaintenance(): Promise<void> {
    try {
      await initializePool();
      logger.info('Starting database maintenance...');

      // Update event active status
      await this.updateEventActiveStatus();

      // Validate schema integrity
      await this.validateSchemaIntegrity();

      // Clean up old data (if needed)
      await this.cleanupOldData();

      logger.info('Database maintenance completed successfully');
    } catch (error) {
      logger.error('Database maintenance failed', { error });
      throw error;
    }
  }

  /**
   * Update is_active status for all events
   */
  private async updateEventActiveStatus(): Promise<void> {
    try {
      const result = await this.eventModel.updateActiveStatus();
      logger.info(`Event active status maintenance: ${result.updated} events updated`);
    } catch (error) {
      logger.error('Failed to update event active status', { error });
      throw error;
    }
  }

  /**
   * Validate database schema integrity
   */
  private async validateSchemaIntegrity(): Promise<void> {
    try {
      // Check for required tables
      const requiredTables = [
        'characters', 'swimsuits', 'skills', 'items', 
        'bromides', 'episodes', 'events', 'documents', 
        'update_logs', 'gachas', 'shop_listings', 
        'swimsuit_skills', 'gacha_pools'
      ];

      const [result] = await executeQuery(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        ORDER BY TABLE_NAME
      `);

      const existingTables = (result as any[]).map(row => row.TABLE_NAME);
      const missingTables = requiredTables.filter(table => !existingTables.includes(table));

      if (missingTables.length > 0) {
        logger.error('Missing required tables', { missingTables });
        throw new Error(`Missing tables: ${missingTables.join(', ')}`);
      }

      // Check for problematic generated columns (MySQL 5.7+)
      try {
        const [generatedColumns] = await executeQuery(`
          SELECT 
            TABLE_NAME, 
            COLUMN_NAME, 
            GENERATION_EXPRESSION 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = DATABASE() 
          AND GENERATION_EXPRESSION IS NOT NULL
        `);

        const problematicColumns = (generatedColumns as any[]).filter(col => 
          col.GENERATION_EXPRESSION && 
          (col.GENERATION_EXPRESSION.includes('now()') || col.GENERATION_EXPRESSION.includes('NOW()'))
        );

        if (problematicColumns.length > 0) {
          logger.warn('Found problematic generated columns using NOW() function', { 
            columns: problematicColumns 
          });
        } else {
          logger.info('No problematic generated columns found');
        }
      } catch (error: any) {
        // Fallback for older MySQL versions
        logger.info('Generated column check skipped (MySQL version may not support it)');
      }

      logger.info('Schema integrity validation passed', { 
        totalTables: existingTables.length,
        requiredTables: requiredTables.length
      });
    } catch (error) {
      logger.error('Schema integrity validation failed', { error });
      throw error;
    }
  }

  /**
   * Clean up old or unnecessary data
   */
  private async cleanupOldData(): Promise<void> {
    try {
      // Example: Remove very old migration logs (older than 1 year)
      const [result] = await executeQuery(`
        DELETE FROM migrations 
        WHERE executed_at < DATE_SUB(NOW(), INTERVAL 1 YEAR)
        LIMIT 100
      `);

      const deletedRows = (result as any).affectedRows;
      if (deletedRows > 0) {
        logger.info(`Cleaned up ${deletedRows} old migration records`);
      }

      logger.info('Data cleanup completed');
    } catch (error) {
      logger.error('Data cleanup failed', { error });
      // Don't throw - cleanup is not critical
    }
  }

  /**
   * Check database performance metrics
   */
  async checkPerformanceMetrics(): Promise<void> {
    try {
      // Check table sizes
      const [tableSizes] = await executeQuery(`
        SELECT 
          TABLE_NAME as table_name,
          ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as size_mb,
          TABLE_ROWS as row_count
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE()
        ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC
      `);

      logger.info('Database table sizes', { tableSizes });

      // Check for tables that might need optimization
      const largeTables = (tableSizes as any[]).filter(table => table.size_mb > 100);
      if (largeTables.length > 0) {
        logger.warn('Large tables detected (>100MB)', { largeTables });
      }
    } catch (error) {
      logger.error('Performance metrics check failed', { error });
    }
  }
}

// Export for use in other modules
export { DatabaseMaintenance };

// CLI execution
async function main() {
  try {
    const maintenance = new DatabaseMaintenance();
    await maintenance.runMaintenance();
    await maintenance.checkPerformanceMetrics();
    
    logger.info('All maintenance tasks completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Maintenance script failed', { error });
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main();
}