import { CharacterModel } from '../models/CharacterModel';
import { Character, NewCharacter } from '../types/database';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';
import { BaseService } from './BaseService';
import { characterSchemas, validateAndThrow } from '../utils/ValidationSchemas';

export class CharacterService extends BaseService<CharacterModel, Character, NewCharacter> {
  constructor() {
    super(new CharacterModel(), 'CharacterService');
  }

  async createCharacter(characterData: NewCharacter): Promise<Character> {
    return this.safeAsyncOperation(async () => {
      // Comprehensive validation using schema
      validateAndThrow(characterData, characterSchemas.create);

      const character = await this.model.create(characterData);
      return character;
    }, 'createCharacter', characterData.name_en);
  }

  async getCharacters(options: PaginationOptions = {}): Promise<PaginatedResult<Character>> {
    return this.safeAsyncOperation(async () => {
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findAll(validatedOptions);
    }, 'getCharacters');
  }

  async getCharacterById(id: string | number): Promise<Character> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(id, 'Character ID');
      return await this.model.findById(numericId);
    }, 'getCharacterById', id);
  }

  async updateCharacter(id: string | number, updates: Partial<NewCharacter>): Promise<Character> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(id, 'Character ID');

      // Validate updates using schema
      validateAndThrow(updates, characterSchemas.update);

      const character = await this.model.update(numericId, updates);
      return character;
    }, 'updateCharacter', id);
  }

  async deleteCharacter(id: string | number): Promise<void> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(id, 'Character ID');

      // Check if character exists before deletion
      await this.model.findById(numericId);
      await this.model.delete(numericId);
    }, 'deleteCharacter', id);
  }

  async getCharacterByKey(key: string): Promise<Character> {
    return this.safeAsyncOperation(async () => {
      this.validateString(key, 'Character key', { required: true });
      return await this.model.findByUniqueKey(key);
    }, 'getCharacterByKey', key);
  }

  async searchCharacters(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Character>> {
    return this.safeAsyncOperation(async () => {
      const validatedQuery = this.validateSearchQuery(query);
      if (!validatedQuery) {
        return await this.getCharacters(options);
      }

      const validatedOptions = this.validatePaginationOptions(options);
      const searchFields = ['name_jp', 'name_en', 'name_cn', 'name_tw', 'name_kr', 'unique_key'];
      return await this.model.search(searchFields, validatedQuery, validatedOptions);
    }, 'searchCharacters', query);
  }

  async getUpcomingBirthdays(days: number = 7): Promise<Character[]> {
    return this.safeAsyncOperation(async () => {
      if (days < 1 || days > 365) {
        throw new Error('Days must be between 1 and 365');
      }
      return await this.model.findUpcomingBirthdays(days);
    }, 'getUpcomingBirthdays');
  }

  async getCharacterSwimsuits(characterId: string | number, options: PaginationOptions = {}): Promise<PaginatedResult<any>> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(characterId, 'Character ID');
      const validatedOptions = this.validatePaginationOptions(options);
      
      // Verify character exists
      await this.model.findById(numericId);
      
      return await this.model.getCharacterSwimsuits(numericId, validatedOptions);
    }, 'getCharacterSwimsuits', characterId);
  }

  // Batch operations
  async createMultipleCharacters(charactersData: NewCharacter[]): Promise<void> {
    return this.safeAsyncOperation(async () => {
      if (!Array.isArray(charactersData) || charactersData.length === 0) {
        throw new Error('Characters data must be a non-empty array');
      }

      if (charactersData.length > 100) {
        throw new Error('Cannot create more than 100 characters at once');
      }

      // Validate all characters before processing
      charactersData.forEach((character, index) => {
        try {
          validateAndThrow(character, characterSchemas.create);
        } catch (error) {
          throw new Error(`Character ${index + 1}: ${error instanceof Error ? error.message : 'Validation failed'}`);
        }
      });

      await this.model.batchCreate(charactersData);
    }, 'createMultipleCharacters');
  }
}

// Export singleton instance
export const characterService = new CharacterService();
export default characterService; 