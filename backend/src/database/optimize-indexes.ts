#!/usr/bin/env bun
import { executeQuery, initializePool, closeDatabase } from '../config/database';
import { QueryOptimizer } from '../services/QueryOptimizer';
import logger from '../config/logger';

/**
 * Database index optimization script
 * This script analyzes the current database and applies recommended indexes
 */
class DatabaseIndexOptimizer {
  
  /**
   * Check if an index exists
   */
  private async indexExists(tableName: string, indexName: string): Promise<boolean> {
    try {
      const [rows] = await executeQuery(`
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.STATISTICS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = ? 
        AND INDEX_NAME = ?
      `, [tableName, indexName]);
      
      return (rows as any[])[0].count > 0;
    } catch (error) {
      logger.error(`Error checking index ${indexName} on ${tableName}:`, error);
      return false;
    }
  }

  /**
   * Get current table statistics
   */
  private async getTableStats(): Promise<Array<{
    tableName: string;
    rowCount: number;
    avgRowLength: number;
    dataLength: number;
    indexLength: number;
  }>> {
    try {
      const [rows] = await executeQuery(`
        SELECT 
          TABLE_NAME as tableName,
          TABLE_ROWS as rowCount,
          AVG_ROW_LENGTH as avgRowLength,
          DATA_LENGTH as dataLength,
          INDEX_LENGTH as indexLength
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_ROWS DESC
      `);
      
      return rows as any[];
    } catch (error) {
      logger.error('Error getting table statistics:', error);
      return [];
    }
  }

  /**
   * Analyze slow query log (if available)
   */
  private async analyzeSlowQueries(): Promise<string[]> {
    const recommendations: string[] = [];
    
    try {
      // Check if slow query log is enabled
      const [slowLogStatus] = await executeQuery("SHOW VARIABLES LIKE 'slow_query_log'");
      const isEnabled = (slowLogStatus as any[])[0]?.Value === 'ON';
      
      if (!isEnabled) {
        recommendations.push('Consider enabling slow query log for better optimization insights');
        logger.info('Slow query log is not enabled');
      } else {
        logger.info('Slow query log is enabled');
      }
      
      // Check long query time setting
      const [longQueryTime] = await executeQuery("SHOW VARIABLES LIKE 'long_query_time'");
      const queryTime = parseFloat((longQueryTime as any[])[0]?.Value || '10');
      
      if (queryTime > 2) {
        recommendations.push(`Consider reducing long_query_time from ${queryTime}s to 2s for better monitoring`);
      }
      
    } catch (error) {
      logger.warn('Could not analyze slow query settings:', error);
    }
    
    return recommendations;
  }

  /**
   * Apply recommended indexes
   */
  private async applyIndexes(): Promise<{
    applied: string[];
    skipped: string[];
    failed: string[];
  }> {
    const recommendations = QueryOptimizer.generateIndexRecommendations();
    const applied: string[] = [];
    const skipped: string[] = [];
    const failed: string[] = [];

    for (const indexSQL of recommendations) {
      try {
        // Extract index name and table name from SQL
        const match = indexSQL.match(/CREATE INDEX (\w+) ON (\w+)/);
        if (!match) {
          logger.warn('Could not parse index SQL:', indexSQL);
          failed.push(indexSQL);
          continue;
        }

        const [, indexName, tableName] = match;
        
        // Check if index already exists
        if (await this.indexExists(tableName, indexName)) {
          logger.info(`Index ${indexName} already exists on ${tableName}, skipping`);
          skipped.push(indexSQL);
          continue;
        }

        // Apply the index
        logger.info(`Creating index: ${indexName} on ${tableName}`);
        await executeQuery(indexSQL);
        applied.push(indexSQL);
        
        logger.info(`Successfully created index: ${indexName}`);
        
      } catch (error: any) {
        logger.error(`Failed to create index: ${indexSQL}`, error);
        failed.push(indexSQL);
      }
    }

    return { applied, skipped, failed };
  }

  /**
   * Analyze table performance and suggest optimizations
   */
  private async analyzeTablePerformance(): Promise<string[]> {
    const recommendations: string[] = [];
    const stats = await this.getTableStats();

    for (const table of stats) {
      // Check for tables with high row count but low index usage
      const indexRatio = table.indexLength / (table.dataLength || 1);
      
      if (table.rowCount > 1000 && indexRatio < 0.1) {
        recommendations.push(
          `Table ${table.tableName} has ${table.rowCount} rows but low index usage (${Math.round(indexRatio * 100)}%). Consider adding indexes on frequently queried columns.`
        );
      }

      // Check for very large tables
      if (table.rowCount > 100000) {
        recommendations.push(
          `Table ${table.tableName} has ${table.rowCount} rows. Consider partitioning if queries are slow.`
        );
      }

      // Check for tables with very long average row length
      if (table.avgRowLength > 1000) {
        recommendations.push(
          `Table ${table.tableName} has large average row length (${table.avgRowLength} bytes). Consider normalizing or archiving old data.`
        );
      }
    }

    return recommendations;
  }

  /**
   * Run complete optimization analysis and apply indexes
   */
  async optimize(options: {
    applyIndexes?: boolean;
    analyzeOnly?: boolean;
  } = {}): Promise<void> {
    const { applyIndexes = true, analyzeOnly = false } = options;

    try {
      await initializePool();
      
      logger.info('Starting database optimization analysis...');

      // Get current table statistics
      const tableStats = await this.getTableStats();
      logger.info('Current table statistics:', {
        totalTables: tableStats.length,
        totalRows: tableStats.reduce((sum, t) => sum + t.rowCount, 0),
        largestTable: tableStats[0]?.tableName,
        largestTableRows: tableStats[0]?.rowCount
      });

      // Analyze slow queries
      const slowQueryRecommendations = await this.analyzeSlowQueries();
      
      // Analyze table performance
      const performanceRecommendations = await this.analyzeTablePerformance();

      // Log all recommendations
      const allRecommendations = [
        ...slowQueryRecommendations,
        ...performanceRecommendations
      ];

      if (allRecommendations.length > 0) {
        logger.info('Performance recommendations:', allRecommendations);
      } else {
        logger.info('No specific performance recommendations at this time');
      }

      if (analyzeOnly) {
        logger.info('Analysis complete (analyze-only mode)');
        return;
      }

      // Apply indexes if requested
      if (applyIndexes) {
        logger.info('Applying recommended indexes...');
        const indexResults = await this.applyIndexes();
        
        logger.info('Index optimization complete:', {
          applied: indexResults.applied.length,
          skipped: indexResults.skipped.length,
          failed: indexResults.failed.length
        });

        if (indexResults.applied.length > 0) {
          logger.info('Successfully applied indexes:', indexResults.applied);
        }

        if (indexResults.failed.length > 0) {
          logger.warn('Failed to apply indexes:', indexResults.failed);
        }
      }

      logger.info('Database optimization complete!');

    } catch (error) {
      logger.error('Database optimization failed:', error);
      throw error;
    }
  }
}

// Main execution
async function main() {
  const optimizer = new DatabaseIndexOptimizer();
  
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const analyzeOnly = args.includes('--analyze-only');
    const skipIndexes = args.includes('--skip-indexes');

    await optimizer.optimize({
      applyIndexes: !skipIndexes,
      analyzeOnly
    });

  } catch (error) {
    logger.error('Optimization script failed:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

// Run if called directly
if (import.meta.main) {
  main();
}

export { DatabaseIndexOptimizer };
