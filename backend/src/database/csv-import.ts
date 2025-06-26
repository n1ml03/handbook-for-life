#!/usr/bin/env bun
import * as fs from 'fs';
import * as path from 'path';
import csvParser from 'csv-parser';
import { executeQuery, initializePool, closeDatabase } from '../config/database';
import logger from '../config/logger';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface CSVImportConfig {
  tableName: string;
  fileName: string;
  hasTranslationColumns: boolean;
  requiredColumns: string[];
  dependsOn: string[];
  order: number;
}

interface ImportResult {
  fileName: string;
  tableName: string;
  recordsProcessed: number;
  recordsInserted: number;
  recordsSkipped: number;
  errors: string[];
  executionTime: number;
}

class CSVImporter {
  private csvDir: string;
  private lockTimeout: number;
  private validateOnly: boolean;

  // CSV Import configuration in dependency order
  private readonly importConfigs: CSVImportConfig[] = [
    // Group 1: Core entities (no dependencies)
    {
      tableName: 'characters',
      fileName: 'characters.csv',
      hasTranslationColumns: true,
      requiredColumns: ['id', 'unique_key', 'name_jp', 'name_en'],
      dependsOn: [],
      order: 1
    },
    {
      tableName: 'skills',
      fileName: 'skills.csv',
      hasTranslationColumns: true,
      requiredColumns: ['id', 'unique_key', 'skill_category', 'name_jp', 'name_en'],
      dependsOn: [],
      order: 2
    },
    {
      tableName: 'items',
      fileName: 'items.csv',
      hasTranslationColumns: true,
      requiredColumns: ['id', 'unique_key', 'item_category', 'rarity', 'name_jp', 'name_en'],
      dependsOn: [],
      order: 3
    },
    {
      tableName: 'bromides',
      fileName: 'bromides.csv',
      hasTranslationColumns: true,
      requiredColumns: ['id', 'unique_key', 'bromide_type', 'rarity', 'name_jp', 'name_en'],
      dependsOn: ['skills'],
      order: 4
    },

    // Group 2: Dependent entities
    {
      tableName: 'swimsuits',
      fileName: 'swimsuits.csv',
      hasTranslationColumns: true,
      requiredColumns: ['id', 'character_id', 'unique_key', 'rarity', 'suit_type', 'name_jp', 'name_en'],
      dependsOn: ['characters'],
      order: 5
    },
    {
      tableName: 'episodes',
      fileName: 'episodes.csv',
      hasTranslationColumns: true,
      requiredColumns: ['id', 'unique_key', 'episode_type', 'title_jp', 'title_en'],
      dependsOn: ['characters', 'swimsuits'],
      order: 6
    },

    // Group 3: Game content
    {
      tableName: 'events',
      fileName: 'events.csv',
      hasTranslationColumns: true,
      requiredColumns: ['id', 'unique_key', 'type', 'start_date', 'end_date', 'name_jp', 'name_en'],
      dependsOn: [],
      order: 7
    },
    {
      tableName: 'gachas',
      fileName: 'gachas.csv',
      hasTranslationColumns: true,
      requiredColumns: ['id', 'unique_key', 'gacha_subtype', 'start_date', 'end_date', 'name_jp', 'name_en'],
      dependsOn: [],
      order: 8
    },

    // Group 4: Linking tables
    {
      tableName: 'swimsuit_skills',
      fileName: 'swimsuit_skills.csv',
      hasTranslationColumns: false,
      requiredColumns: ['swimsuit_id', 'skill_id', 'skill_slot'],
      dependsOn: ['swimsuits', 'skills'],
      order: 9
    },
    {
      tableName: 'gacha_pools',
      fileName: 'gacha_pools.csv',
      hasTranslationColumns: false,
      requiredColumns: ['gacha_id', 'pool_item_type', 'drop_rate'],
      dependsOn: ['gachas', 'swimsuits', 'bromides', 'items'],
      order: 10
    },
    {
      tableName: 'shop_listings',
      fileName: 'shop_listings.csv',
      hasTranslationColumns: false,
      requiredColumns: ['shop_type', 'item_id', 'cost_currency_item_id', 'cost_amount'],
      dependsOn: ['items'],
      order: 11
    }
  ];

