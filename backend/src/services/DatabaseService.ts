import { UpdateLog, NewUpdateLog } from '../types/database';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config';
import { executeQuery } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { generateId } from '../utils/id';

export class DatabaseService {
  constructor() {}

  async getUpdateLogs(options: PaginationOptions = {}): Promise<PaginatedResult<UpdateLog>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'date',
        sortOrder = 'desc'
      } = options;

      const offset = (page - 1) * limit;
      const validSortColumns = ['date', 'title', 'version', 'created_at', 'updated_at'];
      const safeSort = validSortColumns.includes(sortBy) ? sortBy : 'date';
      const safeOrder = sortOrder === 'asc' ? 'ASC' : 'DESC';

      // Get total count
      const [countResult] = await executeQuery(`
        SELECT COUNT(*) as total FROM update_logs
      `);
      const total = (countResult as RowDataPacket[])[0].total;

      // Get data
      const [rows] = await executeQuery(`
        SELECT * FROM update_logs
        ORDER BY ${safeSort} ${safeOrder}
        LIMIT ? OFFSET ?
      `, [limit, offset]);

      const updateLogs = (rows as RowDataPacket[]).map(this.transformUpdateLog);

      return {
        data: updateLogs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logger.error('Failed to fetch update logs', { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch update logs', 500);
    }
  }

  async getPublishedUpdateLogs(options: PaginationOptions = {}): Promise<PaginatedResult<UpdateLog>> {
    try {
      // Validate and set defaults
      const page = Math.max(1, options.page || 1);
      const limit = Math.min(100, Math.max(1, options.limit || 10));
      const sortBy = options.sortBy && ['date', 'version', 'title'].includes(options.sortBy) ? options.sortBy : 'date';
      const sortOrder = options.sortOrder === 'asc' ? 'ASC' : 'DESC';
      const offset = (page - 1) * limit;

      // Safety check for SQL injection
      const safeSort = sortBy.replace(/[^a-zA-Z_]/g, '');
      const safeOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

      // Get total count
      const [countResult] = await executeQuery(`
        SELECT COUNT(*) as total FROM update_logs
      `);
      const total = (countResult as RowDataPacket[])[0].total;

      // Get data
      const [rows] = await executeQuery(`
        SELECT * FROM update_logs
        ORDER BY ${safeSort} ${safeOrder}
        LIMIT ? OFFSET ?
      `, [limit, offset]);

      const updateLogs = (rows as RowDataPacket[]).map(this.transformUpdateLog);

      return {
        data: updateLogs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logger.error('Failed to fetch update logs', { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch update logs', 500);
    }
  }

  async getUpdateLogById(id: string): Promise<UpdateLog> {
    try {
      if (!id?.trim()) {
        throw new AppError('Update log ID is required', 400);
      }

      const [rows] = await executeQuery(`
        SELECT * FROM update_logs WHERE id = ?
      `, [id]);

      const updateLogs = rows as RowDataPacket[];
      if (updateLogs.length === 0) {
        throw new AppError('Update log not found', 404);
      }

      return this.transformUpdateLog(updateLogs[0]);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to fetch update log: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch update log', 500);
    }
  }

  async createUpdateLog(updateLogData: NewUpdateLog): Promise<UpdateLog> {
    try {
      // Enhanced validation
      this.validateCreateUpdateLogData(updateLogData);

      // Generate unique key if not provided
      const uniqueKey = updateLogData.unique_key ||
        this.generateUpdateLogUniqueKey(updateLogData.version);

      logger.info(`Creating update log: ${updateLogData.title}`, {
        version: updateLogData.version,
        uniqueKey
      });

      const [result] = await executeQuery(`
        INSERT INTO update_logs (
          unique_key, version, title, content, description, date, tags,
          screenshots_data, metrics
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        uniqueKey,
        updateLogData.version,
        updateLogData.title,
        updateLogData.content,
        updateLogData.description || '',
        updateLogData.date,
        JSON.stringify(updateLogData.tags || []),
        JSON.stringify(updateLogData.screenshots_data || []),
        JSON.stringify(updateLogData.metrics || this.getDefaultMetrics())
      ]);

      const insertResult = result as ResultSetHeader;
      const createdUpdateLog = await this.getUpdateLogById(insertResult.insertId.toString());

      logger.info(`Update log created successfully: ${createdUpdateLog.title}`, {
        id: createdUpdateLog.id,
        uniqueKey: createdUpdateLog.unique_key
      });
      return createdUpdateLog;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to create update log: ${updateLogData.title}`, {
        error: error instanceof Error ? error.message : error,
        version: updateLogData.version,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw new AppError('Failed to create update log', 500);
    }
  }

  async updateUpdateLog(id: string, updates: Partial<NewUpdateLog>): Promise<UpdateLog> {
    try {
      if (!id?.trim()) {
        throw new AppError('Update log ID is required', 400);
      }

      // Business logic validation
      if (updates.title !== undefined && !updates.title?.trim()) {
        throw new AppError('Update log title cannot be empty', 400);
      }

      if (updates.version !== undefined && !updates.version?.trim()) {
        throw new AppError('Update log version cannot be empty', 400);
      }

      // Check if update log exists
      await this.getUpdateLogById(id);

      // Build update query dynamically
      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (updates.version !== undefined) {
        updateFields.push('version = ?');
        updateValues.push(updates.version);
      }
      if (updates.title !== undefined) {
        updateFields.push('title = ?');
        updateValues.push(updates.title);
      }
      if (updates.content !== undefined) {
        updateFields.push('content = ?');
        updateValues.push(updates.content);
      }
      if (updates.description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(updates.description);
      }
      if (updates.date !== undefined) {
        updateFields.push('date = ?');
        updateValues.push(updates.date);
      }
      if (updates.tags !== undefined) {
        updateFields.push('tags = ?');
        updateValues.push(JSON.stringify(updates.tags));
      }
      if (updates.screenshots_data !== undefined) {
        updateFields.push('screenshots_data = ?');
        updateValues.push(JSON.stringify(updates.screenshots_data));
      }
      if (updates.metrics !== undefined) {
        updateFields.push('metrics = ?');
        updateValues.push(JSON.stringify(updates.metrics));
      }

      if (updateFields.length === 0) {
        throw new AppError('No valid fields to update', 400);
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(id);

      logger.info(`Updating update log: ${id}`, { updates });

      await executeQuery(`
        UPDATE update_logs 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `, updateValues);

      const updatedUpdateLog = await this.getUpdateLogById(id);

      logger.info(`Update log updated successfully: ${updatedUpdateLog.title}`, { id: updatedUpdateLog.id });
      return updatedUpdateLog;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to update update log: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to update update log', 500);
    }
  }

  async deleteUpdateLog(id: string): Promise<void> {
    try {
      if (!id?.trim()) {
        throw new AppError('Update log ID is required', 400);
      }

      // Check if update log exists before deletion
      await this.getUpdateLogById(id);

      logger.info(`Deleting update log: ${id}`);
      await executeQuery(`DELETE FROM update_logs WHERE id = ?`, [id]);
      logger.info(`Update log deleted successfully: ${id}`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to delete update log: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to delete update log', 500);
    }
  }

  private transformUpdateLog(row: RowDataPacket): UpdateLog {
    return {
      id: row.id,
      unique_key: row.unique_key,
      version: row.version,
      title: row.title,
      content: row.content,
      description: row.description || '',
      date: new Date(row.date),
      tags: this.parseJSONField(row.tags, []),
      screenshots_data: this.parseJSONField(row.screenshots_data, []),
      metrics: this.parseJSONField(row.metrics, {
        performanceImprovement: '0%',
        userSatisfaction: '0%',
        bugReports: 0
      }),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  private parseJSONField(field: any, defaultValue: any): any {
    if (!field) return defaultValue;
    try {
      return typeof field === 'string' ? JSON.parse(field) : field;
    } catch {
      return defaultValue;
    }
  }

  private validateCreateUpdateLogData(data: NewUpdateLog): void {
    // Required field validation
    if (!data.version?.trim()) {
      throw new AppError('Update log version is required', 400);
    }

    if (!data.title?.trim()) {
      throw new AppError('Update log title is required', 400);
    }

    if (!data.content?.trim()) {
      throw new AppError('Update log content is required', 400);
    }

    // Version format validation
    const versionPattern = /^v?\d+\.\d+(\.\d+)?(-[a-zA-Z0-9]+)?$/;
    if (!versionPattern.test(data.version.trim())) {
      throw new AppError('Version must follow semantic versioning format (e.g., v1.0.0, 2.1.0-beta)', 400);
    }

    // Title length validation
    if (data.title.trim().length > 255) {
      throw new AppError('Update log title must be 255 characters or less', 400);
    }

    // Content length validation
    if (data.content.trim().length > 65535) {
      throw new AppError('Update log content is too long (maximum 65535 characters)', 400);
    }

    // Date validation
    if (data.date && data.date > new Date()) {
      throw new AppError('Update log date cannot be in the future', 400);
    }

    // Tags validation
    if (data.tags && Array.isArray(data.tags)) {
      if (data.tags.length > 10) {
        throw new AppError('Maximum 10 tags allowed', 400);
      }

      for (const tag of data.tags) {
        if (typeof tag !== 'string' || tag.trim().length === 0) {
          throw new AppError('All tags must be non-empty strings', 400);
        }
        if (tag.trim().length > 50) {
          throw new AppError('Each tag must be 50 characters or less', 400);
        }
      }
    }

    // Screenshots validation
    if (data.screenshots_data && Array.isArray(data.screenshots_data)) {
      for (const screenshot of data.screenshots_data) {
        if (!screenshot.data || !screenshot.mimeType || !screenshot.filename) {
          throw new AppError('All screenshots must have data, mimeType, and filename', 400);
        }
      }
    }
  }

  private generateUpdateLogUniqueKey(version: string): string {
    const cleanVersion = version.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const uniqueId = generateId();
    return `update-${cleanVersion}-${uniqueId}`;
  }

  private getDefaultMetrics(): any {
    return {
      performanceImprovement: '0%',
      userSatisfaction: '0%',
      bugReports: 0,
      downloadCount: 0,
      installationSuccess: '100%'
    };
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  async healthCheck(): Promise<{ isHealthy: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let isHealthy = true;

    try {
      // Test database connection with timeout
      const connectionStart = Date.now();
      await executeQuery('SELECT 1');
      const connectionTime = Date.now() - connectionStart;

      if (connectionTime > 1000) {
        warnings.push(`Database connection is slow: ${connectionTime}ms`);
      }

      // Test each table with performance monitoring
      const tables = [
        'characters', 'swimsuits', 'skills', 'items', 'gachas', 'gacha_pools',
        'bromides', 'episodes', 'events', 'documents', 'update_logs', 'shop_listings'
      ];

      for (const table of tables) {
        try {
          const tableStart = Date.now();
          const [rows] = await executeQuery(`SELECT COUNT(*) as count FROM ${table}`);
          const tableTime = Date.now() - tableStart;

          if (tableTime > 500) {
            warnings.push(`Table ${table} query is slow: ${tableTime}ms`);
          }

          const count = (rows as any[])[0]?.count || 0;
          if (count === 0 && ['characters', 'skills'].includes(table)) {
            warnings.push(`Table ${table} appears to be empty`);
          }

        } catch (error) {
          errors.push(`Table ${table} is not accessible: ${error}`);
          isHealthy = false;
        }
      }

      // Check for missing indexes (simplified check)
      try {
        const [indexes] = await executeQuery(`
          SELECT TABLE_NAME, INDEX_NAME
          FROM information_schema.statistics
          WHERE TABLE_SCHEMA = DATABASE()
          AND INDEX_NAME != 'PRIMARY'
        `);

        const indexCount = (indexes as any[]).length;
        if (indexCount < 10) {
          warnings.push(`Low number of database indexes detected: ${indexCount}. Consider adding performance indexes.`);
        }
      } catch (error) {
        warnings.push('Could not check database indexes');
      }

    } catch (error) {
      errors.push(`Database connection failed: ${error}`);
      isHealthy = false;
    }

    return { isHealthy, errors, warnings };
  }

  async initialize(): Promise<void> {
    logger.info('Initializing DatabaseService...');

    try {
      // Test database connection
      await executeQuery('SELECT 1');

      // Verify critical tables exist
      const criticalTables = ['characters', 'swimsuits', 'skills'];
      for (const table of criticalTables) {
        await executeQuery(`SELECT 1 FROM ${table} LIMIT 1`);
      }

      logger.info('DatabaseService initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize DatabaseService', { error });
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down DatabaseService...');

    try {
      // Perform any cleanup operations
      // Note: We don't close the connection pool here as it might be used by other services
      logger.info('DatabaseService shut down successfully');
    } catch (error) {
      logger.error('Failed to shutdown DatabaseService', { error });
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
export default databaseService;
