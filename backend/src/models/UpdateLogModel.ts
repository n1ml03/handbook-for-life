import { BaseModel, PaginationOptions, PaginatedResult } from './BaseModel';
import { UpdateLog, NewUpdateLog } from '../types/database';
import { executeQuery } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export class UpdateLogModel extends BaseModel<UpdateLog, NewUpdateLog> {
  constructor() {
    super('update_logs');
  }

  // Implementation of abstract methods
  protected mapRow(row: any): UpdateLog {
    return this.mapUpdateLogRow(row);
  }

  protected getCreateFields(): (keyof NewUpdateLog)[] {
    return [
      'unique_key',
      'version', 
      'title',
      'content',
      'description',
      'date',
      'tags',
      'screenshots',
      'metrics'
    ];
  }

  protected getUpdateFields(): (keyof NewUpdateLog)[] {
    return this.getCreateFields();
  }

  // Mapper function to convert database row to UpdateLog object
  private mapUpdateLogRow(row: any): UpdateLog {
    return {
      id: row.id,
      unique_key: row.unique_key,
      version: row.version,
      title: row.title,
      content: row.content,
      description: row.description || '',
      date: new Date(row.date),
      tags: this.parseJSONField(row.tags, []),
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

  // Helper method to safely parse JSON fields
  private parseJSONField(field: any, defaultValue: any): any {
    if (field === null || field === undefined) {
      return defaultValue;
    }
    
    if (typeof field === 'string') {
      try {
        return JSON.parse(field);
      } catch {
        return defaultValue;
      }
    }
    
    return field;
  }

  async create(updateLog: NewUpdateLog): Promise<UpdateLog> {
    try {
      // Generate unique key if not provided
      const uniqueKey = updateLog.unique_key || 
        `update-${updateLog.version.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;

      const [result] = await executeQuery(
        `INSERT INTO update_logs (
          unique_key, version, title, content, description, date, tags,
          screenshots, metrics
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uniqueKey,
          updateLog.version,
          updateLog.title,
          updateLog.content,
          updateLog.description || '',
          updateLog.date,
          JSON.stringify(updateLog.tags || []),
          JSON.stringify(updateLog.screenshots || []),
          JSON.stringify(updateLog.metrics || {
            performanceImprovement: '0%',
            userSatisfaction: '0%',
            bugReports: 0
          })
        ]
      ) as [any, any];

      return this.findById(result.insertId);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError('Update log with this unique_key already exists', 409);
      }
      logger.error('Failed to create update log:', error);
      throw new AppError('Failed to create update log', 500);
    }
  }

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<UpdateLog>> {
    return this.getPaginatedResults(
      'SELECT * FROM update_logs',
      'SELECT COUNT(*) FROM update_logs',
      options,
      this.mapUpdateLogRow.bind(this)
    );
  }



  // Override findById to use proper typing
  async findById(id: number): Promise<UpdateLog> {
    return super.findById(id);
  }

  async findByUniqueKey(unique_key: string): Promise<UpdateLog> {
    const [rows] = await executeQuery('SELECT * FROM update_logs WHERE unique_key = ?', [unique_key]) as [any[], any];
    if (rows.length === 0) {
      throw new AppError('Update log not found', 404);
    }
    return this.mapUpdateLogRow(rows[0]);
  }

  async findByVersion(version: string, options: PaginationOptions = {}): Promise<PaginatedResult<UpdateLog>> {
    return this.getPaginatedResults(
      'SELECT * FROM update_logs WHERE version = ?',
      'SELECT COUNT(*) FROM update_logs WHERE version = ?',
      options,
      this.mapUpdateLogRow,
      [version]
    );
  }

  async findRecent(days: number = 30, options: PaginationOptions = {}): Promise<PaginatedResult<UpdateLog>> {
    return this.getPaginatedResults(
      'SELECT * FROM update_logs WHERE date >= DATE_SUB(NOW(), INTERVAL ? DAY)',
      'SELECT COUNT(*) FROM update_logs WHERE date >= DATE_SUB(NOW(), INTERVAL ? DAY)',
      options,
      this.mapUpdateLogRow,
      [days]
    );
  }

  async update(id: number, updates: Partial<NewUpdateLog>): Promise<UpdateLog> {
    const setClause: string[] = [];
    const params: any[] = [];

    if (updates.unique_key !== undefined) {
      setClause.push(`unique_key = ?`);
      params.push(updates.unique_key);
    }
    if (updates.title !== undefined) {
      setClause.push(`title = ?`);
      params.push(updates.title);
    }
    if (updates.content !== undefined) {
      setClause.push(`content = ?`);
      params.push(updates.content);
    }
    if (updates.description !== undefined) {
      setClause.push(`description = ?`);
      params.push(updates.description);
    }
    if (updates.version !== undefined) {
      setClause.push(`version = ?`);
      params.push(updates.version);
    }
    if (updates.date !== undefined) {
      setClause.push(`date = ?`);
      params.push(updates.date);
    }
    if (updates.tags !== undefined) {
      setClause.push(`tags = ?`);
      params.push(JSON.stringify(updates.tags));
    }
    if (updates.screenshots !== undefined) {
      setClause.push(`screenshots = ?`);
      params.push(JSON.stringify(updates.screenshots));
    }
    if (updates.metrics !== undefined) {
      setClause.push(`metrics = ?`);
      params.push(JSON.stringify(updates.metrics));
    }

    if (setClause.length === 0) {
      return this.findById(id);
    }

    params.push(id);

    await executeQuery(
      `UPDATE update_logs SET ${setClause.join(', ')} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    return super.delete(id);
  }

  // Additional query methods
  async findRecentUpdates(limit: number = 5): Promise<UpdateLog[]> {
    const [rows] = await executeQuery(
      `SELECT * FROM update_logs WHERE is_published = TRUE ORDER BY date DESC LIMIT ?`,
      [limit]
    ) as [any[], any];

    return rows.map(this.mapUpdateLogRow.bind(this));
  }

  async findByDateRange(startDate: Date, endDate: Date, options: PaginationOptions = {}): Promise<PaginatedResult<UpdateLog>> {
    return this.getPaginatedResults(
      'SELECT * FROM update_logs WHERE date BETWEEN ? AND ?',
      'SELECT COUNT(*) FROM update_logs WHERE date BETWEEN ? AND ?',
      options,
      this.mapUpdateLogRow.bind(this),
      [startDate, endDate]
    );
  }

  async searchByTitle(searchTerm: string, options: PaginationOptions = {}): Promise<PaginatedResult<UpdateLog>> {
    const searchPattern = `%${searchTerm}%`;
    return this.getPaginatedResults(
      'SELECT * FROM update_logs WHERE title LIKE ? OR content LIKE ?',
      'SELECT COUNT(*) FROM update_logs WHERE title LIKE ? OR content LIKE ?',
      options,
      this.mapUpdateLogRow.bind(this),
      [searchPattern, searchPattern]
    );
  }

  async findByKey(key: string): Promise<UpdateLog> {
    return this.findByUniqueKey(key);
  }

  async healthCheck(): Promise<{ isHealthy: boolean; tableName: string; errors: string[] }> {
    const errors: string[] = [];

    try {
      await executeQuery('SELECT 1');
      await executeQuery('SELECT COUNT(*) FROM update_logs LIMIT 1');
    } catch (error) {
      const errorMsg = `UpdateLogModel health check failed: ${error instanceof Error ? error.message : error}`;
      errors.push(errorMsg);
    }

    return {
      isHealthy: errors.length === 0,
      tableName: 'update_logs',
      errors
    };
  }
}