  constructor() {
    this.csvDir = process.env.CSV_DIR || './csv_data';
    this.lockTimeout = parseInt(process.env.MIGRATION_LOCK_TIMEOUT || '30000');
    this.validateOnly = false;
  }

  async initialize(): Promise<void> {
    try {
      await initializePool();
      logger.info('CSV Importer initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize CSV importer', { error });
      throw error;
    }
  }

  private async acquireLock(): Promise<boolean> {
    try {
      const lockName = 'doaxvv_csv_import_lock';
      const [result] = await executeQuery('SELECT GET_LOCK(?, ?) as lock_result', [lockName, this.lockTimeout / 1000]);
      const lockResult = (result as RowDataPacket[])[0].lock_result;
      
      if (lockResult === 1) {
        logger.info('CSV import lock acquired successfully');
        return true;
      } else if (lockResult === 0) {
        throw new Error('CSV import lock timeout - another import process is running');
      } else {
        throw new Error('Failed to acquire CSV import lock');
      }
    } catch (error) {
      logger.error('Failed to acquire CSV import lock', { error });
      throw error;
    }
  }

  private async releaseLock(): Promise<void> {
    try {
      const lockName = 'doaxvv_csv_import_lock';
      await executeQuery('SELECT RELEASE_LOCK(?)', [lockName]);
      logger.info('CSV import lock released');
    } catch (error) {
      logger.warn('Failed to release CSV import lock', { error });
    }
  }

  private async validateCSVFile(config: CSVImportConfig): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const filePath = path.join(this.csvDir, config.fileName);

    if (!fs.existsSync(filePath)) {
      errors.push(`CSV file not found: ${config.fileName}`);
      return { isValid: false, errors };
    }

