/**
 * Consolidated Services Module
 * Combines DocumentService, UpdateLogService, and GachaService
 */

import { DocumentModel } from '../models/DocumentModel';
import { UpdateLogModel } from '../models/UpdateLogModel';
import { GachaModel } from '../models/GachaModel';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';
import { Document, UpdateLog, Gacha } from '../types/database';

// ============================================================================
// DOCUMENT SERVICE
// ============================================================================

export class DocumentService {
  private model: DocumentModel;

  constructor() {
    this.model = new DocumentModel();
  }

  /**
   * Get all documents with pagination
   */
  async getDocuments(options: PaginationOptions): Promise<PaginatedResult<Document>> {
    return this.model.findAll(options);
  }

  /**
   * Get a single document by ID
   */
  async getDocumentById(id: number): Promise<Document> {
    return this.model.findById(id);
  }

  /**
   * Get a single document by unique key
   */
  async getDocumentByKey(key: string): Promise<Document> {
    return this.model.findByKey(key);
  }

  /**
   * Create a new document
   */
  async createDocument(data: any): Promise<Document> {
    return this.model.create(data);
  }

  /**
   * Update an existing document
   */
  async updateDocument(id: number, data: any): Promise<Document> {
    return this.model.update(id, data);
  }

  /**
   * Delete a document
   */
  async deleteDocument(id: number): Promise<void> {
    return this.model.delete(id);
  }

  /**
   * Search documents
   */
  async searchDocuments(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Document>> {
    const searchFields = ['title_en', 'summary_en', 'unique_key'];
    return this.model.search(searchFields, query, options);
  }

  /**
   * Get documents by type
   */
  async getDocumentsByType(type: string, options: PaginationOptions = {}): Promise<PaginatedResult<Document>> {
    return this.model.findByType(type, options);
  }

  /**
   * Get documents by category (alias for type)
   */
  async getDocumentsByCategory(category: string, options: PaginationOptions = {}): Promise<PaginatedResult<Document>> {
    return this.model.findByType(category, options);
  }

  /**
   * Get document statistics
   */
  async getDocumentStats(): Promise<any> {
    return this.model.getStats();
  }

  /**
   * Health check for document service
   */
  async healthCheck(): Promise<any> {
    return this.model.healthCheck();
  }
}

// ============================================================================
// UPDATE LOG SERVICE
// ============================================================================

export class UpdateLogService {
  private model: UpdateLogModel;

  constructor() {
    this.model = new UpdateLogModel();
  }

  /**
   * Get all update logs with pagination
   */
  async getUpdateLogs(options: PaginationOptions): Promise<PaginatedResult<UpdateLog>> {
    return this.model.findAll(options);
  }

  /**
   * Get a single update log by ID
   */
  async getUpdateLogById(id: number): Promise<UpdateLog> {
    return this.model.findById(id);
  }

  /**
   * Get a single update log by unique key
   */
  async getUpdateLogByKey(key: string): Promise<UpdateLog> {
    return this.model.findByKey(key);
  }

  /**
   * Create a new update log
   */
  async createUpdateLog(data: any): Promise<UpdateLog> {
    return this.model.create(data);
  }

  /**
   * Update an existing update log
   */
  async updateUpdateLog(id: number, data: any): Promise<UpdateLog> {
    return this.model.update(id, data);
  }

  /**
   * Delete an update log
   */
  async deleteUpdateLog(id: number): Promise<void> {
    return this.model.delete(id);
  }

  /**
   * Get recent update logs
   */
  async getRecentUpdateLogs(days: number = 30, options: PaginationOptions = {}): Promise<PaginatedResult<UpdateLog>> {
    return this.model.findRecent(days, options);
  }
}

// ============================================================================
// GACHA SERVICE
// ============================================================================

export class GachaService {
  private model: GachaModel;

  constructor() {
    this.model = new GachaModel();
  }

  /**
   * Get all gachas with pagination
   */
  async getGachas(options: PaginationOptions): Promise<PaginatedResult<Gacha>> {
    return this.model.findAll(options);
  }

  /**
   * Get a single gacha by ID
   */
  async getGachaById(id: number): Promise<Gacha> {
    return this.model.findById(id);
  }

  /**
   * Get a single gacha by unique key
   */
  async getGachaByKey(key: string): Promise<Gacha> {
    return this.model.findByKey(key);
  }

  /**
   * Create a new gacha
   */
  async createGacha(data: any): Promise<Gacha> {
    return this.model.create(data);
  }

  /**
   * Update an existing gacha
   */
  async updateGacha(id: number, data: any): Promise<Gacha> {
    return this.model.update(id, data);
  }

  /**
   * Delete a gacha
   */
  async deleteGacha(id: number): Promise<void> {
    return this.model.delete(id);
  }

  /**
   * Get active gachas
   */
  async getActiveGachas(options: PaginationOptions = {}): Promise<PaginatedResult<Gacha>> {
    return this.model.findActive(options);
  }

  /**
   * Get gachas by date range
   */
  async getGachasByDateRange(startDate: Date, endDate: Date, options: PaginationOptions = {}): Promise<PaginatedResult<Gacha>> {
    return this.model.findByDateRange(startDate, endDate, options);
  }
}

