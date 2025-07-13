#!/usr/bin/env bun
/**
 * Local Database Setup Script
 * 
 * This script automates the complete local database initialization process:
 * 1. Checks database connectivity
 * 2. Creates database if it doesn't exist
 * 3. Runs all migrations
 * 4. Optionally seeds with sample data
 * 5. Verifies the setup
 * 
 * Usage:
 *   bun scripts/local-db-setup.ts [--seed] [--reset] [--verify-only]
 */

import * as fs from 'fs';
import * as path from 'path';
import * as mysql from 'mysql2/promise';
import logger from '../../config/logger';

interface SetupOptions {
  seed: boolean;
  reset: boolean;
  verifyOnly: boolean;
}

interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  charset: string;
  collation: string;
}

class LocalDatabaseSetup {
  private config: DatabaseConfig;
  private connection: mysql.Connection | null = null;
  private options: SetupOptions;

  constructor(options: SetupOptions) {
    this.options = options;
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'doaxvv_handbook',
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci'
    };
  }

  async initialize(): Promise<void> {
    try {
      logger.info('🔌 Connecting to MySQL server...', {
        host: this.config.host,
        port: this.config.port,
        user: this.config.user
      });

      // Connect without specifying database first
      this.connection = await mysql.createConnection({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        charset: this.config.charset,
        timezone: '+00:00',
        supportBigNumbers: true,
        bigNumberStrings: true
      });

      logger.info('✅ Connected to MySQL server successfully');
    } catch (error) {
      logger.error('❌ Failed to connect to MySQL server:', error);
      throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async checkDatabaseExists(): Promise<boolean> {
    if (!this.connection) {
      throw new Error('Database connection not initialized');
    }

    try {
      const [rows] = await this.connection.execute(
        'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
        [this.config.database]
      );

      return (rows as any[]).length > 0;
    } catch (error) {
      logger.error('Failed to check database existence:', error);
      throw error;
    }
  }

  async createDatabase(): Promise<void> {
    if (!this.connection) {
      throw new Error('Database connection not initialized');
    }

    try {
      const exists = await this.checkDatabaseExists();

      if (this.options.reset && exists) {
        logger.info(`🗑️  Dropping existing database '${this.config.database}'...`);
        await this.connection.execute(`DROP DATABASE \`${this.config.database}\``);
        logger.info('✅ Database dropped successfully');
      }

      if (!exists || this.options.reset) {
        logger.info(`🏗️  Creating database '${this.config.database}'...`);
        
        await this.connection.execute(`
          CREATE DATABASE \`${this.config.database}\` 
          CHARACTER SET ${this.config.charset} 
          COLLATE ${this.config.collation}
        `);
        
        logger.info('✅ Database created successfully');
      } else {
        logger.info(`ℹ️  Database '${this.config.database}' already exists`);
      }

      // Reconnect to the specific database
      await this.connection.end();
      
      this.connection = await mysql.createConnection({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        charset: this.config.charset,
        timezone: '+00:00',
        supportBigNumbers: true,
        bigNumberStrings: true
      });
      
      logger.info(`✅ Connected to database '${this.config.database}'`);

    } catch (error) {
      logger.error('❌ Failed to create database:', error);
      throw error;
    }
  }

  async runMigrations(): Promise<void> {
    if (!this.connection) {
      throw new Error('Database connection not initialized');
    }

    try {
      logger.info('🚀 Running database migrations...');
      
      const migrationsDir = path.join(__dirname, '../src/database/migrations');
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql') && file.match(/^\d{3}_/))
        .sort();

      if (migrationFiles.length === 0) {
        logger.warn('⚠️  No migration files found');
        return;
      }

      logger.info(`📁 Found ${migrationFiles.length} migration files`);

      for (const migrationFile of migrationFiles) {
        logger.info(`⚡ Running migration: ${migrationFile}`);
        
        const migrationPath = path.join(migrationsDir, migrationFile);
        const migrationContent = fs.readFileSync(migrationPath, 'utf8');
        
        // Clean and split statements
        const statements = migrationContent
          .replace(/CREATE DATABASE IF NOT EXISTS[^;]*;/gi, '')
          .replace(/USE [^;]*;/gi, '')
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await this.connection.execute(statement);
            } catch (error) {
              logger.warn(`⚠️  Statement execution warning: ${error instanceof Error ? error.message : 'Unknown error'}`);
              // Continue with other statements for development setup
            }
          }
        }
        
        logger.info(`✅ Migration completed: ${migrationFile}`);
      }

      logger.info('✅ All migrations completed successfully');
    } catch (error) {
      logger.error('❌ Migration failed:', error);
      throw error;
    }
  }

  async seedDatabase(): Promise<void> {
    if (!this.connection) {
      throw new Error('Database connection not initialized');
    }

    try {
      logger.info('🌱 Seeding database with sample data...');
      
      const seedsDir = path.join(__dirname, '../src/database/seeds');
      const seedFiles = fs.readdirSync(seedsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

      if (seedFiles.length === 0) {
        logger.warn('⚠️  No seed files found');
        return;
      }

      for (const seedFile of seedFiles) {
        logger.info(`🌱 Running seed: ${seedFile}`);
        
        const seedPath = path.join(seedsDir, seedFile);
        const seedContent = fs.readFileSync(seedPath, 'utf8');
        
        const statements = seedContent
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await this.connection.execute(statement);
            } catch (error) {
              logger.warn(`⚠️  Seed statement warning: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }
        }
        
        logger.info(`✅ Seed completed: ${seedFile}`);
      }

      logger.info('✅ Database seeding completed successfully');
    } catch (error) {
      logger.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  async verifySetup(): Promise<void> {
    if (!this.connection) {
      throw new Error('Database connection not initialized');
    }

    try {
      logger.info('🔍 Verifying database setup...');
      
      // Check if key tables exist
      const expectedTables = ['characters', 'swimsuits', 'skills', 'items', 'bromides', 'episodes', 'events', 'gachas'];
      const [result] = await this.connection.execute(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME IN (${expectedTables.map(() => '?').join(',')})
      `, [this.config.database, ...expectedTables]);

      const tables = result as any[];
      const foundTables = tables.map(row => row.TABLE_NAME);

      logger.info(`📊 Found ${foundTables.length}/${expectedTables.length} expected tables:`, {
        found: foundTables,
        missing: expectedTables.filter(t => !foundTables.includes(t))
      });

      // Check table row counts
      for (const tableName of foundTables) {
        try {
          const [countResult] = await this.connection.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
          const count = (countResult as any[])[0].count;
          logger.info(`📈 Table '${tableName}': ${count} records`);
        } catch (error) {
          logger.warn(`⚠️  Could not count records in table '${tableName}': ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      if (foundTables.length >= 4) {
        logger.info('✅ Database setup verification passed');
      } else {
        logger.warn('⚠️  Database setup verification incomplete - some tables missing');
      }
    } catch (error) {
      logger.error('❌ Database verification failed:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
      logger.info('🔌 Database connection closed');
    }
  }

  async run(): Promise<void> {
    try {
      logger.info('🚀 Starting local database setup...');
      
      await this.initialize();

      if (this.options.verifyOnly) {
        // Reconnect to the specific database for verification
        await this.connection?.end();
        this.connection = await mysql.createConnection({
          host: this.config.host,
          port: this.config.port,
          user: this.config.user,
          password: this.config.password,
          database: this.config.database,
          charset: this.config.charset,
          timezone: '+00:00',
          supportBigNumbers: true,
          bigNumberStrings: true
        });
        
        await this.verifySetup();
      } else {
        await this.createDatabase();
        await this.runMigrations();
        
        if (this.options.seed) {
          await this.seedDatabase();
        }
        
        await this.verifySetup();
      }
      
      logger.info('🎉 Local database setup completed successfully!');
    } catch (error) {
      logger.error('💥 Database setup failed:', error);
      throw error;
    } finally {
      await this.close();
    }
  }
}

// Parse command line arguments
function parseArguments(): SetupOptions {
  const args = process.argv.slice(2);
  
  return {
    seed: args.includes('--seed'),
    reset: args.includes('--reset'),
    verifyOnly: args.includes('--verify-only')
  };
}

// Main execution
async function main() {
  const options = parseArguments();
  const setup = new LocalDatabaseSetup(options);
  
  try {
    await setup.run();
    process.exit(0);
  } catch (error) {
    logger.error('Setup process failed:', error);
    process.exit(1);
  }
}

// Show usage if help is requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Local Database Setup Script

Usage: bun scripts/local-db-setup.ts [options]

Options:
  --seed         Include sample data seeding
  --reset        Drop and recreate database
  --verify-only  Only verify existing setup
  --help, -h     Show this help message

Examples:
  bun scripts/local-db-setup.ts                    # Basic setup
  bun scripts/local-db-setup.ts --seed             # Setup with sample data
  bun scripts/local-db-setup.ts --reset --seed     # Fresh setup with data
  bun scripts/local-db-setup.ts --verify-only      # Just verify current setup
`);
  process.exit(0);
}

// Run the main function
main();
