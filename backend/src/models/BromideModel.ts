import { BaseModel, PaginationOptions, PaginatedResult } from './BaseModel';
import { Bromide, NewBromide, BromideType, BromideRarity } from '../types/database';
import { executeQuery } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config';

export class BromideModel extends BaseModel<Bromide, NewBromide> {
  constructor() {
    super('bromides');
  }

  // Implementation of abstract methods
  protected mapRow(row: any): Bromide {
    return {
      id: row.id,
      unique_key: row.unique_key,
      name_jp: row.name_jp,
      name_en: row.name_en,
      name_cn: row.name_cn,
      name_tw: row.name_tw,
      name_kr: row.name_kr,
      bromide_type: row.bromide_type,
      rarity: row.rarity,
      skill_id: row.skill_id,
      art_url: row.art_url,
      game_version: row.game_version,
    };
  }

  protected getCreateFields(): (keyof NewBromide)[] {
    return [
      'unique_key',
      'name_jp',
      'name_en',
      'name_cn',
      'name_tw',
      'name_kr',
      'bromide_type',
      'rarity',
      'skill_id',
      'art_url',
      'game_version'
    ];
  }

  protected getUpdateFields(): (keyof NewBromide)[] {
    return this.getCreateFields(); // Same fields can be updated
  }

  // Mapper function to convert database row to Bromide object
  private mapBromideRow(row: any): Bromide {
    return {
      id: row.id,
      unique_key: row.unique_key,
      name_jp: row.name_jp,
      name_en: row.name_en,
      name_cn: row.name_cn,
      name_tw: row.name_tw,
      name_kr: row.name_kr,
      bromide_type: row.bromide_type as BromideType,
      rarity: row.rarity as BromideRarity,
      skill_id: row.skill_id,
      art_url: row.art_url,
      game_version: row.game_version,
    };
  }

