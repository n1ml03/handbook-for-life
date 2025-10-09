import { BaseModel, PaginationOptions, PaginatedResult } from './BaseModel';
import { Episode } from '../types/database';
import { RowDataPacket } from 'mysql2';
import { executeQuery } from '../config/database';

export class EpisodeModel extends BaseModel<Episode> {
  constructor() {
    super('episodes');
  }

  // Override to provide valid sort columns
  protected getValidSortColumns(): string[] {
    return ['id', 'unique_key', 'title_jp', 'title_en', 'title_cn', 'title_tw', 'title_kr', 'type', 'episode_number'];
  }

  // Implementation of abstract mapRow method
  protected mapRow(row: RowDataPacket): Episode {
    return {
      id: row.id,
      unique_key: row.unique_key,
      name_jp: row.name_jp,
      name_en: row.name_en,
      name_cn: row.name_cn,
      name_tw: row.name_tw,
      name_kr: row.name_kr,
      type: row.type,
      release_data: row.release_data,
      release_version: row.release_version,
    };
  }

  /**
   * Search episodes across multi-language name fields
   */
  async searchMultiLanguage(
    searchTerm: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<Episode>> {
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
   * Find episodes by type
   */
  async findByType(
    type: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<Episode>> {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const offset = (page - 1) * limit;

    // Sanitize sortBy to prevent SQL injection
    const sortBy = (options.sortBy || 'id').replace(/[^a-zA-Z0-9_]/g, '');
    const sortOrder = (options.sortOrder === 'DESC') ? 'DESC' : 'ASC';

    // Get total count
    const [countResult] = await executeQuery(
      `SELECT COUNT(*) as total FROM ${this.tableName} WHERE type = ?`,
      [type]
    );
    const total = (countResult as RowDataPacket[])[0].total;

    // Get paginated data - use direct values for LIMIT/OFFSET
    const [rows] = await executeQuery(
      `SELECT * FROM ${this.tableName} WHERE type = ? ORDER BY ${sortBy} ${sortOrder} LIMIT ${limit} OFFSET ${offset}`,
      [type]
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
