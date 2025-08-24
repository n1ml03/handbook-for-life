import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { executeQuery } from './database';
import logger from './logger';
import { AppError } from '../middleware/errorHandler';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PaginationParams {
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

export interface QueryOptions {
  timeout?: number;
  connection?: any;
}

// ============================================================================
// BASIC QUERY UTILITIES
// ============================================================================

export async function selectQuery<T extends RowDataPacket>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  try {
    const [rows] = await executeQuery(sql, params);
    return rows as T[];
  } catch (error) {
    logger.error('Select query failed', { sql, params, error: error instanceof Error ? error.message : error });
    throw new AppError('Database query failed', 500);
  }
}

export async function selectOne<T extends RowDataPacket>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const results = await selectQuery<T>(sql, params);
  return results.length > 0 ? results[0] : null;
}

export async function insertQuery(
  sql: string,
  params: any[] = []
): Promise<ResultSetHeader> {
  try {
    const [result] = await executeQuery(sql, params);
    return result as ResultSetHeader;
  } catch (error) {
    logger.error('Insert query failed', { sql, params, error: error instanceof Error ? error.message : error });
    throw new AppError('Database insert failed', 500);
  }
}

export async function updateQuery(
  sql: string,
  params: any[] = []
): Promise<ResultSetHeader> {
  try {
    const [result] = await executeQuery(sql, params);
    return result as ResultSetHeader;
  } catch (error) {
    logger.error('Update query failed', { sql, params, error: error instanceof Error ? error.message : error });
    throw new AppError('Database update failed', 500);
  }
}

export async function deleteQuery(
  sql: string,
  params: any[] = []
): Promise<ResultSetHeader> {
  try {
    const [result] = await executeQuery(sql, params);
    return result as ResultSetHeader;
  } catch (error) {
    logger.error('Delete query failed', { sql, params, error: error instanceof Error ? error.message : error });
    throw new AppError('Database delete failed', 500);
  }
}

export async function countQuery(
  table: string,
  whereClause: string = '',
  params: any[] = []
): Promise<number> {
  const sql = `SELECT COUNT(*) as count FROM ${table} ${whereClause}`;
  const result = await selectOne<RowDataPacket & { count: number }>(sql, params);
  return result?.count || 0;
}

// ============================================================================
// ADVANCED QUERY UTILITIES
// ============================================================================

export async function existsQuery(
  table: string,
  whereClause: string,
  params: any[] = []
): Promise<boolean> {
  const sql = `SELECT 1 FROM ${table} WHERE ${whereClause} LIMIT 1`;
  const result = await selectOne(sql, params);
  return result !== null;
}

export async function findById<T extends RowDataPacket>(
  table: string,
  id: string | number,
  columns: string = '*'
): Promise<T | null> {
  const sql = `SELECT ${columns} FROM ${table} WHERE id = ? LIMIT 1`;
  return await selectOne<T>(sql, [id]);
}

export async function findByUniqueKey<T extends RowDataPacket>(
  table: string,
  uniqueKey: string,
  keyColumn: string = 'unique_key',
  columns: string = '*'
): Promise<T | null> {
  const sql = `SELECT ${columns} FROM ${table} WHERE ${keyColumn} = ? LIMIT 1`;
  return await selectOne<T>(sql, [uniqueKey]);
}

export async function deleteById(
  table: string,
  id: string | number
): Promise<boolean> {
  const result = await deleteQuery(`DELETE FROM ${table} WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

export async function existsById(
  table: string,
  id: string | number
): Promise<boolean> {
  return await existsQuery(table, 'id = ?', [id]);
}

// ============================================================================
// PAGINATION UTILITIES
// ============================================================================

export async function paginatedQuery<T extends RowDataPacket>(
  baseQuery: string,
  countQuery: string,
  params: any[] = [],
  pagination: PaginationParams = {}
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, pagination.page || 1);
  const limit = Math.min(100, Math.max(1, pagination.limit || 10));
  const offset = (page - 1) * limit;

  // Build ORDER BY clause if sorting is specified
  let orderByClause = '';
  if (pagination.sortBy) {
    const sortOrder = pagination.sortOrder === 'desc' ? 'DESC' : 'ASC';
    orderByClause = ` ORDER BY ${pagination.sortBy} ${sortOrder}`;
  }

  // Execute count query to get total records
  const [totalResult] = await selectQuery<RowDataPacket & { total: number }>(countQuery, params);
  const total = totalResult?.total || 0;

  // Execute main query with pagination
  const paginatedSql = `${baseQuery}${orderByClause} LIMIT ${limit} OFFSET ${offset}`;
  const data = await selectQuery<T>(paginatedSql, params);

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

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export async function bulkInsert(
  table: string,
  columns: string[],
  values: any[][]
): Promise<ResultSetHeader> {
  if (values.length === 0) {
    throw new AppError('No values provided for bulk insert', 400);
  }

  const placeholders = values.map(() => `(${columns.map(() => '?').join(', ')})`).join(', ');
  const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders}`;
  const params = values.flat();

  return await insertQuery(sql, params);
}

export async function upsert(
  table: string,
  data: Record<string, any>,
  uniqueColumns: string[] = ['id']
): Promise<ResultSetHeader> {
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = columns.map(() => '?').join(', ');
  
  const updateClause = columns
    .filter(col => !uniqueColumns.includes(col))
    .map(col => `${col} = VALUES(${col})`)
    .join(', ');

  const sql = `
    INSERT INTO ${table} (${columns.join(', ')}) 
    VALUES (${placeholders})
    ON DUPLICATE KEY UPDATE ${updateClause}
  `;

  return await insertQuery(sql, values);
}

// ============================================================================
// SEARCH UTILITIES
// ============================================================================

export function buildMultiLanguageSearch(
  columns: string[],
  searchTerm: string,
  tableAlias: string = ''
): { whereClause: string; params: any[] } {
  if (!searchTerm?.trim()) {
    return { whereClause: '', params: [] };
  }

  const prefix = tableAlias ? `${tableAlias}.` : '';
  const conditions = columns.map(column => `${prefix}${column} LIKE ?`);
  const whereClause = `(${conditions.join(' OR ')})`;
  const params = columns.map(() => `%${searchTerm.trim()}%`);

  return { whereClause, params };
}

export function buildDateRangeFilter(
  dateColumn: string,
  startDate?: string | Date,
  endDate?: string | Date,
  tableAlias: string = ''
): { whereClause: string; params: any[] } {
  const conditions: string[] = [];
  const params: any[] = [];
  const prefix = tableAlias ? `${tableAlias}.` : '';

  if (startDate) {
    conditions.push(`${prefix}${dateColumn} >= ?`);
    params.push(startDate);
  }

  if (endDate) {
    conditions.push(`${prefix}${dateColumn} <= ?`);
    params.push(endDate);
  }

  return {
    whereClause: conditions.length > 0 ? conditions.join(' AND ') : '',
    params
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export async function getTableCount(table: string): Promise<number> {
  return await countQuery(table, '', []);
}

export async function checkTableHealth(table: string): Promise<{
  exists: boolean;
  rowCount: number;
  error?: string;
}> {
  try {
    // Check if table exists
    const tableExists = await selectOne(`
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = DATABASE() AND table_name = ?
    `, [table]);

    if (!tableExists) {
      return { exists: false, rowCount: 0, error: 'Table does not exist' };
    }

    // Get row count
    const rowCount = await getTableCount(table);

    return { exists: true, rowCount };
  } catch (error) {
    return {
      exists: false,
      rowCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 