import { BaseModel, PaginationOptions, PaginatedResult } from './BaseModel';
import { Swimsuit, NewSwimsuit, SwimsuitRarity, SuitType } from '../types/database';
import { executeQuery } from '@config/database';
import { AppError } from '@middleware/errorHandler';

export class SwimsuitModel extends BaseModel {
  constructor() {
    super('swimsuits');
  }

  // Mapper function to convert database row to Swimsuit object
  private mapSwimsuitRow(row: any): Swimsuit {
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
    };
  }

  async create(swimsuit: NewSwimsuit): Promise<Swimsuit> {
    try {
      const [result] = await executeQuery(
        `INSERT INTO swimsuits (character_id, unique_key, name_jp, name_en, name_cn, name_tw, name_kr,
         description_en, rarity, suit_type, total_stats_awakened, has_malfunction, is_limited, release_date_gl)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      options,
      this.mapSwimsuitRow
    );
  }

  async findById(id: number): Promise<Swimsuit>;
  async findById<T>(id: string | number, mapFunction: (row: any) => T): Promise<T>;
  
  async findById<T = Swimsuit>(id: string | number, mapFunction?: (row: any) => T): Promise<T | Swimsuit> {
    if (mapFunction) {
      return super.findById<T>(id, mapFunction);
    }
    return super.findById<Swimsuit>(id as number, this.mapSwimsuitRow);
  }

  async findByUniqueKey(unique_key: string): Promise<Swimsuit> {
    const [rows] = await executeQuery('SELECT * FROM swimsuits WHERE unique_key = ?', [unique_key]) as [any[], any];
    if (rows.length === 0) {
      throw new AppError('Swimsuit not found', 404);
    }
    return this.mapSwimsuitRow(rows[0]);
  }

  async findByCharacterId(character_id: number, options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    return this.getPaginatedResults(
      'SELECT * FROM swimsuits WHERE character_id = ?',
      'SELECT COUNT(*) FROM swimsuits WHERE character_id = ?',
      options,
      this.mapSwimsuitRow,
      [character_id]
    );
  }

  async findByRarity(rarity: SwimsuitRarity, options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    return this.getPaginatedResults(
      'SELECT * FROM swimsuits WHERE rarity = ?',
      'SELECT COUNT(*) FROM swimsuits WHERE rarity = ?',
      options,
      this.mapSwimsuitRow,
      [rarity]
    );
  }

  async findBySuitType(suit_type: SuitType, options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    return this.getPaginatedResults(
      'SELECT * FROM swimsuits WHERE suit_type = ?',
      'SELECT COUNT(*) FROM swimsuits WHERE suit_type = ?',
      options,
      this.mapSwimsuitRow,
      [suit_type]
    );
  }

  async findLimitedSwimsuits(options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    return this.getPaginatedResults(
      'SELECT * FROM swimsuits WHERE is_limited = TRUE',
      'SELECT COUNT(*) FROM swimsuits WHERE is_limited = TRUE',
      options,
      this.mapSwimsuitRow
    );
  }

  async findWithMalfunction(options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    return this.getPaginatedResults(
      'SELECT * FROM swimsuits WHERE has_malfunction = TRUE',
      'SELECT COUNT(*) FROM swimsuits WHERE has_malfunction = TRUE',
      options,
      this.mapSwimsuitRow
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
    await this.deleteById(id);
  }

  async search(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Swimsuit>> {
    const searchPattern = `%${query}%`;
    return this.getPaginatedResults(
      `SELECT * FROM swimsuits WHERE 
       name_jp LIKE ? OR name_en LIKE ? OR name_cn LIKE ? OR name_tw LIKE ? OR name_kr LIKE ? OR unique_key LIKE ?`,
      `SELECT COUNT(*) FROM swimsuits WHERE 
       name_jp LIKE ? OR name_en LIKE ? OR name_cn LIKE ? OR name_tw LIKE ? OR name_kr LIKE ? OR unique_key LIKE ?`,
      options,
      this.mapSwimsuitRow,
      [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]
    );
  }

  async getTopStatsSwimsuits(limit: number = 10): Promise<Swimsuit[]> {
    const [rows] = await executeQuery(
      'SELECT * FROM swimsuits ORDER BY total_stats_awakened DESC LIMIT ?',
      [limit]
    ) as [any[], any];
    
    return rows.map(this.mapSwimsuitRow);
  }
} 