    return new Promise((resolve) => {
      const rows: any[] = [];
      let headerValidated = false;

      fs.createReadStream(filePath, { encoding: 'utf8' })
        .pipe(csvParser())
        .on('headers', (headers: string[]) => {
          // Validate required columns
          const missingColumns = config.requiredColumns.filter(col => !headers.includes(col));
          if (missingColumns.length > 0) {
            errors.push(`Missing required columns in ${config.fileName}: ${missingColumns.join(', ')}`);
          }
          headerValidated = true;
        })
        .on('data', (row: any) => {
          if (rows.length < 10) { // Only validate first 10 rows for performance
            rows.push(row);
          }
        })
        .on('end', () => {
          if (!headerValidated) {
            errors.push(`Failed to read headers from ${config.fileName}`);
          }

          if (rows.length === 0) {
            errors.push(`No data rows found in ${config.fileName}`);
          }

          // Validate data types for first few rows
          rows.forEach((row, index) => {
            if (config.requiredColumns.includes('id') && isNaN(Number(row.id))) {
              errors.push(`Invalid ID in ${config.fileName} row ${index + 2}: ${row.id}`);
            }
          });

          resolve({ isValid: errors.length === 0, errors });
        })
        .on('error', (err: any) => {
          errors.push(`Error reading ${config.fileName}: ${err.message}`);
          resolve({ isValid: false, errors });
        });
    });
  }

  private async checkDependencies(config: CSVImportConfig): Promise<{ satisfied: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const dependency of config.dependsOn) {
      try {
        const [result] = await executeQuery(`SELECT COUNT(*) as count FROM ${dependency}`) as [RowDataPacket[], any];
        const count = result[0].count;

        if (count === 0) {
          errors.push(`Dependency table '${dependency}' is empty. Import ${dependency} data first.`);
        }
      } catch (error) {
        errors.push(`Failed to check dependency '${dependency}': ${error instanceof Error ? error.message : error}`);
      }
    }

    return { satisfied: errors.length === 0, errors };
  }

  private async importCSVFile(config: CSVImportConfig): Promise<ImportResult> {
    const startTime = Date.now();
    const result: ImportResult = {
      fileName: config.fileName,
      tableName: config.tableName,
      recordsProcessed: 0,
      recordsInserted: 0,
      recordsSkipped: 0,
      errors: [],
      executionTime: 0
    };

    const filePath = path.join(this.csvDir, config.fileName);

    if (!fs.existsSync(filePath)) {
      result.errors.push(`File not found: ${config.fileName}`);
      return result;
    }

    logger.info(`Importing ${config.fileName} to ${config.tableName}...`);

    return new Promise((resolve) => {
      const rows: any[] = [];

      fs.createReadStream(filePath, { encoding: 'utf8' })
        .pipe(csvParser())
        .on('data', (row: any) => {
          rows.push(row);
        })
        .on('end', async () => {
          result.recordsProcessed = rows.length;

          try {
            // Process rows in batches for better performance
            const batchSize = 100;
            for (let i = 0; i < rows.length; i += batchSize) {
              const batch = rows.slice(i, i + batchSize);
              
              for (const row of batch) {
                try {
                  if (this.validateOnly) {
                    result.recordsInserted++;
                    continue;
                  }

                  await this.insertRow(config.tableName, row);
                  result.recordsInserted++;
                } catch (error) {
                  result.recordsSkipped++;
                  result.errors.push(`Row ${i + result.recordsSkipped}: ${error instanceof Error ? error.message : error}`);
                  
                  // Stop if too many errors
                  if (result.errors.length > 50) {
                    result.errors.push('Too many errors, stopping import...');
                    break;
                  }
                }
              }

              if (result.errors.length > 50) break;
            }

            result.executionTime = Date.now() - startTime;
            logger.info(`Import completed: ${config.fileName} - ${result.recordsInserted}/${result.recordsProcessed} records inserted`);
            
            resolve(result);
          } catch (error) {
            result.errors.push(`Import failed: ${error instanceof Error ? error.message : error}`);
            result.executionTime = Date.now() - startTime;
            resolve(result);
          }
        })
        .on('error', (err: any) => {
          result.errors.push(`Error reading file: ${err.message}`);
          result.executionTime = Date.now() - startTime;
          resolve(result);
        });
    });
  }

  private async insertRow(tableName: string, row: any): Promise<void> {
    // Remove empty/null values and prepare for insertion
    const cleanRow: any = {};
    
    Object.keys(row).forEach(key => {
      const value = row[key];
      if (value !== '' && value !== null && value !== undefined) {
        cleanRow[key] = value;
      }
    });

    if (Object.keys(cleanRow).length === 0) {
      throw new Error('No valid data in row');
    }

    const columns = Object.keys(cleanRow).map(key => `\`${key}\``).join(', ');
    const placeholders = Object.keys(cleanRow).map(() => '?').join(', ');
    const values = Object.values(cleanRow);

    const query = `INSERT INTO \`${tableName}\` (${columns}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${Object.keys(cleanRow).map(key => `\`${key}\` = VALUES(\`${key}\`)`).join(', ')}`;

    await executeQuery(query, values);
  }

  async importAll(): Promise<ImportResult[]> {
    let lockAcquired = false;
    const results: ImportResult[] = [];

    try {
      if (!this.validateOnly) {
        lockAcquired = await this.acquireLock();
      }

      // Sort configs by order
      const sortedConfigs = [...this.importConfigs].sort((a, b) => a.order - b.order);

      logger.info(`Starting CSV import process for ${sortedConfigs.length} files...`);

      for (const config of sortedConfigs) {
        // Validate CSV file
        const validation = await this.validateCSVFile(config);
        if (!validation.isValid) {
          results.push({
            fileName: config.fileName,
            tableName: config.tableName,
            recordsProcessed: 0,
            recordsInserted: 0,
            recordsSkipped: 0,
            errors: validation.errors,
            executionTime: 0
          });
          continue;
        }

        // Check dependencies
        if (!this.validateOnly) {
          const depCheck = await this.checkDependencies(config);
          if (!depCheck.satisfied) {
            results.push({
              fileName: config.fileName,
              tableName: config.tableName,
              recordsProcessed: 0,
              recordsInserted: 0,
              recordsSkipped: 0,
              errors: depCheck.errors,
              executionTime: 0
            });
            continue;
          }
        }

        // Import the file
        const result = await this.importCSVFile(config);
        results.push(result);

        // Stop on critical errors
        if (result.errors.length > 0 && result.recordsInserted === 0) {
          logger.error(`Critical error importing ${config.fileName}, stopping process`);
          break;
        }
      }

      logger.info('CSV import process completed');
      this.printSummary(results);

      return results;
    } catch (error) {
      logger.error('CSV import process failed', { error });
      throw error;
    } finally {
      if (lockAcquired) {
        await this.releaseLock();
      }
    }
  }

  async importSingle(fileName: string): Promise<ImportResult> {
    const config = this.importConfigs.find(c => c.fileName === fileName);
    if (!config) {
      throw new Error(`No configuration found for file: ${fileName}`);
    }

    const validation = await this.validateCSVFile(config);
    if (!validation.isValid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    if (!this.validateOnly) {
      const depCheck = await this.checkDependencies(config);
      if (!depCheck.satisfied) {
        throw new Error(`Dependencies not satisfied: ${depCheck.errors.join(', ')}`);
      }
    }

    return this.importCSVFile(config);
  }

  setValidateOnly(validateOnly: boolean): void {
    this.validateOnly = validateOnly;
  }

  setCsvDir(csvDir: string): void {
    this.csvDir = csvDir;
  }

  private printSummary(results: ImportResult[]): void {
    console.log('\n' + '='.repeat(60));
    console.log('CSV IMPORT SUMMARY');
    console.log('='.repeat(60));
    
    let totalProcessed = 0;
    let totalInserted = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    results.forEach(result => {
      const status = result.errors.length === 0 ? '✅ SUCCESS' : '❌ ERRORS';
      console.log(`${status} ${result.fileName} -> ${result.tableName}`);
      console.log(`  Processed: ${result.recordsProcessed}, Inserted: ${result.recordsInserted}, Skipped: ${result.recordsSkipped}`);
      console.log(`  Time: ${result.executionTime}ms`);
      
      if (result.errors.length > 0) {
        console.log(`  Errors: ${result.errors.slice(0, 3).join('; ')}${result.errors.length > 3 ? '...' : ''}`);
      }
      console.log('');

      totalProcessed += result.recordsProcessed;
      totalInserted += result.recordsInserted;
      totalSkipped += result.recordsSkipped;
      totalErrors += result.errors.length;
    });

    console.log(`TOTALS: ${totalInserted}/${totalProcessed} records inserted, ${totalSkipped} skipped, ${totalErrors} errors`);
    console.log('='.repeat(60));
  }

  async cleanup(): Promise<void> {
    try {
      await closeDatabase();
      logger.info('CSV Importer cleanup completed');
    } catch (error) {
      logger.warn('Error during CSV importer cleanup', { error });
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const importer = new CSVImporter();

  try {
    await importer.initialize();

    // Parse command line arguments
    if (args.includes('--help') || args.includes('-h')) {
      console.log(`
