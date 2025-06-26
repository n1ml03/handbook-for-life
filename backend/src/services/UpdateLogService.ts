import { UpdateLogModel } from '../models/UpdateLogModel';
import { UpdateLog, NewUpdateLog } from '../types/database';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';
import { BaseService } from './BaseService';

export class UpdateLogService extends BaseService<UpdateLogModel, UpdateLog, NewUpdateLog> {
  constructor() {
    super(new UpdateLogModel(), 'UpdateLogService');
  }

  async createUpdateLog(updateLogData: NewUpdateLog): Promise<UpdateLog> {
    return this.safeAsyncOperation(async () => {
      this.validateRequiredString(updateLogData.version, 'Update log version');
      this.validateRequiredString(updateLogData.title, 'Update log title');
      this.validateRequiredString(updateLogData.content, 'Update log content');

      this.logOperationStart('Creating', updateLogData.title, { version: updateLogData.version });

      const updateLog = await this.model.create(updateLogData);

      this.logOperationSuccess('Created', updateLog.title, { id: updateLog.id });
      return updateLog;
    }, 'create update log', updateLogData.title);
  }

  async getUpdateLogs(options: PaginationOptions = {}): Promise<PaginatedResult<UpdateLog>> {
    return this.safeAsyncOperation(async () => {
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findAll(validatedOptions);
    }, 'fetch update logs');
  }

  async getPublishedUpdateLogs(options: PaginationOptions = {}): Promise<PaginatedResult<UpdateLog>> {
    return this.safeAsyncOperation(async () => {
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findPublished(validatedOptions);
    }, 'fetch published update logs');
  }

  async getUpdateLogById(id: string): Promise<UpdateLog> {
    return this.safeAsyncOperation(async () => {
      this.validateId(id, 'Update log ID');
      const numericId = this.parseNumericId(id, 'Update log ID');
      return await this.model.findById(numericId);
    }, 'fetch update log', id);
  }

  async getUpdateLogByUniqueKey(uniqueKey: string): Promise<UpdateLog> {
    return this.safeAsyncOperation(async () => {
      this.validateId(uniqueKey, 'Update log unique key');
      return await this.model.findByUniqueKey(uniqueKey);
    }, 'fetch update log by unique key', uniqueKey);
  }

  async getUpdateLogsByVersion(version: string, options: PaginationOptions = {}): Promise<PaginatedResult<UpdateLog>> {
    return this.safeAsyncOperation(async () => {
      this.validateRequiredString(version, 'Version');
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findByVersion(version, validatedOptions);
    }, 'fetch update logs by version', version);
  }

  async updateUpdateLog(id: string, updates: Partial<NewUpdateLog>): Promise<UpdateLog> {
    return this.safeAsyncOperation(async () => {
      this.validateId(id, 'Update log ID');
      const numericId = this.parseNumericId(id, 'Update log ID');
      this.validateOptionalString(updates.title, 'Update log title');
      this.validateOptionalString(updates.version, 'Update log version');
      this.validateOptionalString(updates.content, 'Update log content');

      this.logOperationStart('Updating', id, { updates });

      const updateLog = await this.model.update(numericId, updates);

      this.logOperationSuccess('Updated', updateLog.title, { id: updateLog.id });
      return updateLog;
    }, 'update update log', id);
  }

  async deleteUpdateLog(id: string): Promise<void> {
    return this.safeAsyncOperation(async () => {
      this.validateId(id, 'Update log ID');
      const numericId = this.parseNumericId(id, 'Update log ID');

      // Check if update log exists first
      await this.model.findById(numericId);

      this.logOperationStart('Deleting', id);
      await this.model.delete(numericId);
      this.logOperationSuccess('Deleted', id);
    }, 'delete update log', id);
  }

  async getRecentUpdateLogs(limit: number = 5): Promise<UpdateLog[]> {
    return this.safeAsyncOperation(async () => {
      if (limit <= 0 || limit > 100) {
        throw new Error('Limit must be between 1 and 100');
      }
      return await this.model.findRecentUpdates(limit);
    }, 'fetch recent update logs');
  }

  async getUpdateLogsByDateRange(startDate: Date, endDate: Date, options: PaginationOptions = {}): Promise<PaginatedResult<UpdateLog>> {
    return this.safeAsyncOperation(async () => {
      this.validateDateRange(startDate, endDate);
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findByDateRange(startDate, endDate, validatedOptions);
    }, 'fetch update logs by date range');
  }

  async searchUpdateLogs(searchTerm: string, options: PaginationOptions = {}): Promise<PaginatedResult<UpdateLog>> {
    return this.safeAsyncOperation(async () => {
      this.validateSearchQuery(searchTerm);
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.searchByTitle(searchTerm.trim(), validatedOptions);
    }, 'search update logs', searchTerm);
  }

  // Health check is inherited from BaseService
}

// Export singleton instance
export const updateLogService = new UpdateLogService();
export default updateLogService;
