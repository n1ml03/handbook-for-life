import { BaseModel, PaginationOptions, PaginatedResult } from './BaseModel';
import { Gacha, NewGacha, GachaSubtype } from '../types/database';
import { executeQuery } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export class GachaModel extends BaseModel<Gacha, NewGacha> {
  constructor() {
    super('gachas');
  }

  // Implementation of abstract methods
  protected mapRow(row: any): Gacha {
    return {
      id: row.id,
      unique_key: row.unique_key,
      name_jp: row.name_jp,
      name_en: row.name_en,
      name_cn: row.name_cn,
      name_tw: row.name_tw,
      name_kr: row.name_kr,
      gacha_subtype: row.gacha_subtype,
      start_date: new Date(row.start_date),
      end_date: new Date(row.end_date),
      game_version: row.game_version,
      banner_image_data: row.banner_image_data,
      banner_image_mime_type: row.banner_image_mime_type,
    };
  }

  protected getCreateFields(): (keyof NewGacha)[] {
    return [
      'unique_key',
      'name_jp',
      'name_en',
      'name_cn',
      'name_tw',
      'name_kr',
      'gacha_subtype',
      'start_date',
      'end_date',
      'game_version',
      'banner_image_data',
      'banner_image_mime_type'
    ];
  }

  protected getUpdateFields(): (keyof NewGacha)[] {
    return this.getCreateFields(); // Same fields can be updated
  }

  // Mapper function to convert database row to Gacha object
  private mapGachaRow(row: any): Gacha {
    return {
      id: row.id,
      unique_key: row.unique_key,
      name_jp: row.name_jp,
      name_en: row.name_en,
      name_cn: row.name_cn,
      name_tw: row.name_tw,
      name_kr: row.name_kr,
      gacha_subtype: row.gacha_subtype as GachaSubtype,
      start_date: row.start_date,
      end_date: row.end_date,
      game_version: row.game_version,
      banner_image_data: row.banner_image_data,
      banner_image_mime_type: row.banner_image_mime_type,
    };
  }

  async create(gacha: NewGacha): Promise<Gacha> {
    try {
      const [result] = await executeQuery(
        `INSERT INTO gachas (unique_key, name_jp, name_en, name_cn, name_tw, name_kr,
         gacha_subtype, start_date, end_date, game_version, banner_image_data, banner_image_mime_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          gacha.unique_key,
          gacha.name_jp,
          gacha.name_en,
          gacha.name_cn,
          gacha.name_tw,
          gacha.name_kr,
          gacha.gacha_subtype,
          gacha.start_date,
          gacha.end_date,
          gacha.game_version,
          gacha.banner_image_data,
          gacha.banner_image_mime_type,
        ]
      ) as [any, any];

      return this.findById(result.insertId);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError('Gacha with this unique_key already exists', 409);
      }
      throw new AppError('Failed to create gacha', 500);
    }
  }

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<Gacha>> {
    return this.getPaginatedResults(
      'SELECT * FROM gachas',
      'SELECT COUNT(*) FROM gachas',
      options,
      this.mapGachaRow
    );
  }

  // Override findById to use proper typing
  async findById(id: number): Promise<Gacha> {
    return super.findById(id);
  }

  async findByUniqueKey(unique_key: string): Promise<Gacha> {
    const [rows] = await executeQuery('SELECT * FROM gachas WHERE unique_key = ?', [unique_key]) as [any[], any];
    if (rows.length === 0) {
      throw new AppError('Gacha not found', 404);
    }
    return this.mapGachaRow(rows[0]);
  }

  async findByType(gacha_type: string, options: PaginationOptions = {}): Promise<PaginatedResult<Gacha>> {
    return this.getPaginatedResults(
      'SELECT * FROM gachas WHERE gacha_type = ?',
      'SELECT COUNT(*) FROM gachas WHERE gacha_type = ?',
      options,
      this.mapGachaRow,
      [gacha_type]
    );
  }

  async findActive(options: PaginationOptions = {}): Promise<PaginatedResult<Gacha>> {
    return this.getPaginatedResults(
      'SELECT * FROM gachas WHERE is_active = TRUE',
      'SELECT COUNT(*) FROM gachas WHERE is_active = TRUE',
      options,
      this.mapGachaRow
    );
  }

  async update(id: number, updates: Partial<NewGacha>): Promise<Gacha> {
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
    if (updates.gacha_subtype !== undefined) {
      setClause.push(`gacha_subtype = ?`);
      params.push(updates.gacha_subtype);
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
      `UPDATE gachas SET ${setClause.join(', ')} WHERE id = ?`,
      params
    );

    logger.info(`Gacha updated: ${id}`);
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
  ): Promise<PaginatedResult<Gacha>> {
    return super.search(searchFields, query, options, additionalWhere);
  }

  // Convenience search method for gachas
  async searchGachas(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Gacha>> {
    const searchFields = ['name_jp', 'name_en', 'name_cn', 'name_tw', 'name_kr', 'unique_key'];
    return this.search(searchFields, query, options);
  }

  async findBySubtype(subtype: GachaSubtype, options: PaginationOptions = {}): Promise<PaginatedResult<Gacha>> {
    return this.getPaginatedResults(
      `SELECT * FROM gachas WHERE gacha_subtype = ?`,
      `SELECT COUNT(*) FROM gachas WHERE gacha_subtype = ?`,
      options,
      this.mapGachaRow,
      [subtype]
    );
  }

  async findByDateRange(startDate: Date, endDate: Date, options: PaginationOptions = {}): Promise<PaginatedResult<Gacha>> {
    return this.getPaginatedResults(
      `SELECT * FROM gachas WHERE start_date >= ? AND end_date <= ?`,
      `SELECT COUNT(*) FROM gachas WHERE start_date >= ? AND end_date <= ?`,
      options,
      this.mapGachaRow,
      [startDate, endDate]
    );
  }

  async findByKey(key: string): Promise<Gacha> {
    return this.findByUniqueKey(key);
  }

  async healthCheck(): Promise<{ isHealthy: boolean; tableName: string; errors: string[] }> {
    const errors: string[] = [];

    try {
      await executeQuery('SELECT 1');
      await executeQuery('SELECT COUNT(*) FROM gachas LIMIT 1');
    } catch (error) {
      const errorMsg = `GachaModel health check failed: ${error instanceof Error ? error.message : error}`;
      errors.push(errorMsg);
    }

    return {
      isHealthy: errors.length === 0,
      tableName: 'gachas',
      errors
    };
  }
}
