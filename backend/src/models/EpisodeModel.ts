import { BaseModel, PaginationOptions, PaginatedResult } from './BaseModel';
import { Episode, NewEpisode, EpisodeType } from '../types/database';
import { executeQuery } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config';

export class EpisodeModel extends BaseModel<Episode, NewEpisode> {
  constructor() {
    super('episodes');
  }

  // Implementation of abstract methods
  protected mapRow(row: any): Episode {
    return {
      id: row.id,
      unique_key: row.unique_key,
      title_jp: row.title_jp,
      title_en: row.title_en,
      title_cn: row.title_cn,
      title_tw: row.title_tw,
      title_kr: row.title_kr,
      unlock_condition_en: row.unlock_condition_en,
      episode_type: row.episode_type,
      related_entity_type: row.related_entity_type,
      related_entity_id: row.related_entity_id,
      game_version: row.game_version,
    };
  }

  protected getCreateFields(): (keyof NewEpisode)[] {
    return [
      'unique_key',
      'title_jp',
      'title_en',
      'title_cn',
      'title_tw',
      'title_kr',
      'unlock_condition_en',
      'episode_type',
      'related_entity_type',
      'related_entity_id',
      'game_version'
    ];
  }

  protected getUpdateFields(): (keyof NewEpisode)[] {
    return this.getCreateFields(); // Same fields can be updated
  }

  // Override mapSortColumn to handle frontend sort parameters
  protected mapSortColumn(sortBy: string): string | null {
    const columnMapping: Record<string, string> = {
      'created_at': 'id', // Map created_at to id since we don't have created_at column
      'title': 'title_en', // Default to English title for 'title' parameter
      'title_en': 'title_en',
      'title_jp': 'title_jp',
      'title_cn': 'title_cn', 
      'title_tw': 'title_tw',
      'title_kr': 'title_kr',
      'type': 'episode_type',
      'episode_type': 'episode_type',
      'id': 'id',
      'unique_key': 'unique_key',
      'game_version': 'game_version',
      'related_entity_type': 'related_entity_type',
      'related_entity_id': 'related_entity_id'
    };

    return columnMapping[sortBy] || null;
  }

  // Mapper function to convert database row to Episode object
  private mapEpisodeRow(row: any): Episode {
    return {
      id: row.id,
      unique_key: row.unique_key,
      title_jp: row.title_jp,
      title_en: row.title_en,
      title_cn: row.title_cn,
      title_tw: row.title_tw,
      title_kr: row.title_kr,
      unlock_condition_en: row.unlock_condition_en,
      episode_type: row.episode_type as EpisodeType,
      related_entity_type: row.related_entity_type,
      related_entity_id: row.related_entity_id,
      game_version: row.game_version,
    };
  }

