import { BaseModel, PaginationOptions, PaginatedResult } from './BaseModel';
import { Character, NewCharacter } from '../types/database';
import { executeQuery } from '@config/database';
import { AppError } from '@middleware/errorHandler';

export class CharacterModel extends BaseModel {
  constructor() {
    super('characters');
  }

  // Mapper function to convert database row to Character object
  private mapCharacterRow(row: any): Character {
    return {
      id: row.id,
      unique_key: row.unique_key,
      name_jp: row.name_jp,
      name_en: row.name_en,
      name_cn: row.name_cn,
      name_tw: row.name_tw,
      name_kr: row.name_kr,
      birthday: row.birthday,
      height: row.height,
      measurements: row.measurements,
      blood_type: row.blood_type,
      voice_actor_jp: row.voice_actor_jp,
      profile_image_url: row.profile_image_url,
      is_active: Boolean(row.is_active),
      game_version: row.game_version,
    };
  }

  async create(character: NewCharacter): Promise<Character> {
    try {
      const [result] = await executeQuery(
        `INSERT INTO characters (unique_key, name_jp, name_en, name_cn, name_tw, name_kr,
         birthday, height, measurements, blood_type, voice_actor_jp, profile_image_url, is_active, game_version)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          character.unique_key,
          character.name_jp,
          character.name_en,
          character.name_cn,
          character.name_tw,
          character.name_kr,
          character.birthday,
          character.height,
          character.measurements,
          character.blood_type,
          character.voice_actor_jp,
          character.profile_image_url,
          character.is_active ?? true,
          character.game_version,
        ]
      ) as [any, any];

      return this.findById(result.insertId);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError('Character with this unique_key already exists', 409);
      }
      throw new AppError('Failed to create character', 500);
    }
  }

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<Character>> {
    return this.getPaginatedResults(
      'SELECT * FROM characters WHERE is_active = TRUE',
      'SELECT COUNT(*) FROM characters WHERE is_active = TRUE',
      options,
      this.mapCharacterRow
    );
  }

  // Overload signatures
  async findById(id: number): Promise<Character>;
  async findById<T>(id: string | number, mapFunction: (row: any) => T): Promise<T>;
  
  // Implementation
  async findById<T = Character>(id: string | number, mapFunction?: (row: any) => T): Promise<T | Character> {
    if (mapFunction) {
      return super.findById<T>(id, mapFunction);
    }
    return super.findById<Character>(id as number, this.mapCharacterRow);
  }

  async findByUniqueKey(unique_key: string): Promise<Character> {
    const [rows] = await executeQuery('SELECT * FROM characters WHERE unique_key = ?', [unique_key]) as [any[], any];
    if (rows.length === 0) {
      throw new AppError('Character not found', 404);
    }
    return this.mapCharacterRow(rows[0]);
  }

  async update(id: number, updates: Partial<NewCharacter>): Promise<Character> {
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
    if (updates.birthday !== undefined) {
      setClause.push(`birthday = ?`);
      params.push(updates.birthday);
    }
    if (updates.height !== undefined) {
      setClause.push(`height = ?`);
      params.push(updates.height);
    }
    if (updates.measurements !== undefined) {
      setClause.push(`measurements = ?`);
      params.push(updates.measurements);
    }
    if (updates.blood_type !== undefined) {
      setClause.push(`blood_type = ?`);
      params.push(updates.blood_type);
    }
    if (updates.voice_actor_jp !== undefined) {
      setClause.push(`voice_actor_jp = ?`);
      params.push(updates.voice_actor_jp);
    }
    if (updates.profile_image_url !== undefined) {
      setClause.push(`profile_image_url = ?`);
      params.push(updates.profile_image_url);
    }
    if (updates.is_active !== undefined) {
      setClause.push(`is_active = ?`);
      params.push(updates.is_active);
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
      `UPDATE characters SET ${setClause.join(', ')} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.deleteById(id);
  }

  async search(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Character>> {
    const searchFields = ['name_jp', 'name_en', 'name_cn', 'name_tw', 'name_kr', 'unique_key'];
    return this.getOptimizedSearchResults(
      searchFields,
      query,
      options,
      this.mapCharacterRow,
      'is_active = TRUE'
    );
  }

  async findUpcomingBirthdays(days: number = 7): Promise<Character[]> {
    const [rows] = await executeQuery(
      `SELECT * FROM characters
       WHERE is_active = TRUE AND birthday IS NOT NULL
       AND DAYOFYEAR(birthday) BETWEEN DAYOFYEAR(NOW()) AND DAYOFYEAR(DATE_ADD(NOW(), INTERVAL ? DAY))
       ORDER BY DAYOFYEAR(birthday)`,
      [days]
    ) as [any[], any];

    return rows.map(this.mapCharacterRow);
  }

  async getCharacterSkills(characterId: number, options: PaginationOptions = {}): Promise<PaginatedResult<any>> {
    // Optimized query with proper indexing hints and reduced redundancy
    const query = `
      SELECT DISTINCT
        s.id,
        s.unique_key,
        s.name_jp,
        s.name_en,
        s.name_cn,
        s.name_tw,
        s.name_kr,
        s.description_en,
        s.skill_category,
        s.effect_type
      FROM skills s
      INNER JOIN swimsuit_skills ss ON s.id = ss.skill_id
      INNER JOIN swimsuits sw ON ss.swimsuit_id = sw.id
      WHERE sw.character_id = ?
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT s.id) as count
      FROM skills s
      INNER JOIN swimsuit_skills ss ON s.id = ss.skill_id
      INNER JOIN swimsuits sw ON ss.swimsuit_id = sw.id
      WHERE sw.character_id = ?
    `;

    return this.getPaginatedResults(
      query,
      countQuery,
      options,
      (row: any) => ({
        id: row.id,
        unique_key: row.unique_key,
        name_jp: row.name_jp,
        name_en: row.name_en,
        name_cn: row.name_cn,
        name_tw: row.name_tw,
        name_kr: row.name_kr,
        description_en: row.description_en,
        skill_category: row.skill_category,
        effect_type: row.effect_type
      }),
      [characterId]
    );
  }

  async getCharacterSwimsuits(characterId: number, options: PaginationOptions = {}): Promise<PaginatedResult<any>> {
    const query = `
      SELECT s.*, c.name_en as character_name
      FROM swimsuits s
      LEFT JOIN characters c ON s.character_id = c.id
      WHERE s.character_id = ?
    `;

    const countQuery = `
      SELECT COUNT(*) FROM swimsuits WHERE character_id = ?
    `;

    return this.getPaginatedResults(
      query,
      countQuery,
      options,
      (row: any) => ({
        id: row.id,
        character_id: row.character_id,
        unique_key: row.unique_key,
        name_jp: row.name_jp,
        name_en: row.name_en,
        name_cn: row.name_cn,
        name_tw: row.name_tw,
        name_kr: row.name_kr,
        description_en: row.description_en,
        rarity: row.rarity,
        suit_type: row.suit_type,
        total_stats_awakened: row.total_stats_awakened,
        has_malfunction: Boolean(row.has_malfunction),
        is_limited: Boolean(row.is_limited),
        release_date_gl: row.release_date_gl,
        game_version: row.game_version,
        character_name: row.character_name
      }),
      [characterId]
    );
  }

  async findByKey(key: string): Promise<Character> {
    return this.findByUniqueKey(key);
  }

  async healthCheck(): Promise<{ isHealthy: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      await executeQuery('SELECT 1');
      await executeQuery('SELECT COUNT(*) FROM characters LIMIT 1');
    } catch (error) {
      const errorMsg = `CharacterModel health check failed: ${error instanceof Error ? error.message : error}`;
      errors.push(errorMsg);
    }

    return {
      isHealthy: errors.length === 0,
      errors
    };
  }
}