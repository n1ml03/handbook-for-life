import { BaseModel, PaginationOptions, PaginatedResult } from './BaseModel';
import { Swimsuit } from '../types/database';
import { RowDataPacket } from 'mysql2';
import { executeQuery } from '../config/database';

export class SwimsuitModel extends BaseModel<Swimsuit> {
  constructor() {
    super('swimsuits');
  }

  // Override to provide valid sort columns
  protected getValidSortColumns(): string[] {
    return ['id', 'unique_key', 'name_jp', 'name_en', 'name_cn', 'name_tw', 'name_kr', 'character_key', 'rarity', 'attribute', 'max_level', 'max_pow', 'max_tec', 'max_stm', 'max_apl'];
  }

  // Implementation of abstract mapRow method with embedded skills
  protected mapRow(row: RowDataPacket): Swimsuit {
    return {
      id: row.id,
      unique_key: row.unique_key,
      unique_msg_key: row.unique_msg_key,
      name_jp: row.name_jp,
      name_en: row.name_en,
      name_cn: row.name_cn,
      name_tw: row.name_tw,
      name_kr: row.name_kr,
      character_key: row.character_key,
      rarity: row.rarity,
      attribute: row.attribute,
      max_level: row.max_level,
      // Base stats
      base_pow: row.base_pow,
      max_pow: row.max_pow,
      pow_growth: row.pow_growth,
      base_tec: row.base_tec,
      max_tex: row.max_tex,
      tec_growth: row.tec_growth,
      base_stm: row.base_stm,
      max_stm: row.max_stm,
      stm_growth: row.stm_growth,
      base_apl: row.base_apl,
      max_apl: row.max_apl,
      apl_growth: row.apl_growth,
      // Embedded Skill 1
      skill_id_1: row.skill_id_1,
      skill_key_1: row.skill_key_1,
      skill_name_jp_1: row.skill_name_jp_1,
      skill_name_en_1: row.skill_name_en_1,
      skill_name_cn_1: row.skill_name_cn_1,
      skill_name_tw_1: row.skill_name_tw_1,
      skill_name_kr_1: row.skill_name_kr_1,
      skill_des_1: row.skill_des_1,
      skill_des_jp_1: row.skill_des_jp_1,
      skill_des_en_1: row.skill_des_en_1,
      skill_des_cn_1: row.skill_des_cn_1,
      skill_des_tw_1: row.skill_des_tw_1,
      skill_des_kr_1: row.skill_des_kr_1,
      // Embedded Skill 2
      skill_id_2: row.skill_id_2,
      skill_key_2: row.skill_key_2,
      skill_name_jp_2: row.skill_name_jp_2,
      skill_name_en_2: row.skill_name_en_2,
      skill_name_cn_2: row.skill_name_cn_2,
      skill_name_tw_2: row.skill_name_tw_2,
      skill_name_kr_2: row.skill_name_kr_2,
      skill_des_2: row.skill_des_2,
      skill_des_jp_2: row.skill_des_jp_2,
      skill_des_en_2: row.skill_des_en_2,
      skill_des_cn_2: row.skill_des_cn_2,
      skill_des_tw_2: row.skill_des_tw_2,
      skill_des_kr_2: row.skill_des_kr_2,
      // Embedded Skill 3
      skill_id_3: row.skill_id_3,
      skill_key_3: row.skill_key_3,
      skill_name_jp_3: row.skill_name_jp_3,
      skill_name_en_3: row.skill_name_en_3,
      skill_name_cn_3: row.skill_name_cn_3,
      skill_name_tw_3: row.skill_name_tw_3,
      skill_name_kr_3: row.skill_name_kr_3,
      skill_des_3: row.skill_des_3,
      skill_des_jp_3: row.skill_des_jp_3,
      skill_des_en_3: row.skill_des_en_3,
      skill_des_cn_3: row.skill_des_cn_3,
      skill_des_tw_3: row.skill_des_tw_3,
      skill_des_kr_3: row.skill_des_kr_3,
      // Bromide references
      bromide: row.bromide,
      cossbreak_bromide: row.cossbreak_bromide,
    };
  }

  /**
   * Search swimsuits across multi-language name fields
   */
  async searchMultiLanguage(
    searchTerm: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<Swimsuit>> {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const offset = (page - 1) * limit;

    // Sanitize sortBy to prevent SQL injection
    const sortBy = (options.sortBy || 'id').replace(/[^a-zA-Z0-9_]/g, '');
    const sortOrder = (options.sortOrder === 'DESC') ? 'DESC' : 'ASC';

    const searchPattern = `%${searchTerm}%`;

    // Get total count
    const [countResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM ${this.tableName}
       WHERE name_jp LIKE ? OR name_en LIKE ? OR name_cn LIKE ? OR name_tw LIKE ? OR name_kr LIKE ?`,
      [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]
    );
    const total = (countResult as RowDataPacket[])[0].total;

    // Get paginated data - use direct values for LIMIT/OFFSET
    const [rows] = await executeQuery(
      `SELECT * FROM ${this.tableName}
       WHERE name_jp LIKE ? OR name_en LIKE ? OR name_cn LIKE ? OR name_tw LIKE ? OR name_kr LIKE ?
       ORDER BY ${sortBy} ${sortOrder} LIMIT ${limit} OFFSET ${offset}`,
      [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]
    );

    const data = (rows as RowDataPacket[]).map(row => this.mapRow(row));
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Find swimsuits by character key
   */
  async findByCharacterKey(
    characterKey: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<Swimsuit>> {
    // NOTE: The swimsuits table does not have a character_key column in the current database schema
    // This method returns an empty result until the schema is updated
    // TODO: Add character_key column to swimsuits table or implement JOIN with characters table

    const page = options.page || 1;
    const limit = options.limit || 50;

    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    };
  }

  /**
   * Get top swimsuits sorted by maximum stats
   */
  async getTopByStats(
    statType: 'pow' | 'tec' | 'stm' | 'apl' | 'total' = 'total',
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<Swimsuit>> {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const offset = (page - 1) * limit;

    let orderByClause: string;
    if (statType === 'total') {
      orderByClause = '(COALESCE(max_pow, 0) + COALESCE(max_tec, 0) + COALESCE(max_stm, 0) + COALESCE(max_apl, 0)) DESC';
    } else {
      orderByClause = `max_${statType} DESC`;
    }

    // Get total count
    const [countResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM ${this.tableName}`
    );
    const total = (countResult as RowDataPacket[])[0].total;

    // Get paginated data - use direct values for LIMIT/OFFSET
    const [rows] = await executeQuery(
      `SELECT * FROM ${this.tableName} ORDER BY ${orderByClause} LIMIT ${limit} OFFSET ${offset}`
    );

    const data = (rows as RowDataPacket[]).map(row => this.mapRow(row));
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Count swimsuits by rarity
   */
  async countByRarity(): Promise<Record<string, number>> {
    const [rows] = await executeQuery(
      `SELECT rarity, COUNT(*) as count FROM ${this.tableName} WHERE rarity IS NOT NULL GROUP BY rarity`
    );

    const result: Record<string, number> = {};
    (rows as RowDataPacket[]).forEach(row => {
      result[row.rarity] = row.count;
    });

    return result;
  }
}