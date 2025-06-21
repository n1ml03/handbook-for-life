import { DocumentModel } from '../models/DocumentModel';
import { Document, NewDocument } from '../types/database';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config';

export class DocumentService {
  private documentModel: DocumentModel;

  constructor() {
    this.documentModel = new DocumentModel();
  }

  async createDocument(documentData: NewDocument): Promise<Document> {
    try {
      if (!documentData.unique_key?.trim()) {
        throw new AppError('Document unique key is required', 400);
      }

      if (!documentData.title_en?.trim()) {
        throw new AppError('Document title is required', 400);
      }

      // Validate JSON content if provided
      if (documentData.content_json_en) {
        if (typeof documentData.content_json_en === 'string') {
          try {
            JSON.parse(documentData.content_json_en);
          } catch {
            throw new AppError('Invalid JSON format for content_json_en', 400);
          }
        } else if (typeof documentData.content_json_en !== 'object') {
          throw new AppError('Content JSON must be a valid JSON object or string', 400);
        }
      }

      logger.info(`Creating document: ${documentData.title_en}`, { key: documentData.unique_key });
      
      const document = await this.documentModel.create(documentData);
      
      logger.info(`Document created successfully: ${document.title_en}`, { id: document.id });
      return document;
    } catch (error) {
      logger.error(`Failed to create document: ${documentData.title_en}`, { 
        error: error instanceof Error ? error.message : error 
      });
      throw error;
    }
  }

  async getDocuments(options: PaginationOptions = {}): Promise<PaginatedResult<Document>> {
    try {
      return await this.documentModel.findAll(options);
    } catch (error) {
      logger.error('Failed to fetch documents', { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch documents', 500);
    }
  }

  async getPublishedDocuments(options: PaginationOptions = {}): Promise<PaginatedResult<Document>> {
    try {
      return await this.documentModel.findPublished(options);
    } catch (error) {
      logger.error('Failed to fetch published documents', { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch published documents', 500);
    }
  }

  async getDocumentById(id: string): Promise<Document> {
    try {
      if (!id?.trim()) {
        throw new AppError('Document ID is required', 400);
      }

      return await this.documentModel.findById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to fetch document: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch document', 500);
    }
  }

  async getDocumentByKey(key: string): Promise<Document> {
    try {
      if (!key?.trim()) {
        throw new AppError('Document key is required', 400);
      }

      return await this.documentModel.findByKey(key);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to fetch document by key: ${key}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch document', 500);
    }
  }

  async updateDocument(id: string, updates: Partial<NewDocument>): Promise<Document> {
    try {
      if (!id?.trim()) {
        throw new AppError('Document ID is required', 400);
      }

      if (updates.title_en !== undefined && !updates.title_en?.trim()) {
        throw new AppError('Document title cannot be empty', 400);
      }

      // Validate JSON content if provided
      if (updates.content_json_en !== undefined) {
        if (updates.content_json_en && typeof updates.content_json_en === 'string') {
          try {
            JSON.parse(updates.content_json_en);
          } catch {
            throw new AppError('Invalid JSON format for content_json_en', 400);
          }
        } else if (updates.content_json_en && typeof updates.content_json_en !== 'object') {
          throw new AppError('Content JSON must be a valid JSON object or string', 400);
        }
      }

      logger.info(`Updating document: ${id}`, { updates });
      
      const document = await this.documentModel.update(id, updates);
      
      logger.info(`Document updated successfully: ${document.title_en}`, { id: document.id });
      return document;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to update document: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to update document', 500);
    }
  }

  async publishDocument(id: string): Promise<Document> {
    try {
      if (!id?.trim()) {
        throw new AppError('Document ID is required', 400);
      }

      logger.info(`Publishing document: ${id}`);
      
      const document = await this.documentModel.update(id, { is_published: true });
      
      logger.info(`Document published successfully: ${document.title_en}`, { id: document.id });
      return document;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to publish document: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to publish document', 500);
    }
  }

  async unpublishDocument(id: string): Promise<Document> {
    try {
      if (!id?.trim()) {
        throw new AppError('Document ID is required', 400);
      }

      logger.info(`Unpublishing document: ${id}`);
      
      const document = await this.documentModel.update(id, { is_published: false });
      
      logger.info(`Document unpublished successfully: ${document.title_en}`, { id: document.id });
      return document;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to unpublish document: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to unpublish document', 500);
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      if (!id?.trim()) {
        throw new AppError('Document ID is required', 400);
      }

      await this.documentModel.findById(id);
      
      logger.info(`Deleting document: ${id}`);
      await this.documentModel.delete(id);
      logger.info(`Document deleted successfully: ${id}`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to delete document: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to delete document', 500);
    }
  }

  async searchDocuments(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Document>> {
    try {
      if (!query?.trim()) {
        throw new AppError('Search query is required', 400);
      }

      return await this.documentModel.search(query.trim(), options);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to search documents: ${query}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to search documents', 500);
    }
  }

  async healthCheck(): Promise<{ isHealthy: boolean; errors: string[] }> {
    try {
      const modelHealth = await this.documentModel.healthCheck();
      return {
        isHealthy: modelHealth.isHealthy,
        errors: modelHealth.errors
      };
    } catch (error) {
      return {
        isHealthy: false,
        errors: [`Document service health check failed: ${error instanceof Error ? error.message : error}`]
      };
    }
  }
}

export const documentService = new DocumentService();
export default documentService; 