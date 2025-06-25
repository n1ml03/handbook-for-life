import { SwimsuitModel } from '../models/SwimsuitModel';
import { Swimsuit, NewSwimsuit, SwimsuitRarity, SuitType } from '../types/database';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';
import { BaseService } from './BaseService';

export class SwimsuitService extends BaseService<SwimsuitModel, Swimsuit, NewSwimsuit> {
  constructor() {
    super(new SwimsuitModel(), 'SwimsuitService');
  }

  async createSwimsuit(swimsuitData: NewSwimsuit): Promise<Swimsuit> {
    return this.safeAsyncOperation(async () => {
      this.validateRequiredString(swimsuitData.unique_key, 'Swimsuit unique key');
      this.validateRequiredString(swimsuitData.name_en, 'Swimsuit name');
      
      if (!swimsuitData.character_id) {
        throw new Error('Character ID is required');
      }

      this.logOperationStart('Creating', swimsuitData.name_en, { 
        key: swimsuitData.unique_key, 
        characterId: swimsuitData.character_id 
      });

      const swimsuit = await this.model.create(swimsuitData);

      this.logOperationSuccess('Created', swimsuit.name_en, { id: swimsuit.id });
      return swimsuit;
    }, 'create swimsuit', swimsuitData.name_en);
  }

  async getSwimsuits(options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    return this.safeAsyncOperation(async () => {
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findAll(validatedOptions);
    }, 'fetch swimsuits');
  }

  async getSwimsuitById(id: string | number): Promise<Swimsuit> {
    return this.safeAsyncOperation(async () => {
      this.validateId(id, 'Swimsuit ID');
      return await this.model.findById(id);
    }, 'fetch swimsuit', id);
  }

  async getSwimsuitByKey(key: string): Promise<Swimsuit> {
    return this.safeAsyncOperation(async () => {
      this.validateId(key, 'Swimsuit key');
      return await this.model.findByKey(key);
    }, 'fetch swimsuit by key', key);
  }

  async getSwimsuitsByCharacter(characterId: string | number, options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    return this.safeAsyncOperation(async () => {
      const numericCharacterId = this.parseNumericId(characterId, 'Character ID');
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findByCharacter(numericCharacterId, validatedOptions);
    }, 'fetch swimsuits by character', characterId);
  }

  async getSwimsuitsByRarity(rarity: string, options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    return this.safeAsyncOperation(async () => {
      this.validateRequiredString(rarity, 'Rarity');
      const swimsuitRarity = this.validateSwimsuitRarity(rarity);
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findByRarity(swimsuitRarity, validatedOptions);
    }, 'fetch swimsuits by rarity', rarity);
  }

  async getSwimsuitsByType(type: string, options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    return this.safeAsyncOperation(async () => {
      this.validateRequiredString(type, 'Suit type');
      const suitType = this.validateSuitType(type);
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findByType(suitType, validatedOptions);
    }, 'fetch swimsuits by type', type);
  }

  async updateSwimsuit(id: string | number, updates: Partial<NewSwimsuit>): Promise<Swimsuit> {
    return this.safeAsyncOperation(async () => {
      this.validateId(id, 'Swimsuit ID');
      this.validateOptionalString(updates.name_en, 'Swimsuit name');

      this.logOperationStart('Updating', id, { updates });

      const swimsuit = await this.model.update(id, updates);

      this.logOperationSuccess('Updated', swimsuit.name_en, { id: swimsuit.id });
      return swimsuit;
    }, 'update swimsuit', id);
  }

  async deleteSwimsuit(id: string | number): Promise<void> {
    return this.safeAsyncOperation(async () => {
      this.validateId(id, 'Swimsuit ID');

      // Check if swimsuit exists before deletion
      await this.model.findById(id);

      this.logOperationStart('Deleting', id);
      await this.model.delete(id);
      this.logOperationSuccess('Deleted', id);
    }, 'delete swimsuit', id);
  }

  async searchSwimsuits(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    return this.safeAsyncOperation(async () => {
      this.validateSearchQuery(query);
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.search(query.trim(), validatedOptions);
    }, 'search swimsuits', query);
  }

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  private validateSwimsuitRarity(rarity: string): SwimsuitRarity {
    const validRarities: SwimsuitRarity[] = ['N', 'R', 'SR', 'SSR'];
    
    if (!validRarities.includes(rarity as SwimsuitRarity)) {
      throw new Error(`Invalid swimsuit rarity: ${rarity}. Valid rarities are: ${validRarities.join(', ')}`);
    }
    
    return rarity as SwimsuitRarity;
  }

  private validateSuitType(type: string): SuitType {
    const validTypes: SuitType[] = ['OFFENSIVE', 'DEFENSIVE', 'SUPPORTER'];
    
    if (!validTypes.includes(type as SuitType)) {
      throw new Error(`Invalid suit type: ${type}. Valid types are: ${validTypes.join(', ')}`);
    }
    
    return type as SuitType;
  }

  // Health check is inherited from BaseService
}

// Export singleton instance
export const swimsuitService = new SwimsuitService();
export default swimsuitService; 