import { BaseModel, PaginationOptions, PaginatedResult } from './BaseModel';
import { Document, NewDocument } from '../types/database';
import { executeQuery } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { QueryOptimizer } from '../services/QueryOptimizer';

export interface UpdateDocument {
  unique_key?: string;
  title_en?: string;
  summary_en?: string;
  content_json_en?: any;
  is_published?: boolean;
  screenshots?: string[];
}

// Extended Document type that matches frontend expectations
export interface ExtendedDocument extends Document {
  title: string; // Maps to title_en
  content: string; // Maps to content_json_en converted to HTML
  category: string; // Generated category
  tags: string[]; // Generated tags
  author: string; // Default author
  isPublished: boolean; // Maps to is_published
  createdAt: string; // Maps to created_at
  updatedAt: string; // Maps to updated_at
}

export class DocumentModel extends BaseModel<ExtendedDocument, NewDocument> {
  constructor() {
    super('documents');
  }

  // Implementation of abstract methods
  protected mapRow(row: any): ExtendedDocument {
    return this.mapDocumentRow(row);
  }

  protected getCreateFields(): (keyof NewDocument)[] {
    return [
      'unique_key',
      'title_en',
      'summary_en',
      'content_json_en',
      'is_published',
      'screenshots'
    ];
  }

  protected getUpdateFields(): (keyof NewDocument)[] {
    return this.getCreateFields(); // Same fields can be updated
  }

  // Enhanced mapper function to convert database row to Extended Document object
  private mapDocumentRow = (row: any): ExtendedDocument => {
    // Convert TipTap JSON to HTML for content field
    const content = this.convertTipTapToHtml(row.content_json_en);
    
    // Generate category based on unique_key or content analysis
    const category = this.generateCategory(row.unique_key, content);
    
    // Generate tags from category and content
    const tags = this.generateTags(category, content);

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
      // Extended fields for frontend compatibility
      title: row.title_en,
      content,
      category,
      tags,
      author: 'System Admin', // Default author
      isPublished: Boolean(row.is_published),
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  };

  // Helper method to convert TipTap JSON to HTML
  private convertTipTapToHtml(jsonContent: any): string {
    if (!jsonContent) return '';
    
    try {
      const parsed = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
      // Simple conversion - in production, use a proper TipTap to HTML converter
      if (parsed?.content) {
        return this.extractTextFromTipTap(parsed.content);
      }
      return '';
    } catch (error) {
      return '';
    }
  }

  // Extract text content from TipTap structure with better HTML generation
  private extractTextFromTipTap(content: any[]): string {
    if (!Array.isArray(content)) return '';
    
    return content.map(node => {
      if (node.type === 'paragraph' && node.content) {
        const text = node.content.map((textNode: any) => textNode.text || '').join('');
        return `<p>${text}</p>`;
      }
      if (node.type === 'heading' && node.content) {
        const text = node.content.map((textNode: any) => textNode.text || '').join('');
        const level = node.attrs?.level || 1;
        return `<h${level}>${text}</h${level}>`;
      }
      if (node.type === 'bulletList' && node.content) {
        const items = this.extractTextFromTipTap(node.content);
        return `<ul>${items}</ul>`;
      }
      if (node.type === 'listItem' && node.content) {
        const text = this.extractTextFromTipTap(node.content);
        return `<li>${text}</li>`;
      }
      if (node.content) {
        return this.extractTextFromTipTap(node.content);
      }
      return '';
    }).join('\n');
  }

