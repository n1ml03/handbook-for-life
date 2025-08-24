import { SwimsuitModel } from '../models/SwimsuitModel';
import { Swimsuit, NewSwimsuit, SwimsuitRarity, SuitType } from '../types/database';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';
import { BaseService } from './BaseService';
import { TransactionManager } from './TransactionManager';
import { DatabaseError } from '../middleware/errorHandler';

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
      const numericId = this.parseNumericId(id, 'Swimsuit ID');
      return await this.model.findById(numericId);
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
      const numericId = this.parseNumericId(id, 'Swimsuit ID');
      this.validateOptionalString(updates.name_en, 'Swimsuit name');

      this.logOperationStart('Updating', id, { updates });

      const swimsuit = await this.model.update(numericId, updates);

      this.logOperationSuccess('Updated', swimsuit.name_en, { id: swimsuit.id });
      return swimsuit;
    }, 'update swimsuit', id);
  }

  async deleteSwimsuit(id: string | number): Promise<void> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(id, 'Swimsuit ID');

      // Check if swimsuit exists before deletion
      await this.model.findById(numericId);

      this.logOperationStart('Deleting', id);
      await this.model.delete(numericId);
      this.logOperationSuccess('Deleted', id);
    }, 'delete swimsuit', id);
  }

  async searchSwimsuits(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    return this.safeAsyncOperation(async () => {
      this.validateSearchQuery(query);
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.searchSwimsuits(query.trim(), validatedOptions);
    }, 'search swimsuits', query);
  }

  /**
   * Create multiple swimsuits with their skill associations in a single transaction
   */
  async createSwimsuitsWithSkills(
    swimsuitsData: Array<{
      swimsuit: NewSwimsuit;
      skillIds: number[];
    }>
  ): Promise<{
    created: Swimsuit[];
    failed: Array<{ swimsuit: NewSwimsuit; error: string }>;
  }> {
    return this.safeAsyncOperation(async () => {
      if (!swimsuitsData || swimsuitsData.length === 0) {
        throw new Error('No swimsuit data provided');
      }

      this.logOperationStart('Creating swimsuits with skills', 'batch', {
        count: swimsuitsData.length
      });

      const operations = swimsuitsData.map((data, index) => ({
        name: `create-swimsuit-${index}-${data.swimsuit.unique_key}`,
        operation: async (connection: any) => {
          // Create swimsuit
          const [result] = await connection.execute(
            `INSERT INTO swimsuits (character_id, unique_key, name_jp, name_en, name_cn, name_tw, name_kr,
             description_en, rarity, suit_type, total_stats_awakened, has_malfunction, is_limited,
             release_date_gl, game_version)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              data.swimsuit.character_id,
              data.swimsuit.unique_key,
              data.swimsuit.name_jp,
              data.swimsuit.name_en,
              data.swimsuit.name_cn,
              data.swimsuit.name_tw,
              data.swimsuit.name_kr,
              data.swimsuit.description_en,
              data.swimsuit.rarity,
              data.swimsuit.suit_type,
              data.swimsuit.total_stats_awakened ?? 0,
              data.swimsuit.has_malfunction ?? false,
              data.swimsuit.is_limited ?? true,
              data.swimsuit.release_date_gl,
              data.swimsuit.game_version
            ]
          );

          const swimsuitId = (result as any).insertId;

          // Create skill associations
          if (data.skillIds && data.skillIds.length > 0) {
            const skillInserts = data.skillIds.map(skillId =>
              connection.execute(
                'INSERT INTO swimsuit_skills (swimsuit_id, skill_id) VALUES (?, ?)',
                [swimsuitId, skillId]
              )
            );
            await Promise.all(skillInserts);
          }

          return { swimsuitId, skillCount: data.skillIds?.length || 0 };
        },
        rollbackOperation: async (connection: any, results: any[]) => {
          // Remove skill associations first
          if (results[index]?.swimsuitId) {
            await connection.execute(
              'DELETE FROM swimsuit_skills WHERE swimsuit_id = ?',
              [results[index].swimsuitId]
            );

            // Remove swimsuit
            await connection.execute(
              'DELETE FROM swimsuits WHERE id = ?',
              [results[index].swimsuitId]
            );
          }
        }
      }));

      try {
        const results = await TransactionManager.executeComplexTransaction(
          operations,
          {
            context: 'bulk-swimsuit-creation',
            timeout: 60000, // 1 minute timeout
            retryOnDeadlock: true,
            maxRetries: 3
          }
        );

        // Fetch created swimsuits
        const created: Swimsuit[] = [];
        for (let i = 0; i < results.length; i++) {
          const result = results[i] as { swimsuitId: number; skillCount: number };
          if (result.swimsuitId) {
            const swimsuit = await this.model.findById(result.swimsuitId);
            created.push(swimsuit);
          }
        }

        this.logOperationSuccess('Created swimsuits with skills', 'batch', {
          created: created.length,
          totalSkillAssociations: results.reduce((sum, r) => sum + ((r as any).skillCount || 0), 0)
        });

        return { created, failed: [] };

      } catch (error: any) {
        // If transaction fails, return partial results
        const failed = swimsuitsData.map(data => ({
          swimsuit: data.swimsuit,
          error: error.message
        }));

        return { created: [], failed };
      }
    }, 'create swimsuits with skills', `${swimsuitsData.length} swimsuits`);
  }

  /**
   * Bulk update swimsuit statistics with validation
   */
  async bulkUpdateStats(
    updates: Array<{
      id: number;
      total_stats_awakened?: number;
      total_stats_unawakened?: number;
    }>
  ): Promise<{ updated: number; failed: number; errors: any[] }> {
    return this.safeAsyncOperation(async () => {
      if (!updates || updates.length === 0) {
        throw new Error('No update data provided');
      }

      this.logOperationStart('Bulk updating swimsuit stats', 'batch', {
        count: updates.length
      });

      // Validate all updates first
      const validUpdates = updates.filter(update => {
        if (!update.id || typeof update.id !== 'number') {
          return false;
        }
        if (update.total_stats_awakened !== undefined && update.total_stats_awakened < 0) {
          return false;
        }
        if (update.total_stats_unawakened !== undefined && update.total_stats_unawakened < 0) {
          return false;
        }
        return true;
      });

      if (validUpdates.length === 0) {
        throw new Error('No valid updates provided');
      }

      const result = await TransactionManager.executeBatchInsert(
        'swimsuit_stats_temp', // Temporary approach - in real implementation, use proper batch update
        validUpdates,
        {
          batchSize: 50,
          validateRecord: (record) => record.id > 0,
          context: 'swimsuit-stats-update'
        }
      );

      this.logOperationSuccess('Bulk updated swimsuit stats', 'batch', result);

      // Map the result to match the expected return type
      return {
        updated: result.inserted,
        failed: result.failed,
        errors: result.errors
      };
    }, 'bulk update swimsuit stats', `${updates.length} updates`);
  }

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  private validateSwimsuitRarity(rarity: string): SwimsuitRarity {
    const validRarities: SwimsuitRarity[] = ['N', 'R', 'SR', 'SSR', 'SSR+'];
    
    if (!validRarities.includes(rarity as SwimsuitRarity)) {
      throw new Error(`Invalid swimsuit rarity: ${rarity}. Valid rarities are: ${validRarities.join(', ')}`);
    }
    
    return rarity as SwimsuitRarity;
  }

  private validateSuitType(type: string): SuitType {
    const validTypes: SuitType[] = ['POW', 'TEC', 'STM', 'APL', 'N/A'];
    
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