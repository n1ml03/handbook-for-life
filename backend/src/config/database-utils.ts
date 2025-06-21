import { RowDataPacket, ResultSetHeader, FieldPacket, QueryResult, OkPacket } from 'mysql2';
import { executeQuery } from './database';

// ============================================================================
// TYPED DATABASE QUERY UTILITIES
// ============================================================================

/**
 * Execute a SELECT query and return typed rows
 */
export async function selectQuery<T extends RowDataPacket>(
  query: string,
  params?: any[]
): Promise<T[]> {
  const [result] = await executeQuery(query, params);
  if (Array.isArray(result)) {
    return result as T[];
  }
  throw new Error('Query did not return row data');
}

/**
 * Execute an INSERT query and return the result
 */
export async function insertQuery(
  query: string,
  params?: any[]
): Promise<ResultSetHeader> {
  const [result] = await executeQuery(query, params);
  if ('insertId' in result || 'affectedRows' in result) {
    return result as ResultSetHeader;
  }
  throw new Error('Query did not return insert result');
}

/**
 * Execute an UPDATE query and return the result
 */
export async function updateQuery(
  query: string,
  params?: any[]
): Promise<ResultSetHeader> {
  const [result] = await executeQuery(query, params);
  if ('affectedRows' in result) {
    return result as ResultSetHeader;
  }
  throw new Error('Query did not return update result');
}

/**
 * Execute a DELETE query and return the result
 */
export async function deleteQuery(
  query: string,
  params?: any[]
): Promise<ResultSetHeader> {
  const [result] = await executeQuery(query, params);
  if ('affectedRows' in result) {
    return result as ResultSetHeader;
  }
  throw new Error('Query did not return delete result');
}

/**
 * Execute a COUNT query and return the count
 */
export async function countQuery(
  query: string,
  params?: any[]
): Promise<number> {
  const [result] = await executeQuery(query, params);
  if (Array.isArray(result)) {
    const rows = result as RowDataPacket[];
    return rows[0]?.count || rows[0]?.['COUNT(*)'] || 0;
  }
  throw new Error('COUNT query did not return row data');
}

/**
 * Execute a query that returns a single row
 */
export async function selectOne<T extends RowDataPacket>(
  query: string,
  params?: any[]
): Promise<T | null> {
  const [result] = await executeQuery(query, params);
  if (Array.isArray(result)) {
    const rows = result as T[];
    return rows[0] || null;
  }
  throw new Error('Query did not return row data');
}

/**
 * Check if a record exists
 */
export async function existsQuery(
  query: string,
  params?: any[]
): Promise<boolean> {
  const [result] = await executeQuery(query, params);
  if (Array.isArray(result)) {
    const rows = result as RowDataPacket[];
    return rows.length > 0;
  }
  throw new Error('EXISTS query did not return row data');
}

// ============================================================================
// COMMON QUERY PATTERNS
// ============================================================================

/**
 * Find a record by ID
 */
