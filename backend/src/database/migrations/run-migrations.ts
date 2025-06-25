#!/usr/bin/env bun
import * as fs from 'fs';
import * as path from 'path';
import { executeQuery, initializePool, closeDatabase } from '../../config/database';
import logger from '../../config/logger';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Migration {
  id: number;
  filename: string;
  version: string;
  executed_at: Date;
}

interface MigrationFile {
  filename: string;
  version: string;
  fullPath: string;
  content: string;
}

class MigrationRunner {
  private migrationsDir: string;
  private lockTimeout: number;

  constructor() {
    this.migrationsDir = path.join(import.meta.dir);
    this.lockTimeout = parseInt(process.env.MIGRATION_LOCK_TIMEOUT || '30000');
  }

  async initialize(): Promise<void> {
    try {
      await initializePool();
      await this.createMigrationsTable();
      logger.info('Migration runner initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize migration runner', { error });
      throw error;
    }
  }

  private async createMigrationsTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        version VARCHAR(50) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_version (version),
        INDEX idx_executed_at (executed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;

    await executeQuery(createTableQuery);
    logger.info('Migrations table ensured');
  }

  private async acquireLock(): Promise<boolean> {
    try {
      const lockName = 'doaxvv_migration_lock';
      const [result] = await executeQuery('SELECT GET_LOCK(?, ?) as lock_result', [lockName, this.lockTimeout / 1000]);
      const lockResult = (result as RowDataPacket[])[0].lock_result;
      
      if (lockResult === 1) {
        logger.info('Migration lock acquired successfully');
        return true;
      } else if (lockResult === 0) {
        throw new Error('Migration lock timeout - another migration process is running');
      } else {
        throw new Error('Failed to acquire migration lock');
      }
    } catch (error) {
      logger.error('Failed to acquire migration lock', { error });
      throw error;
    }
  }

  private async releaseLock(): Promise<void> {
    try {
      const lockName = 'doaxvv_migration_lock';
      await executeQuery('SELECT RELEASE_LOCK(?)', [lockName]);
      logger.info('Migration lock released');
    } catch (error) {
      logger.warn('Failed to release migration lock', { error });
    }
  }

  private async getExecutedMigrations(): Promise<Migration[]> {
    try {
      const [rows] = await executeQuery('SELECT * FROM migrations ORDER BY version ASC');
      return rows as Migration[];
    } catch (error) {
      logger.error('Failed to get executed migrations', { error });
      throw error;
    }
  }

  private async getMigrationFiles(): Promise<MigrationFile[]> {
    try {
      const files = fs.readdirSync(this.migrationsDir)
        .filter(file => file.endsWith('.sql') && file.match(/^\d{3}_/))
        .sort();

      const migrationFiles: MigrationFile[] = [];

      for (const filename of files) {
        const fullPath = path.join(this.migrationsDir, filename);
        const content = fs.readFileSync(fullPath, 'utf8');
        const version = filename.split('_')[0];

        migrationFiles.push({
          filename,
          version,
          fullPath,
          content
        });
      }

      return migrationFiles;
    } catch (error) {
      logger.error('Failed to read migration files', { error });
      throw error;
    }
  }

  private async executeMigration(migrationFile: MigrationFile): Promise<void> {
    logger.info(`Executing migration: ${migrationFile.filename}`);

    try {
      // Split the migration file by semicolons and execute each statement
      const statements = migrationFile.content
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

      for (const statement of statements) {
        if (statement.trim()) {
          await executeQuery(statement);
        }
      }

      // Record the migration as executed
      await executeQuery(
        'INSERT INTO migrations (filename, version) VALUES (?, ?)',
        [migrationFile.filename, migrationFile.version]
      );

      logger.info(`Migration completed successfully: ${migrationFile.filename}`);
    } catch (error) {
      logger.error(`Migration failed: ${migrationFile.filename}`, { error });
      throw error;
    }
  }

