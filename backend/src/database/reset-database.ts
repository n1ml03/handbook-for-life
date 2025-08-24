#!/usr/bin/env bun
import * as mysql from 'mysql2/promise';
import { config } from 'dotenv';
import logger from '../config/logger';
import path from 'path';
import fs from 'fs';

// Load environment variables
config();

interface DatabaseResetConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  charset: string;
  collation: string;
}

class DatabaseReset {
  private config: DatabaseResetConfig;
  private connection: mysql.Connection | null = null;

  constructor() {
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

  private splitSQLStatements(sql: string): string[] {
    const statements: string[] = [];
    let currentStatement = '';
    let inComment = false;
    let inQuotes = false;
    let quoteChar = '';
    
    const lines = sql.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines and comment-only lines
      if (!trimmedLine || trimmedLine.startsWith('--')) {
        continue;
      }
      
      currentStatement += line + '\n';
      
      // Check if this line ends a statement (contains semicolon not in quotes/comments)
      let foundSemicolon = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const prevChar = i > 0 ? line[i - 1] : '';
        
        // Handle quotes
        if ((char === '"' || char === "'") && prevChar !== '\\') {
          if (!inQuotes) {
            inQuotes = true;
            quoteChar = char;
          } else if (char === quoteChar) {
            inQuotes = false;
            quoteChar = '';
          }
        }
        
        // Handle comments
        if (!inQuotes && char === '-' && line[i + 1] === '-') {
          inComment = true;
          break;
        }
        
        // Check for semicolon
        if (!inQuotes && !inComment && char === ';') {
          foundSemicolon = true;
          break;
        }
      }
      
      // Reset comment flag at end of line
      inComment = false;
      
      // If we found a semicolon, this statement is complete
      if (foundSemicolon) {
        const statement = currentStatement.trim();
        if (statement && !statement.startsWith('--')) {
          statements.push(statement);
        }
        currentStatement = '';
        inQuotes = false;
        quoteChar = '';
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim()) {
      const statement = currentStatement.trim();
      if (statement && !statement.startsWith('--')) {
        statements.push(statement);
      }
    }
    
    return statements;
  }

