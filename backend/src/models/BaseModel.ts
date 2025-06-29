import mysql from 'mysql2/promise';
import pool, { executeQuery, executeTransaction } from '../config/database';
import logger from '../config/logger';
import { AppError, DatabaseError } from '../middleware/errorHandler';
import { QueryOptimizer } from '../services/QueryOptimizer';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface BaseEntity {
  id: number;
  [key: string]: any;
}

export interface NewBaseEntity {
  [key: string]: any;
}

export abstract class BaseModel<TEntity extends BaseEntity, TNewEntity extends NewBaseEntity> {
  protected pool: mysql.Pool;
  protected tableName: string;

  constructor(tableName: string) {
    this.pool = pool;
    this.tableName = tableName;
  }

  // Abstract methods that must be implemented by child classes
  protected abstract mapRow(row: any): TEntity;
  protected abstract getCreateFields(): (keyof TNewEntity)[];
  protected abstract getUpdateFields(): (keyof TNewEntity)[];

  // Enhanced helper method for transactions using the optimized database transaction handler
  protected async withTransaction<T>(
    callback: (connection: mysql.PoolConnection) => Promise<T>,
    options?: {
      timeout?: number;
      isolationLevel?: 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE';
      retryOnDeadlock?: boolean;
      maxRetries?: number;
    }
  ): Promise<T> {
    try {
      return await executeTransaction(callback, options);
    } catch (error: any) {
      // Convert to DatabaseError for better error handling
      throw new DatabaseError(
        `Transaction failed in ${this.tableName}`,
        error,
        { table: this.tableName, operation: 'transaction' }
      );
    }
  }

  // Optimized pagination query builder
  protected buildPaginationQuery(baseQuery: string, options: PaginationOptions): string {
    const { page = 1, limit = 10, sortBy, sortOrder = 'asc' } = options;
    const offset = (page - 1) * limit;

    let query = baseQuery;

    if (sortBy) {
      // Map sortBy parameter to actual column name
      const columnName = this.mapSortColumn(sortBy);
      if (columnName) {
        query += ` ORDER BY ${columnName} ${sortOrder.toUpperCase()}`;
      } else {
        query += ` ORDER BY id ${sortOrder.toUpperCase()}`;
      }
    } else {
      query += ` ORDER BY id ${sortOrder.toUpperCase()}`;
    }

    query += ` LIMIT ${limit} OFFSET ${offset}`;
    return query;
  }

  // Override this method in child classes to map sort parameters to actual column names
  protected mapSortColumn(sortBy: string): string | null {
    // Default implementation - validate and sanitize column name
    const safeColumnName = sortBy.replace(/[^a-zA-Z0-9_]/g, '');
    return safeColumnName;
  }

  // Generic paginated results with performance tracking
  protected async getPaginatedResults<T = TEntity>(
    baseQuery: string,
    countQuery: string,
    options: PaginationOptions,
    mapFunction?: (row: any) => T,
    params: any[] = []
  ): Promise<PaginatedResult<T>> {
    const { page = 1, limit = 10 } = options;
    const mapper = mapFunction || this.mapRow;

    try {
      const startTime = Date.now();

      // Execute both queries in parallel for better performance
      const [countResult, dataResult] = await Promise.all([
        executeQuery(countQuery, params) as Promise<[any[], any]>,
        executeQuery(this.buildPaginationQuery(baseQuery, options), params) as Promise<[any[], any]>
      ]);

      const [countRows] = countResult;
      const [dataRows] = dataResult;

      const total = countRows[0]['COUNT(*)'] || countRows[0].count || 0;
      const data = dataRows.map(mapper as (row: any) => T);

      const executionTime = Date.now() - startTime;

      // Log slow queries for optimization
      if (executionTime > 1000) {
        QueryOptimizer.logSlowQuery(baseQuery, params, executionTime);
      }

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error: any) {
      logger.error('Pagination query failed:', {
        error: error.message,
        table: this.tableName,
        options,
        baseQuery,
        countQuery
      });

      throw new DatabaseError(
        `Failed to fetch paginated results from ${this.tableName}`,
        error,
        { table: this.tableName, options, operation: 'pagination' }
      );
    }
  }

  // Enhanced CRUD operations with better error handling
  public async findById(id: string | number): Promise<TEntity> {
    try {
      // Validate ID
      if (id === null || id === undefined || id === '') {
        throw new AppError(`Invalid ID provided for ${this.tableName}`, 400);
      }

      const [rows] = await executeQuery(
        `SELECT * FROM ${this.tableName} WHERE id = ?`,
        [id]
      ) as [any[], any];

      if (rows.length === 0) {
        throw new AppError(`${this.tableName} with ID ${id} not found`, 404);
      }

      return this.mapRow(rows[0]);
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new DatabaseError(
        `Failed to find ${this.tableName} by ID`,
        error,
        { table: this.tableName, id, operation: 'findById' }
      );
    }
  }

