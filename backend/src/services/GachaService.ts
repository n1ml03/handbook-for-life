import { GachaModel } from '../models/GachaModel';
import { GachaPoolModel } from '../models/GachaPoolModel';
import { Gacha, NewGacha, GachaPool, NewGachaPool, GachaSubtype, PaginationOptions, PaginatedResult } from '../types/database';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export class GachaService {
  private gachaModel: GachaModel;
  private gachaPoolModel: GachaPoolModel;

  constructor() {
    this.gachaModel = new GachaModel();
    this.gachaPoolModel = new GachaPoolModel();
  }

  // ============================================================================
  // GACHA CRUD OPERATIONS
  // ============================================================================

  async createGacha(gachaData: NewGacha): Promise<Gacha> {
    try {
      // Validate date range
      if (gachaData.start_date >= gachaData.end_date) {
        throw new AppError('Start date must be before end date', 400);
      }

      const gacha = await this.gachaModel.create(gachaData);
      logger.info(`Created gacha: ${gacha.name_en} (ID: ${gacha.id})`);
      return gacha;
    } catch (error) {
      logger.error('Failed to create gacha:', error);
      throw error;
    }
  }

  async getGachaById(id: number): Promise<Gacha> {
    try {
      return await this.gachaModel.findById(id);
    } catch (error) {
      logger.error(`Failed to get gacha by ID ${id}:`, error);
      throw error;
    }
  }

  async getGachaByUniqueKey(uniqueKey: string): Promise<Gacha> {
    try {
      return await this.gachaModel.findByUniqueKey(uniqueKey);
    } catch (error) {
      logger.error(`Failed to get gacha by unique key ${uniqueKey}:`, error);
      throw error;
    }
  }

  async getAllGachas(options: PaginationOptions = {}): Promise<PaginatedResult<Gacha>> {
    try {
      return await this.gachaModel.findAll(options);
    } catch (error) {
      logger.error('Failed to get all gachas:', error);
      throw error;
    }
  }

  async updateGacha(id: number, updates: Partial<NewGacha>): Promise<Gacha> {
    try {
      // Validate date range if both dates are provided
      if (updates.start_date && updates.end_date && updates.start_date >= updates.end_date) {
        throw new AppError('Start date must be before end date', 400);
      }

      const gacha = await this.gachaModel.update(id, updates);
      logger.info(`Updated gacha: ${gacha.name_en} (ID: ${gacha.id})`);
      return gacha;
    } catch (error) {
      logger.error(`Failed to update gacha ${id}:`, error);
      throw error;
    }
  }

  async deleteGacha(id: number): Promise<void> {
    try {
      // First delete all gacha pool items
      await this.gachaPoolModel.deleteByGachaId(id);
      
      // Then delete the gacha
      await this.gachaModel.delete(id);
      logger.info(`Deleted gacha with ID: ${id}`);
    } catch (error) {
      logger.error(`Failed to delete gacha ${id}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // GACHA SEARCH AND FILTERING
  // ============================================================================

  async searchGachas(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Gacha>> {
    try {
      return await this.gachaModel.search(query, options);
    } catch (error) {
      logger.error(`Failed to search gachas with query "${query}":`, error);
      throw error;
    }
  }

  async getActiveGachas(options: PaginationOptions = {}): Promise<PaginatedResult<Gacha>> {
    try {
      return await this.gachaModel.findActive(options);
    } catch (error) {
      logger.error('Failed to get active gachas:', error);
      throw error;
    }
  }

  async getGachasBySubtype(subtype: GachaSubtype, options: PaginationOptions = {}): Promise<PaginatedResult<Gacha>> {
    try {
      return await this.gachaModel.findBySubtype(subtype, options);
    } catch (error) {
      logger.error(`Failed to get gachas by subtype ${subtype}:`, error);
      throw error;
    }
  }

  async getGachasByDateRange(startDate: Date, endDate: Date, options: PaginationOptions = {}): Promise<PaginatedResult<Gacha>> {
    try {
      if (startDate >= endDate) {
        throw new AppError('Start date must be before end date', 400);
      }
      return await this.gachaModel.findByDateRange(startDate, endDate, options);
    } catch (error) {
      logger.error('Failed to get gachas by date range:', error);
      throw error;
    }
  }

  // ============================================================================
  // GACHA POOL OPERATIONS
  // ============================================================================

  async addPoolItem(poolData: NewGachaPool): Promise<GachaPool> {
    try {
      // Validate that the gacha exists
      await this.gachaModel.findById(poolData.gacha_id);

      // Validate drop rate
      if (poolData.drop_rate <= 0 || poolData.drop_rate > 1) {
        throw new AppError('Drop rate must be between 0 and 1', 400);
      }

      const poolItem = await this.gachaPoolModel.create(poolData);
      logger.info(`Added pool item to gacha ${poolData.gacha_id}: ${poolData.pool_item_type} ID ${poolData.item_id}`);
      return poolItem;
    } catch (error) {
      logger.error('Failed to add pool item:', error);
      throw error;
    }
  }

  async getGachaPool(gachaId: number, options: PaginationOptions = {}): Promise<PaginatedResult<any>> {
    try {
      return await this.gachaPoolModel.findByGachaIdWithDetails(gachaId, options);
    } catch (error) {
      logger.error(`Failed to get gacha pool for gacha ${gachaId}:`, error);
      throw error;
    }
  }

  async getFeaturedItems(gachaId: number, options: PaginationOptions = {}): Promise<PaginatedResult<GachaPool>> {
    try {
      return await this.gachaPoolModel.findFeaturedByGachaId(gachaId, options);
    } catch (error) {
      logger.error(`Failed to get featured items for gacha ${gachaId}:`, error);
      throw error;
    }
  }

  async updatePoolItem(id: number, updates: Partial<NewGachaPool>): Promise<GachaPool> {
    try {
      // Validate drop rate if provided
      if (updates.drop_rate !== undefined && (updates.drop_rate <= 0 || updates.drop_rate > 1)) {
        throw new AppError('Drop rate must be between 0 and 1', 400);
      }

      const poolItem = await this.gachaPoolModel.update(id, updates);
      logger.info(`Updated pool item ${id}`);
      return poolItem;
    } catch (error) {
      logger.error(`Failed to update pool item ${id}:`, error);
      throw error;
    }
  }

  async removePoolItem(id: number): Promise<void> {
    try {
      await this.gachaPoolModel.delete(id);
      logger.info(`Removed pool item ${id}`);
    } catch (error) {
      logger.error(`Failed to remove pool item ${id}:`, error);
      throw error;
    }
  }

  async bulkAddPoolItems(gachaId: number, poolItems: Omit<NewGachaPool, 'gacha_id'>[]): Promise<GachaPool[]> {
    try {
      // Validate that the gacha exists
      await this.gachaModel.findById(gachaId);

      // Add gacha_id to all items
      const poolItemsWithGachaId = poolItems.map(item => ({
        ...item,
        gacha_id: gachaId,
      }));

      // Validate all drop rates
      for (const item of poolItemsWithGachaId) {
        if (item.drop_rate <= 0 || item.drop_rate > 1) {
          throw new AppError('All drop rates must be between 0 and 1', 400);
        }
      }

      const results = await this.gachaPoolModel.bulkCreate(poolItemsWithGachaId);
      logger.info(`Bulk added ${results.length} pool items to gacha ${gachaId}`);
      return results;
    } catch (error) {
      logger.error(`Failed to bulk add pool items to gacha ${gachaId}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // GACHA ANALYTICS AND VALIDATION
  // ============================================================================

  async validateGachaDropRates(gachaId: number): Promise<{ isValid: boolean; totalRate: number; message: string }> {
    try {
      const { isValid, totalRate } = await this.gachaPoolModel.validateDropRates(gachaId);
      
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
    } catch (error) {
      logger.error(`Failed to validate drop rates for gacha ${gachaId}:`, error);
      throw error;
    }
  }

  async getGachaStatistics(gachaId: number): Promise<any> {
    try {
      const [dropRateValidation, rarityBreakdown] = await Promise.all([
        this.gachaPoolModel.validateDropRates(gachaId),
        this.gachaPoolModel.getDropRatesByRarity(gachaId),
      ]);

      return {
        dropRateValidation,
        rarityBreakdown,
      };
    } catch (error) {
      logger.error(`Failed to get statistics for gacha ${gachaId}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  async healthCheck(): Promise<{ isHealthy: boolean; errors: string[] }> {
    const errors: string[] = [];
    let isHealthy = true;

    try {
      const gachaHealth = await this.gachaModel.healthCheck();
      const poolHealth = await this.gachaPoolModel.healthCheck();

      if (!gachaHealth.isHealthy) {
        errors.push(...gachaHealth.errors);
        isHealthy = false;
      }

      if (!poolHealth.isHealthy) {
        errors.push(...poolHealth.errors);
        isHealthy = false;
      }
    } catch (error) {
      errors.push(`GachaService health check failed: ${error}`);
      isHealthy = false;
    }

    return { isHealthy, errors };
  }
}

// Export singleton instance
export const gachaService = new GachaService();
