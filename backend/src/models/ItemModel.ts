import { BaseModel, PaginationOptions, PaginatedResult } from './BaseModel';
import { Item, NewItem, ItemCategory, ItemRarity } from '../types/database';
import { executeQuery } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config';

export class ItemModel extends BaseModel<Item, NewItem> {
  constructor() {
    super('items');
  }

  // Implementation of abstract methods
  protected mapRow(row: any): Item {
    return {
      id: row.id,
      unique_key: row.unique_key,
      name_jp: row.name_jp,
      name_en: row.name_en,
      name_cn: row.name_cn,
      name_tw: row.name_tw,
      name_kr: row.name_kr,
      description_en: row.description_en,
      source_description_en: row.source_description_en,
      item_category: row.item_category,
      rarity: row.rarity,
      icon_url: row.icon_url,
      game_version: row.game_version,
    };
  }

  protected getCreateFields(): (keyof NewItem)[] {
    return [
      'unique_key',
      'name_jp',
      'name_en',
      'name_cn',
      'name_tw',
      'name_kr',
      'description_en',
      'source_description_en',
      'item_category',
      'rarity',
      'icon_url',
      'game_version'
    ];
  }

  protected getUpdateFields(): (keyof NewItem)[] {
    return this.getCreateFields(); // Same fields can be updated
  }

  // Mapper function to convert database row to Item object
  private mapItemRow(row: any): Item {
    return this.mapRow(row);
  }

  async create(item: NewItem): Promise<Item> {
    try {
      const [result] = await executeQuery(
        `INSERT INTO items (unique_key, name_jp, name_en, name_cn, name_tw, name_kr,
         description_en, source_description_en, item_category, rarity, icon_url, game_version)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.unique_key,
          item.name_jp,
          item.name_en,
          item.name_cn,
          item.name_tw,
          item.name_kr,
          item.description_en,
          item.source_description_en,
          item.item_category,
          item.rarity,
          item.icon_url,
          item.game_version,
        ]
      ) as [any, any];

      return this.findById(result.insertId);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError('Item with this unique_key already exists', 409);
      }
      throw new AppError('Failed to create item', 500);
    }
  }

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<Item>> {
    return this.getPaginatedResults(
      'SELECT * FROM items',
      'SELECT COUNT(*) FROM items',
      options,
      this.mapItemRow
    );
  }

  // Override findById to use proper typing
  async findById(id: number): Promise<Item> {
    return super.findById(id);
  }

  async findByUniqueKey(unique_key: string): Promise<Item> {
    const [rows] = await executeQuery('SELECT * FROM items WHERE unique_key = ?', [unique_key]) as [any[], any];
    if (rows.length === 0) {
      throw new AppError('Item not found', 404);
    }
    return this.mapItemRow(rows[0]);
  }

  async findByCategory(category: ItemCategory, options: PaginationOptions = {}): Promise<PaginatedResult<Item>> {
    return this.getPaginatedResults(
      'SELECT * FROM items WHERE item_category = ?',
      'SELECT COUNT(*) FROM items WHERE item_category = ?',
      options,
      this.mapItemRow,
      [category]
    );
  }

  async findByRarity(rarity: ItemRarity, options: PaginationOptions = {}): Promise<PaginatedResult<Item>> {
    return this.getPaginatedResults(
      'SELECT * FROM items WHERE rarity = ?',
      'SELECT COUNT(*) FROM items WHERE rarity = ?',
      options,
      this.mapItemRow,
      [rarity]
    );
  }

  async update(id: number, updates: Partial<NewItem>): Promise<Item> {
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
    if (updates.description_en !== undefined) {
      setClause.push(`description_en = ?`);
      params.push(updates.description_en);
    }
    if (updates.source_description_en !== undefined) {
      setClause.push(`source_description_en = ?`);
      params.push(updates.source_description_en);
    }
    if (updates.item_category !== undefined) {
      setClause.push(`item_category = ?`);
      params.push(updates.item_category);
    }
    if (updates.rarity !== undefined) {
      setClause.push(`rarity = ?`);
      params.push(updates.rarity);
    }
    if (updates.icon_url !== undefined) {
      setClause.push(`icon_url = ?`);
      params.push(updates.icon_url);
    }
    if (updates.game_version !== undefined) {
      setClause.push(`game_version = ?`);
      params.push(updates.game_version);
    }

    if (setClause.length === 0) {
      return this.findById(id);
    }

    params.push(id);

    const [result] = await executeQuery(
      `UPDATE items SET ${setClause.join(', ')} WHERE id = ?`,
      params
    ) as [any, any];

    if (result.affectedRows === 0) {
      throw new AppError('Item not found', 404);
    }

    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    return super.delete(id);
  }

  async findByKey(key: string): Promise<Item> {
    return this.findByUniqueKey(key);
  }

  async getCurrencyItems(): Promise<Item[]> {
    const [rows] = await executeQuery(
      'SELECT * FROM items WHERE item_category = ? ORDER BY name_en',
      ['CURRENCY']
    ) as [any[], any];
    
    return rows.map(this.mapItemRow);
  }

  async healthCheck(): Promise<{ isHealthy: boolean; tableName: string; errors: string[] }> {
    const errors: string[] = [];

    try {
      await executeQuery('SELECT 1');
      await executeQuery('SELECT COUNT(*) FROM items LIMIT 1');
    } catch (error) {
      const errorMsg = `ItemModel health check failed: ${error instanceof Error ? error.message : error}`;
      errors.push(errorMsg);
    }

    return {
      isHealthy: errors.length === 0,
      tableName: 'items',
      errors
    };
  }
}