CSV Import Tool for DOAXVV Handbook Database

Usage:
  bun run csv-import.ts [options]

Options:
  --folder <path>      Set CSV folder path (default: ./csv_data)
  --file <filename>    Import specific file only
  --validate-only      Validate CSV files without importing
  --help, -h           Show this help message

Examples:
  bun run csv-import.ts --folder ./production_csv
  bun run csv-import.ts --file characters.csv
  bun run csv-import.ts --validate-only

Import Order:
  1. Core entities: characters, skills, items, bromides
  2. Dependent entities: swimsuits, episodes
  3. Game content: events, gachas  
  4. Linking tables: swimsuit_skills, gacha_pools, shop_listings
      `);
      process.exit(0);
    }

    // Set options
    const folderIndex = args.indexOf('--folder');
    if (folderIndex !== -1 && args[folderIndex + 1]) {
      importer.setCsvDir(args[folderIndex + 1]);
    }

    const validateOnly = args.includes('--validate-only');
    importer.setValidateOnly(validateOnly);

    // Execute import
    const fileIndex = args.indexOf('--file');
    if (fileIndex !== -1 && args[fileIndex + 1]) {
      // Import single file
      const fileName = args[fileIndex + 1];
      const result = await importer.importSingle(fileName);
      
      if (result.errors.length > 0) {
        console.error(`Import failed: ${result.errors.join(', ')}`);
        process.exit(1);
      } else {
        console.log(`Import successful: ${result.recordsInserted}/${result.recordsProcessed} records imported`);
      }
    } else {
      // Import all files
      const results = await importer.importAll();
      const hasErrors = results.some(r => r.errors.length > 0);
      
      if (hasErrors) {
        process.exit(1);
      }
    }

  } catch (error) {
    logger.error('CSV import failed', { error });
    console.error(`Error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  } finally {
    await importer.cleanup();
  }
}

// Bun/TypeScript compatible main check
if (process.argv[1] && process.argv[1].endsWith('csv-import.ts')) {
  main();
}

export { CSVImporter }; 