  // Enhanced category generation with more sophisticated logic
  private generateCategory(uniqueKey: string, content: string): string {
    const key = uniqueKey.toLowerCase();
    
    if (key.includes('guide')) return 'Guide';
    if (key.includes('tutorial')) return 'Tutorial';
    if (key.includes('changelog') || key.includes('update')) return 'Changelog';
    if (key.includes('faq') || key.includes('help')) return 'FAQ';
    if (key.includes('news') || key.includes('announcement')) return 'News';
    if (key.includes('feature')) return 'Feature';
    if (key.includes('api') || key.includes('technical')) return 'Technical';
    
    // Analyze content for category hints
    const contentLower = content.toLowerCase();
    if (contentLower.includes('how to') || contentLower.includes('step by step')) return 'Guide';
    if (contentLower.includes('frequently asked') || contentLower.includes('common question')) return 'FAQ';
    if (contentLower.includes('new feature') || contentLower.includes('release note')) return 'Changelog';
    if (contentLower.includes('troubleshoot') || contentLower.includes('problem')) return 'Troubleshooting';
    
    return 'General';
  }

  // Enhanced tag generation with more comprehensive keyword detection
  private generateTags(category: string, content: string): string[] {
    const tags = [category.toLowerCase()];
    
    // Add common tags based on content keywords
    const contentLower = content.toLowerCase();
    const gameKeywords = ['character', 'swimsuit', 'skill', 'event', 'gacha', 'item', 'bromide', 'episode'];
    const actionKeywords = ['guide', 'tutorial', 'tips', 'tricks', 'strategy'];
    const featureKeywords = ['ui', 'interface', 'database', 'api', 'search', 'filter'];
    
    [...gameKeywords, ...actionKeywords, ...featureKeywords].forEach(keyword => {
      if (contentLower.includes(keyword)) {
        tags.push(keyword);
      }
    });
    
    // Add version tags if mentioned
    const versionMatch = contentLower.match(/version\s+(\d+\.?\d*)/);
    if (versionMatch) {
      tags.push(`v${versionMatch[1]}`);
    }
    
    return [...new Set(tags)]; // Remove duplicates
  }

