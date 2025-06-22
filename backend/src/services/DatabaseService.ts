import { UpdateLog, NewUpdateLog } from '../types/database';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config';
import { executeQuery } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

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
        SELECT COUNT(*) as total FROM update_logs WHERE isPublished = true
      `);
      const total = (countResult as RowDataPacket[])[0].total;

      // Get data
      const [rows] = await executeQuery(`
        SELECT * FROM update_logs
        WHERE isPublished = true
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
      logger.error('Failed to fetch published update logs', { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch published update logs', 500);
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
      // Business logic validation
      if (!updateLogData.version?.trim()) {
        throw new AppError('Update log version is required', 400);
      }

      if (!updateLogData.title?.trim()) {
        throw new AppError('Update log title is required', 400);
      }

      if (!updateLogData.content?.trim()) {
        throw new AppError('Update log content is required', 400);
      }

      // Generate unique key if not provided
      const uniqueKey = updateLogData.unique_key || 
        `update-${updateLogData.version.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;

      logger.info(`Creating update log: ${updateLogData.title}`, { version: updateLogData.version });

      const [result] = await executeQuery(`
        INSERT INTO update_logs (
          unique_key, version, title, content, description, date, tags, 
          isPublished, technicalDetails, bugFixes, screenshots, metrics
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        uniqueKey,
        updateLogData.version,
        updateLogData.title,
        updateLogData.content,
        updateLogData.description || '',
        updateLogData.date,
        JSON.stringify(updateLogData.tags || []),
        updateLogData.isPublished !== undefined ? updateLogData.isPublished : true,
        JSON.stringify(updateLogData.technicalDetails || []),
        JSON.stringify(updateLogData.bugFixes || []),
        JSON.stringify(updateLogData.screenshots || []),
        JSON.stringify(updateLogData.metrics || {
          performanceImprovement: '0%',
          userSatisfaction: '0%',
          bugReports: 0
        })
      ]);

      const insertResult = result as ResultSetHeader;
      const createdUpdateLog = await this.getUpdateLogById(insertResult.insertId.toString());

      logger.info(`Update log created successfully: ${createdUpdateLog.title}`, { id: createdUpdateLog.id });
      return createdUpdateLog;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to create update log: ${updateLogData.title}`, { 
        error: error instanceof Error ? error.message : error,
        version: updateLogData.version 
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
      if (updates.isPublished !== undefined) {
        updateFields.push('isPublished = ?');
        updateValues.push(updates.isPublished);
      }
      if (updates.technicalDetails !== undefined) {
        updateFields.push('technicalDetails = ?');
        updateValues.push(JSON.stringify(updates.technicalDetails));
      }
      if (updates.bugFixes !== undefined) {
        updateFields.push('bugFixes = ?');
        updateValues.push(JSON.stringify(updates.bugFixes));
      }
      if (updates.screenshots !== undefined) {
        updateFields.push('screenshots = ?');
        updateValues.push(JSON.stringify(updates.screenshots));
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
      isPublished: Boolean(row.isPublished),
      technicalDetails: this.parseJSONField(row.technicalDetails, []),
      bugFixes: this.parseJSONField(row.bugFixes, []),
      screenshots: this.parseJSONField(row.screenshots, []),
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

  async healthCheck(): Promise<{ isHealthy: boolean; errors: string[] }> {
    try {
      await executeQuery('SELECT 1 FROM update_logs LIMIT 1');
      return {
        isHealthy: true,
        errors: []
      };
    } catch (error) {
      return {
        isHealthy: false,
        errors: [`Database service health check failed: ${error instanceof Error ? error.message : error}`]
      };
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
export default databaseService;
