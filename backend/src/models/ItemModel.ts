import { BaseModel, PaginationOptions, PaginatedResult } from './BaseModel';
import { Item } from '../types/database';
import { RowDataPacket } from 'mysql2';
import { executeQuery } from '../config/database';

export class ItemModel extends BaseModel<Item> {
  constructor() {
    super('items');
  }

  // Implementation of abstract mapRow method
  protected mapRow(row: RowDataPacket): Item {
    return {
      id: row.id,
      unique_key: row.unique_key,
      name_jp: row.name_jp,
      name_en: row.name_en,
      name_cn: row.name_cn,
      name_tw: row.name_tw,
      name_kr: row.name_kr,
      type: row.type,
      description: row.description,
      icon_small: row.icon_small,
      icon_large: row.icon_large,
    };
  }

  /**
   * Search items across multi-language name fields
   */
  async searchMultiLanguage(
    searchTerm: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<Item>> {
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
   * Find items by type
   */
  async findByType(
    type: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<Item>> {
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

  /**
   * Find items by category (alias for findByType for backward compatibility)
   */
  async findByCategory(
    category: string,
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<Item>> {
    return this.findByType(category, options);
  }

  /**
   * Count items by category
   */
  async countByCategory(category: string): Promise<number> {
    const [rows] = await executeQuery(
      `SELECT COUNT(*) as total FROM ${this.tableName} WHERE type = ?`,
      [category]
    );
    return (rows as RowDataPacket[])[0].total;
  }
}