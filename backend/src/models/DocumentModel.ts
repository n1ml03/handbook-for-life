import { PaginationOptions, PaginatedResult } from './BaseModel';
import { Document, NewDocument } from '../types/database';
import { executeQuery } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export interface UpdateDocument {
  unique_key?: string;
  title_en?: string;
  summary_en?: string;
  content_json_en?: any;
  is_published?: boolean;
}

export class DocumentModel {
  protected tableName = 'documents';

  // Mapper function to convert database row to Document object
  private mapDocumentRow(row: any): Document {
    return {
      id: row.id,
      unique_key: row.unique_key,
      title_en: row.title_en,
      summary_en: row.summary_en,
      content_json_en: row.content_json_en,
      is_published: Boolean(row.is_published),
      screenshots: row.screenshots ? JSON.parse(row.screenshots) : [],
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  // Helper method for pagination
  protected async getPaginatedResults<T>(
    query: string,
    countQuery: string,
    options: PaginationOptions,
    mapFunction: (row: any) => T,
    params: any[] = []
  ): Promise<PaginatedResult<T>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const offset = (page - 1) * limit;

    // Execute count and data queries in parallel
    const [countResult, dataResult] = await Promise.all([
      executeQuery(countQuery, params) as Promise<[any[], any]>,
      executeQuery(`${query} LIMIT ${limit} OFFSET ${offset}`, params) as Promise<[any[], any]>
    ]);

    const total = countResult[0][0]?.['COUNT(*)'] || 0;
    const data = dataResult[0].map(mapFunction);
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

  async create(document: NewDocument): Promise<Document> {
    try {
      const [result] = await executeQuery(
        `INSERT INTO documents (unique_key, title_en, summary_en, content_json_en, is_published, screenshots)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          document.unique_key,
          document.title_en,
          document.summary_en,
          document.content_json_en ? JSON.stringify(document.content_json_en) : null,
          document.is_published ?? false,
          document.screenshots ? JSON.stringify(document.screenshots) : null,
        ]
      ) as [any, any];

      const documentId = result.insertId;
      return this.findById(documentId);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError('Document with this unique_key already exists', 409);
      }
      throw new AppError('Failed to create document', 500);
    }
  }

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<Document>> {
    return this.getPaginatedResults(
      'SELECT * FROM documents',
      'SELECT COUNT(*) FROM documents',
      options,
      this.mapDocumentRow
    );
  }

  // Public method for finding by ID
  async findById(id: string | number): Promise<Document> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numericId)) {
      throw new AppError('Invalid document ID', 400);
    }
    
    const [rows] = await executeQuery('SELECT * FROM documents WHERE id = ?', [numericId]) as [any[], any];
    if (rows.length === 0) {
      throw new AppError('Document not found', 404);
    }
    return this.mapDocumentRow(rows[0]);
  }

  async findByUniqueKey(unique_key: string): Promise<Document> {
    const [rows] = await executeQuery('SELECT * FROM documents WHERE unique_key = ?', [unique_key]) as [any[], any];
    if (rows.length === 0) {
      throw new AppError('Document not found', 404);
    }
    return this.mapDocumentRow(rows[0]);
  }

  async findByKey(key: string): Promise<Document> {
    return this.findByUniqueKey(key);
  }

  async update(id: string | number, updates: Partial<NewDocument>): Promise<Document> {
    const setClause: string[] = [];
    const params: any[] = [];

    if (updates.unique_key !== undefined) {
      setClause.push(`unique_key = ?`);
      params.push(updates.unique_key);
    }
    if (updates.title_en !== undefined) {
      setClause.push(`title_en = ?`);
      params.push(updates.title_en);
    }
    if (updates.summary_en !== undefined) {
      setClause.push(`summary_en = ?`);
      params.push(updates.summary_en);
    }
    if (updates.content_json_en !== undefined) {
      setClause.push(`content_json_en = ?`);
      params.push(updates.content_json_en ? JSON.stringify(updates.content_json_en) : null);
    }
    if (updates.is_published !== undefined) {
      setClause.push(`is_published = ?`);
      params.push(updates.is_published);
    }
    if (updates.screenshots !== undefined) {
      setClause.push(`screenshots = ?`);
      params.push(updates.screenshots ? JSON.stringify(updates.screenshots) : null);
    }

    if (setClause.length === 0) {
      return this.findById(id);
    }

    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(typeof id === 'string' ? parseInt(id, 10) : id);

    await executeQuery(
      `UPDATE documents SET ${setClause.join(', ')} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  async delete(id: string | number): Promise<void> {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numericId)) {
      throw new AppError('Invalid document ID', 400);
    }
    
    const [result] = await executeQuery('DELETE FROM documents WHERE id = ?', [numericId]) as [any, any];
    if (result.affectedRows === 0) {
      throw new AppError('Document not found', 404);
    }
  }

  /**
   * Find only published documents
   */
  async findPublished(options: PaginationOptions = {}): Promise<PaginatedResult<Document>> {
    return this.getPaginatedResults(
      'SELECT * FROM documents WHERE is_published = true',
      'SELECT COUNT(*) FROM documents WHERE is_published = true',
      options,
      this.mapDocumentRow
    );
  }

  /**
   * Search documents by title or summary
   */
  async search(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Document>> {
    const searchPattern = `%${query}%`;
    return this.getPaginatedResults(
      `SELECT * FROM documents WHERE 
       (title_en LIKE ? OR summary_en LIKE ?)`,
      `SELECT COUNT(*) FROM documents WHERE 
       (title_en LIKE ? OR summary_en LIKE ?)`,
      options,
      this.mapDocumentRow,
      [searchPattern, searchPattern]
    );
  }

  /**
   * Toggle publish status
   */
  async togglePublishStatus(id: string | number): Promise<Document> {
    const document = await this.findById(id);
    const newStatus = !document.is_published;
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

    const query = `
      UPDATE documents 
      SET is_published = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;

    await executeQuery(query, [newStatus, numericId]);
    return this.findById(id);
  }

  async healthCheck(): Promise<{ isHealthy: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      await executeQuery('SELECT 1');
      await executeQuery('SELECT COUNT(*) FROM documents LIMIT 1');
    } catch (error) {
      const errorMsg = `DocumentModel health check failed: ${error instanceof Error ? error.message : error}`;
      errors.push(errorMsg);
    }

    return {
      isHealthy: errors.length === 0,
      errors
    };
  }
} 