  async create(bromide: NewBromide): Promise<Bromide> {
    try {
      const [result] = await executeQuery(
        `INSERT INTO bromides (unique_key, name_jp, name_en, name_cn, name_tw, name_kr,
         bromide_type, rarity, skill_id, art_url, game_version)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bromide.unique_key,
          bromide.name_jp,
          bromide.name_en,
          bromide.name_cn,
          bromide.name_tw,
          bromide.name_kr,
          bromide.bromide_type ?? 'DECO',
          bromide.rarity,
          bromide.skill_id,
          bromide.art_url,
          bromide.game_version,
        ]
      ) as [any, any];

      logger.info(`Bromide created: ${bromide.name_en}`, { id: result.insertId });
      return this.findById(result.insertId);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError('Bromide with this unique_key already exists', 409);
      }
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new AppError('Skill not found', 400);
      }
      throw new AppError('Failed to create bromide', 500);
    }
  }

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<Bromide>> {
    return this.getPaginatedResults(
      'SELECT * FROM bromides',
      'SELECT COUNT(*) FROM bromides',
      options,
      this.mapBromideRow
    );
  }

  async findById(id: number): Promise<Bromide>;
  async findById<T>(id: string | number, mapFunction: (row: any) => T): Promise<T>;
  
  async findById<T = Bromide>(id: string | number, mapFunction?: (row: any) => T): Promise<T | Bromide> {
    if (mapFunction) {
      return super.findById(id) as Promise<T>;
    }
    return super.findById(id as number);
  }

  async findByUniqueKey(unique_key: string): Promise<Bromide> {
    const [rows] = await executeQuery('SELECT * FROM bromides WHERE unique_key = ?', [unique_key]) as [any[], any];
    if (rows.length === 0) {
      throw new AppError('Bromide not found', 404);
    }
    return this.mapBromideRow(rows[0]);
  }

  async findByType(bromide_type: BromideType, options: PaginationOptions = {}): Promise<PaginatedResult<Bromide>> {
    // Validate the type is a valid BromideType
    if (!['DECO', 'OWNER'].includes(bromide_type)) {
      throw new AppError(`Invalid bromide type: ${bromide_type}`, 400);
    }

    return this.getPaginatedResults(
      'SELECT * FROM bromides WHERE bromide_type = ?',
      'SELECT COUNT(*) FROM bromides WHERE bromide_type = ?',
      options,
      this.mapBromideRow,
      [bromide_type]
    );
  }

  async findByRarity(rarity: BromideRarity, options: PaginationOptions = {}): Promise<PaginatedResult<Bromide>> {
    return this.getPaginatedResults(
      'SELECT * FROM bromides WHERE rarity = ?',
      'SELECT COUNT(*) FROM bromides WHERE rarity = ?',
      options,
      this.mapBromideRow,
      [rarity]
    );
  }

  async update(id: number, updates: Partial<NewBromide>): Promise<Bromide> {
    const setClause: string[] = [];
    const params: any[] = [];

    if (updates.unique_key !== undefined) {
      setClause.push(`unique_key = ?`);
      params.push(updates.unique_key);
    }
    if (updates.name_jp !== undefined) {
      setClause.push(`name_jp = ?`);
      params.push(updates.name_jp);
    }
    if (updates.name_en !== undefined) {
      setClause.push(`name_en = ?`);
      params.push(updates.name_en);
    }
    if (updates.name_cn !== undefined) {
      setClause.push(`name_cn = ?`);
      params.push(updates.name_cn);
    }
    if (updates.name_tw !== undefined) {
      setClause.push(`name_tw = ?`);
      params.push(updates.name_tw);
    }
    if (updates.name_kr !== undefined) {
      setClause.push(`name_kr = ?`);
      params.push(updates.name_kr);
    }
    if (updates.bromide_type !== undefined) {
      setClause.push(`bromide_type = ?`);
      params.push(updates.bromide_type);
    }
    if (updates.rarity !== undefined) {
      setClause.push(`rarity = ?`);
      params.push(updates.rarity);
    }
    if (updates.skill_id !== undefined) {
      setClause.push(`skill_id = ?`);
      params.push(updates.skill_id);
    }
    if (updates.art_url !== undefined) {
      setClause.push(`art_url = ?`);
      params.push(updates.art_url);
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
      `UPDATE bromides SET ${setClause.join(', ')} WHERE id = ?`,
      params
    );

    logger.info(`Bromide updated: ${id}`);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    return super.delete(id);
  }

  // Override search method to match BaseModel signature
  async search(
    searchFields: string[],
    query: string,
    options: PaginationOptions = {},
    additionalWhere?: string
  ): Promise<PaginatedResult<Bromide>> {
    return super.search(searchFields, query, options, additionalWhere);
  }

  // Convenience search method for bromides
  async searchBromides(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Bromide>> {
    const searchFields = ['name_jp', 'name_en', 'name_cn', 'name_tw', 'name_kr', 'unique_key'];
    return this.search(searchFields, query, options);
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  protected processPaginationOptions(options: PaginationOptions): {
    offset: number;
    limit: number;
    sortBy: string;
    sortOrder: string;
  } {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const offset = (page - 1) * limit;
    const sortBy = options.sortBy || 'id';
    const sortOrder = (options.sortOrder || 'asc').toUpperCase();

    return { offset, limit, sortBy, sortOrder };
  }

  async healthCheck(): Promise<{ isHealthy: boolean; tableName: string; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Test basic connection
      await executeQuery('SELECT 1');
      
      // Test table existence and basic query
      await executeQuery('SELECT COUNT(*) FROM bromides LIMIT 1');
      
      logger.debug('BromideModel health check passed');
    } catch (error) {
      const errorMsg = `BromideModel health check failed: ${error instanceof Error ? error.message : error}`;
      errors.push(errorMsg);
      logger.error(errorMsg);
    }

    return {
      isHealthy: errors.length === 0,
      tableName: 'bromides',
      errors
    };
  }

  async findByKey(key: string): Promise<Bromide> {
    return this.findByUniqueKey(key);
  }
} 