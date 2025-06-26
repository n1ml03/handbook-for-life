import { BaseModel, PaginationOptions, PaginatedResult } from './BaseModel';
import { GachaPool, NewGachaPool, PoolItemType } from '../types/database';
import { executeQuery } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config';

export class GachaPoolModel extends BaseModel<GachaPool, NewGachaPool> {
  constructor() {
    super('gacha_pools');
  }

  // Implementation of abstract methods
  protected mapRow(row: any): GachaPool {
    return {
      id: row.id,
      gacha_id: row.gacha_id,
      pool_item_type: row.pool_item_type,
      item_id: row.item_id,
      drop_rate: row.drop_rate,
      is_featured: Boolean(row.is_featured),
    };
  }

  protected getCreateFields(): (keyof NewGachaPool)[] {
    return [
      'gacha_id',
      'pool_item_type',
      'item_id',
      'drop_rate',
      'is_featured'
    ];
  }

  protected getUpdateFields(): (keyof NewGachaPool)[] {
    return this.getCreateFields(); // Same fields can be updated
  }

  // Mapper function to convert database row to GachaPool object
  private mapGachaPoolRow(row: any): GachaPool {
    return this.mapRow(row);
  }

  async create(gachaPool: NewGachaPool): Promise<GachaPool> {
    try {
      const [result] = await executeQuery(
        `INSERT INTO gacha_pools (gacha_id, pool_item_type, item_id, drop_rate, is_featured)
         VALUES (?, ?, ?, ?, ?)`,
        [
          gachaPool.gacha_id,
          gachaPool.pool_item_type,
          gachaPool.item_id,
          gachaPool.drop_rate,
          gachaPool.is_featured ?? false,
        ]
      ) as [any, any];

      return this.findById(result.insertId);
    } catch (error: any) {
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new AppError('Referenced gacha or item does not exist', 400);
      }
      throw new AppError('Failed to create gacha pool item', 500);
    }
  }

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<GachaPool>> {
    return this.getPaginatedResults(
      'SELECT * FROM gacha_pools',
      'SELECT COUNT(*) FROM gacha_pools',
      options,
      this.mapGachaPoolRow
    );
  }

  // Override findById to use proper typing
  async findById(id: number): Promise<GachaPool> {
    return super.findById(id);
  }

  async findByGachaId(gachaId: number, options: PaginationOptions = {}): Promise<PaginatedResult<GachaPool>> {
    return this.getPaginatedResults(
      `SELECT * FROM gacha_pools WHERE gacha_id = ?`,
      `SELECT COUNT(*) FROM gacha_pools WHERE gacha_id = ?`,
      options,
      this.mapGachaPoolRow,
      [gachaId]
    );
  }

  async findByGachaIdWithDetails(gachaId: number, options: PaginationOptions = {}): Promise<PaginatedResult<any>> {
    const baseQuery = `
      SELECT 
        gp.*,
        CASE 
          WHEN gp.pool_item_type = 'SWIMSUIT' THEN s.name_en
          WHEN gp.pool_item_type = 'BROMIDE' THEN b.name_en
          WHEN gp.pool_item_type = 'ITEM' THEN i.name_en
        END as item_name,
        CASE 
          WHEN gp.pool_item_type = 'SWIMSUIT' THEN s.rarity
          WHEN gp.pool_item_type = 'BROMIDE' THEN b.rarity
          WHEN gp.pool_item_type = 'ITEM' THEN i.rarity
        END as item_rarity
      FROM gacha_pools gp
      LEFT JOIN swimsuits s ON gp.pool_item_type = 'SWIMSUIT' AND gp.item_id = s.id
      LEFT JOIN bromides b ON gp.pool_item_type = 'BROMIDE' AND gp.item_id = b.id
      LEFT JOIN items i ON gp.pool_item_type = 'ITEM' AND gp.item_id = i.id
      WHERE gp.gacha_id = ?
    `;

    const countQuery = `SELECT COUNT(*) FROM gacha_pools WHERE gacha_id = ?`;

    return this.getPaginatedResults(
      baseQuery,
      countQuery,
      options,
      (row: any) => ({
        ...this.mapGachaPoolRow(row),
        item_name: row.item_name,
        item_rarity: row.item_rarity,
      }),
      [gachaId]
    );
  }

  async findFeaturedByGachaId(gachaId: number, options: PaginationOptions = {}): Promise<PaginatedResult<GachaPool>> {
    return this.getPaginatedResults(
      `SELECT * FROM gacha_pools WHERE gacha_id = ? AND is_featured = TRUE`,
      `SELECT COUNT(*) FROM gacha_pools WHERE gacha_id = ? AND is_featured = TRUE`,
      options,
      this.mapGachaPoolRow,
      [gachaId]
    );
  }

  async findByItemType(itemType: PoolItemType, options: PaginationOptions = {}): Promise<PaginatedResult<GachaPool>> {
    return this.getPaginatedResults(
      `SELECT * FROM gacha_pools WHERE pool_item_type = ?`,
      `SELECT COUNT(*) FROM gacha_pools WHERE pool_item_type = ?`,
      options,
      this.mapGachaPoolRow,
      [itemType]
    );
  }

  async update(id: number, updates: Partial<NewGachaPool>): Promise<GachaPool> {
    const setClause: string[] = [];
    const params: any[] = [];

    if (updates.gacha_id !== undefined) {
      setClause.push(`gacha_id = ?`);
      params.push(updates.gacha_id);
    }
    if (updates.pool_item_type !== undefined) {
      setClause.push(`pool_item_type = ?`);
      params.push(updates.pool_item_type);
    }
    if (updates.item_id !== undefined) {
      setClause.push(`item_id = ?`);
      params.push(updates.item_id);
    }
    if (updates.drop_rate !== undefined) {
      setClause.push(`drop_rate = ?`);
      params.push(updates.drop_rate);
    }
    if (updates.is_featured !== undefined) {
      setClause.push(`is_featured = ?`);
      params.push(updates.is_featured);
    }

    if (setClause.length === 0) {
      return this.findById(id);
    }

    params.push(id);

    await executeQuery(
      `UPDATE gacha_pools SET ${setClause.join(', ')} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    return super.delete(id);
  }

  async deleteByGachaId(gachaId: number): Promise<void> {
    await executeQuery('DELETE FROM gacha_pools WHERE gacha_id = ?', [gachaId]);
  }

  async bulkCreate(gachaPools: NewGachaPool[]): Promise<GachaPool[]> {
    if (gachaPools.length === 0) {
      return [];
    }

    return super.withTransaction(async (connection) => {
      const results: GachaPool[] = [];
      
      for (const gachaPool of gachaPools) {
        const [result] = await connection.execute(
          `INSERT INTO gacha_pools (gacha_id, pool_item_type, item_id, drop_rate, is_featured)
           VALUES (?, ?, ?, ?, ?)`,
          [
            gachaPool.gacha_id,
            gachaPool.pool_item_type,
            gachaPool.item_id,
            gachaPool.drop_rate,
            gachaPool.is_featured ?? false,
          ]
        ) as [any, any];

        const created = await this.findById(result.insertId);
        results.push(created);
      }

      return results;
    });
  }

  async validateDropRates(gachaId: number): Promise<{ isValid: boolean; totalRate: number }> {
    const [rows] = await executeQuery(
      'SELECT SUM(drop_rate) as total_rate FROM gacha_pools WHERE gacha_id = ?',
      [gachaId]
    ) as [any[], any];

    const totalRate = parseFloat(rows[0]?.total_rate || '0');
    const isValid = Math.abs(totalRate - 1.0) < 0.0001; // Allow for floating point precision

    return { isValid, totalRate };
  }

  async getDropRatesByRarity(gachaId: number): Promise<any[]> {
    const [rows] = await executeQuery(`
      SELECT 
        CASE 
          WHEN gp.pool_item_type = 'SWIMSUIT' THEN s.rarity
          WHEN gp.pool_item_type = 'BROMIDE' THEN b.rarity
          WHEN gp.pool_item_type = 'ITEM' THEN i.rarity
        END as rarity,
        SUM(gp.drop_rate) as total_rate,
        COUNT(*) as item_count
      FROM gacha_pools gp
      LEFT JOIN swimsuits s ON gp.pool_item_type = 'SWIMSUIT' AND gp.item_id = s.id
      LEFT JOIN bromides b ON gp.pool_item_type = 'BROMIDE' AND gp.item_id = b.id
      LEFT JOIN items i ON gp.pool_item_type = 'ITEM' AND gp.item_id = i.id
      WHERE gp.gacha_id = ?
      GROUP BY rarity
      ORDER BY total_rate DESC
    `, [gachaId]) as [any[], any];

    return rows.map(row => ({
      rarity: row.rarity,
      total_rate: parseFloat(row.total_rate),
      item_count: row.item_count,
    }));
  }

  async findByKey(key: string): Promise<GachaPool> {
    const [rows] = await executeQuery('SELECT * FROM gacha_pools WHERE id = ?', [key]) as [any[], any];
    if (rows.length === 0) {
      throw new AppError('Gacha pool not found', 404);
    }
    return this.mapGachaPoolRow(rows[0]);
  }

  async healthCheck(): Promise<{ isHealthy: boolean; tableName: string; errors: string[] }> {
    const errors: string[] = [];

    try {
      await executeQuery('SELECT 1');
      await executeQuery('SELECT COUNT(*) FROM gacha_pools LIMIT 1');
    } catch (error) {
      const errorMsg = `GachaPoolModel health check failed: ${error instanceof Error ? error.message : error}`;
      errors.push(errorMsg);
    }

    return {
      isHealthy: errors.length === 0,
      tableName: 'gacha_pools',
      errors
    };
  }
}
