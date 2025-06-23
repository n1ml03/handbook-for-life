import { CharacterModel } from '../models/CharacterModel';
import { Character, NewCharacter } from '../types/database';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';
import { BaseService } from './BaseService';
import { Validator, ServiceSchemas } from '../utils/ValidationSchemas';

export class CharacterService extends BaseService<CharacterModel, Character, NewCharacter> {
  constructor() {
    super(new CharacterModel(), 'CharacterService');
  }

  async createCharacter(characterData: NewCharacter): Promise<Character> {
    return this.safeAsyncOperation(async () => {
      // Comprehensive validation using schema
      Validator.validateAndThrow(characterData, ServiceSchemas.Character.create);

      this.logOperationStart('Creating', characterData.name_en, { uniqueKey: characterData.unique_key });

      const character = await this.model.create(characterData);

      this.logOperationSuccess('Created', character.name_en, { id: character.id });
      return character;
    }, 'create character', characterData.name_en);
  }

  async getCharacters(options: PaginationOptions = {}): Promise<PaginatedResult<Character>> {
    return this.safeAsyncOperation(async () => {
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findAll(validatedOptions);
    }, 'fetch characters');
  }

  async getCharacterById(id: string | number): Promise<Character> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(id, 'Character ID');
      return await this.model.findById(numericId);
    }, 'fetch character', id);
  }

  async updateCharacter(id: string | number, updates: Partial<NewCharacter>): Promise<Character> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(id, 'Character ID');

      // Validate updates using schema
      Validator.validateAndThrow(updates, ServiceSchemas.Character.update, { allowExtraFields: false });

      this.logOperationStart('Updating', id, { updates });

      const character = await this.model.update(numericId, updates);

      this.logOperationSuccess('Updated', character.name_en, { id: character.id });
      return character;
    }, 'update character', id);
  }

  async deleteCharacter(id: string | number): Promise<void> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(id, 'Character ID');

      // Check if character exists before deletion
      await this.model.findById(numericId);

      this.logOperationStart('Deleting', id);
      await this.model.delete(numericId);
      this.logOperationSuccess('Deleted', id);
    }, 'delete character', id);
  }

  async getCharacterByKey(key: string): Promise<Character> {
    return this.safeAsyncOperation(async () => {
      this.validateId(key, 'Character key');
      return await this.model.findByUniqueKey(key);
    }, 'fetch character by key', key);
  }

  async getActiveCharacters(options: PaginationOptions = {}): Promise<PaginatedResult<Character>> {
    return this.safeAsyncOperation(async () => {
      const validatedOptions = this.validatePaginationOptions(options);
      // Use findAll since it already filters for active characters
      return await this.model.findAll(validatedOptions);
    }, 'fetch active characters');
  }

  async getCharactersByBirthday(month?: number, day?: number, options: PaginationOptions = {}): Promise<PaginatedResult<Character>> {
    return this.safeAsyncOperation(async () => {
      const validatedOptions = this.validatePaginationOptions(options);
      // For now, use findAll and filter in application layer
      // TODO: Implement findByBirthday in CharacterModel
      const allCharacters = await this.model.findAll(validatedOptions);
      return allCharacters; // Simplified for now
    }, 'fetch characters by birthday');
  }

  async searchCharacters(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Character>> {
    return this.safeAsyncOperation(async () => {
      this.validateSearchQuery(query);
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.search(query.trim(), validatedOptions);
    }, 'search characters', query);
  }

  // Health check is inherited from BaseService
}

// Export singleton instance
export const characterService = new CharacterService();
export default characterService; 