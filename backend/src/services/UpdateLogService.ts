import { UpdateLogModel } from '../models/UpdateLogModel';
import { UpdateLog, NewUpdateLog } from '../types/database';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config';

export class UpdateLogService {
  private updateLogModel: UpdateLogModel;

  constructor() {
    this.updateLogModel = new UpdateLogModel();
  }

  async createUpdateLog(updateLogData: NewUpdateLog): Promise<UpdateLog> {
    try {
      // Business logic validation
      if (!updateLogData.version?.trim()) {
        throw new AppError('Update log version is required', 400);
      }

      if (!updateLogData.title?.trim()) {
        throw new AppError('Update log title is required', 400);
      }

      if (!updateLogData.content?.trim()) {
        throw new AppError('Update log content is required', 400);
      }

      logger.info(`Creating update log: ${updateLogData.title}`, { version: updateLogData.version });
      
      const updateLog = await this.updateLogModel.create(updateLogData);
      
      logger.info(`Update log created successfully: ${updateLog.title}`, { id: updateLog.id });
      return updateLog;
    } catch (error) {
      logger.error(`Failed to create update log: ${updateLogData.title}`, { 
        error: error instanceof Error ? error.message : error 
      });
      throw error;
    }
  }

  async getUpdateLogs(options: PaginationOptions = {}): Promise<PaginatedResult<UpdateLog>> {
    try {
      return await this.updateLogModel.findAll(options);
    } catch (error) {
      logger.error('Failed to fetch update logs', { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch update logs', 500);
    }
  }

  async getPublishedUpdateLogs(options: PaginationOptions = {}): Promise<PaginatedResult<UpdateLog>> {
    try {
      return await this.updateLogModel.findPublished(options);
    } catch (error) {
      logger.error('Failed to fetch published update logs', { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch published update logs', 500);
    }
  }

  async getUpdateLogById(id: string): Promise<UpdateLog> {
    try {
      if (!id?.trim()) {
        throw new AppError('Update log ID is required', 400);
      }

      return await this.updateLogModel.findById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to fetch update log: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch update log', 500);
    }
  }

  async getUpdateLogByUniqueKey(uniqueKey: string): Promise<UpdateLog> {
    try {
      if (!uniqueKey?.trim()) {
        throw new AppError('Update log unique key is required', 400);
      }

      return await this.updateLogModel.findByUniqueKey(uniqueKey);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to fetch update log by unique key: ${uniqueKey}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch update log', 500);
    }
  }

  async getUpdateLogsByVersion(version: string): Promise<UpdateLog[]> {
    try {
      if (!version?.trim()) {
        throw new AppError('Version is required', 400);
      }

      return await this.updateLogModel.findByVersion(version);
    } catch (error) {
      logger.error(`Failed to fetch update logs for version: ${version}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch update logs by version', 500);
    }
  }

  async updateUpdateLog(id: string, updates: Partial<NewUpdateLog>): Promise<UpdateLog> {
    try {
      if (!id?.trim()) {
        throw new AppError('Update log ID is required', 400);
      }

      // Business logic validation
      if (updates.title !== undefined && !updates.title?.trim()) {
        throw new AppError('Update log title cannot be empty', 400);
      }

      if (updates.version !== undefined && !updates.version?.trim()) {
        throw new AppError('Update log version cannot be empty', 400);
      }

      if (updates.content !== undefined && !updates.content?.trim()) {
        throw new AppError('Update log content cannot be empty', 400);
      }

      logger.info(`Updating update log: ${id}`, { updates });
      
      const updateLog = await this.updateLogModel.update(id, updates);
      
      logger.info(`Update log updated successfully: ${updateLog.title}`, { id: updateLog.id });
      return updateLog;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to update update log: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to update update log', 500);
    }
  }

  async deleteUpdateLog(id: string): Promise<void> {
    try {
      if (!id?.trim()) {
        throw new AppError('Update log ID is required', 400);
      }

      // Check if update log exists first
      await this.getUpdateLogById(id);

      await this.updateLogModel.delete(id);
      
      logger.info(`Update log deleted successfully: ${id}`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to delete update log: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to delete update log', 500);
    }
  }

  // Additional service methods
  async getRecentUpdateLogs(limit: number = 5): Promise<UpdateLog[]> {
    try {
      return await this.updateLogModel.findRecentUpdates(limit);
    } catch (error) {
      logger.error('Failed to fetch recent update logs', { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch recent update logs', 500);
    }
  }

  async getUpdateLogsByDateRange(startDate: Date, endDate: Date, options: PaginationOptions = {}): Promise<PaginatedResult<UpdateLog>> {
    try {
      if (startDate >= endDate) {
        throw new AppError('Start date must be before end date', 400);
      }

      return await this.updateLogModel.findByDateRange(startDate, endDate, options);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Failed to fetch update logs by date range', { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch update logs by date range', 500);
    }
  }

  async searchUpdateLogs(searchTerm: string, options: PaginationOptions = {}): Promise<PaginatedResult<UpdateLog>> {
    try {
      if (!searchTerm?.trim()) {
        throw new AppError('Search term is required', 400);
      }

      return await this.updateLogModel.searchByTitle(searchTerm, options);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Failed to search update logs', { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to search update logs', 500);
    }
  }

  // Health check
  async healthCheck(): Promise<{ isHealthy: boolean; service: string; errors: string[] }> {
    try {
      const modelHealth = await this.updateLogModel.healthCheck();
      return {
        isHealthy: modelHealth.isHealthy,
        service: 'UpdateLogService',
        errors: modelHealth.errors
      };
    } catch (error) {
      return {
        isHealthy: false,
        service: 'UpdateLogService',
        errors: [`Service health check failed: ${error instanceof Error ? error.message : error}`]
      };
    }
  }
}

// Export singleton instance
export const updateLogService = new UpdateLogService();
