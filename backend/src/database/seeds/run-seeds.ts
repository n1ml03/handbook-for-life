#!/usr/bin/env bun
import * as fs from 'fs';
import * as path from 'path';
import { executeQuery, initializePool, closeDatabase } from '../../config/database';
import { logger } from '../../config';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface SeedFile {
  filename: string;
  tableName: string;
  fullPath: string;
  content: string;
  order: number;
}

interface SeedRecord {
  id: number;
  table_name: string;
  filename: string;
  records_inserted: number;
  executed_at: Date;
}

class SeedRunner {
  private seedsDir: string;
  private lockTimeout: number;

  constructor() {
    this.seedsDir = path.join(__dirname);
    this.lockTimeout = parseInt(process.env.MIGRATION_LOCK_TIMEOUT || '30000');
  }

  async initialize(): Promise<void> {
    try {
      await initializePool();
      await this.createSeedsTable();
      logger.info('Seed runner initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize seed runner', { error });
      throw error;
    }
  }

  private async createSeedsTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS seeds (
        id INT AUTO_INCREMENT PRIMARY KEY,
        table_name VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL UNIQUE,
        records_inserted INT DEFAULT 0,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_table_name (table_name),
        INDEX idx_executed_at (executed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    await executeQuery(createTableQuery);
    logger.info('Seeds table ensured');
  }

  private async acquireLock(): Promise<boolean> {
    try {
      const lockName = 'doaxvv_seed_lock';
      const [result] = await executeQuery('SELECT GET_LOCK(?, ?) as lock_result', [lockName, this.lockTimeout / 1000]);
      const lockResult = (result as RowDataPacket[])[0].lock_result;
      
      if (lockResult === 1) {
        logger.info('Seed lock acquired successfully');
        return true;
      } else if (lockResult === 0) {
        throw new Error('Seed lock timeout - another seed process is running');
      } else {
        throw new Error('Failed to acquire seed lock');
      }
    } catch (error) {
      logger.error('Failed to acquire seed lock', { error });
      throw error;
    }
  }

  private async releaseLock(): Promise<void> {
    try {
      const lockName = 'doaxvv_seed_lock';
      await executeQuery('SELECT RELEASE_LOCK(?)', [lockName]);
      logger.info('Seed lock released');
    } catch (error) {
      logger.warn('Failed to release seed lock', { error });
    }
  }

  private async getExecutedSeeds(): Promise<SeedRecord[]> {
    try {
      const [rows] = await executeQuery('SELECT * FROM seeds ORDER BY executed_at ASC');
      return rows as SeedRecord[];
    } catch (error) {
      logger.error('Failed to get executed seeds', { error });
      throw error;
    }
  }

  private async getSeedFiles(): Promise<SeedFile[]> {
    try {
      const files = fs.readdirSync(this.seedsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

      const seedFiles: SeedFile[] = [];

      for (const filename of files) {
        const fullPath = path.join(this.seedsDir, filename);
        const content = fs.readFileSync(fullPath, 'utf8');
        
        // Extract table name from filename (e.g., "01_characters.sql" -> "characters")
        const parts = filename.split('_');
        const tableName = parts.length > 1 ? parts[1].replace('.sql', '') : filename.replace('.sql', '');
        const order = parts.length > 1 && !isNaN(parseInt(parts[0])) ? parseInt(parts[0]) : 999;

        seedFiles.push({
          filename,
          tableName,
          fullPath,
          content,
          order
        });
      }

      // Sort by order number
      return seedFiles.sort((a, b) => a.order - b.order);
    } catch (error) {
      logger.error('Failed to read seed files', { error });
      throw error;
    }
  }

  private async validateTableExists(tableName: string): Promise<boolean> {
    try {
      const [rows] = await executeQuery(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
      `, [tableName]);

      return (rows as RowDataPacket[]).length > 0;
    } catch (error) {
      logger.error(`Failed to validate table existence: ${tableName}`, { error });
      return false;
    }
  }

  private async executeSeed(seedFile: SeedFile, force: boolean = false): Promise<void> {
    logger.info(`Executing seed: ${seedFile.filename} for table: ${seedFile.tableName}`);

    try {
      // Validate table exists
      const tableExists = await this.validateTableExists(seedFile.tableName);
      if (!tableExists) {
        throw new Error(`Table '${seedFile.tableName}' does not exist. Please run migrations first.`);
      }

      // Check if table has data (unless force is true)
      if (!force) {
        const [countResult] = await executeQuery(`SELECT COUNT(*) as count FROM ${seedFile.tableName}`);
        const count = (countResult as RowDataPacket[])[0].count;
        
        if (count > 0) {
          logger.info(`Table '${seedFile.tableName}' already has ${count} records. Skipping seed. Use --force to override.`);
          return;
        }
      }

      // Split the seed file by semicolons and execute each statement
      const statements = seedFile.content
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      let recordsInserted = 0;

      for (const statement of statements) {
        if (statement.trim()) {
          const [result] = await executeQuery(statement);
          if ((result as ResultSetHeader).affectedRows) {
            recordsInserted += (result as ResultSetHeader).affectedRows;
          }
        }
      }

      // Record the seed execution
      await executeQuery(
        'INSERT INTO seeds (table_name, filename, records_inserted) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE records_inserted = VALUES(records_inserted), executed_at = CURRENT_TIMESTAMP',
        [seedFile.tableName, seedFile.filename, recordsInserted]
      );

      logger.info(`Seed completed successfully: ${seedFile.filename} (${recordsInserted} records inserted)`);
    } catch (error) {
      logger.error(`Seed failed: ${seedFile.filename}`, { error });
      throw error;
    }
  }

  async runSeeds(options: { force?: boolean; table?: string } = {}): Promise<void> {
    let lockAcquired = false;

    try {
      lockAcquired = await this.acquireLock();

      const executedSeeds = await this.getExecutedSeeds();
      const seedFiles = await this.getSeedFiles();

      // Filter by table if specified
      const filteredSeedFiles = options.table 
        ? seedFiles.filter(sf => sf.tableName === options.table)
        : seedFiles;

      if (filteredSeedFiles.length === 0) {
        if (options.table) {
          logger.info(`No seed files found for table: ${options.table}`);
        } else {
          logger.info('No seed files found');
        }
        return;
      }

      const executedFilenames = new Set(executedSeeds.map(s => s.filename));
      const pendingSeeds = options.force 
        ? filteredSeedFiles 
        : filteredSeedFiles.filter(sf => !executedFilenames.has(sf.filename));

      if (pendingSeeds.length === 0 && !options.force) {
        logger.info('No pending seeds found. Use --force to re-run seeds.');
        return;
      }

      logger.info(`Found ${pendingSeeds.length} seeds to execute`);

      for (const seed of pendingSeeds) {
        await this.executeSeed(seed, options.force);
      }

      logger.info(`Successfully executed ${pendingSeeds.length} seeds`);
    } catch (error) {
      logger.error('Seed process failed', { error });
      throw error;
    } finally {
      if (lockAcquired) {
        await this.releaseLock();
      }
    }
  }

  async clearSeeds(tableName?: string): Promise<void> {
    let lockAcquired = false;

    try {
      lockAcquired = await this.acquireLock();

      if (tableName) {
        // Clear specific table
        const tableExists = await this.validateTableExists(tableName);
        if (!tableExists) {
          throw new Error(`Table '${tableName}' does not exist`);
        }

        logger.warn(`Clearing all data from table: ${tableName}`);
        await executeQuery(`DELETE FROM ${tableName}`);
        await executeQuery('DELETE FROM seeds WHERE table_name = ?', [tableName]);
        logger.info(`Table '${tableName}' cleared successfully`);
      } else {
        // Clear all seeded data
        const executedSeeds = await this.getExecutedSeeds();
        const uniqueTables = [...new Set(executedSeeds.map(s => s.table_name))];

        logger.warn('Clearing all seeded data from the following tables:', uniqueTables);

        for (const table of uniqueTables) {
          const tableExists = await this.validateTableExists(table);
          if (tableExists) {
            await executeQuery(`DELETE FROM ${table}`);
            logger.info(`Cleared table: ${table}`);
          } else {
            logger.warn(`Table '${table}' no longer exists, skipping`);
          }
        }

        await executeQuery('DELETE FROM seeds');
        logger.info('All seed records cleared');
      }
    } catch (error) {
      logger.error('Clear seeds failed', { error });
      throw error;
    } finally {
      if (lockAcquired) {
        await this.releaseLock();
      }
    }
  }

  async getSeedStatus(): Promise<void> {
    try {
      const executedSeeds = await this.getExecutedSeeds();
      const seedFiles = await this.getSeedFiles();

      const executedFilenames = new Set(executedSeeds.map(s => s.filename));
      const pendingSeeds = seedFiles.filter(sf => !executedFilenames.has(sf.filename));

      console.log('\n=== SEED STATUS ===\n');
      console.log(`Total seed files: ${seedFiles.length}`);
      console.log(`Executed seeds: ${executedSeeds.length}`);
      console.log(`Pending seeds: ${pendingSeeds.length}\n`);

      if (executedSeeds.length > 0) {
        console.log('EXECUTED SEEDS:');
        executedSeeds.forEach(s => {
          console.log(`  ✓ ${s.filename} -> ${s.table_name} (${s.records_inserted} records, ${s.executed_at})`);
        });
        console.log('');
      }

      if (pendingSeeds.length > 0) {
        console.log('PENDING SEEDS:');
        pendingSeeds.forEach(s => {
          console.log(`  ○ ${s.filename} -> ${s.tableName}`);
        });
        console.log('');
      }

      // Show table record counts
      if (executedSeeds.length > 0) {
        console.log('TABLE RECORD COUNTS:');
        const uniqueTables = [...new Set(executedSeeds.map(s => s.table_name))];
        
        for (const table of uniqueTables) {
          try {
            const [countResult] = await executeQuery(`SELECT COUNT(*) as count FROM ${table}`);
            const count = (countResult as RowDataPacket[])[0].count;
            console.log(`  ${table}: ${count} records`);
          } catch (error) {
            console.log(`  ${table}: Error getting count`);
          }
        }
        console.log('');
      }
    } catch (error) {
      logger.error('Failed to get seed status', { error });
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    try {
      await closeDatabase();
      logger.info('Seed runner cleaned up');
    } catch (error) {
      logger.error('Failed to cleanup seed runner', { error });
    }
  }
}

// CLI Handler
async function main() {
  const seedRunner = new SeedRunner();

  try {
    await seedRunner.initialize();

    const args = process.argv.slice(2);
    const command = args[0] || 'run';

    // Parse flags
    const forceFlag = args.includes('--force');
    const tableFlag = args.find(arg => arg.startsWith('--table='));
    const tableName = tableFlag ? tableFlag.split('=')[1] : undefined;

    switch (command) {
      case 'run':
        await seedRunner.runSeeds({ force: forceFlag, table: tableName });
        break;
      case 'status':
        await seedRunner.getSeedStatus();
        break;
      case 'clear':
        await seedRunner.clearSeeds(tableName);
        break;
      default:
        console.log('Usage: bun run-seeds.ts [run|status|clear] [options]');
        console.log('  run     - Execute pending seeds (default)');
        console.log('  status  - Show seed status');
        console.log('  clear   - Clear seeded data');
        console.log('');
        console.log('Options:');
        console.log('  --force         - Force re-execution of seeds');
        console.log('  --table=<name>  - Target specific table');
        console.log('');
        console.log('Examples:');
        console.log('  bun run-seeds.ts run --force');
        console.log('  bun run-seeds.ts run --table=characters');
        console.log('  bun run-seeds.ts clear --table=characters');
        process.exit(1);
    }

    console.log('\nSeed process completed successfully');
  } catch (error) {
    console.error('\nSeed process failed:', error);
    process.exit(1);
  } finally {
    await seedRunner.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default SeedRunner;
