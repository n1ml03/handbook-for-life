import mysql from 'mysql2/promise';
import pool, { executeQuery } from '../config/database';
import logger from '../config/logger';
import { AppError } from '../middleware/errorHandler';
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

  // Helper method for transactions
  protected async withTransaction<T>(callback: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const result = await callback(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      logger.error('Transaction failed:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  // Optimized pagination query builder
  protected buildPaginationQuery(baseQuery: string, options: PaginationOptions): string {
    const { page = 1, limit = 10, sortBy, sortOrder = 'asc' } = options;
    const offset = (page - 1) * limit;

    let query = baseQuery;

    if (sortBy) {
      // Validate sortBy to prevent SQL injection
      const safeColumnName = sortBy.replace(/[^a-zA-Z0-9_]/g, '');
      query += ` ORDER BY ${safeColumnName} ${sortOrder.toUpperCase()}`;
    } else {
      query += ` ORDER BY id ${sortOrder.toUpperCase()}`;
    }

    query += ` LIMIT ${limit} OFFSET ${offset}`;
    return query;
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
    } catch (error) {
      logger.error('Pagination query failed:', error);
      throw new AppError('Failed to fetch paginated results', 500);
    }
  }

  // Generic CRUD operations with type safety
  public async findById(id: string | number): Promise<TEntity> {
    const [rows] = await executeQuery(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]) as [any[], any];
    if (rows.length === 0) {
      throw new AppError(`${this.tableName} not found`, 404);
    }
    return this.mapRow(rows[0]);
  }

  public async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<TEntity>> {
    return this.getPaginatedResults(
      `SELECT * FROM ${this.tableName}`,
      `SELECT COUNT(*) FROM ${this.tableName}`,
      options
    );
  }

  // Generic create with dynamic field mapping
  public async create(entity: TNewEntity): Promise<TEntity> {
    const fields = this.getCreateFields();
    const fieldNames = fields.map(f => String(f)).join(', ');
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map(field => entity[field as keyof TNewEntity]);

    try {
      const [result] = await executeQuery(
        `INSERT INTO ${this.tableName} (${fieldNames}) VALUES (${placeholders})`,
        values
      ) as [any, any];

      return this.findById(result.insertId);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError(`${this.tableName} with this key already exists`, 409);
      }
      throw new AppError(`Failed to create ${this.tableName}`, 500);
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