import mysql from 'mysql2/promise';
import pool, { executeQuery } from '@config/database';
import logger from '@config/logger';
import { AppError } from '@middleware/errorHandler';
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

export abstract class BaseModel {
  protected pool: mysql.Pool;
  protected tableName: string;

  constructor(tableName: string) {
    this.pool = pool;
    this.tableName = tableName;
  }

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

  // Helper method for pagination (MySQL syntax)
  protected buildPaginationQuery(baseQuery: string, options: PaginationOptions): string {
    const { page = 1, limit = 10, sortBy, sortOrder = 'asc' } = options;
    const offset = (page - 1) * limit;

    let query = baseQuery;

    if (sortBy) {
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    }

    query += ` LIMIT ${limit} OFFSET ${offset}`;

    return query;
  }

  protected async getPaginatedResults<T>(
    baseQuery: string,
    countQuery: string,
    options: PaginationOptions,
    mapFunction: (row: any) => T,
    params: any[] = []
  ): Promise<PaginatedResult<T>> {
    const { page = 1, limit = 10 } = options;

    try {
      const startTime = Date.now();

      // Get total count
      const [countRows] = await executeQuery(countQuery, params) as [any[], any];
      const total = countRows[0]['COUNT(*)'] || countRows[0].count || 0;

      // Get paginated data
      const paginatedQuery = this.buildPaginationQuery(baseQuery, options);
      const [dataRows] = await executeQuery(paginatedQuery, params) as [any[], any];
      const data = dataRows.map(mapFunction);

      const executionTime = Date.now() - startTime;

      // Log slow queries for optimization
      if (executionTime > 1000) {
        QueryOptimizer.logSlowQuery(paginatedQuery, params, executionTime);
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

  // Generic CRUD operations
  public async findById<T>(id: string | number, mapFunction: (row: any) => T): Promise<T> {
    const [rows] = await executeQuery(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]) as [any[], any];
    if (rows.length === 0) {
      throw new AppError(`${this.tableName} not found`, 404);
    }
    return mapFunction(rows[0]);
  }

  protected async deleteById(id: string | number): Promise<void> {
    const [result] = await executeQuery(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]) as [any, any];
    if (result.affectedRows === 0) {
      throw new AppError(`${this.tableName} not found`, 404);
    }
  }

  protected async exists(id: string | number): Promise<boolean> {
    const [rows] = await executeQuery(`SELECT 1 FROM ${this.tableName} WHERE id = ? LIMIT 1`, [id]) as [any[], any];
    return rows.length > 0;
  }

  /**
   * Optimized search method using QueryOptimizer
   */
  protected async getOptimizedSearchResults<T>(
    searchFields: string[],
    query: string,
    options: PaginationOptions,
    mapFunction: (row: any) => T,
    additionalWhere?: string
  ): Promise<PaginatedResult<T>> {
    const { searchQuery, countQuery, params } = QueryOptimizer.buildOptimizedSearchQuery(
      this.tableName,
      searchFields,
      query,
      additionalWhere
    );

    return this.getPaginatedResults(searchQuery, countQuery, options, mapFunction, params);
  }

  /**
   * Optimized date range search
   */
  protected async getDateRangeResults<T>(
    dateField: string,
    startDate: Date | undefined,
    endDate: Date | undefined,
    options: PaginationOptions,
    mapFunction: (row: any) => T,
    additionalWhere?: string
  ): Promise<PaginatedResult<T>> {
    const { query, countQuery, params } = QueryOptimizer.buildDateRangeQuery(
      this.tableName,
      dateField,
      startDate,
      endDate,
      additionalWhere
    );

    return this.getPaginatedResults(query, countQuery, options, mapFunction, params);
  }

  /**
   * Batch operations for better performance
   */
  protected async batchInsert<T>(
    records: T[],
    fields: (keyof T)[],
    batchSize: number = 100
  ): Promise<void> {
    if (records.length === 0) return;

    const fieldNames = fields.map(f => String(f)).join(', ');
    const placeholders = fields.map(() => '?').join(', ');

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const values = batch.map(() => `(${placeholders})`).join(', ');
      const query = `INSERT INTO ${this.tableName} (${fieldNames}) VALUES ${values}`;

      const params = batch.flatMap(record =>
        fields.map(field => record[field])
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

  /**
   * Process and normalize pagination options
   */
  protected processPaginationOptions(options: PaginationOptions = {}): {
    offset: number;
    limit: number;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
  } {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const offset = (page - 1) * limit;
    const sortBy = options.sortBy || 'id';
    const sortOrder = (options.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC') as 'ASC' | 'DESC';

    return { offset, limit, sortBy, sortOrder };
  }

  /**
   * Build a paginated result object
   */
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