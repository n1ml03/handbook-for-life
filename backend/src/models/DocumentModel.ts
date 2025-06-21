import { BaseModel, PaginationOptions, PaginatedResult } from './BaseModel';
import { executeQuery } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export interface Document {
  id: number;
  unique_key: string;
  title_en: string;
  summary_en?: string;
  content_json_en?: any; // JSON from Tiptap
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface NewDocument {
  unique_key: string;
  title_en: string;
  summary_en?: string;
  content_json_en?: any;
  is_published?: boolean;
}

export interface UpdateDocument {
  unique_key?: string;
  title_en?: string;
  summary_en?: string;
  content_json_en?: any;
  is_published?: boolean;
}

export class DocumentModel extends BaseModel {
  constructor() {
    super('documents');
  }

  // Mapper function to convert database row to Document object
  private mapDocumentRow(row: any): Document {
    return {
      id: row.id,
      unique_key: row.unique_key,
      title_en: row.title_en,
      summary_en: row.summary_en,
      content_json_en: row.content_json_en,
      is_published: Boolean(row.is_published),
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  async create(document: NewDocument): Promise<Document> {
    try {
      const [result] = await executeQuery(
        `INSERT INTO documents (unique_key, title_en, summary_en, content_json_en, is_published)
         VALUES (?, ?, ?, ?, ?)`,
        [
          document.unique_key,
          document.title_en,
          document.summary_en,
          document.content_json_en ? JSON.stringify(document.content_json_en) : null,
          document.is_published ?? false,
        ]
      ) as [any, any];

      return this.findById(result.insertId);
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

  // Overload signatures
  async findById(id: number): Promise<Document>;
  async findById<T>(id: string | number, mapFunction: (row: any) => T): Promise<T>;
  
  // Implementation
  async findById<T = Document>(id: string | number, mapFunction?: (row: any) => T): Promise<T | Document> {
    if (mapFunction) {
      return super.findById<T>(id, mapFunction);
    }
    return super.findById<Document>(id as number, this.mapDocumentRow);
  }

  async findByKey(unique_key: string): Promise<Document> {
    const [rows] = await executeQuery('SELECT * FROM documents WHERE unique_key = ?', [unique_key]) as [any[], any];
    if (rows.length === 0) {
      throw new AppError('Document not found', 404);
    }
    return this.mapDocumentRow(rows[0]);
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

    if (setClause.length === 0) {
      return this.findById(id);
    }

    setClause.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    await executeQuery(
      `UPDATE documents SET ${setClause.join(', ')} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  async delete(id: string | number): Promise<void> {
    await this.deleteById(id);
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
  async togglePublishStatus(id: number): Promise<Document> {
    const document = await this.findById(id);
    const newStatus = !document.is_published;

    const query = `
      UPDATE documents 
      SET is_published = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;

    await executeQuery(query, [newStatus, id]);
    return this.findById(id);
  }
} 