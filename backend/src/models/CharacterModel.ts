import { BaseModel, PaginationOptions, PaginatedResult } from './BaseModel';
import { Character } from '../types/database';
import { RowDataPacket } from 'mysql2';
import { executeQuery } from '../config/database';

export class CharacterModel extends BaseModel<Character> {
  constructor() {
    super('characters');
  }

  // Override to provide valid sort columns
  protected getValidSortColumns(): string[] {
    return ['id', 'unique_key', 'name_jp', 'name_en', 'name_cn', 'name_tw', 'name_kr'];
  }

  // Implementation of abstract mapRow method
  protected mapRow(row: RowDataPacket): Character {
    return {
      id: row.id,
      unique_key: row.unique_key,
      name_jp: row.name_jp,
      name_en: row.name_en,
      name_cn: row.name_cn,
      name_tw: row.name_tw,
      name_kr: row.name_kr,
      // Multi-language age fields
      age_jp: row.age_jp,
      age_en: row.age_en,
      age_cn: row.age_cn,
      age_tw: row.age_tw,
      age_kr: row.age_kr,
      // Multi-language birthday fields
      birthday_jp: row.birthday_jp,
      birthday_en: row.birthday_en,
      birthday_cn: row.birthday_cn,
      birthday_tw: row.birthday_tw,
      birthday_kr: row.birthday_kr,
      // Multi-language height fields
      height_jp: row.height_jp,
      height_en: row.height_en,
      height_cn: row.height_cn,
      height_tw: row.height_tw,
      height_kr: row.height_kr,
      // Multi-language measurements fields
      measurements_jp: row.measurements_jp,
      measurements_en: row.measurements_en,
      measurements_cn: row.measurements_cn,
      measurements_tw: row.measurements_tw,
      measurements_kr: row.measurements_kr,
      // Multi-language blood type fields
      blood_jp: row.blood_jp,
      blood_en: row.blood_en,
      blood_cn: row.blood_cn,
      blood_tw: row.blood_tw,
      blood_kr: row.blood_kr,
      // Multi-language job fields
      job_jp: row.job_jp,
      job_en: row.job_en,
      job_cn: row.job_cn,
      job_tw: row.job_tw,
      job_kr: row.job_kr,
      // Multi-language hobby fields
      hobby_jp: row.hobby_jp,
      hobby_en: row.hobby_en,
      hobby_cn: row.hobby_cn,
      hobby_tw: row.hobby_tw,
      hobby_kr: row.hobby_kr,
      // Multi-language food fields
      food_jp: row.food_jp,
      food_en: row.food_en,
      food_cn: row.food_cn,
      food_tw: row.food_tw,
      food_kr: row.food_kr,
      // Multi-language color fields
      color_jp: row.color_jp,
      color_en: row.color_en,
      color_cn: row.color_cn,
      color_tw: row.color_tw,
      color_kr: row.color_kr,
      // Multi-language cast/voice actor fields
      cast_jp: row.cast_jp,
      cast_en: row.cast_en,
      cast_cn: row.cast_cn,
      cast_tw: row.cast_tw,
      cast_kr: row.cast_kr,
    };
  }

  /**
   * Search characters across multi-language name fields
   */
  async searchMultiLanguage(
    searchTerm: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<Character>> {
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
   * Find characters by birthday month and/or day
   */
  async findByBirthday(
    month?: number,
    day?: number,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<Character>> {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const offset = (page - 1) * limit;

    // Sanitize sortBy to prevent SQL injection
    const sortBy = (options.sortBy || 'id').replace(/[^a-zA-Z0-9_]/g, '');
    const sortOrder = (options.sortOrder === 'DESC') ? 'DESC' : 'ASC';

    let whereClause = '';
    const params: any[] = [];

    if (month && day) {
      // Search for specific date (e.g., "6月6日", "June 6", "6月6日")
      const patterns = [
        `%${month}月${day}日%`,  // Japanese/Chinese: "6月6日"
        `%${month}/${day}%`,      // Numeric: "6/6"
        `%-${month}-${day}%`,     // ISO-like: "2000-06-06"
      ];
      whereClause = `WHERE (${patterns.map(() => 'birthday_jp LIKE ? OR birthday_en LIKE ? OR birthday_cn LIKE ? OR birthday_tw LIKE ? OR birthday_kr LIKE ?').join(' OR ')})`;
      patterns.forEach(pattern => {
        params.push(pattern, pattern, pattern, pattern, pattern);
      });
    } else if (month) {
      // Search for month only (e.g., "6月", "June")
      const patterns = [
        `%${month}月%`,           // Japanese/Chinese: "6月"
        `%/${month}/%`,           // Numeric: "/6/"
        `%-${String(month).padStart(2, '0')}-%`, // ISO-like: "-06-"
      ];
      whereClause = `WHERE (${patterns.map(() => 'birthday_jp LIKE ? OR birthday_en LIKE ? OR birthday_cn LIKE ? OR birthday_tw LIKE ? OR birthday_kr LIKE ?').join(' OR ')})`;
      patterns.forEach(pattern => {
        params.push(pattern, pattern, pattern, pattern, pattern);
      });
    }

    // Get total count
    const [countResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`,
      params
    );
    const total = (countResult as RowDataPacket[])[0].total;

    // Get paginated data - use direct values for LIMIT/OFFSET
    const [rows] = await executeQuery(
      `SELECT * FROM ${this.tableName} ${whereClause} ORDER BY ${sortBy} ${sortOrder} LIMIT ${limit} OFFSET ${offset}`,
      params
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
}