  async runMigrations(): Promise<void> {
    let lockAcquired = false;

    try {
      lockAcquired = await this.acquireLock();

      const executedMigrations = await this.getExecutedMigrations();
      const migrationFiles = await this.getMigrationFiles();

      const executedVersions = new Set(executedMigrations.map(m => m.filename));
      const pendingMigrations = migrationFiles.filter(mf => !executedVersions.has(mf.filename));

      if (pendingMigrations.length === 0) {
        logger.info('No pending migrations found');
        return;
      }

      logger.info(`Found ${pendingMigrations.length} pending migrations`);

      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }

      logger.info(`Successfully executed ${pendingMigrations.length} migrations`);
    } catch (error) {
      logger.error('Migration process failed', { error });
      throw error;
    } finally {
      if (lockAcquired) {
        await this.releaseLock();
      }
    }
  }

  async rollbackLastMigration(): Promise<void> {
    let lockAcquired = false;

    try {
      lockAcquired = await this.acquireLock();

      const [rows] = await executeQuery(
        'SELECT * FROM migrations ORDER BY executed_at DESC LIMIT 1'
      );

      const migrations = rows as Migration[];
      if (migrations.length === 0) {
        logger.info('No migrations to rollback');
        return;
      }

      const lastMigration = migrations[0];
      logger.warn(`Rolling back migration: ${lastMigration.filename}`);

      // Remove the migration record
      await executeQuery('DELETE FROM migrations WHERE id = ?', [lastMigration.id]);

      logger.info(`Rolled back migration: ${lastMigration.filename}`);
      logger.warn('Note: Automatic schema rollback is not implemented. Manual intervention may be required.');
    } catch (error) {
      logger.error('Rollback failed', { error });
      throw error;
    } finally {
      if (lockAcquired) {
        await this.releaseLock();
      }
    }
  }

  async getMigrationStatus(): Promise<void> {
    try {
      const executedMigrations = await this.getExecutedMigrations();
      const migrationFiles = await this.getMigrationFiles();

      const executedVersions = new Set(executedMigrations.map(m => m.filename));
      const pendingMigrations = migrationFiles.filter(mf => !executedVersions.has(mf.filename));

      console.log('\n=== MIGRATION STATUS ===\n');
      console.log(`Total migration files: ${migrationFiles.length}`);
      console.log(`Executed migrations: ${executedMigrations.length}`);
      console.log(`Pending migrations: ${pendingMigrations.length}\n`);

      if (executedMigrations.length > 0) {
        console.log('EXECUTED MIGRATIONS:');
        executedMigrations.forEach(m => {
          console.log(`  ✓ ${m.filename} (${m.executed_at})`);
        });
        console.log('');
      }

      if (pendingMigrations.length > 0) {
        console.log('PENDING MIGRATIONS:');
        pendingMigrations.forEach(m => {
          console.log(`  ○ ${m.filename}`);
        });
        console.log('');
      }
    } catch (error) {
      logger.error('Failed to get migration status', { error });
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    try {
      await closeDatabase();
      logger.info('Migration runner cleaned up');
    } catch (error) {
      logger.error('Failed to cleanup migration runner', { error });
    }
  }
}

// CLI Handler
async function main() {
  const migrationRunner = new MigrationRunner();

  try {
    await migrationRunner.initialize();

    const args = process.argv.slice(2);
    const command = args[0] || 'run';

    switch (command) {
      case 'run':
        await migrationRunner.runMigrations();
        break;
      case 'status':
        await migrationRunner.getMigrationStatus();
        break;
      case 'rollback':
        await migrationRunner.rollbackLastMigration();
        break;
      default:
        console.log('Usage: bun run-migrations.ts [run|status|rollback]');
        console.log('  run      - Execute pending migrations (default)');
        console.log('  status   - Show migration status');
        console.log('  rollback - Rollback the last migration');
        process.exit(1);
    }

    console.log('\nMigration process completed successfully');
  } catch (error) {
    console.error('\nMigration process failed:', error);
    process.exit(1);
  } finally {
    await migrationRunner.cleanup();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export default MigrationRunner;