  async initialize(): Promise<void> {
    try {
      // Connect to MySQL server without specifying database
      this.connection = await mysql.createConnection({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        charset: this.config.charset,
        timezone: '+00:00',
        supportBigNumbers: true,
        bigNumberStrings: true,
        multipleStatements: true
      });

      logger.info('Connected to MySQL server successfully');
    } catch (error) {
      logger.error('Failed to connect to MySQL server:', error);
      throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async dropDatabase(): Promise<void> {
    if (!this.connection) {
      throw new Error('Database connection not initialized');
    }

    try {
      logger.info(`Dropping database '${this.config.database}' if it exists...`);
      
      await this.connection.execute(`DROP DATABASE IF EXISTS \`${this.config.database}\``);
      
      logger.info(`Database '${this.config.database}' dropped successfully`);
    } catch (error) {
      logger.error('Failed to drop database:', error);
      throw new Error(`Database drop failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createDatabase(): Promise<void> {
    if (!this.connection) {
      throw new Error('Database connection not initialized');
    }

    try {
      logger.info(`Creating database '${this.config.database}'...`);
      
      await this.connection.execute(`
        CREATE DATABASE \`${this.config.database}\` 
        CHARACTER SET ${this.config.charset} 
        COLLATE ${this.config.collation}
      `);
      
      logger.info(`Database '${this.config.database}' created successfully`);

      // Close current connection and reconnect to the specific database
      await this.connection.end();
      
      // Reconnect with the specific database
      this.connection = await mysql.createConnection({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        charset: this.config.charset,
        timezone: '+00:00',
        supportBigNumbers: true,
        bigNumberStrings: true,
        multipleStatements: true
      });
      
      logger.info(`Connected to database '${this.config.database}'`);

    } catch (error) {
      logger.error('Failed to create database:', error);
      throw new Error(`Database creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async runMigrations(): Promise<void> {
    if (!this.connection) {
      throw new Error('Database connection not initialized');
    }

    try {
      const migrationsDir = path.join(import.meta.dir, 'migrations');
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql') && file.match(/^\d{3}_/))
        .sort();

      if (migrationFiles.length === 0) {
        logger.warn('No migration files found');
        return;
      }

      logger.info(`Found ${migrationFiles.length} migration files`);

      for (const migrationFile of migrationFiles) {
        logger.info(`Running migration: ${migrationFile}`);
        
        const migrationPath = path.join(migrationsDir, migrationFile);
        const migrationContent = fs.readFileSync(migrationPath, 'utf8');
        
        // Remove problematic statements
        const cleanedContent = migrationContent
          .replace(/CREATE DATABASE IF NOT EXISTS[^;]*;/gi, '')
          .replace(/USE [^;]*;/gi, '');

        // Split into logical statements more intelligently
        const statements = this.splitSQLStatements(cleanedContent);

        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await this.connection.execute(statement);
            } catch (error) {
              logger.error(`Statement execution failed: ${statement.substring(0, 100)}...`, { error });
              throw error;
            }
          }
        }
        
        logger.info(`Migration completed: ${migrationFile}`);
      }

      logger.info('All migrations executed successfully');
    } catch (error) {
      logger.error('Failed to run migrations:', error);
      throw new Error(`Migration execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async runConsolidatedSeeds(): Promise<void> {
    if (!this.connection) {
      throw new Error('Database connection not initialized');
    }

    try {
      const seedsDir = path.join(import.meta.dir, 'seeds');
      const consolidatedSeedFile = path.join(seedsDir, '000_mysql_data.sql');

      if (!fs.existsSync(consolidatedSeedFile)) {
        throw new Error('Consolidated seed file not found: 000_mysql_data.sql');
      }

      logger.info('Running consolidated seed data...');
      
      const seedContent = fs.readFileSync(consolidatedSeedFile, 'utf8');
      
      // Split into logical statements more intelligently
      const statements = this.splitSQLStatements(seedContent);
      let recordsInserted = 0;

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const [result] = await this.connection.execute(statement);
            if ((result as any).affectedRows) {
              recordsInserted += (result as any).affectedRows;
            }
          } catch (error) {
            logger.error(`Seed statement failed: ${statement.substring(0, 100)}...`, { error });
            throw error;
          }
        }
      }
      
      logger.info(`Consolidated seed data completed successfully (${recordsInserted} records inserted)`);
    } catch (error) {
      logger.error('Failed to run consolidated seeds:', error);
      throw new Error(`Seed execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async verifySetup(): Promise<void> {
    if (!this.connection) {
      throw new Error('Database connection not initialized');
    }

    try {
      // Check if key tables exist and have data
      const tablesToCheck = ['characters', 'swimsuits', 'skills', 'items', 'bromides', 'episodes', 'events', 'gachas', 'documents', 'update_logs'];
      
      for (const tableName of tablesToCheck) {
        const [result] = await this.connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        const count = (result as any[])[0].count;
        logger.info(`Table '${tableName}': ${count} records`);
      }

      logger.info('Database setup verification completed successfully');
    } catch (error) {
      logger.error('Database verification failed:', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
      logger.info('Database connection closed');
    }
  }

  async resetDatabase(): Promise<void> {
    try {
      logger.info('Starting complete database reset...');
      
      await this.initialize();
      await this.dropDatabase();
      await this.createDatabase();
      await this.runMigrations();
      await this.runConsolidatedSeeds();
      await this.verifySetup();
      
      logger.info('Database reset completed successfully!');
    } catch (error) {
      logger.error('Database reset failed:', error);
      throw error;
    } finally {
      await this.close();
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const force = args.includes('--force') || args.includes('-f');

  if (!force) {
    logger.warn('This will completely DROP and RECREATE the database!');
    logger.warn('All existing data will be PERMANENTLY LOST!');
    logger.warn('Use --force flag to confirm this action.');
    process.exit(1);
  }

  const resetTool = new DatabaseReset();

  try {
    await resetTool.resetDatabase();
    logger.info('Database reset process completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database reset process failed:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.main) {
  main();
}

export { DatabaseReset }; 