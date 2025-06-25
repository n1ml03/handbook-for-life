import { EpisodeModel } from '../models/EpisodeModel';
import { Episode, NewEpisode, EpisodeType } from '../types/database';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';
import { BaseService } from './BaseService';

export class EpisodeService extends BaseService<EpisodeModel, Episode, NewEpisode> {
  constructor() {
    super(new EpisodeModel(), 'EpisodeService');
  }

  async createEpisode(episodeData: NewEpisode): Promise<Episode> {
    return this.safeAsyncOperation(async () => {
      this.validateRequiredString(episodeData.unique_key, 'Episode unique key');
      this.validateRequiredString(episodeData.title_en, 'Episode title');

      this.logOperationStart('Creating', episodeData.title_en, { key: episodeData.unique_key });

      const episode = await this.model.create(episodeData);

      this.logOperationSuccess('Created', episode.title_en, { id: episode.id });
      return episode;
    }, 'create episode', episodeData.title_en);
  }

  async getEpisodes(options: PaginationOptions = {}): Promise<PaginatedResult<Episode>> {
    return this.safeAsyncOperation(async () => {
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findAll(validatedOptions);
    }, 'fetch episodes');
  }

  async getEpisodeById(id: string | number): Promise<Episode> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(id, 'Episode ID');
      return await this.model.findById(numericId);
    }, 'fetch episode', id);
  }

  async getEpisodeByKey(key: string): Promise<Episode> {
    return this.safeAsyncOperation(async () => {
      this.validateId(key, 'Episode key');
      return await this.model.findByKey(key);
    }, 'fetch episode by key', key);
  }

  async getEpisodesByType(type: string, options: PaginationOptions = {}): Promise<PaginatedResult<Episode>> {
    return this.safeAsyncOperation(async () => {
      this.validateRequiredString(type, 'Episode type');
      
      // Convert string to EpisodeType enum
      const episodeType = this.validateEpisodeType(type);
      
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findByType(episodeType, validatedOptions);
    }, 'fetch episodes by type', type);
  }

  async getEpisodesByRelatedEntity(entityType: string, entityId: string | number, options: PaginationOptions = {}): Promise<PaginatedResult<Episode>> {
    return this.safeAsyncOperation(async () => {
      this.validateRequiredString(entityType, 'Entity type');
      const numericEntityId = this.parseNumericId(entityId, 'Entity ID');

      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findByRelatedEntity(entityType, numericEntityId, validatedOptions);
    }, 'fetch episodes by related entity', `${entityType}:${entityId}`);
  }

  async updateEpisode(id: string | number, updates: Partial<NewEpisode>): Promise<Episode> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(id, 'Episode ID');
      this.validateOptionalString(updates.title_en, 'Episode title');

      this.logOperationStart('Updating', id, { updates });

      const episode = await this.model.update(numericId, updates);

      this.logOperationSuccess('Updated', episode.title_en, { id: episode.id });
      return episode;
    }, 'update episode', id);
  }

  async deleteEpisode(id: string | number): Promise<void> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(id, 'Episode ID');

      // Check if episode exists before deletion
      await this.model.findById(numericId);

      this.logOperationStart('Deleting', id);
      await this.model.delete(numericId);
      this.logOperationSuccess('Deleted', id);
    }, 'delete episode', id);
  }

  async searchEpisodes(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Episode>> {
    return this.safeAsyncOperation(async () => {
      this.validateSearchQuery(query);
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.search(query.trim(), validatedOptions);
    }, 'search episodes', query);
  }

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  private validateEpisodeType(type: string): EpisodeType {
    const validTypes: EpisodeType[] = ['MAIN', 'CHARACTER', 'EVENT', 'SWIMSUIT', 'ITEM'];
    
    if (!validTypes.includes(type as EpisodeType)) {
      throw this.handleServiceError('validate episode type', type, `Invalid episode type: ${type}. Valid types are: ${validTypes.join(', ')}`);
    }
    
    return type as EpisodeType;
  }

  // Health check is inherited from BaseService
}

export const episodeService = new EpisodeService();
export default episodeService; 