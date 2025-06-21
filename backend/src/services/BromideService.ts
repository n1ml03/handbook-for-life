import { BromideModel } from '../models/BromideModel';
import { Bromide, NewBromide } from '../types/database';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config';

export class BromideService {
  private bromideModel: BromideModel;

  constructor() {
    this.bromideModel = new BromideModel();
  }

  async createBromide(bromideData: NewBromide): Promise<Bromide> {
    try {
      if (!bromideData.unique_key?.trim()) {
        throw new AppError('Bromide unique key is required', 400);
      }

      if (!bromideData.name_en?.trim()) {
        throw new AppError('Bromide name is required', 400);
      }

      logger.info(`Creating bromide: ${bromideData.name_en}`, { key: bromideData.unique_key });
      
      const bromide = await this.bromideModel.create(bromideData);
      
      logger.info(`Bromide created successfully: ${bromide.name_en}`, { id: bromide.id });
      return bromide;
    } catch (error) {
      logger.error(`Failed to create bromide: ${bromideData.name_en}`, { 
        error: error instanceof Error ? error.message : error 
      });
      throw error;
    }
  }

  async getBromides(options: PaginationOptions = {}): Promise<PaginatedResult<Bromide>> {
    try {
      return await this.bromideModel.findAll(options);
    } catch (error) {
      logger.error('Failed to fetch bromides', { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch bromides', 500);
    }
  }

  async getBromideById(id: string): Promise<Bromide> {
    try {
      if (!id?.trim()) {
        throw new AppError('Bromide ID is required', 400);
      }

      return await this.bromideModel.findById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to fetch bromide: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch bromide', 500);
    }
  }

  async getBromideByKey(key: string): Promise<Bromide> {
    try {
      if (!key?.trim()) {
        throw new AppError('Bromide key is required', 400);
      }

      return await this.bromideModel.findByKey(key);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to fetch bromide by key: ${key}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch bromide', 500);
    }
  }

  async getBromidesByType(type: string, options: PaginationOptions = {}): Promise<PaginatedResult<Bromide>> {
    try {
      if (!type?.trim()) {
        throw new AppError('Bromide type is required', 400);
      }

      return await this.bromideModel.findByType(type, options);
    } catch (error) {
      logger.error(`Failed to fetch bromides by type: ${type}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch bromides by type', 500);
    }
  }

  async updateBromide(id: string, updates: Partial<NewBromide>): Promise<Bromide> {
    try {
      if (!id?.trim()) {
        throw new AppError('Bromide ID is required', 400);
      }

      if (updates.name_en !== undefined && !updates.name_en?.trim()) {
        throw new AppError('Bromide name cannot be empty', 400);
      }

      logger.info(`Updating bromide: ${id}`, { updates });
      
      const bromide = await this.bromideModel.update(id, updates);
      
      logger.info(`Bromide updated successfully: ${bromide.name_en}`, { id: bromide.id });
      return bromide;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to update bromide: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to update bromide', 500);
    }
  }

  async deleteBromide(id: string): Promise<void> {
    try {
      if (!id?.trim()) {
        throw new AppError('Bromide ID is required', 400);
      }

      await this.bromideModel.findById(id);
      
      logger.info(`Deleting bromide: ${id}`);
      await this.bromideModel.delete(id);
      logger.info(`Bromide deleted successfully: ${id}`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to delete bromide: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to delete bromide', 500);
    }
  }

  async searchBromides(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Bromide>> {
    try {
      if (!query?.trim()) {
        throw new AppError('Search query is required', 400);
      }

      return await this.bromideModel.search(query.trim(), options);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to search bromides: ${query}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to search bromides', 500);
    }
  }

  async healthCheck(): Promise<{ isHealthy: boolean; errors: string[] }> {
    try {
      const modelHealth = await this.bromideModel.healthCheck();
      return {
        isHealthy: modelHealth.isHealthy,
        errors: modelHealth.errors
      };
    } catch (error) {
      return {
        isHealthy: false,
        errors: [`Bromide service health check failed: ${error instanceof Error ? error.message : error}`]
      };
    }
  }
}

export const bromideService = new BromideService();
export default bromideService; 