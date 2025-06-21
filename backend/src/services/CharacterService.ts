import { CharacterModel } from '../models/CharacterModel';
import { Character, NewCharacter } from '../types/database';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config';

export class CharacterService {
  private characterModel: CharacterModel;

  constructor() {
    this.characterModel = new CharacterModel();
  }

  async createCharacter(characterData: NewCharacter): Promise<Character> {
    try {
      // Business logic validation
      if (!characterData.unique_key?.trim()) {
        throw new AppError('Character unique key is required', 400);
      }

      if (!characterData.name_en?.trim()) {
        throw new AppError('Character name (English) is required', 400);
      }

      logger.info(`Creating character: ${characterData.name_en}`, { uniqueKey: characterData.unique_key });
      
      const character = await this.characterModel.create(characterData);
      
      logger.info(`Character created successfully: ${character.name_en}`, { id: character.id });
      return character;
    } catch (error) {
      logger.error(`Failed to create character: ${characterData.name_en}`, { 
        error: error instanceof Error ? error.message : error,
        uniqueKey: characterData.unique_key 
      });
      throw error;
    }
  }

  async getCharacters(options: PaginationOptions = {}): Promise<PaginatedResult<Character>> {
    try {
      return await this.characterModel.findAll(options);
    } catch (error) {
      logger.error('Failed to fetch characters', { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch characters', 500);
    }
  }

  async getCharacterById(id: string): Promise<Character> {
    try {
      if (!id?.trim()) {
        throw new AppError('Character ID is required', 400);
      }

      return await this.characterModel.findById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to fetch character: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch character', 500);
    }
  }

  async updateCharacter(id: string, updates: Partial<NewCharacter>): Promise<Character> {
    try {
      if (!id?.trim()) {
        throw new AppError('Character ID is required', 400);
      }

      // Business logic validation
      if (updates.name_en !== undefined && !updates.name_en?.trim()) {
        throw new AppError('Character name (English) cannot be empty', 400);
      }

      logger.info(`Updating character: ${id}`, { updates });
      
      const character = await this.characterModel.update(id, updates);
      
      logger.info(`Character updated successfully: ${character.name_en}`, { id: character.id });
      return character;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to update character: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to update character', 500);
    }
  }

  async deleteCharacter(id: string): Promise<void> {
    try {
      if (!id?.trim()) {
        throw new AppError('Character ID is required', 400);
      }

      // Check if character exists before deletion
      await this.characterModel.findById(id);
      
      logger.info(`Deleting character: ${id}`);
      await this.characterModel.delete(id);
      logger.info(`Character deleted successfully: ${id}`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to delete character: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to delete character', 500);
    }
  }

  async getCharacterByKey(key: string): Promise<Character> {
    try {
      if (!key?.trim()) {
        throw new AppError('Character key is required', 400);
      }

      return await this.characterModel.findByKey(key);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to fetch character by key: ${key}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch character', 500);
    }
  }

  async getActiveCharacters(options: PaginationOptions = {}): Promise<PaginatedResult<Character>> {
    try {
      return await this.characterModel.findActive(options);
    } catch (error) {
      logger.error('Failed to fetch active characters', { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch active characters', 500);
    }
  }

  async getCharactersByBirthday(month?: number, day?: number, options: PaginationOptions = {}): Promise<PaginatedResult<Character>> {
    try {
      return await this.characterModel.findByBirthday(month, day, options);
    } catch (error) {
      logger.error(`Failed to fetch characters by birthday: ${month}/${day}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch characters by birthday', 500);
    }
  }

  async searchCharacters(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Character>> {
    try {
      if (!query?.trim()) {
        throw new AppError('Search query is required', 400);
      }

      return await this.characterModel.search(query.trim(), options);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to search characters: ${query}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to search characters', 500);
    }
  }

  async healthCheck(): Promise<{ isHealthy: boolean; errors: string[] }> {
    try {
      const modelHealth = await this.characterModel.healthCheck();
      return {
        isHealthy: modelHealth.isHealthy,
        errors: modelHealth.errors
      };
    } catch (error) {
      return {
        isHealthy: false,
        errors: [`Character service health check failed: ${error instanceof Error ? error.message : error}`]
      };
    }
  }
}

// Export singleton instance
export const characterService = new CharacterService();
export default characterService; 