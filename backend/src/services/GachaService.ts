import { GachaModel } from '../models/GachaModel';
import { GachaPoolModel } from '../models/GachaPoolModel';
import { Gacha, NewGacha, GachaPool, NewGachaPool, GachaSubtype, PaginationOptions, PaginatedResult } from '../types/database';
import { BaseService } from './BaseService';

export class GachaService extends BaseService<GachaModel, Gacha, NewGacha> {
  private gachaPoolModel: GachaPoolModel;

  constructor() {
    super(new GachaModel(), 'GachaService');
    this.gachaPoolModel = new GachaPoolModel();
  }

  // ============================================================================
  // GACHA CRUD OPERATIONS
  // ============================================================================

  async createGacha(gachaData: NewGacha): Promise<Gacha> {
    return this.safeAsyncOperation(async () => {
      this.validateDateRange(gachaData.start_date, gachaData.end_date);

      this.logOperationStart('Creating', gachaData.name_en, { 
        key: gachaData.unique_key,
        startDate: gachaData.start_date,
        endDate: gachaData.end_date
      });

      const gacha = await this.model.create(gachaData);

      this.logOperationSuccess('Created', gacha.name_en, { id: gacha.id });
      return gacha;
    }, 'create gacha', gachaData.name_en);
  }

  async getGachaById(id: number): Promise<Gacha> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(id, 'Gacha ID');
      const gacha = await this.model.findById(numericId);
      return gacha;
    }, 'fetch gacha', id);
  }

  async getGachaByUniqueKey(uniqueKey: string): Promise<Gacha> {
    return this.safeAsyncOperation(async () => {
      this.validateId(uniqueKey, 'Gacha unique key');
      return await this.model.findByUniqueKey(uniqueKey);
    }, 'fetch gacha by unique key', uniqueKey);
  }

  async getAllGachas(options: PaginationOptions = {}): Promise<PaginatedResult<Gacha>> {
    return this.safeAsyncOperation(async () => {
      const validatedOptions = this.validatePaginationOptions(options);
      const result = await this.model.findAll(validatedOptions);
      return this.formatPaginatedDatesForResponse(result);
    }, 'fetch all gachas');
  }

  async updateGacha(id: number, updates: Partial<NewGacha>): Promise<Gacha> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(id, 'Gacha ID');
      
      // Validate date range if both dates are provided
      if (updates.start_date && updates.end_date) {
        this.validateDateRange(updates.start_date, updates.end_date);
      }

      this.logOperationStart('Updating', id, { updates });

      const gacha = await this.model.update(numericId, updates);

      this.logOperationSuccess('Updated', gacha.name_en, { id: gacha.id });
      return gacha;
    }, 'update gacha', id);
  }

  async deleteGacha(id: number): Promise<void> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(id, 'Gacha ID');

      this.logOperationStart('Deleting', id);
      
      // First delete all gacha pool items
      await this.gachaPoolModel.deleteByGachaId(numericId);
      
      // Then delete the gacha
      await this.model.delete(numericId);
      
      this.logOperationSuccess('Deleted', id);
    }, 'delete gacha', id);
  }

  // ============================================================================
  // GACHA SEARCH AND FILTERING
  // ============================================================================

  async searchGachas(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Gacha>> {
    return this.safeAsyncOperation(async () => {
      this.validateSearchQuery(query);
      const validatedOptions = this.validatePaginationOptions(options);
      const searchFields = ['name_jp', 'name_en', 'name_cn', 'name_tw', 'name_kr', 'unique_key'];
      return await this.model.search(searchFields, query.trim(), validatedOptions);
    }, 'search gachas', query);
  }

  async getActiveGachas(options: PaginationOptions = {}): Promise<PaginatedResult<Gacha>> {
    return this.safeAsyncOperation(async () => {
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findActive(validatedOptions);
    }, 'fetch active gachas');
  }

  async getGachasBySubtype(subtype: GachaSubtype, options: PaginationOptions = {}): Promise<PaginatedResult<Gacha>> {
    return this.safeAsyncOperation(async () => {
      this.validateGachaSubtype(subtype);
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findBySubtype(subtype, validatedOptions);
    }, 'fetch gachas by subtype', subtype);
  }

  async getGachasByDateRange(startDate: Date, endDate: Date, options: PaginationOptions = {}): Promise<PaginatedResult<Gacha>> {
    return this.safeAsyncOperation(async () => {
      this.validateDateRange(startDate, endDate);
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findByDateRange(startDate, endDate, validatedOptions);
    }, 'fetch gachas by date range');
  }

  // ============================================================================
  // GACHA POOL OPERATIONS
  // ============================================================================

  async addPoolItem(poolData: NewGachaPool): Promise<GachaPool> {
    return this.safeAsyncOperation(async () => {
      // Validate that the gacha exists
      await this.model.findById(poolData.gacha_id);
      this.validateDropRate(poolData.drop_rate);

      this.logOperationStart('Adding pool item', 
        `${poolData.pool_item_type} ID ${poolData.item_id}`, 
        { gachaId: poolData.gacha_id }
      );

      const poolItem = await this.gachaPoolModel.create(poolData);

      this.logOperationSuccess('Added pool item', poolItem.id);
      return poolItem;
    }, 'add pool item');
  }

  async getGachaPool(gachaId: number, options: PaginationOptions = {}): Promise<PaginatedResult<any>> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(gachaId, 'Gacha ID');
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.gachaPoolModel.findByGachaIdWithDetails(numericId, validatedOptions);
    }, 'fetch gacha pool', gachaId);
  }

  async getFeaturedItems(gachaId: number, options: PaginationOptions = {}): Promise<PaginatedResult<GachaPool>> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(gachaId, 'Gacha ID');
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.gachaPoolModel.findFeaturedByGachaId(numericId, validatedOptions);
    }, 'fetch featured items', gachaId);
  }

  async updatePoolItem(id: number, updates: Partial<NewGachaPool>): Promise<GachaPool> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(id, 'Pool item ID');
      
      if (updates.drop_rate !== undefined) {
        this.validateDropRate(updates.drop_rate);
      }

      this.logOperationStart('Updating pool item', id, { updates });

      const poolItem = await this.gachaPoolModel.update(numericId, updates);

      this.logOperationSuccess('Updated pool item', poolItem.id);
      return poolItem;
    }, 'update pool item', id);
  }

  async removePoolItem(id: number): Promise<void> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(id, 'Pool item ID');

      this.logOperationStart('Removing pool item', id);
      await this.gachaPoolModel.delete(numericId);
      this.logOperationSuccess('Removed pool item', id);
    }, 'remove pool item', id);
  }

  async bulkAddPoolItems(gachaId: number, poolItems: Omit<NewGachaPool, 'gacha_id'>[]): Promise<GachaPool[]> {
    return this.safeAsyncOperation(async () => {
      const numericGachaId = this.parseNumericId(gachaId, 'Gacha ID');
      
      // Validate that the gacha exists
      await this.model.findById(numericGachaId);

      // Add gacha_id to all items and validate drop rates
      const poolItemsWithGachaId = poolItems.map(item => {
        this.validateDropRate(item.drop_rate);
        return {
          ...item,
          gacha_id: numericGachaId,
        };
      });

      this.logOperationStart('Bulk adding pool items', 
        `${poolItems.length} items`, 
        { gachaId: numericGachaId }
      );

      const results = await this.gachaPoolModel.bulkCreate(poolItemsWithGachaId);

      this.logOperationSuccess('Bulk added pool items', results.length);
      return results;
    }, 'bulk add pool items', gachaId);
  }

  // ============================================================================
  // GACHA ANALYTICS AND VALIDATION
  // ============================================================================

  async validateGachaDropRates(gachaId: number): Promise<{ isValid: boolean; totalRate: number; message: string }> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(gachaId, 'Gacha ID');
      const { isValid, totalRate } = await this.gachaPoolModel.validateDropRates(numericId);
      
      let message = '';
      if (!isValid) {
        if (totalRate < 1.0) {
          message = `Drop rates sum to ${totalRate.toFixed(4)}, which is less than 1.0`;
        } else {
          message = `Drop rates sum to ${totalRate.toFixed(4)}, which exceeds 1.0`;
        }
      } else {
        message = 'Drop rates are valid';
      }

      return { isValid, totalRate, message };
    }, 'validate gacha drop rates', gachaId);
  }

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  private validateGachaSubtype(subtype: GachaSubtype): void {
    const validSubtypes: GachaSubtype[] = ['TRENDY', 'NOSTALGIC', 'BIRTHDAY', 'ANNIVERSARY', 'PAID', 'FREE', 'ETC'];
    if (!validSubtypes.includes(subtype)) {
      throw new Error(`Invalid gacha subtype: ${subtype}. Valid subtypes are: ${validSubtypes.join(', ')}`);
    }
  }

  private validateDropRate(dropRate: number): void {
    if (dropRate <= 0 || dropRate > 1) {
      throw new Error('Drop rate must be between 0 and 1');
    }
  }

  // Health check is inherited from BaseService
}

// Export singleton instance
export const gachaService = new GachaService();
export default gachaService;