  public async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<TEntity>> {
    return this.getPaginatedResults(
      `SELECT * FROM ${this.tableName}`,
      `SELECT COUNT(*) FROM ${this.tableName}`,
      options
    );
  }

  // Enhanced create with comprehensive error handling
  public async create(entity: TNewEntity): Promise<TEntity> {
    try {
      // Validate entity
      if (!entity || typeof entity !== 'object') {
        throw new AppError(`Invalid entity data for ${this.tableName}`, 400);
      }

      const fields = this.getCreateFields();
      const fieldNames = fields.map(f => String(f)).join(', ');
      const placeholders = fields.map(() => '?').join(', ');
      const values = fields.map(field => entity[field as keyof TNewEntity]);

      // Check for required fields
      const missingFields = fields.filter(field =>
        entity[field as keyof TNewEntity] === undefined ||
        entity[field as keyof TNewEntity] === null
      );

      if (missingFields.length > 0) {
        throw new AppError(
          `Missing required fields for ${this.tableName}: ${missingFields.join(', ')}`,
          400
        );
      }

      const [result] = await executeQuery(
        `INSERT INTO ${this.tableName} (${fieldNames}) VALUES (${placeholders})`,
        values
      ) as [any, any];

      logger.info(`Created new ${this.tableName}`, {
        id: result.insertId,
        affectedRows: result.affectedRows
      });

      return this.findById(result.insertId);
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new DatabaseError(
        `Failed to create ${this.tableName}`,
        error,
        { table: this.tableName, entity, operation: 'create' }
      );
    }
  }

  // Generic update with dynamic field mapping
  public async update(id: number, updates: Partial<TNewEntity>): Promise<TEntity> {
    const fields = this.getUpdateFields();
    const setClause: string[] = [];
    const params: any[] = [];

    // Build dynamic SET clause
    fields.forEach(field => {
      if (updates[field as keyof TNewEntity] !== undefined) {
        setClause.push(`${String(field)} = ?`);
        params.push(updates[field as keyof TNewEntity]);
      }
    });

    if (setClause.length === 0) {
      return this.findById(id);
    }

    params.push(id);

    await executeQuery(
      `UPDATE ${this.tableName} SET ${setClause.join(', ')} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  public async delete(id: string | number): Promise<void> {
    const [result] = await executeQuery(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]) as [any, any];
    if (result.affectedRows === 0) {
      throw new AppError(`${this.tableName} not found`, 404);
    }
  }

  public async exists(id: string | number): Promise<boolean> {
    const [rows] = await executeQuery(`SELECT 1 FROM ${this.tableName} WHERE id = ? LIMIT 1`, [id]) as [any[], any];
    return rows.length > 0;
  }

  // Optimized search method
  public async search(
    searchFields: string[],
    query: string,
    options: PaginationOptions = {},
    additionalWhere?: string
  ): Promise<PaginatedResult<TEntity>> {
    const { searchQuery, countQuery, params } = QueryOptimizer.buildOptimizedSearchQuery(
      this.tableName,
      searchFields,
      query,
      additionalWhere
    );

    return this.getPaginatedResults(searchQuery, countQuery, options, undefined, params);
  }

  // Batch operations for better performance
  public async batchCreate(records: TNewEntity[], batchSize: number = 100): Promise<void> {
    if (records.length === 0) return;

    const fields = this.getCreateFields();
    const fieldNames = fields.map(f => String(f)).join(', ');
    const placeholders = fields.map(() => '?').join(', ');

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const values = batch.map(() => `(${placeholders})`).join(', ');
      const query = `INSERT INTO ${this.tableName} (${fieldNames}) VALUES ${values}`;

      const params = batch.flatMap(record =>
        fields.map(field => record[field as keyof TNewEntity])
      );

      await executeQuery(query, params);
    }
  }

  // Health check for the model
  async healthCheck(): Promise<{ isHealthy: boolean; tableName: string; errors: string[] }> {
    const errors: string[] = [];
    let isHealthy = true;

    try {
      await executeQuery(`SELECT 1 FROM ${this.tableName} LIMIT 1`);
    } catch (error) {
      errors.push(`Table ${this.tableName} is not accessible: ${error}`);
      isHealthy = false;
    }

    return { isHealthy, tableName: this.tableName, errors };
  }

  // Utility methods
  protected buildPaginatedResult<T>(
    data: T[],
    total: number,
    options: PaginationOptions = {}
  ): PaginatedResult<T> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}