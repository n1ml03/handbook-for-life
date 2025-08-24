/**
 * Database Management Module
 * 
 * This module provides a centralized interface for all database operations
 * including migrations, seeding, CSV imports, and utilities.
 */

// Export main database utilities
export { initializePool, closeDatabase, executeQuery } from '../config/database';

// Export migration and seed runners
export { default as DatabaseSetup } from './migrations/run-setup';
export { default as SeedRunner } from './seeds/run-seeds';



// Database structure overview
export const DATABASE_STRUCTURE = {
  // Core tables with their primary purposes
  CORE_TABLES: {
    characters: 'Character information with multi-language support',
    swimsuits: 'Swimsuit library with stats and attributes', 
    skills: 'Active/passive/potential skills system',
    items: 'Game items and accessories',
    bromides: 'Deco-Bromide card collection',
    episodes: 'Story episodes and narratives',
    events: 'Game events and campaigns',
    documents: 'Documentation and guides',
    update_logs: 'Version tracking and changelogs',
    gachas: 'Gacha banner information',
    shop_listings: 'In-game shop items'
  },

  // Linking tables for relationships
  LINKING_TABLES: {
    swimsuit_skills: 'Many-to-many: swimsuits ↔ skills',
    gacha_pools: 'Gacha reward pools with drop rates'
  },



  // Multi-language support
  SUPPORTED_LANGUAGES: ['jp', 'en', 'cn', 'tw', 'kr'],

  // Key features
  FEATURES: [
    'UTF8MB4 character set for emoji support',
    'Optimized indexes for performance',
    'Generated columns for computed values', 
    'Foreign key constraints for data integrity',
    'Multi-language content support',
    'Migration versioning system',

    'Sample data for development testing'
  ]
} as const;

/**
 * Database health check
 */
export async function checkDatabaseHealth(): Promise<{
  isHealthy: boolean;
  details: {
    connection: boolean;
    tables: Record<string, boolean>;
    totalRecords: Record<string, number>;
  };
  errors: string[];
}> {
  const errors: string[] = [];
  const details = {
    connection: false,
    tables: {} as Record<string, boolean>,
    totalRecords: {} as Record<string, number>
  };

  try {
    // Test connection
    const { executeQuery } = await import('../config/database');
    await executeQuery('SELECT 1');
    details.connection = true;

    // Check each core table
    for (const [tableName] of Object.entries(DATABASE_STRUCTURE.CORE_TABLES)) {
      try {
        const [result] = await executeQuery(`SELECT COUNT(*) as count FROM ${tableName}`) as [any[], any];
        const count = result[0].count;
        details.tables[tableName] = true;
        details.totalRecords[tableName] = count;
      } catch (error) {
        details.tables[tableName] = false;
        details.totalRecords[tableName] = 0;
        errors.push(`Table ${tableName}: ${error instanceof Error ? error.message : error}`);
      }
    }

    // Check linking tables
    for (const [tableName] of Object.entries(DATABASE_STRUCTURE.LINKING_TABLES)) {
      try {
        const [result] = await executeQuery(`SELECT COUNT(*) as count FROM ${tableName}`) as [any[], any];
        const count = result[0].count;
        details.tables[tableName] = true;
        details.totalRecords[tableName] = count;
      } catch (error) {
        details.tables[tableName] = false;
        details.totalRecords[tableName] = 0;
        errors.push(`Linking table ${tableName}: ${error instanceof Error ? error.message : error}`);
      }
    }

  } catch (error) {
    errors.push(`Database connection failed: ${error instanceof Error ? error.message : error}`);
  }

  return {
    isHealthy: errors.length === 0,
    details,
    errors
  };
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(): Promise<{
  tableStats: Record<string, {
    rowCount: number;
    indexCount: number;
    dataSize: string;
  }>;
  totalSize: string;
  lastUpdated: Date;
}> {
  const { executeQuery } = await import('../config/database');
  
  const [tables] = await executeQuery(`
    SELECT 
      TABLE_NAME,
      TABLE_ROWS,
      INDEX_LENGTH,
      DATA_LENGTH,
      ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) AS 'SIZE_MB'
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = DATABASE()
    ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC
  `) as [any[], any];

  const tableStats: Record<string, any> = {};
  let totalSizeBytes = 0;

  tables.forEach((table: any) => {
    tableStats[table.TABLE_NAME] = {
      rowCount: table.TABLE_ROWS || 0,
      indexCount: Math.round(table.INDEX_LENGTH / 1024), // KB
      dataSize: `${table.SIZE_MB || 0} MB`
    };
    totalSizeBytes += (table.DATA_LENGTH + table.INDEX_LENGTH) || 0;
  });

  return {
    tableStats,
    totalSize: `${Math.round(totalSizeBytes / 1024 / 1024 * 100) / 100} MB`,
    lastUpdated: new Date()
  };
}

/**
 * Development utilities
 */
export const DEV_UTILS = {
  /**
   * Quick database reset for development
   */
  async resetDatabaseForDev(): Promise<void> {
    console.log('🔄 Resetting database for development...');
    
    // Run schema setup
    const { default: DatabaseSetup } = await import('./migrations/run-setup');
    const setup = new (DatabaseSetup as any)({ seed: true, reset: true, verifyOnly: false });
    await setup.run();

    // Run seeds
    const { default: SeedRunner } = await import('./seeds/run-seeds');  
    const seedRunner = new (SeedRunner as any)();
    await seedRunner.initialize();
    await seedRunner.runSeeds();

    console.log('✅ Database reset complete!');
  },


};

// Export for convenience
export default {
  DATABASE_STRUCTURE,
  checkDatabaseHealth,
  getDatabaseStats,
  DEV_UTILS
}; 