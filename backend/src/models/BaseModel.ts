import { executeQuery } from '../config/database';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
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

/**
 * Simplified BaseModel - provides basic CRUD operations
 * Each model extends this and implements its own mapRow method
 * T = Entity type (e.g., Character)
 * N = New entity type for creation (e.g., NewCharacter), defaults to Partial<T>
 */
export abstract class BaseModel<T, N = Partial<T>> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Map a database row to the entity type
   * Must be implemented by each model
   */
  protected abstract mapRow(row: RowDataPacket): T;

  /**
   * Get list of valid sortable columns for this model
   * Override in child classes to provide specific columns
   * Defaults to just 'id'
   */
  protected getValidSortColumns(): string[] {
    return ['id'];
  }

  /**
   * Validate and sanitize sortBy parameter
   * Returns 'id' if the column is invalid
   */
  protected validateSortBy(sortBy?: string): string {
    if (!sortBy) return 'id';

    // Sanitize the input
    const sanitized = sortBy.replace(/[^a-zA-Z0-9_]/g, '');

    // Check if it's in the valid columns list
    const validColumns = this.getValidSortColumns();
    if (validColumns.includes(sanitized)) {
      return sanitized;
    }

    // Default to 'id' if invalid
    return 'id';
  }

  /**
   * Find all records with optional pagination
   */
  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<T>> {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const offset = (page - 1) * limit;

    // Validate and sanitize sortBy
    const sortBy = this.validateSortBy(options.sortBy);
    const sortOrder = (options.sortOrder === 'DESC') ? 'DESC' : 'ASC';

    // Get total count
    const [countResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM ${this.tableName}`
    );
    const total = (countResult as RowDataPacket[])[0].total;

    // Get paginated data - use direct values for LIMIT/OFFSET
    const [rows] = await executeQuery(
      `SELECT * FROM ${this.tableName} ORDER BY ${sortBy} ${sortOrder} LIMIT ${limit} OFFSET ${offset}`
    );

    const data = (rows as RowDataPacket[]).map(row => this.mapRow(row));
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Find a record by ID
   */
  async findById(id: number): Promise<T> {
    const [rows] = await executeQuery(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );

    const results = rows as RowDataPacket[];
    if (results.length === 0) {
      throw new Error(`${this.tableName} with id ${id} not found`);
    }

    return this.mapRow(results[0]);
  }

  /**
   * Find a record by unique key
   */
  async findByKey(key: string): Promise<T> {
    const [rows] = await executeQuery(
      `SELECT * FROM ${this.tableName} WHERE unique_key = ?`,
      [key]
    );

    const results = rows as RowDataPacket[];
    if (results.length === 0) {
      throw new Error(`${this.tableName} with key ${key} not found`);
    }

    return this.mapRow(results[0]);
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>): Promise<T> {
    const fields = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    const [result] = await executeQuery(
      `INSERT INTO ${this.tableName} (${fields}) VALUES (${placeholders})`,
      values
    );

    const insertId = (result as ResultSetHeader).insertId;
    return this.findById(insertId);
  }

  /**
   * Update a record by ID
   */
  async update(id: number, data: Partial<T>): Promise<T> {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];

    await executeQuery(
      `UPDATE ${this.tableName} SET ${fields} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  /**
   * Delete a record by ID
   */
  async delete(id: number): Promise<void> {
    const [result] = await executeQuery(
      `DELETE FROM ${this.tableName} WHERE id = ?`,
      [id]
    );

    const affectedRows = (result as ResultSetHeader).affectedRows;
    if (affectedRows === 0) {
      throw new Error(`${this.tableName} with id ${id} not found`);
    }
  }

  /**
   * Check if a record exists by ID
   */
  async exists(id: number): Promise<boolean> {
    const [rows] = await executeQuery(
      `SELECT 1 FROM ${this.tableName} WHERE id = ? LIMIT 1`,
      [id]
    );

    return (rows as RowDataPacket[]).length > 0;
  }

  /**
   * Check if a record exists by unique key
   */
  async existsByKey(key: string): Promise<boolean> {
    const [rows] = await executeQuery(
      `SELECT 1 FROM ${this.tableName} WHERE unique_key = ? LIMIT 1`,
      [key]
    );

    return (rows as RowDataPacket[]).length > 0;
  }

  /**
   * Get total count of records
   */
  async count(): Promise<number> {
    const [rows] = await executeQuery(
      `SELECT COUNT(*) as total FROM ${this.tableName}`
    );

    return (rows as RowDataPacket[])[0].total;
  }

  /**
   * Helper method to build paginated results
   * Used by child models for custom queries
   */
  protected buildPaginatedResult(
    data: T[],
    total: number,
    options: PaginationOptions
  ): PaginatedResult<T> {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Helper method to execute paginated query
   * Used by child models for custom queries
   */
  protected async getPaginatedResults(
    query: string,
    countQuery: string,
    options: PaginationOptions = {},
    mapFunction?: (row: RowDataPacket) => T,
    params: any[] = []
  ): Promise<PaginatedResult<T>> {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const offset = (page - 1) * limit;

    // Validate and sanitize sortBy
    const sortBy = this.validateSortBy(options.sortBy);
    const sortOrder = (options.sortOrder === 'DESC') ? 'DESC' : 'ASC';

    // Build query with pagination - use direct values for LIMIT/OFFSET as some MySQL versions
    // don't support placeholders in LIMIT clause
    const paginatedQuery = `${query} ORDER BY ${sortBy} ${sortOrder} LIMIT ${limit} OFFSET ${offset}`;

    // Get total count
    const [countResult] = await executeQuery(countQuery, params);
    const total = (countResult as RowDataPacket[])[0].total;

    // Get paginated data - use same params as count query
    const [rows] = await executeQuery(paginatedQuery, params);
    const mapper = mapFunction || this.mapRow.bind(this);
    const data = (rows as RowDataPacket[]).map(row => mapper(row));

    return this.buildPaginatedResult(data, total, options);
  }

  /**
   * Search across multiple fields
   */
  async search(
    fields: string[],
    searchTerm: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<T>> {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const offset = (page - 1) * limit;

    // Validate and sanitize sortBy
    const sortBy = this.validateSortBy(options.sortBy);
    const sortOrder = (options.sortOrder === 'DESC') ? 'DESC' : 'ASC';

    const searchPattern = `%${searchTerm}%`;
    const whereConditions = fields.map(field => `${field} LIKE ?`).join(' OR ');
    const searchParams = fields.map(() => searchPattern);

    // Get total count
    const [countResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM ${this.tableName} WHERE ${whereConditions}`,
      searchParams
    );
    const total = (countResult as RowDataPacket[])[0].total;

    // Get paginated data - use direct values for LIMIT/OFFSET
    const [rows] = await executeQuery(
      `SELECT * FROM ${this.tableName} WHERE ${whereConditions} ORDER BY ${sortBy} ${sortOrder} LIMIT ${limit} OFFSET ${offset}`,
      searchParams
    );

    const data = (rows as RowDataPacket[]).map(row => this.mapRow(row));
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }
}

