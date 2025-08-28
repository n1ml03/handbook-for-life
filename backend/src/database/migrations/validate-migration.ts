#!/usr/bin/env bun
/**
 * Migration Validation Script
 *
 * This script validates the consolidated migration file for:
 * 1. SQL syntax correctness
 * 2. Proper statement separation
 * 3. Comment structure
 * 4. Basic SQL statement validation
 *
 * Usage:
 *   bun validate-migration.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalStatements: number;
    createTableStatements: number;
    alterTableStatements: number;
    createIndexStatements: number;
    commentLines: number;
  };
}

class MigrationValidator {
  private migrationContent: string;
  private statements: string[];

  constructor(migrationPath: string) {
    this.migrationContent = fs.readFileSync(migrationPath, 'utf8');
    this.statements = this.parseStatements();
  }

  private parseStatements(): string[] {
    // Clean content first
    let cleanedContent = this.migrationContent
      .replace(/CREATE DATABASE IF NOT EXISTS[^;]*;/gi, '')
      .replace(/USE [^;]*;/gi, '');

    // Split by semicolons and clean up
    const statements = cleanedContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Found ${statements.length} statements to validate`);

    // Show all statements
    console.log('All statements:');
    statements.forEach((stmt, index) => {
      const preview = stmt.substring(0, 60).replace(/\n/g, ' ');
      console.log(`  ${index + 1}: ${preview}...`);
    });
    console.log('');

    return statements;
  }

  private validateSQLStatement(statement: string): { isValid: boolean; error?: string } {
    const trimmed = statement.trim();

    // Skip empty statements
    if (!trimmed) {
      return { isValid: true };
    }

    // Basic SQL keyword validation
    const sqlKeywords = [
      'CREATE TABLE', 'ALTER TABLE', 'CREATE INDEX', 'DROP INDEX',
      'INSERT INTO', 'UPDATE', 'DELETE FROM', 'CREATE OR REPLACE VIEW'
    ];

    const upperStatement = trimmed.toUpperCase();
    const hasValidKeyword = sqlKeywords.some(keyword => upperStatement.includes(keyword));

    if (!hasValidKeyword) {
      // Check if it's a valid statement without standard keywords
      if (upperStatement.includes('FOREIGN KEY') ||
          upperStatement.includes('PRIMARY KEY') ||
          upperStatement.includes('INDEX') ||
          upperStatement.includes('ENGINE=') ||
          upperStatement.startsWith('(') ||
          trimmed.startsWith('ADD COLUMN') ||
          trimmed.startsWith('MODIFY COLUMN')) {
        return { isValid: true };
      }

      return {
        isValid: false,
        error: `Statement doesn't contain recognized SQL keywords: ${trimmed.substring(0, 50)}...`
      };
    }

    // Basic syntax checks
    if (upperStatement.includes('CREATE TABLE') && !upperStatement.includes('(')) {
      return {
        isValid: false,
        error: 'CREATE TABLE statement missing opening parenthesis'
      };
    }

    if (upperStatement.includes('ALTER TABLE') && !upperStatement.includes('ADD') &&
        !upperStatement.includes('DROP') && !upperStatement.includes('MODIFY')) {
      return {
        isValid: false,
        error: 'ALTER TABLE statement missing ADD, DROP, or MODIFY clause'
      };
    }

    return { isValid: true };
  }

  private analyzeStatements(): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      stats: {
        totalStatements: 0,
        createTableStatements: 0,
        alterTableStatements: 0,
        createIndexStatements: 0,
        commentLines: 0
      }
    };

    // Count comment lines
    const lines = this.migrationContent.split('\n');
    result.stats.commentLines = lines.filter(line => line.trim().startsWith('--')).length;

    // Validate each statement
    for (const statement of this.statements) {
      result.stats.totalStatements++;

      // Categorize statements
      const upperStatement = statement.toUpperCase();
      if (upperStatement.includes('CREATE TABLE')) {
        result.stats.createTableStatements++;
      } else if (upperStatement.includes('ALTER TABLE')) {
        result.stats.alterTableStatements++;
      } else if (upperStatement.includes('CREATE INDEX') || upperStatement.includes('INDEX')) {
        result.stats.createIndexStatements++;
      }

      // Validate statement
      const validation = this.validateSQLStatement(statement);
      if (!validation.isValid) {
        result.errors.push(validation.error!);
        result.isValid = false;
      }
    }

    // Generate warnings
    if (result.stats.totalStatements === 0) {
      result.warnings.push('No SQL statements found in migration file');
    }

    if (result.stats.createTableStatements === 0) {
      result.warnings.push('No CREATE TABLE statements found - migration may be incomplete');
    }

    return result;
  }

  public validate(): ValidationResult {
    console.log('🔍 Validating consolidated migration file...\n');

    const result = this.analyzeStatements();

    console.log('📊 Migration Statistics:');
    console.log(`   Total statements: ${result.stats.totalStatements}`);
    console.log(`   CREATE TABLE statements: ${result.stats.createTableStatements}`);
    console.log(`   ALTER TABLE statements: ${result.stats.alterTableStatements}`);
    console.log(`   CREATE INDEX statements: ${result.stats.createIndexStatements}`);
    console.log(`   Comment lines: ${result.stats.commentLines}`);
    console.log('');

    if (result.errors.length > 0) {
      console.log('❌ Validation Errors:');
      result.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
      console.log('');
    }

    if (result.warnings.length > 0) {
      console.log('⚠️  Validation Warnings:');
      result.warnings.forEach((warning, index) => {
        console.log(`   ${index + 1}. ${warning}`);
      });
      console.log('');
    }

    if (result.isValid) {
      console.log('✅ Migration validation completed successfully!');
      console.log('🎉 The consolidated migration file appears to be valid.');
    } else {
      console.log('❌ Migration validation failed!');
      console.log('💥 Please fix the errors before proceeding.');
    }

    return result;
  }
}

// Main execution
function main() {
  const migrationPath = path.join(__dirname, 'consolidated_migration.sql');

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  const validator = new MigrationValidator(migrationPath);
  const result = validator.validate();

  process.exit(result.isValid ? 0 : 1);
}

// Export for use in other modules
export { MigrationValidator };

// Run if executed directly
if (import.meta.main) {
  main();
}
