import { BaseModel, PaginationOptions, PaginatedResult } from './BaseModel';
import { ShopListing, NewShopListing, ShopType } from '../types/database';
import { executeQuery } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class ShopListingModel extends BaseModel<ShopListing, NewShopListing> {
  constructor() {
    super('shop_listings');
  }

  // Implementation of abstract methods
  protected mapRow(row: any): ShopListing {
    return {
      id: row.id,
      shop_type: row.shop_type as ShopType,
      item_id: row.item_id,
      cost_currency_item_id: row.cost_currency_item_id,
      cost_amount: row.cost_amount,
      start_date: row.start_date,
      end_date: row.end_date,
    };
  }

  protected getCreateFields(): (keyof NewShopListing)[] {
    return [
      'shop_type',
      'item_id',
      'cost_currency_item_id',
      'cost_amount',
      'start_date',
      'end_date'
    ];
  }

  protected getUpdateFields(): (keyof NewShopListing)[] {
    return this.getCreateFields();
  }

  // Mapper function to convert database row to ShopListing object
  private mapShopListingRow(row: any): ShopListing {
    return this.mapRow(row);
  }

  async create(shopListing: NewShopListing): Promise<ShopListing> {
    try {
      const [result] = await executeQuery(
        `INSERT INTO shop_listings (shop_type, item_id, cost_currency_item_id, cost_amount, start_date, end_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          shopListing.shop_type,
          shopListing.item_id,
          shopListing.cost_currency_item_id,
          shopListing.cost_amount,
          shopListing.start_date,
          shopListing.end_date,
        ]
      ) as [any, any];

      return this.findById(result.insertId);
    } catch (error: any) {
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new AppError('Referenced item does not exist', 400);
      }
      throw new AppError('Failed to create shop listing', 500);
    }
  }

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<ShopListing>> {
    return this.getPaginatedResults(
      'SELECT * FROM shop_listings',
      'SELECT COUNT(*) FROM shop_listings',
      options,
      this.mapShopListingRow
    );
  }

  // Override findById to use proper typing
  async findById(id: number): Promise<ShopListing> {
    return super.findById(id);
  }

  async findByShopType(shopType: ShopType, options: PaginationOptions = {}): Promise<PaginatedResult<ShopListing>> {
    return this.getPaginatedResults(
      `SELECT * FROM shop_listings WHERE shop_type = ?`,
      `SELECT COUNT(*) FROM shop_listings WHERE shop_type = ?`,
      options,
      this.mapShopListingRow,
      [shopType]
    );
  }

  async findWithItemDetails(options: PaginationOptions = {}): Promise<PaginatedResult<any>> {
    const baseQuery = `
      SELECT
        sl.*,
        i1.name_en as item_name,
        i1.rarity as item_rarity,
        i1.icon_data as item_icon_data,
        i1.icon_mime_type as item_icon_mime_type,
        i2.name_en as currency_name,
        i2.icon_data as currency_icon_data,
        i2.icon_mime_type as currency_icon_mime_type
      FROM shop_listings sl
      LEFT JOIN items i1 ON sl.item_id = i1.id
      LEFT JOIN items i2 ON sl.cost_currency_item_id = i2.id
    `;

    const countQuery = `SELECT COUNT(*) FROM shop_listings`;

    return this.getPaginatedResults(
      baseQuery,
      countQuery,
      options,
      (row: any) => ({
        ...this.mapShopListingRow(row),
        item_name: row.item_name,
        item_rarity: row.item_rarity,
        item_icon_data: row.item_icon_data,
        item_icon_mime_type: row.item_icon_mime_type,
        currency_name: row.currency_name,
        currency_icon_data: row.currency_icon_data,
        currency_icon_mime_type: row.currency_icon_mime_type,
      })
    );
  }

  async findByShopTypeWithDetails(shopType: ShopType, options: PaginationOptions = {}): Promise<PaginatedResult<any>> {
    const baseQuery = `
      SELECT
        sl.*,
        i1.name_en as item_name,
        i1.rarity as item_rarity,
        i1.icon_data as item_icon_data,
        i1.icon_mime_type as item_icon_mime_type,
        i2.name_en as currency_name,
        i2.icon_data as currency_icon_data,
        i2.icon_mime_type as currency_icon_mime_type
      FROM shop_listings sl
      LEFT JOIN items i1 ON sl.item_id = i1.id
      LEFT JOIN items i2 ON sl.cost_currency_item_id = i2.id
      WHERE sl.shop_type = ?
    `;

    const countQuery = `SELECT COUNT(*) FROM shop_listings WHERE shop_type = ?`;

    return this.getPaginatedResults(
      baseQuery,
      countQuery,
      options,
      (row: any) => ({
        ...this.mapShopListingRow(row),
        item_name: row.item_name,
        item_rarity: row.item_rarity,
        item_icon_data: row.item_icon_data,
        item_icon_mime_type: row.item_icon_mime_type,
        currency_name: row.currency_name,
        currency_icon_data: row.currency_icon_data,
        currency_icon_mime_type: row.currency_icon_mime_type,
      }),
      [shopType]
    );
  }

  async findActive(options: PaginationOptions = {}): Promise<PaginatedResult<ShopListing>> {
    return this.getPaginatedResults(
      `SELECT * FROM shop_listings WHERE 
       (start_date IS NULL OR start_date <= NOW()) AND 
       (end_date IS NULL OR end_date >= NOW())`,
      `SELECT COUNT(*) FROM shop_listings WHERE 
       (start_date IS NULL OR start_date <= NOW()) AND 
       (end_date IS NULL OR end_date >= NOW())`,
      options,
      this.mapShopListingRow
    );
  }

  async findActiveWithDetails(options: PaginationOptions = {}): Promise<PaginatedResult<any>> {
    const baseQuery = `
      SELECT
        sl.*,
        i1.name_en as item_name,
        i1.rarity as item_rarity,
        i1.icon_data as item_icon_data,
        i1.icon_mime_type as item_icon_mime_type,
        i2.name_en as currency_name,
        i2.icon_data as currency_icon_data,
        i2.icon_mime_type as currency_icon_mime_type
      FROM shop_listings sl
      LEFT JOIN items i1 ON sl.item_id = i1.id
      LEFT JOIN items i2 ON sl.cost_currency_item_id = i2.id
      WHERE (sl.start_date IS NULL OR sl.start_date <= NOW()) AND
            (sl.end_date IS NULL OR sl.end_date >= NOW())
    `;

    const countQuery = `
      SELECT COUNT(*) FROM shop_listings
      WHERE (start_date IS NULL OR start_date <= NOW()) AND
            (end_date IS NULL OR end_date >= NOW())
    `;

    return this.getPaginatedResults(
      baseQuery,
      countQuery,
      options,
      (row: any) => ({
        ...this.mapShopListingRow(row),
        item_name: row.item_name,
        item_rarity: row.item_rarity,
        item_icon_data: row.item_icon_data,
        item_icon_mime_type: row.item_icon_mime_type,
        currency_name: row.currency_name,
        currency_icon_data: row.currency_icon_data,
        currency_icon_mime_type: row.currency_icon_mime_type,
      })
    );
  }

  async findByItemId(itemId: number, options: PaginationOptions = {}): Promise<PaginatedResult<ShopListing>> {
    return this.getPaginatedResults(
      `SELECT * FROM shop_listings WHERE item_id = ?`,
      `SELECT COUNT(*) FROM shop_listings WHERE item_id = ?`,
      options,
      this.mapShopListingRow,
      [itemId]
    );
  }

  async findByCurrencyId(currencyId: number, options: PaginationOptions = {}): Promise<PaginatedResult<ShopListing>> {
    return this.getPaginatedResults(
      `SELECT * FROM shop_listings WHERE cost_currency_item_id = ?`,
      `SELECT COUNT(*) FROM shop_listings WHERE cost_currency_item_id = ?`,
      options,
      this.mapShopListingRow,
      [currencyId]
    );
  }

  async findByDateRange(startDate: Date, endDate: Date, options: PaginationOptions = {}): Promise<PaginatedResult<ShopListing>> {
    return this.getPaginatedResults(
      `SELECT * FROM shop_listings WHERE 
       (start_date IS NULL OR start_date >= ?) AND 
       (end_date IS NULL OR end_date <= ?)`,
      `SELECT COUNT(*) FROM shop_listings WHERE 
       (start_date IS NULL OR start_date >= ?) AND 
       (end_date IS NULL OR end_date <= ?)`,
      options,
      this.mapShopListingRow,
      [startDate, endDate]
    );
  }

  async update(id: number, updates: Partial<NewShopListing>): Promise<ShopListing> {
    const setClause: string[] = [];
    const params: any[] = [];

    if (updates.shop_type !== undefined) {
      setClause.push(`shop_type = ?`);
      params.push(updates.shop_type);
    }
    if (updates.item_id !== undefined) {
      setClause.push(`item_id = ?`);
      params.push(updates.item_id);
    }
    if (updates.cost_currency_item_id !== undefined) {
      setClause.push(`cost_currency_item_id = ?`);
      params.push(updates.cost_currency_item_id);
    }
    if (updates.cost_amount !== undefined) {
      setClause.push(`cost_amount = ?`);
      params.push(updates.cost_amount);
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
      `UPDATE shop_listings SET ${setClause.join(', ')} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    return super.delete(id);
  }

  async bulkCreate(shopListings: NewShopListing[]): Promise<ShopListing[]> {
    if (shopListings.length === 0) {
      return [];
    }

    return this.withTransaction(async (connection) => {
      const results: ShopListing[] = [];
      
      for (const listing of shopListings) {
        const [result] = await connection.execute(
          `INSERT INTO shop_listings (shop_type, item_id, cost_currency_item_id, cost_amount, start_date, end_date)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            listing.shop_type,
            listing.item_id,
            listing.cost_currency_item_id,
            listing.cost_amount,
            listing.start_date,
            listing.end_date,
          ]
        ) as [any, any];

        const created = await this.findById(result.insertId);
        results.push(created);
      }

      return results;
    });
  }

  async getShopStatistics(): Promise<any> {
    const [rows] = await executeQuery(`
      SELECT 
        shop_type,
        COUNT(*) as total_listings,
        COUNT(CASE WHEN (start_date IS NULL OR start_date <= NOW()) AND 
                         (end_date IS NULL OR end_date >= NOW()) THEN 1 END) as active_listings,
        AVG(cost_amount) as avg_cost
      FROM shop_listings
      GROUP BY shop_type
      ORDER BY shop_type
    `) as [any[], any];

    return rows.map(row => ({
      shop_type: row.shop_type,
      total_listings: row.total_listings,
      active_listings: row.active_listings,
      avg_cost: parseFloat(row.avg_cost || '0'),
    }));
  }

  async findByKey(key: string): Promise<ShopListing> {
    const numericId = parseInt(key, 10);
    if (isNaN(numericId)) {
      throw new AppError('Invalid key format for shop listing', 400);
    }
    return this.findById(numericId);
  }

  async healthCheck(): Promise<{ isHealthy: boolean; tableName: string; errors: string[] }> {
    const errors: string[] = [];

    try {
      await executeQuery('SELECT 1');
      await executeQuery('SELECT COUNT(*) FROM shop_listings LIMIT 1');
    } catch (error) {
      const errorMsg = `ShopListingModel health check failed: ${error instanceof Error ? error.message : error}`;
      errors.push(errorMsg);
    }

    return {
      isHealthy: errors.length === 0,
      tableName: 'shop_listings',
      errors
    };
  }
}
