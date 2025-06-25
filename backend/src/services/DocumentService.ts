import { DocumentModel } from '../models/DocumentModel';
import { Document, NewDocument } from '../types/database';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';
import { BaseService } from './BaseService';

export class DocumentService extends BaseService<DocumentModel, Document, NewDocument> {
  constructor() {
    super(new DocumentModel(), 'DocumentService');
  }

  async createDocument(documentData: NewDocument): Promise<Document> {
    return this.safeAsyncOperation(async () => {
      this.validateRequiredString(documentData.unique_key, 'Document unique key');
      this.validateRequiredString(documentData.title_en, 'Document title');

      this.logOperationStart('Creating', documentData.title_en, { key: documentData.unique_key });

      const document = await this.model.create(documentData);

      this.logOperationSuccess('Created', document.title_en, { id: document.id });
      return document;
    }, 'create document', documentData.title_en);
  }

  async getDocuments(options: PaginationOptions = {}): Promise<PaginatedResult<Document>> {
    return this.safeAsyncOperation(async () => {
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findAll(validatedOptions);
    }, 'fetch documents');
  }

  async getDocumentById(id: string | number): Promise<Document> {
    return this.safeAsyncOperation(async () => {
      this.validateId(id, 'Document ID');
      return await this.model.findById(id);
    }, 'fetch document', id);
  }

  async getDocumentByKey(key: string): Promise<Document> {
    return this.safeAsyncOperation(async () => {
      this.validateId(key, 'Document key');
      return await this.model.findByKey(key);
    }, 'fetch document by key', key);
  }

  async updateDocument(id: string | number, updates: Partial<NewDocument>): Promise<Document> {
    return this.safeAsyncOperation(async () => {
      this.validateId(id, 'Document ID');
      this.validateOptionalString(updates.title_en, 'Document title');

      this.logOperationStart('Updating', id, { updates });

      const document = await this.model.update(id, updates);

      this.logOperationSuccess('Updated', document.title_en, { id: document.id });
      return document;
    }, 'update document', id);
  }

  async deleteDocument(id: string | number): Promise<void> {
    return this.safeAsyncOperation(async () => {
      this.validateId(id, 'Document ID');

      // Check if document exists before deletion
      await this.model.findById(id);

      this.logOperationStart('Deleting', id);
      await this.model.delete(id);
      this.logOperationSuccess('Deleted', id);
    }, 'delete document', id);
  }

  async getPublishedDocuments(options: PaginationOptions = {}): Promise<PaginatedResult<Document>> {
    return this.safeAsyncOperation(async () => {
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findPublished(validatedOptions);
    }, 'fetch published documents');
  }

  async searchDocuments(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Document>> {
    return this.safeAsyncOperation(async () => {
      this.validateSearchQuery(query);
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.search(query.trim(), validatedOptions);
    }, 'search documents', query);
  }

  async togglePublishStatus(id: string | number): Promise<Document> {
    return this.safeAsyncOperation(async () => {
      this.validateId(id, 'Document ID');

      this.logOperationStart('Toggling publish status', id);

      const document = await this.model.togglePublishStatus(id);

      this.logOperationSuccess('Toggled publish status', document.title_en, { 
        id: document.id, 
        newStatus: document.is_published 
      });
      return document;
    }, 'toggle document publish status', id);
  }

  // Health check is inherited from BaseService
}

export const documentService = new DocumentService();
export default documentService; 