export async function findById<T extends RowDataPacket>(
  tableName: string,
  id: number
): Promise<T | null> {
  return selectOne<T>(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
}

/**
 * Find a record by unique key
 */
export async function findByUniqueKey<T extends RowDataPacket>(
  tableName: string,
  uniqueKey: string
): Promise<T | null> {
  return selectOne<T>(`SELECT * FROM ${tableName} WHERE unique_key = ?`, [uniqueKey]);
}

/**
 * Delete a record by ID
 */
export async function deleteById(
  tableName: string,
  id: number
): Promise<boolean> {
  const result = await deleteQuery(`DELETE FROM ${tableName} WHERE id = ?`, [id]);
  return result.affectedRows > 0;
}

/**
 * Check if a record exists by ID
 */
export async function existsById(
  tableName: string,
  id: number
): Promise<boolean> {
  return existsQuery(`SELECT 1 FROM ${tableName} WHERE id = ? LIMIT 1`, [id]);
}

/**
 * Get total count of records in a table
 */
export async function getTableCount(
  tableName: string,
  whereClause?: string,
  params?: any[]
): Promise<number> {
  const query = whereClause 
    ? `SELECT COUNT(*) as count FROM ${tableName} WHERE ${whereClause}`
    : `SELECT COUNT(*) as count FROM ${tableName}`;
  
  return countQuery(query, params);
}

// ============================================================================
// PAGINATION HELPERS
// ============================================================================

export interface PaginationParams {
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
 * Execute a paginated query
 */
export async function paginatedQuery<T extends RowDataPacket>(
  baseQuery: string,
  countQuery: string,
  params: any[],
  pagination: PaginationParams
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, pagination.page || 1);
  const limit = Math.min(100, Math.max(1, pagination.limit || 20));
  const offset = (page - 1) * limit;
  
  // Add sorting if specified
  let query = baseQuery;
  if (pagination.sortBy) {
    const sortOrder = pagination.sortOrder === 'DESC' ? 'DESC' : 'ASC';
    query += ` ORDER BY ${pagination.sortBy} ${sortOrder}`;
  }
  
  // Add pagination
  query += ` LIMIT ${limit} OFFSET ${offset}`;
  
  // Execute both queries in parallel
  const [data, total] = await Promise.all([
    selectQuery<T>(query, params),
    countQuery ? countQuery(countQuery, params) : 0
  ]);
  
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

/**
 * Bulk insert records
 */
export async function bulkInsert<T>(
  tableName: string,
  records: T[],
  fields: string[]
): Promise<ResultSetHeader> {
  if (records.length === 0) {
    throw new Error('No records to insert');
  }
  
  const placeholders = records.map(() => `(${fields.map(() => '?').join(', ')})`).join(', ');
  const query = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES ${placeholders}`;
  
  const params = records.flatMap(record => 
    fields.map(field => (record as any)[field])
  );
  
  return insertQuery(query, params);
}

/**
 * Upsert (INSERT ... ON DUPLICATE KEY UPDATE)
 */
export async function upsert<T>(
  tableName: string,
  record: T,
  fields: string[],
  updateFields?: string[]
): Promise<ResultSetHeader> {
  const insertFields = fields.join(', ');
  const placeholders = fields.map(() => '?').join(', ');
  const updatePart = updateFields || fields.filter(f => f !== 'id');
  const updateClause = updatePart.map(field => `${field} = VALUES(${field})`).join(', ');
  
  const query = `
    INSERT INTO ${tableName} (${insertFields}) 
    VALUES (${placeholders})
    ON DUPLICATE KEY UPDATE ${updateClause}
  `;
  
  const params = fields.map(field => (record as any)[field]);
  
  return insertQuery(query, params);
}

// ============================================================================
// SEARCH HELPERS
// ============================================================================

/**
 * Build a multi-language search query
 */
export function buildMultiLanguageSearch(
  searchTerm: string,
  languages: string[] = ['en', 'jp', 'cn', 'tw', 'kr'],
  fieldPrefix: string = 'name'
): { whereClause: string; params: string[] } {
  if (!searchTerm.trim()) {
    return { whereClause: '1=1', params: [] };
  }
  
  const searchPattern = `%${searchTerm.trim()}%`;
  const conditions = languages.map(lang => `${fieldPrefix}_${lang} LIKE ?`);
  const whereClause = `(${conditions.join(' OR ')})`;
  const params = new Array(languages.length).fill(searchPattern);
  
  return { whereClause, params };
}

/**
 * Build a date range filter
 */
export function buildDateRangeFilter(
  startDate?: Date,
  endDate?: Date,
  fieldName: string = 'created_at'
): { whereClause: string; params: any[] } {
  const conditions: string[] = [];
  const params: any[] = [];
  
  if (startDate) {
    conditions.push(`${fieldName} >= ?`);
    params.push(startDate);
  }
  
  if (endDate) {
    conditions.push(`${fieldName} <= ?`);
    params.push(endDate);
  }
  
  return {
    whereClause: conditions.length > 0 ? conditions.join(' AND ') : '1=1',
    params
  };
}

// ============================================================================
// HEALTH CHECK HELPERS
// ============================================================================

/**
 * Check table health
 */
export async function checkTableHealth(tableName: string): Promise<{
  exists: boolean;
  recordCount: number;
  lastModified?: Date;
}> {
  try {
    // Check if table exists
    const exists = await existsQuery(`
      SELECT 1 FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
    `, [tableName]);
    
    if (!exists) {
      return { exists: false, recordCount: 0 };
    }
    
    // Get record count
    const recordCount = await getTableCount(tableName);
    
    // Try to get last modified time (if table has updated_at column)
    let lastModified: Date | undefined;
    try {
      const result = await selectOne<RowDataPacket>(`
        SELECT updated_at FROM ${tableName} 
        ORDER BY updated_at DESC LIMIT 1
      `);
      lastModified = result?.updated_at;
    } catch {
      // Table might not have updated_at column
    }
    
    return { exists: true, recordCount, lastModified };
    
  } catch (error) {
    throw new Error(`Health check failed for table ${tableName}: ${error}`);
  }
} 