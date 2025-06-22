import { ShopListingModel } from '../models/ShopListingModel';
import { ItemModel } from '../models/ItemModel';
import { ShopListing, NewShopListing, ShopType, PaginationOptions, PaginatedResult } from '../types/database';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export class ShopService {
  private shopListingModel: ShopListingModel;
  private itemModel: ItemModel;

  constructor() {
    this.shopListingModel = new ShopListingModel();
    this.itemModel = new ItemModel();
  }

  // ============================================================================
  // SHOP LISTING CRUD OPERATIONS
  // ============================================================================

  async createShopListing(listingData: NewShopListing): Promise<ShopListing> {
    try {
      // Validate that both items exist
      await this.itemModel.findById(listingData.item_id);
      await this.itemModel.findById(listingData.cost_currency_item_id);

      // Validate cost amount
      if (listingData.cost_amount <= 0) {
        throw new AppError('Cost amount must be greater than 0', 400);
      }

      // Validate date range if both dates are provided
      if (listingData.start_date && listingData.end_date && listingData.start_date >= listingData.end_date) {
        throw new AppError('Start date must be before end date', 400);
      }

      const listing = await this.shopListingModel.create(listingData);
      logger.info(`Created shop listing: ${listing.id} for item ${listing.item_id}`);
      return listing;
    } catch (error) {
      logger.error('Failed to create shop listing:', error);
      throw error;
    }
  }

  async getShopListingById(id: number): Promise<ShopListing> {
    try {
      return await this.shopListingModel.findById(id);
    } catch (error) {
      logger.error(`Failed to get shop listing by ID ${id}:`, error);
      throw error;
    }
  }

  async getAllShopListings(options: PaginationOptions = {}): Promise<PaginatedResult<any>> {
    try {
      return await this.shopListingModel.findWithItemDetails(options);
    } catch (error) {
      logger.error('Failed to get all shop listings:', error);
      throw error;
    }
  }

  async updateShopListing(id: number, updates: Partial<NewShopListing>): Promise<ShopListing> {
    try {
      // Validate items if they are being updated
      if (updates.item_id) {
        await this.itemModel.findById(updates.item_id);
      }
      if (updates.cost_currency_item_id) {
        await this.itemModel.findById(updates.cost_currency_item_id);
      }

      // Validate cost amount if provided
      if (updates.cost_amount !== undefined && updates.cost_amount <= 0) {
        throw new AppError('Cost amount must be greater than 0', 400);
      }

      // Validate date range if both dates are provided
      if (updates.start_date && updates.end_date && updates.start_date >= updates.end_date) {
        throw new AppError('Start date must be before end date', 400);
      }

      const listing = await this.shopListingModel.update(id, updates);
      logger.info(`Updated shop listing: ${listing.id}`);
      return listing;
    } catch (error) {
      logger.error(`Failed to update shop listing ${id}:`, error);
      throw error;
    }
  }

  async deleteShopListing(id: number): Promise<void> {
    try {
      await this.shopListingModel.delete(id);
      logger.info(`Deleted shop listing with ID: ${id}`);
    } catch (error) {
      logger.error(`Failed to delete shop listing ${id}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // SHOP FILTERING AND SEARCH
  // ============================================================================

  async getShopListingsByType(shopType: ShopType, options: PaginationOptions = {}): Promise<PaginatedResult<any>> {
    try {
      return await this.shopListingModel.findByShopTypeWithDetails(shopType, options);
    } catch (error) {
      logger.error(`Failed to get shop listings by type ${shopType}:`, error);
      throw error;
    }
  }

  async getActiveShopListings(options: PaginationOptions = {}): Promise<PaginatedResult<any>> {
    try {
      return await this.shopListingModel.findActiveWithDetails(options);
    } catch (error) {
      logger.error('Failed to get active shop listings:', error);
      throw error;
    }
  }

  async getShopListingsByItem(itemId: number, options: PaginationOptions = {}): Promise<PaginatedResult<ShopListing>> {
    try {
      // Validate that the item exists
      await this.itemModel.findById(itemId);
      
      return await this.shopListingModel.findByItemId(itemId, options);
    } catch (error) {
      logger.error(`Failed to get shop listings by item ${itemId}:`, error);
      throw error;
    }
  }

  async getShopListingsByCurrency(currencyId: number, options: PaginationOptions = {}): Promise<PaginatedResult<ShopListing>> {
    try {
      // Validate that the currency item exists
      await this.itemModel.findById(currencyId);
      
      return await this.shopListingModel.findByCurrencyId(currencyId, options);
    } catch (error) {
      logger.error(`Failed to get shop listings by currency ${currencyId}:`, error);
      throw error;
    }
  }

  async getShopListingsByDateRange(startDate: Date, endDate: Date, options: PaginationOptions = {}): Promise<PaginatedResult<ShopListing>> {
    try {
      if (startDate >= endDate) {
        throw new AppError('Start date must be before end date', 400);
      }
      
      return await this.shopListingModel.findByDateRange(startDate, endDate, options);
    } catch (error) {
      logger.error('Failed to get shop listings by date range:', error);
      throw error;
    }
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  async bulkCreateShopListings(listings: NewShopListing[]): Promise<ShopListing[]> {
    try {
      // Validate all items exist
      const itemIds = new Set<number>();
      for (const listing of listings) {
        itemIds.add(listing.item_id);
        itemIds.add(listing.cost_currency_item_id);
      }

      // Check all items exist
      for (const itemId of itemIds) {
        await this.itemModel.findById(itemId);
      }

      // Validate all cost amounts
      for (const listing of listings) {
        if (listing.cost_amount <= 0) {
          throw new AppError('All cost amounts must be greater than 0', 400);
        }
        
        // Validate date range if both dates are provided
        if (listing.start_date && listing.end_date && listing.start_date >= listing.end_date) {
          throw new AppError('All start dates must be before end dates', 400);
        }
      }

      const results = await this.shopListingModel.bulkCreate(listings);
      logger.info(`Bulk created ${results.length} shop listings`);
      return results;
    } catch (error) {
      logger.error('Failed to bulk create shop listings:', error);
      throw error;
    }
  }

  // ============================================================================
  // SHOP ANALYTICS
  // ============================================================================

  async getShopStatistics(): Promise<any> {
    try {
      const statistics = await this.shopListingModel.getShopStatistics();
      logger.info('Retrieved shop statistics');
      return statistics;
    } catch (error) {
      logger.error('Failed to get shop statistics:', error);
      throw error;
    }
  }

  async getShopSummary(): Promise<any> {
    try {
      const [statistics, activeListings] = await Promise.all([
        this.shopListingModel.getShopStatistics(),
        this.shopListingModel.findActive({ limit: 1 })
      ]);

      const totalListings = statistics.reduce((sum: number, stat: any) => sum + stat.total_listings, 0);
      const totalActiveListings = statistics.reduce((sum: number, stat: any) => sum + stat.active_listings, 0);

      return {
        total_listings: totalListings,
        active_listings: totalActiveListings,
        shop_types: statistics,
        last_updated: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Failed to get shop summary:', error);
      throw error;
    }
  }

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  async validateShopListing(listingData: NewShopListing): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check if item exists
      await this.itemModel.findById(listingData.item_id);
    } catch {
      errors.push(`Item with ID ${listingData.item_id} does not exist`);
    }

    try {
      // Check if currency item exists
      await this.itemModel.findById(listingData.cost_currency_item_id);
    } catch {
      errors.push(`Currency item with ID ${listingData.cost_currency_item_id} does not exist`);
    }

    // Validate cost amount
    if (listingData.cost_amount <= 0) {
      errors.push('Cost amount must be greater than 0');
    }

    // Validate date range
    if (listingData.start_date && listingData.end_date && listingData.start_date >= listingData.end_date) {
      errors.push('Start date must be before end date');
    }

    // Check for duplicate listings (same item in same shop type)
    try {
      const existingListings = await this.shopListingModel.findByItemId(listingData.item_id);
      const duplicateInSameShop = existingListings.data.some(listing => 
        listing.shop_type === listingData.shop_type &&
        // Check if time periods overlap
        (!listingData.start_date || !listing.end_date || listingData.start_date <= listing.end_date) &&
        (!listingData.end_date || !listing.start_date || listingData.end_date >= listing.start_date)
      );

      if (duplicateInSameShop) {
        errors.push('Item already exists in this shop type during the specified time period');
      }
    } catch {
      // If we can't check for duplicates, it's not a validation error
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  async healthCheck(): Promise<{ isHealthy: boolean; errors: string[] }> {
    const errors: string[] = [];
    let isHealthy = true;

    try {
      const shopHealth = await this.shopListingModel.healthCheck();
      const itemHealth = await this.itemModel.healthCheck();

      if (!shopHealth.isHealthy) {
        errors.push(...shopHealth.errors);
        isHealthy = false;
      }

      if (!itemHealth.isHealthy) {
        errors.push(...itemHealth.errors);
        isHealthy = false;
      }
    } catch (error) {
      errors.push(`ShopService health check failed: ${error}`);
      isHealthy = false;
    }

    return { isHealthy, errors };
  }
}

// Export singleton instance
export const shopService = new ShopService();