  async create(episode: NewEpisode): Promise<Episode> {
    try {
      const [result] = await executeQuery(
        `INSERT INTO episodes (unique_key, title_jp, title_en, title_cn, title_tw, title_kr,
         unlock_condition_en, episode_type, related_entity_type, related_entity_id, game_version)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          episode.unique_key,
          episode.title_jp,
          episode.title_en,
          episode.title_cn,
          episode.title_tw,
          episode.title_kr,
          episode.unlock_condition_en,
          episode.episode_type,
          episode.related_entity_type,
          episode.related_entity_id,
          episode.game_version,
        ]
      ) as [any, any];

      logger.info(`Episode created: ${episode.title_en}`, { id: result.insertId });
      return this.findById(result.insertId);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError('Episode with this unique_key already exists', 409);
      }
      throw new AppError('Failed to create episode', 500);
    }
  }

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<Episode>> {
    return this.getPaginatedResults(
      'SELECT * FROM episodes',
      'SELECT COUNT(*) FROM episodes',
      options,
      this.mapEpisodeRow
    );
  }

  async findById(id: number): Promise<Episode>;
  async findById<T>(id: string | number, mapFunction: (row: any) => T): Promise<T>;
  
  async findById<T = Episode>(id: string | number, mapFunction?: (row: any) => T): Promise<T | Episode> {
    if (mapFunction) {
      return super.findById(id) as Promise<T>;
    }
    return super.findById(id as number);
  }

  async findByUniqueKey(unique_key: string): Promise<Episode> {
    const [rows] = await executeQuery('SELECT * FROM episodes WHERE unique_key = ?', [unique_key]) as [any[], any];
    if (rows.length === 0) {
      throw new AppError('Episode not found', 404);
    }
    return this.mapEpisodeRow(rows[0]);
  }

  async findByType(episode_type: EpisodeType, options: PaginationOptions = {}): Promise<PaginatedResult<Episode>> {
    return this.getPaginatedResults(
      'SELECT * FROM episodes WHERE episode_type = ?',
      'SELECT COUNT(*) FROM episodes WHERE episode_type = ?',
      options,
      this.mapEpisodeRow,
      [episode_type]
    );
  }

  async findByRelatedEntity(entity_type: string, entity_id: number, options: PaginationOptions = {}): Promise<PaginatedResult<Episode>> {
    return this.getPaginatedResults(
      'SELECT * FROM episodes WHERE related_entity_type = ? AND related_entity_id = ?',
      'SELECT COUNT(*) FROM episodes WHERE related_entity_type = ? AND related_entity_id = ?',
      options,
      this.mapEpisodeRow,
      [entity_type, entity_id]
    );
  }

  async update(id: number, updates: Partial<NewEpisode>): Promise<Episode> {
    const setClause: string[] = [];
    const params: any[] = [];

    if (updates.unique_key !== undefined) {
      setClause.push(`unique_key = ?`);
      params.push(updates.unique_key);
    }
    if (updates.title_jp !== undefined) {
      setClause.push(`title_jp = ?`);
      params.push(updates.title_jp);
    }
    if (updates.title_en !== undefined) {
      setClause.push(`title_en = ?`);
      params.push(updates.title_en);
    }
    if (updates.title_cn !== undefined) {
      setClause.push(`title_cn = ?`);
      params.push(updates.title_cn);
    }
    if (updates.title_tw !== undefined) {
      setClause.push(`title_tw = ?`);
      params.push(updates.title_tw);
    }
    if (updates.title_kr !== undefined) {
      setClause.push(`title_kr = ?`);
      params.push(updates.title_kr);
    }
    if (updates.unlock_condition_en !== undefined) {
      setClause.push(`unlock_condition_en = ?`);
      params.push(updates.unlock_condition_en);
    }
    if (updates.episode_type !== undefined) {
      setClause.push(`episode_type = ?`);
      params.push(updates.episode_type);
    }
    if (updates.related_entity_type !== undefined) {
      setClause.push(`related_entity_type = ?`);
      params.push(updates.related_entity_type);
    }
    if (updates.related_entity_id !== undefined) {
      setClause.push(`related_entity_id = ?`);
      params.push(updates.related_entity_id);
    }
    if (updates.game_version !== undefined) {
      setClause.push(`game_version = ?`);
      params.push(updates.game_version);
    }

    if (setClause.length === 0) {
      return this.findById(id);
    }

    params.push(id);

    await executeQuery(
      `UPDATE episodes SET ${setClause.join(', ')} WHERE id = ?`,
      params
    );

    logger.info(`Episode updated: ${id}`);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    return super.delete(id);
  }

  async search(
    searchFields: string[],
    query: string,
    options: PaginationOptions = {},
    additionalWhere?: string
  ): Promise<PaginatedResult<Episode>> {
    return super.search(searchFields, query, options, additionalWhere);
  }

  // Convenience search method for episodes
  async searchEpisodes(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Episode>> {
    const searchFields = ['title_jp', 'title_en', 'title_cn', 'title_tw', 'title_kr', 'unique_key'];
    return this.search(searchFields, query, options);
  }

  async getMainStoryEpisodes(options: PaginationOptions = {}): Promise<PaginatedResult<Episode>> {
    return this.findByType('MAIN', options);
  }

  async getCharacterEpisodes(character_id: number, options: PaginationOptions = {}): Promise<PaginatedResult<Episode>> {
    return this.findByRelatedEntity('characters', character_id, options);
  }

  async findByCharacter(character_id: number, options: PaginationOptions = {}): Promise<PaginatedResult<Episode>> {
    return this.getPaginatedResults(
      'SELECT * FROM episodes WHERE episode_type = ? AND related_entity_id = ?',
      'SELECT COUNT(*) FROM episodes WHERE episode_type = ? AND related_entity_id = ?',
      options,
      this.mapEpisodeRow,
      ['CHARACTER', character_id]
    );
  }

  async healthCheck(): Promise<{ isHealthy: boolean; tableName: string; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Test basic connection
      await executeQuery('SELECT 1');
      
      // Test table existence and basic query
      await executeQuery('SELECT COUNT(*) FROM episodes LIMIT 1');
      
      logger.debug('EpisodeModel health check passed');
    } catch (error) {
      const errorMsg = `EpisodeModel health check failed: ${error instanceof Error ? error.message : error}`;
      errors.push(errorMsg);
      logger.error(errorMsg);
    }

    return {
      isHealthy: errors.length === 0,
      tableName: 'episodes',
      errors
    };
  }

  async findByKey(key: string): Promise<Episode> {
    return this.findByUniqueKey(key);
  }
}