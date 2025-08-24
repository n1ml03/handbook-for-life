import { BaseService } from './BaseService';
import { DocumentModel, ExtendedDocument } from '../models/DocumentModel';
import { NewDocument } from '../types/database';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';
import { AppError } from '../middleware/errorHandler';

/**
 * Optimized Document service using enhanced BaseService functionality
 */
export class DocumentService extends BaseService<DocumentModel, ExtendedDocument, NewDocument> {
  constructor() {
    super(new DocumentModel(), 'DocumentService');
  }

  /**
   * Get all documents with performance tracking
   */
  async getDocuments(options: PaginationOptions = {}): Promise<PaginatedResult<ExtendedDocument>> {
    return this.trackPerformance('getDocuments', async () => {
      this.logOperationStart('Get documents', undefined, { options });
      
      const validatedOptions = this.validatePaginationOptions(options);
      const result = await this.model.findAll(validatedOptions);
      
      this.logOperationSuccess('Get documents', undefined, { 
        count: result.data.length,
        total: result.pagination.total 
      });
      
      return this.formatPaginatedDatesForResponse(result);
    });
  }



  /**
   * Get documents by category with validation
   */
  async getDocumentsByCategory(
    category: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<ExtendedDocument>> {
    return this.trackPerformance('getDocumentsByCategory', async () => {
      // Validate category
      this.validateString(category, 'Category', {
        required: true,
        minLength: 1,
        maxLength: 50
      });

      this.logOperationStart('Get documents by category', category, { options });

      const validatedOptions = this.validatePaginationOptions(options);
      const result = await this.model.findByCategory(category, validatedOptions);

      this.logOperationSuccess('Get documents by category', category, {
        count: result.data.length,
        total: result.pagination.total
      });

      return this.formatPaginatedDatesForResponse(result);
    });
  }

  /**
   * Get documents by type with validation
   */
  async getDocumentsByType(
    documentType: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<ExtendedDocument>> {
    return this.trackPerformance('getDocumentsByType', async () => {
      // Validate document type
      this.validateString(documentType, 'Document type', {
        required: true,
        minLength: 1,
        maxLength: 20
      });

      this.logOperationStart('Get documents by type', documentType, { options });

      const validatedOptions = this.validatePaginationOptions(options);
      const result = await this.model.findByType(documentType, validatedOptions);

      this.logOperationSuccess('Get documents by type', documentType, {
        count: result.data.length,
        total: result.pagination.total
      });

      return this.formatPaginatedDatesForResponse(result);
    });
  }

  /**
   * Get document by ID with enhanced validation
   */
  async getDocumentById(id: string | number): Promise<ExtendedDocument> {
    return this.trackPerformance('getDocumentById', async () => {
      const numericId = this.parseNumericId(id, 'Document ID');
      
      this.logOperationStart('Get document', numericId);
      
      try {
        const document = await this.model.findById(numericId);
        
        this.logOperationSuccess('Get document', numericId, { title: document.title_en });
        
        return this.formatResponse(document).data;
      } catch (error) {
        this.handleServiceError('Get document', numericId, error);
        throw error;
      }
    });
  }

  /**
   * Get document by unique key with validation
   */
  async getDocumentByKey(uniqueKey: string): Promise<ExtendedDocument> {
    return this.trackPerformance('getDocumentByKey', async () => {
      this.validateString(uniqueKey, 'Unique key', { 
        required: true, 
        minLength: 1, 
        maxLength: 150
      });
      
      this.logOperationStart('Get document by key', uniqueKey);
      
      try {
        const document = await this.model.findByKey(uniqueKey);
        
        this.logOperationSuccess('Get document by key', uniqueKey, { 
          documentId: document.id,
          title: document.title_en 
        });
        
        return this.formatResponse(document).data;
      } catch (error) {
        this.handleServiceError('Get document by key', uniqueKey, error);
        throw error;
      }
    });
  }

  /**
   * Search documents with enhanced validation and sanitization
   */
  async searchDocuments(
    query: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<ExtendedDocument>> {
    return this.trackPerformance('searchDocuments', async () => {
      const sanitizedQuery = this.validateSearchQuery(query, { 
        required: true,
        minLength: 2,
        maxLength: 100
      });
      
      if (!sanitizedQuery) {
        throw new AppError('Search query is required', 400);
      }
      
      this.logOperationStart('Search documents', sanitizedQuery, { options });
      
      const validatedOptions = this.validatePaginationOptions(options);
      
      try {
        const searchFields = ['title_en', 'summary_en', 'unique_key'];
        const result = await this.model.search(searchFields, sanitizedQuery, validatedOptions);
        
        this.logOperationSuccess('Search documents', sanitizedQuery, { 
          count: result.data.length,
          total: result.pagination.total 
        });
        
        return this.formatPaginatedDatesForResponse(result);
      } catch (error) {
        this.handleServiceError('Search documents', sanitizedQuery, error);
        throw error;
      }
    });
  }

  /**
   * Create document with comprehensive validation
   */
  async createDocument(documentData: NewDocument): Promise<ExtendedDocument> {
    return this.trackPerformance('createDocument', async () => {
      // Comprehensive validation
      this.validateDocumentData(documentData, 'create');
      
      this.logOperationStart('Create document', documentData.unique_key);
      
      try {
        const document = await this.model.create(documentData);
        
        this.logOperationSuccess('Create document', document.id, { 
          uniqueKey: document.unique_key,
          title: document.title_en 
        });
        
        return this.formatResponse(document).data;
      } catch (error) {
        this.handleServiceError('Create document', documentData.unique_key, error, { documentData });
        throw error;
      }
    });
  }

  /**
   * Update document with validation
   */
  async updateDocument(id: string | number, updates: Partial<NewDocument>): Promise<ExtendedDocument> {
    return this.trackPerformance('updateDocument', async () => {
      const numericId = this.parseNumericId(id, 'Document ID');
      
      // Validate update data
      this.validateDocumentData(updates, 'update');
      
      this.logOperationStart('Update document', numericId, { updateFields: Object.keys(updates) });
      
      try {
        const document = await this.model.update(numericId, updates);
        
        this.logOperationSuccess('Update document', numericId, { 
          uniqueKey: document.unique_key,
          title: document.title_en 
        });
        
        return this.formatResponse(document).data;
      } catch (error) {
        this.handleServiceError('Update document', numericId, error, { updates });
        throw error;
      }
    });
  }



  /**
   * Delete document with proper validation
   */
  async deleteDocument(id: string | number): Promise<void> {
    return this.trackPerformance('deleteDocument', async () => {
      const numericId = this.parseNumericId(id, 'Document ID');
      
      this.logOperationStart('Delete document', numericId);
      
      try {
        await this.model.delete(numericId);
        
        this.logOperationSuccess('Delete document', numericId);
      } catch (error) {
        this.handleServiceError('Delete document', numericId, error);
        throw error;
      }
    });
  }

  /**
   * Get document statistics with performance optimization
   */
  async getDocumentStats(): Promise<{
    total: number;
    byCategory: Record<string, number>;
    lastUpdated: string;
  }> {
    return this.trackPerformance('getDocumentStats', async () => {
      this.logOperationStart('Get document statistics');

      try {
        const stats = await this.model.getDocumentStats();

        this.logOperationSuccess('Get document statistics', undefined, {
          total: stats.total,
          categories: Object.keys(stats.byCategory).length
        });

        return stats;
      } catch (error) {
        this.handleServiceError('Get document statistics', undefined, error);
        throw error;
      }
    });
  }

  /**
   * Comprehensive document data validation
   */
  private validateDocumentData(data: Partial<NewDocument>, operation: 'create' | 'update'): void {
    const isCreate = operation === 'create';
    
    // Validate unique_key
    if (isCreate || data.unique_key !== undefined) {
      this.validateString(data.unique_key, 'Unique key', {
        required: isCreate,
        minLength: 1,
        maxLength: 150,
        trim: true
      });
    }
    
    // Validate title_en
    if (isCreate || data.title_en !== undefined) {
      this.validateString(data.title_en, 'Title', {
        required: isCreate,
        minLength: 1,
        maxLength: 255,
        trim: true
      });
    }
    
    // Validate summary_en
    if (data.summary_en !== undefined) {
      this.validateString(data.summary_en, 'Summary', {
        required: false,
        maxLength: 1000,
        trim: true
      });
    }
    
    // Validate content_json_en (TipTap content)
    if (data.content_json_en !== undefined) {
      this.validateTipTapContent(data.content_json_en, 'Content');
    }
    
    // Validate screenshots_data array
    if (data.screenshots_data !== undefined) {
      this.validateScreenshots(data.screenshots_data);
    }
  }

  /**
   * Validate TipTap JSON content
   */
  private validateTipTapContent(content: any, fieldName: string): void {
    if (content === null || content === undefined) {
      return; // Allow null/undefined content
    }
    
    // If it's a string, try to parse it as JSON
    if (typeof content === 'string') {
      try {
        const parsed = JSON.parse(content);
        this.validateTipTapStructure(parsed, fieldName);
      } catch (error) {
        throw new AppError(`${fieldName} must be valid JSON`, 400);
      }
    } else if (typeof content === 'object') {
      this.validateTipTapStructure(content, fieldName);
    } else {
      throw new AppError(`${fieldName} must be a valid JSON object or string`, 400);
    }
  }

  /**
   * Validate TipTap document structure
   */
  private validateTipTapStructure(doc: any, fieldName: string): void {
    if (!doc || typeof doc !== 'object') {
      throw new AppError(`${fieldName} must be a valid TipTap document object`, 400);
    }
    
    // Basic TipTap structure validation
    if (doc.type && doc.type !== 'doc') {
      throw new AppError(`${fieldName} must have type 'doc' at root level`, 400);
    }
    
    if (doc.content && !Array.isArray(doc.content)) {
      throw new AppError(`${fieldName} content must be an array`, 400);
    }
    
    // Validate content size (prevent extremely large documents)
    const contentString = JSON.stringify(doc);
    if (contentString.length > 1024 * 1024) { // 1MB limit
      throw new AppError(`${fieldName} is too large (max 1MB)`, 400);
    }
  }

  /**
   * Validate screenshots_data array
   */
  private validateScreenshots(screenshots: any): void {
    if (!Array.isArray(screenshots)) {
      throw new AppError('Screenshots must be an array', 400);
    }

    if (screenshots.length > 20) {
      throw new AppError('Cannot have more than 20 screenshots', 400);
    }

    screenshots.forEach((screenshot, index) => {
      if (typeof screenshot !== 'object' || !screenshot) {
        throw new AppError(`Screenshot ${index + 1} must be an object`, 400);
      }

      if (!screenshot.data || typeof screenshot.data !== 'string') {
        throw new AppError(`Screenshot ${index + 1} must have valid data field`, 400);
      }

      if (!screenshot.mimeType || typeof screenshot.mimeType !== 'string') {
        throw new AppError(`Screenshot ${index + 1} must have valid mimeType field`, 400);
      }

      if (!screenshot.filename || typeof screenshot.filename !== 'string') {
        throw new AppError(`Screenshot ${index + 1} must have valid filename field`, 400);
      }
    });
  }

  /**
   * Enhanced service health checks
   */
  protected async performServiceHealthChecks(): Promise<{ 
    isHealthy: boolean; 
    errors: string[]; 
    warnings: string[] 
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Test document model health
      const modelHealth = await this.model.healthCheck();
      if (!modelHealth.isHealthy) {
        errors.push(...modelHealth.errors);
      }
      
      // Check recent performance
      const recentMetrics = this.getPerformanceMetrics({ 
        since: Date.now() - 300000 // Last 5 minutes
      });
      
      const failedOperations = recentMetrics.filter(m => !m.success);
      if (failedOperations.length > recentMetrics.length * 0.1) {
        warnings.push(`High failure rate in recent operations: ${failedOperations.length}/${recentMetrics.length}`);
      }
      
      const slowOperations = recentMetrics.filter(m => m.executionTime > 1000);
      if (slowOperations.length > recentMetrics.length * 0.3) {
        warnings.push(`Many slow operations recently: ${slowOperations.length}/${recentMetrics.length}`);
      }
      
    } catch (error) {
      errors.push(`Service health check failed: ${error instanceof Error ? error.message : error}`);
    }
    
    return {
      isHealthy: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check DocumentService dependencies
   */
  protected async checkDependencies(): Promise<Record<string, string>> {
    const dependencies: Record<string, string> = {
      database: 'connected',
      documentModel: 'active',
    };
    
    try {
      // Test database connectivity through model
      await this.model.healthCheck();
      dependencies.database = 'healthy';
    } catch {
      dependencies.database = 'error';
    }
    
    // Add performance metrics
    const stats = this.getPerformanceStats();
    dependencies.performanceMetrics = `${stats.totalOperations} ops, ${Math.round(stats.averageTime)}ms avg`;
    
    return dependencies;
  }
}

export const documentService = new DocumentService();
export default documentService; 