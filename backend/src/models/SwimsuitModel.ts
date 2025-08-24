import { BaseModel, PaginationOptions, PaginatedResult } from './BaseModel';
import { Swimsuit, NewSwimsuit, SwimsuitRarity, SuitType } from '../types/database';
import { executeQuery } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class SwimsuitModel extends BaseModel<Swimsuit, NewSwimsuit> {
  constructor() {
    super('swimsuits');
  }

  // Implementation of abstract methods
  protected mapRow(row: any): Swimsuit {
    return {
      id: row.id,
      character_id: row.character_id,
      unique_key: row.unique_key,
      name_jp: row.name_jp,
      name_en: row.name_en,
      name_cn: row.name_cn,
      name_tw: row.name_tw,
      name_kr: row.name_kr,
      description_en: row.description_en,
      rarity: row.rarity as SwimsuitRarity,
      suit_type: row.suit_type as SuitType,
      total_stats_awakened: row.total_stats_awakened,
      has_malfunction: Boolean(row.has_malfunction),
      is_limited: Boolean(row.is_limited),
      release_date_gl: row.release_date_gl,
      game_version: row.game_version,
      image_before_data: row.image_before_data,
      image_before_mime_type: row.image_before_mime_type,
      image_after_data: row.image_after_data,
      image_after_mime_type: row.image_after_mime_type,
    };
  }

  protected getCreateFields(): (keyof NewSwimsuit)[] {
    return [
      'character_id',
      'unique_key',
      'name_jp',
      'name_en',
      'name_cn',
      'name_tw',
      'name_kr',
      'description_en',
      'rarity',
      'suit_type',
      'total_stats_awakened',
      'has_malfunction',
      'is_limited',
      'release_date_gl',
      'game_version',
      'image_before_data',
      'image_before_mime_type',
      'image_after_data',
      'image_after_mime_type',
    ];
  }

  protected getUpdateFields(): (keyof NewSwimsuit)[] {
    return this.getCreateFields();
  }

  async create(swimsuit: NewSwimsuit): Promise<Swimsuit> {
    try {
      const [result] = await executeQuery(
        `INSERT INTO swimsuits (character_id, unique_key, name_jp, name_en, name_cn, name_tw, name_kr,
         description_en, rarity, suit_type, total_stats_awakened, has_malfunction, is_limited, release_date_gl, game_version,
         image_before_data, image_before_mime_type, image_after_data, image_after_mime_type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          swimsuit.character_id,
          swimsuit.unique_key,
          swimsuit.name_jp,
          swimsuit.name_en,
          swimsuit.name_cn,
          swimsuit.name_tw,
          swimsuit.name_kr,
          swimsuit.description_en,
          swimsuit.rarity,
          swimsuit.suit_type,
          swimsuit.total_stats_awakened ?? 0,
          swimsuit.has_malfunction ?? false,
          swimsuit.is_limited ?? true,
          swimsuit.release_date_gl,
          swimsuit.game_version,
          swimsuit.image_before_data,
          swimsuit.image_before_mime_type,
          swimsuit.image_after_data,
          swimsuit.image_after_mime_type,
        ]
      ) as [any, any];

      return this.findById(result.insertId);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError('Swimsuit with this unique_key already exists', 409);
      }
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new AppError('Character not found', 400);
      }
      throw new AppError('Failed to create swimsuit', 500);
    }
  }

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    return this.getPaginatedResults(
      'SELECT * FROM swimsuits',
      'SELECT COUNT(*) FROM swimsuits',
      options
    );
  }

  // New method to get swimsuits with character information
  async findAllWithCharacters(options: PaginationOptions = {}): Promise<PaginatedResult<any>> {
    const query = `
      SELECT 
        s.*,
        c.name_en as character_name_en,
        c.name_jp as character_name_jp,
        c.unique_key as character_unique_key
      FROM swimsuits s
      LEFT JOIN characters c ON s.character_id = c.id
    `;
    
    const countQuery = 'SELECT COUNT(*) FROM swimsuits s LEFT JOIN characters c ON s.character_id = c.id';
    
    return this.getPaginatedResults(query, countQuery, options, this.mapRowWithCharacter.bind(this));
  }

  // Map row with character data
  protected mapRowWithCharacter(row: any): any {
    return {
      ...this.mapRow(row),
      character: {
        name_en: row.character_name_en || 'Unknown Character',
        name_jp: row.character_name_jp || '',
        unique_key: row.character_unique_key || ''
      }
    };
  }

  // Override findById to use proper typing
  async findById(id: number): Promise<Swimsuit> {
    return super.findById(id);
  }

  async findByUniqueKey(unique_key: string): Promise<Swimsuit> {
    const [rows] = await executeQuery('SELECT * FROM swimsuits WHERE unique_key = ?', [unique_key]) as [any[], any];
    if (rows.length === 0) {
      throw new AppError('Swimsuit not found', 404);
    }
    return this.mapRow(rows[0]);
  }

  async findByCharacterId(character_id: number, options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    return this.getPaginatedResults(
      'SELECT * FROM swimsuits WHERE character_id = ?',
      'SELECT COUNT(*) FROM swimsuits WHERE character_id = ?',
      options,
      undefined,
      [character_id]
    );
  }

  async findByRarity(rarity: SwimsuitRarity, options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    return this.getPaginatedResults(
      'SELECT * FROM swimsuits WHERE rarity = ?',
      'SELECT COUNT(*) FROM swimsuits WHERE rarity = ?',
      options,
      undefined,
      [rarity]
    );
  }

  async findBySuitType(suit_type: SuitType, options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    return this.getPaginatedResults(
      'SELECT * FROM swimsuits WHERE suit_type = ?',
      'SELECT COUNT(*) FROM swimsuits WHERE suit_type = ?',
      options,
      undefined,
      [suit_type]
    );
  }

  async findLimitedSwimsuits(options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    return this.getPaginatedResults(
      'SELECT * FROM swimsuits WHERE is_limited = TRUE',
      'SELECT COUNT(*) FROM swimsuits WHERE is_limited = TRUE',
      options
    );
  }

  async findWithMalfunction(options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    return this.getPaginatedResults(
      'SELECT * FROM swimsuits WHERE has_malfunction = TRUE',
      'SELECT COUNT(*) FROM swimsuits WHERE has_malfunction = TRUE',
      options
    );
  }

  async update(id: number, updates: Partial<NewSwimsuit>): Promise<Swimsuit> {
    const setClause: string[] = [];
    const params: any[] = [];

    if (updates.character_id !== undefined) {
      setClause.push(`character_id = ?`);
      params.push(updates.character_id);
    }
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
    if (updates.description_en !== undefined) {
      setClause.push(`description_en = ?`);
      params.push(updates.description_en);
    }
    if (updates.rarity !== undefined) {
      setClause.push(`rarity = ?`);
      params.push(updates.rarity);
    }
    if (updates.suit_type !== undefined) {
      setClause.push(`suit_type = ?`);
      params.push(updates.suit_type);
    }
    if (updates.total_stats_awakened !== undefined) {
      setClause.push(`total_stats_awakened = ?`);
      params.push(updates.total_stats_awakened);
    }
    if (updates.has_malfunction !== undefined) {
      setClause.push(`has_malfunction = ?`);
      params.push(updates.has_malfunction);
    }
    if (updates.is_limited !== undefined) {
      setClause.push(`is_limited = ?`);
      params.push(updates.is_limited);
    }
    if (updates.release_date_gl !== undefined) {
      setClause.push(`release_date_gl = ?`);
      params.push(updates.release_date_gl);
    }
    if (updates.game_version !== undefined) {
      setClause.push(`game_version = ?`);
      params.push(updates.game_version);
    }
    if (updates.image_before_data !== undefined) {
      setClause.push(`image_before_data = ?`);
      params.push(updates.image_before_data);
    }
    if (updates.image_before_mime_type !== undefined) {
      setClause.push(`image_before_mime_type = ?`);
      params.push(updates.image_before_mime_type);
    }
    if (updates.image_after_data !== undefined) {
      setClause.push(`image_after_data = ?`);
      params.push(updates.image_after_data);
    }
    if (updates.image_after_mime_type !== undefined) {
      setClause.push(`image_after_mime_type = ?`);
      params.push(updates.image_after_mime_type);
    }

    if (setClause.length === 0) {
      return this.findById(id);
    }

    params.push(id);

    await executeQuery(
      `UPDATE swimsuits SET ${setClause.join(', ')} WHERE id = ?`,
      params
    );

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
  ): Promise<PaginatedResult<Swimsuit>> {
    return super.search(searchFields, query, options, additionalWhere);
  }

  // Convenience search method for swimsuits
  async searchSwimsuits(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    const searchFields = ['name_jp', 'name_en', 'name_cn', 'name_tw', 'name_kr', 'unique_key'];
    return this.search(searchFields, query, options);
  }

  async getTopStatsSwimsuits(limit: number = 10): Promise<Swimsuit[]> {
    const [rows] = await executeQuery(
      'SELECT * FROM swimsuits ORDER BY total_stats_awakened DESC LIMIT ?',
      [limit]
    ) as [any[], any];
    
    return rows.map(row => this.mapRow(row));
  }

  async findByCharacter(characterId: number, options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    return this.findByCharacterId(characterId, options);
  }

  async findByType(suitType: SuitType, options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    return this.findBySuitType(suitType, options);
  }

  async findByKey(key: string): Promise<Swimsuit> {
    return this.findByUniqueKey(key);
  }

  async healthCheck(): Promise<{ isHealthy: boolean; tableName: string; errors: string[] }> {
    const errors: string[] = [];

    try {
      await executeQuery('SELECT 1');
      await executeQuery('SELECT COUNT(*) FROM swimsuits LIMIT 1');
    } catch (error) {
      const errorMsg = `SwimsuitModel health check failed: ${error instanceof Error ? error.message : error}`;
      errors.push(errorMsg);
    }

    return {
      isHealthy: errors.length === 0,
      tableName: 'swimsuits',
      errors
    };
  }
} 