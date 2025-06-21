import { SwimsuitModel } from '../models/SwimsuitModel';
import { Swimsuit, NewSwimsuit } from '../types/database';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config';

export class SwimsuitService {
  private swimsuitModel: SwimsuitModel;

  constructor() {
    this.swimsuitModel = new SwimsuitModel();
  }

  async createSwimsuit(swimsuitData: NewSwimsuit): Promise<Swimsuit> {
    try {
      if (!swimsuitData.unique_key?.trim()) {
        throw new AppError('Swimsuit unique key is required', 400);
      }

      if (!swimsuitData.name_en?.trim()) {
        throw new AppError('Swimsuit name is required', 400);
      }

      if (!swimsuitData.character_id) {
        throw new AppError('Character ID is required', 400);
      }

      logger.info(`Creating swimsuit: ${swimsuitData.name_en}`, { 
        key: swimsuitData.unique_key, 
        characterId: swimsuitData.character_id 
      });
      
      const swimsuit = await this.swimsuitModel.create(swimsuitData);
      
      logger.info(`Swimsuit created successfully: ${swimsuit.name_en}`, { id: swimsuit.id });
      return swimsuit;
    } catch (error) {
      logger.error(`Failed to create swimsuit: ${swimsuitData.name_en}`, { 
        error: error instanceof Error ? error.message : error 
      });
      throw error;
    }
  }

  async getSwimsuits(options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    try {
      return await this.swimsuitModel.findAll(options);
    } catch (error) {
      logger.error('Failed to fetch swimsuits', { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch swimsuits', 500);
    }
  }

  async getSwimsuitById(id: string): Promise<Swimsuit> {
    try {
      if (!id?.trim()) {
        throw new AppError('Swimsuit ID is required', 400);
      }

      return await this.swimsuitModel.findById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to fetch swimsuit: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch swimsuit', 500);
    }
  }

  async getSwimsuitByKey(key: string): Promise<Swimsuit> {
    try {
      if (!key?.trim()) {
        throw new AppError('Swimsuit key is required', 400);
      }

      return await this.swimsuitModel.findByKey(key);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to fetch swimsuit by key: ${key}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch swimsuit', 500);
    }
  }

  async getSwimsuitsByCharacter(characterId: number, options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    try {
      if (!characterId) {
        throw new AppError('Character ID is required', 400);
      }

      return await this.swimsuitModel.findByCharacter(characterId, options);
    } catch (error) {
      logger.error(`Failed to fetch swimsuits for character: ${characterId}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch swimsuits for character', 500);
    }
  }

  async getSwimsuitsByRarity(rarity: string, options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    try {
      if (!rarity?.trim()) {
        throw new AppError('Rarity is required', 400);
      }

      return await this.swimsuitModel.findByRarity(rarity, options);
    } catch (error) {
      logger.error(`Failed to fetch swimsuits by rarity: ${rarity}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch swimsuits by rarity', 500);
    }
  }

  async getSwimsuitsByType(type: string, options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    try {
      if (!type?.trim()) {
        throw new AppError('Suit type is required', 400);
      }

      return await this.swimsuitModel.findByType(type, options);
    } catch (error) {
      logger.error(`Failed to fetch swimsuits by type: ${type}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch swimsuits by type', 500);
    }
  }

  async updateSwimsuit(id: string, updates: Partial<NewSwimsuit>): Promise<Swimsuit> {
    try {
      if (!id?.trim()) {
        throw new AppError('Swimsuit ID is required', 400);
      }

      if (updates.name_en !== undefined && !updates.name_en?.trim()) {
        throw new AppError('Swimsuit name cannot be empty', 400);
      }

      logger.info(`Updating swimsuit: ${id}`, { updates });
      
      const swimsuit = await this.swimsuitModel.update(id, updates);
      
      logger.info(`Swimsuit updated successfully: ${swimsuit.name_en}`, { id: swimsuit.id });
      return swimsuit;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to update swimsuit: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to update swimsuit', 500);
    }
  }

  async deleteSwimsuit(id: string): Promise<void> {
    try {
      if (!id?.trim()) {
        throw new AppError('Swimsuit ID is required', 400);
      }

      await this.swimsuitModel.findById(id);
      
      logger.info(`Deleting swimsuit: ${id}`);
      await this.swimsuitModel.delete(id);
      logger.info(`Swimsuit deleted successfully: ${id}`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to delete swimsuit: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to delete swimsuit', 500);
    }
  }

  async searchSwimsuits(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    try {
      if (!query?.trim()) {
        throw new AppError('Search query is required', 400);
      }

      return await this.swimsuitModel.search(query.trim(), options);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to search swimsuits: ${query}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to search swimsuits', 500);
    }
  }

  async healthCheck(): Promise<{ isHealthy: boolean; errors: string[] }> {
    try {
      const modelHealth = await this.swimsuitModel.healthCheck();
      return {
        isHealthy: modelHealth.isHealthy,
        errors: modelHealth.errors
      };
    } catch (error) {
      return {
        isHealthy: false,
        errors: [`Swimsuit service health check failed: ${error instanceof Error ? error.message : error}`]
      };
    }
  }
}

export const swimsuitService = new SwimsuitService();
export default swimsuitService; 