  async create(document: NewDocument): Promise<ExtendedDocument> {
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

      return this.findById(result.insertId);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError('Document with this unique_key already exists', 409);
      }
      throw new AppError('Failed to create document', 500);
    }
  }

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<ExtendedDocument>> {
    return this.getPaginatedResults(
      'SELECT * FROM documents',
      'SELECT COUNT(*) FROM documents',
      options,
      this.mapDocumentRow
    );
  }

  async findById(id: number): Promise<ExtendedDocument>;
  async findById<T>(id: string | number, mapFunction: (row: any) => T): Promise<T>;
  
  async findById<T = ExtendedDocument>(id: string | number, mapFunction?: (row: any) => T): Promise<T | ExtendedDocument> {
    if (mapFunction) {
      return super.findById(id) as Promise<T>;
    }
    return super.findById(id as number);
  }

  async findByUniqueKey(unique_key: string): Promise<ExtendedDocument> {
    const [rows] = await executeQuery('SELECT * FROM documents WHERE unique_key = ?', [unique_key]) as [any[], any];
    if (rows.length === 0) {
      throw new AppError('Document not found', 404);
    }
    return this.mapDocumentRow(rows[0]);
  }

  async findByKey(key: string): Promise<ExtendedDocument> {
    return this.findByUniqueKey(key);
  }

  async update(id: number, updates: Partial<NewDocument>): Promise<ExtendedDocument> {
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
      throw new AppError('No updates provided', 400);
    }

    // Add timestamp update
    setClause.push(`updated_at = NOW()`);
    params.push(id);

    try {
      await executeQuery(
        `UPDATE documents SET ${setClause.join(', ')} WHERE id = ?`,
        params
      );

      return this.findById(id);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError('Document with this unique_key already exists', 409);
      }
      throw new AppError('Failed to update document', 500);
    }
  }

  async delete(id: number): Promise<void> {
    const [result] = await executeQuery('DELETE FROM documents WHERE id = ?', [id]) as [any, any];
    if (result.affectedRows === 0) {
      throw new AppError('Document not found', 404);
    }
  }

  async findPublished(options: PaginationOptions = {}): Promise<PaginatedResult<ExtendedDocument>> {
    return this.getPaginatedResults(
      'SELECT * FROM documents WHERE is_published = TRUE',
      'SELECT COUNT(*) FROM documents WHERE is_published = TRUE',
      options,
      this.mapDocumentRow
    );
  }

  /**
   * Override search method to match BaseModel signature
   */
  async search(
    searchFields: string[],
    query: string,
    options: PaginationOptions = {},
    additionalWhere?: string
  ): Promise<PaginatedResult<ExtendedDocument>> {
    return super.search(searchFields, query, options, additionalWhere);
  }

  /**
   * Convenience search method for documents
   */
  async searchDocuments(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<ExtendedDocument>> {
    const searchFields = ['title_en', 'summary_en', 'unique_key'];
    return this.search(searchFields, query, options);
  }

  async togglePublishStatus(id: number): Promise<ExtendedDocument> {
    await executeQuery(
      'UPDATE documents SET is_published = NOT is_published, updated_at = NOW() WHERE id = ?',
      [id]
    );
    return this.findById(id);
  }

  /**
   * Enhanced findByCategory with better search logic and performance
   */
  async findByCategory(category: string, options: PaginationOptions = {}): Promise<PaginatedResult<ExtendedDocument>> {
    // Use optimized query that searches in multiple fields
    const searchPattern = `%${category.toLowerCase()}%`;
    return this.getPaginatedResults(
      `SELECT * FROM documents WHERE 
       LOWER(unique_key) LIKE ? OR 
       LOWER(title_en) LIKE ? OR 
       LOWER(summary_en) LIKE ?`,
      `SELECT COUNT(*) FROM documents WHERE 
       LOWER(unique_key) LIKE ? OR 
       LOWER(title_en) LIKE ? OR 
       LOWER(summary_en) LIKE ?`,
      options,
      this.mapDocumentRow,
      [searchPattern, searchPattern, searchPattern]
    );
  }

  /**
   * Get document statistics for analytics
   */
  async getDocumentStats(): Promise<{
    total: number;
    published: number;
    unpublished: number;
    byCategory: Record<string, number>;
    lastUpdated: string;
  }> {
    const [totalRows] = await executeQuery('SELECT COUNT(*) as count FROM documents') as [any[], any];
    const [publishedRows] = await executeQuery('SELECT COUNT(*) as count FROM documents WHERE is_published = TRUE') as [any[], any];
    const [lastUpdatedRows] = await executeQuery('SELECT MAX(updated_at) as last_updated FROM documents') as [any[], any];
    
    const total = totalRows[0].count;
    const published = publishedRows[0].count;
    const unpublished = total - published;
    
    // Generate category statistics from all documents
    const [allDocs] = await executeQuery('SELECT unique_key, title_en, summary_en, content_json_en FROM documents') as [any[], any];
    const byCategory: Record<string, number> = {};
    
    allDocs.forEach((doc: any) => {
      const content = this.convertTipTapToHtml(doc.content_json_en);
      const category = this.generateCategory(doc.unique_key, content);
      byCategory[category] = (byCategory[category] || 0) + 1;
    });
    
    return {
      total,
      published,
      unpublished,
      byCategory,
      lastUpdated: lastUpdatedRows[0].last_updated ? new Date(lastUpdatedRows[0].last_updated).toISOString() : new Date().toISOString()
    };
  }

  async healthCheck(): Promise<{ isHealthy: boolean; tableName: string; errors: string[] }> {
    const errors: string[] = [];
    let isHealthy = true;

    try {
      // Test basic connectivity
      await executeQuery('SELECT 1 FROM documents LIMIT 1');
      
      // Test performance
      const startTime = Date.now();
      await executeQuery('SELECT COUNT(*) FROM documents');
      const queryTime = Date.now() - startTime;
      
      if (queryTime > 1000) {
        errors.push(`Slow query performance: ${queryTime}ms`);
      }
      
    } catch (error) {
      errors.push(`Database error: ${error}`);
      isHealthy = false;
    }

    return {
      isHealthy,
      tableName: this.tableName,
      errors,
    };
  }
} 