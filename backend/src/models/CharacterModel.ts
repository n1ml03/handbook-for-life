import { BaseModel, PaginationOptions, PaginatedResult } from './BaseModel';
import { Character, NewCharacter } from '../types/database';
import { executeQuery } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class CharacterModel extends BaseModel<Character, NewCharacter> {
  constructor() {
    super('characters');
  }

  // Implementation of abstract methods
  protected mapRow(row: any): Character {
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
      profile_image_data: row.profile_image_data,
      profile_image_mime_type: row.profile_image_mime_type,
      is_active: Boolean(row.is_active),
      game_version: row.game_version,
    };
  }

  protected getCreateFields(): (keyof NewCharacter)[] {
    return [
      'unique_key',
      'name_jp',
      'name_en',
      'name_cn',
      'name_tw',
      'name_kr',
      'birthday',
      'height',
      'measurements',
      'blood_type',
      'voice_actor_jp',
      'profile_image_data',
      'profile_image_mime_type',
      'is_active',
      'game_version'
    ];
  }

  protected getUpdateFields(): (keyof NewCharacter)[] {
    return this.getCreateFields(); // Same fields can be updated
  }

  // Override mapSortColumn to handle specific sorting requirements
  protected mapSortColumn(sortBy: string): string | null {
    const columnMapping: { [key: string]: string } = {
      // Character fields
      'name': 'name_en',
      'name_en': 'name_en',
      'name_jp': 'name_jp',
      'birthday': 'birthday',
      'height': 'height',
      'unique_key': 'unique_key',
      'is_active': 'is_active',
      
      // Swimsuit fields
      'rarity': 'rarity',
      'suit_type': 'suit_type',
      'total_stats_awakened': 'total_stats_awakened',
      'has_malfunction': 'has_malfunction',
      'is_limited': 'is_limited',
      'release_date_gl': 'release_date_gl',
      
      // Skill fields
      'skill_category': 'skill_category',
      'effect_type': 'effect_type',
      'game_version': 'game_version',
      'skill_slot': 'skill_slot',
      
      // Default ID sorting
      'id': 'id'
    };

    return columnMapping[sortBy] || 'id';
  }

  // Override base methods to add character-specific logic
  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<Character>> {
    return this.getPaginatedResults(
      'SELECT * FROM characters WHERE is_active = TRUE',
      'SELECT COUNT(*) FROM characters WHERE is_active = TRUE',
      options
    );
  }

  async findByUniqueKey(unique_key: string): Promise<Character> {
    const [rows] = await executeQuery('SELECT * FROM characters WHERE unique_key = ?', [unique_key]) as [any[], any];
    if (rows.length === 0) {
      throw new AppError('Character not found', 404);
    }
    return this.mapRow(rows[0]);
  }

  // Character-specific search with active filter
  async search(
    searchFields: string[],
    query: string,
    options: PaginationOptions = {},
    additionalWhere?: string
  ): Promise<PaginatedResult<Character>> {
    const activeFilter = additionalWhere ? `is_active = TRUE AND (${additionalWhere})` : 'is_active = TRUE';
    return super.search(searchFields, query, options, activeFilter);
  }

  // Convenience search method for characters
  async searchCharacters(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Character>> {
    const searchFields = ['name_jp', 'name_en', 'name_cn', 'name_tw', 'name_kr', 'unique_key'];
    return this.search(searchFields, query, options);
  }

  async findUpcomingBirthdays(days: number = 7): Promise<Character[]> {
    const [rows] = await executeQuery(
      `SELECT * FROM characters
       WHERE is_active = TRUE AND birthday IS NOT NULL
       AND DAYOFYEAR(birthday) BETWEEN DAYOFYEAR(NOW()) AND DAYOFYEAR(DATE_ADD(NOW(), INTERVAL ? DAY))
       ORDER BY DAYOFYEAR(birthday)`,
      [days]
    ) as [any[], any];

    return rows.map(row => this.mapRow(row));
  }

  async getCharacterSwimsuits(characterId: number, options: PaginationOptions = {}): Promise<PaginatedResult<any>> {
    // Set default sorting for swimsuits if not specified
    const defaultOptions = {
      ...options,
      sortBy: options.sortBy || 'rarity',
      sortOrder: options.sortOrder || 'desc' as 'desc'
    };

    const query = `
      SELECT DISTINCT
        s.id,
        s.character_id,
        s.unique_key,
        s.name_jp,
        s.name_en,
        s.name_cn,
        s.name_tw,
        s.name_kr,
        s.rarity,
        s.suit_type,
        s.total_stats_awakened,
        s.has_malfunction,
        s.is_limited,
        s.release_date_gl
      FROM swimsuits s
      WHERE s.character_id = ?`;

    const countQuery = `
      SELECT COUNT(DISTINCT s.id) as count
      FROM swimsuits s
      WHERE s.character_id = ?`;

    return this.getPaginatedResults(
      query,
      countQuery,
      defaultOptions,
      (row: any) => ({
        id: row.id,
        character_id: row.character_id,
        unique_key: row.unique_key,
        name_jp: row.name_jp,
        name_en: row.name_en,
        name_cn: row.name_cn,
        name_tw: row.name_tw,
        name_kr: row.name_kr,
        rarity: row.rarity,
        suit_type: row.suit_type,
        total_stats_awakened: row.total_stats_awakened,
        has_malfunction: Boolean(row.has_malfunction),
        is_limited: Boolean(row.is_limited),
        release_date_gl: row.release_date_gl,
      }),
      [characterId]
    );
  }

  async getCharacterSkills(characterId: number, options: PaginationOptions = {}): Promise<PaginatedResult<any>> {
    // Set default sorting for skills if not specified
    const defaultOptions = {
      ...options,
      sortBy: options.sortBy || 'skill_category',
      sortOrder: options.sortOrder || 'asc' as 'asc'
    };

    const query = `
      SELECT DISTINCT
        sk.id,
        sk.unique_key,
        sk.name_jp,
        sk.name_en,
        sk.name_cn,
        sk.name_tw,
        sk.name_kr,
        sk.description_en,
        sk.skill_category,
        sk.effect_type,
        sk.game_version,
        ss.skill_slot,
        s.unique_key as swimsuit_key,
        s.name_en as swimsuit_name
      FROM skills sk
      JOIN swimsuit_skills ss ON sk.id = ss.skill_id
      JOIN swimsuits s ON ss.swimsuit_id = s.id
      WHERE s.character_id = ?`;

    const countQuery = `
      SELECT COUNT(DISTINCT sk.id) as count
      FROM skills sk
      JOIN swimsuit_skills ss ON sk.id = ss.skill_id
      JOIN swimsuits s ON ss.swimsuit_id = s.id
      WHERE s.character_id = ?`;

    return this.getPaginatedResults(
      query,
      countQuery,
      defaultOptions,
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
        effect_type: row.effect_type,
        game_version: row.game_version,
        skill_slot: row.skill_slot,
        swimsuit_key: row.swimsuit_key,
        swimsuit_name: row.swimsuit_name,
      }),
      [characterId]
    );
  }

  // Convenience method for compatibility
  async findByKey(key: string): Promise<Character> {
    return this.findByUniqueKey(key);
  }

  async healthCheck(): Promise<{ isHealthy: boolean; tableName: string; errors: string[] }> {
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
      tableName: 'characters',
      errors
    };
  }
}