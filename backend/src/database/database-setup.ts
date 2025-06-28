#!/usr/bin/env bun
import * as mysql from 'mysql2/promise';
import { config } from 'dotenv';
import logger from '../config/logger';
import path from 'path';
import fs from 'fs';

// Load environment variables
config();

interface DatabaseSetupConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  charset: string;
  collation: string;
}

class DatabaseSetup {
  private config: DatabaseSetupConfig;
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
        bigNumberStrings: true
      });

      logger.info('Connected to MySQL server successfully');
    } catch (error) {
      logger.error('Failed to connect to MySQL server:', error);
      throw new Error(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createDatabase(): Promise<void> {
    if (!this.connection) {
      throw new Error('Database connection not initialized');
    }

    try {
      // Check if database exists
      const [rows] = await this.connection.execute(
        'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
        [this.config.database]
      );

      if ((rows as any[]).length === 0) {
        // Database doesn't exist, create it
        logger.info(`Creating database '${this.config.database}'...`);
        
        await this.connection.execute(`
          CREATE DATABASE \`${this.config.database}\` 
          CHARACTER SET ${this.config.charset} 
          COLLATE ${this.config.collation}
        `);
        
        logger.info(`Database '${this.config.database}' created successfully`);
      } else {
        logger.info(`Database '${this.config.database}' already exists`);
      }

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
        bigNumberStrings: true
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
        
        // Split by semicolons and execute each statement
        const statements = migrationContent
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('CREATE DATABASE') && !stmt.startsWith('USE '));

        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await this.connection.execute(statement);
            } catch (error) {
              logger.warn(`Statement execution warning: ${error instanceof Error ? error.message : 'Unknown error'}`);
              // Continue with other statements
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

  async verifySetup(): Promise<void> {
    if (!this.connection) {
      throw new Error('Database connection not initialized');
    }

    try {
      // Check if key tables exist
      const [result] = await this.connection.execute(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME IN ('characters', 'swimsuits', 'skills', 'items')
      `, [this.config.database]);

      const tables = result as any[];
      const tableNames = tables.map(row => row.TABLE_NAME);

      if (tableNames.length > 0) {
        logger.info('Database setup verification passed', { tablesFound: tableNames });
      } else {
        logger.warn('Database setup verification failed - no expected tables found');
      }
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

  async setupDatabase(): Promise<void> {
    try {
      logger.info('Starting database setup...');
      
      await this.initialize();
      await this.createDatabase();
      await this.runMigrations();
      await this.verifySetup();
      
      logger.info('Database setup completed successfully!');
    } catch (error) {
      logger.error('Database setup failed:', error);
      throw error;
    } finally {
      await this.close();
    }
  }
}

// Main execution function
async function main() {
  const setup = new DatabaseSetup();
  
  try {
    await setup.setupDatabase();
    process.exit(0);
  } catch (error) {
    logger.error('Setup process failed:', error);
    process.exit(1);
  }
}

// Export for use in other modules
export { DatabaseSetup };

// Run if executed directly
if (import.meta.main) {
  main();
} 