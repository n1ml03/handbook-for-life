import { BaseModel, PaginationOptions, PaginatedResult } from './BaseModel';
import { Gacha, NewGacha, GachaSubtype } from '../types/database';
import { executeQuery } from '@config/database';
import { AppError } from '@middleware/errorHandler';

export class GachaModel extends BaseModel {
  constructor() {
    super('gachas');
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
      game_version: row.game_version,
      start_date: row.start_date,
      end_date: row.end_date,
    };
  }

  async create(gacha: NewGacha): Promise<Gacha> {
    try {
      const [result] = await executeQuery(
        `INSERT INTO gachas (unique_key, name_jp, name_en, name_cn, name_tw, name_kr, 
         gacha_subtype, game_version, start_date, end_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          gacha.unique_key,
          gacha.name_jp,
          gacha.name_en,
          gacha.name_cn,
          gacha.name_tw,
          gacha.name_kr,
          gacha.gacha_subtype,
          gacha.game_version,
          gacha.start_date,
          gacha.end_date,
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

  // Overload signatures
  async findById(id: number): Promise<Gacha>;
  async findById<T>(id: string | number, mapFunction: (row: any) => T): Promise<T>;
  
  // Implementation
  async findById<T = Gacha>(id: string | number, mapFunction?: (row: any) => T): Promise<T | Gacha> {
    if (mapFunction) {
      return super.findById<T>(id, mapFunction);
    }
    return super.findById<Gacha>(id as number, this.mapGachaRow);
  }

  async findByUniqueKey(unique_key: string): Promise<Gacha> {
    const [rows] = await executeQuery('SELECT * FROM gachas WHERE unique_key = ?', [unique_key]) as [any[], any];
    if (rows.length === 0) {
      throw new AppError('Gacha not found', 404);
    }
    return this.mapGachaRow(rows[0]);
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
    if (updates.start_date !== undefined) {
      setClause.push(`start_date = ?`);
      params.push(updates.start_date);
    }
    if (updates.end_date !== undefined) {
      setClause.push(`end_date = ?`);
      params.push(updates.end_date);
    }

    if (setClause.length === 0) {
      return this.findById(id);
    }

    params.push(id);

    await executeQuery(
      `UPDATE gachas SET ${setClause.join(', ')} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.deleteById(id);
  }

  async search(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Gacha>> {
    const searchPattern = `%${query}%`;
    return this.getPaginatedResults(
      `SELECT * FROM gachas WHERE 
       (name_jp LIKE ? OR name_en LIKE ? OR name_cn LIKE ? OR name_tw LIKE ? OR name_kr LIKE ? OR unique_key LIKE ?)`,
      `SELECT COUNT(*) FROM gachas WHERE 
       (name_jp LIKE ? OR name_en LIKE ? OR name_cn LIKE ? OR name_tw LIKE ? OR name_kr LIKE ? OR unique_key LIKE ?)`,
      options,
      this.mapGachaRow,
      [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]
    );
  }

  async findActive(options: PaginationOptions = {}): Promise<PaginatedResult<Gacha>> {
    return this.getPaginatedResults(
      `SELECT * FROM gachas WHERE NOW() BETWEEN start_date AND end_date`,
      `SELECT COUNT(*) FROM gachas WHERE NOW() BETWEEN start_date AND end_date`,
      options,
      this.mapGachaRow
    );
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
}
