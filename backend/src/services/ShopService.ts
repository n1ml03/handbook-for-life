import { ShopListingModel } from '../models/ShopListingModel';
import { ItemModel } from '../models/ItemModel';
import { ShopListing, NewShopListing, ShopType, PaginationOptions, PaginatedResult } from '../types/database';
import { BaseService } from './BaseService';

export class ShopService extends BaseService<ShopListingModel, ShopListing, NewShopListing> {
  private itemModel: ItemModel;

  constructor() {
    super(new ShopListingModel(), 'ShopService');
    this.itemModel = new ItemModel();
  }

  // ============================================================================
  // SHOP LISTING CRUD OPERATIONS
  // ============================================================================

  async createShopListing(listingData: NewShopListing): Promise<ShopListing> {
    return this.safeAsyncOperation(async () => {
      // Validate that both items exist
      await this.itemModel.findById(listingData.item_id);
      await this.itemModel.findById(listingData.cost_currency_item_id);

      this.validateCostAmount(listingData.cost_amount);

      // Validate date range if both dates are provided
      if (listingData.start_date && listingData.end_date) {
        this.validateDateRange(listingData.start_date, listingData.end_date);
      }

      this.logOperationStart('Creating shop listing', 
        `item ${listingData.item_id}`, 
        { costAmount: listingData.cost_amount, currency: listingData.cost_currency_item_id }
      );

      const listing = await this.model.create(listingData);

      this.logOperationSuccess('Created shop listing', listing.id);
      return listing;
    }, 'create shop listing');
  }

  async getShopListingById(id: number): Promise<ShopListing> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(id, 'Shop listing ID');
      return await this.model.findById(numericId);
    }, 'fetch shop listing', id);
  }

  async getAllShopListings(options: PaginationOptions = {}): Promise<PaginatedResult<any>> {
    return this.safeAsyncOperation(async () => {
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findWithItemDetails(validatedOptions);
    }, 'fetch all shop listings');
  }

  async updateShopListing(id: number, updates: Partial<NewShopListing>): Promise<ShopListing> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(id, 'Shop listing ID');

      // Validate items if they are being updated
      if (updates.item_id) {
        await this.itemModel.findById(updates.item_id);
      }
      if (updates.cost_currency_item_id) {
        await this.itemModel.findById(updates.cost_currency_item_id);
      }

      // Validate cost amount if provided
      if (updates.cost_amount !== undefined) {
        this.validateCostAmount(updates.cost_amount);
      }

      // Validate date range if both dates are provided
      if (updates.start_date && updates.end_date) {
        this.validateDateRange(updates.start_date, updates.end_date);
      }

      this.logOperationStart('Updating shop listing', id, { updates });

      const listing = await this.model.update(numericId, updates);

      this.logOperationSuccess('Updated shop listing', listing.id);
      return listing;
    }, 'update shop listing', id);
  }

  async deleteShopListing(id: number): Promise<void> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(id, 'Shop listing ID');

      this.logOperationStart('Deleting shop listing', id);
      await this.model.delete(numericId);
      this.logOperationSuccess('Deleted shop listing', id);
    }, 'delete shop listing', id);
  }

  // ============================================================================
  // SHOP FILTERING AND SEARCH
  // ============================================================================

  async getShopListingsByType(shopType: ShopType, options: PaginationOptions = {}): Promise<PaginatedResult<any>> {
    return this.safeAsyncOperation(async () => {
      this.validateShopType(shopType);
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findByShopTypeWithDetails(shopType, validatedOptions);
    }, 'fetch shop listings by type', shopType);
  }

  async getActiveShopListings(options: PaginationOptions = {}): Promise<PaginatedResult<any>> {
    return this.safeAsyncOperation(async () => {
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findActiveWithDetails(validatedOptions);
    }, 'fetch active shop listings');
  }

  async getShopListingsByItem(itemId: number, options: PaginationOptions = {}): Promise<PaginatedResult<ShopListing>> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(itemId, 'Item ID');
      
      // Validate that the item exists
      await this.itemModel.findById(numericId);
      
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findByItemId(numericId, validatedOptions);
    }, 'fetch shop listings by item', itemId);
  }

  async getShopListingsByCurrency(currencyId: number, options: PaginationOptions = {}): Promise<PaginatedResult<ShopListing>> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(currencyId, 'Currency ID');
      
      // Validate that the currency item exists
      await this.itemModel.findById(numericId);
      
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findByCurrencyId(numericId, validatedOptions);
    }, 'fetch shop listings by currency', currencyId);
  }

  async getShopListingsByDateRange(startDate: Date, endDate: Date, options: PaginationOptions = {}): Promise<PaginatedResult<ShopListing>> {
    return this.safeAsyncOperation(async () => {
      this.validateDateRange(startDate, endDate);
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findByDateRange(startDate, endDate, validatedOptions);
    }, 'fetch shop listings by date range');
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  async bulkCreateShopListings(listings: NewShopListing[]): Promise<ShopListing[]> {
    return this.safeAsyncOperation(async () => {
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

      // Validate all cost amounts and date ranges
      for (const listing of listings) {
        this.validateCostAmount(listing.cost_amount);
        
        if (listing.start_date && listing.end_date) {
          this.validateDateRange(listing.start_date, listing.end_date);
        }
      }

      this.logOperationStart('Bulk creating shop listings', `${listings.length} listings`);

      const results = await this.model.bulkCreate(listings);

      this.logOperationSuccess('Bulk created shop listings', results.length);
      return results;
    }, 'bulk create shop listings');
  }

  // ============================================================================
  // ANALYTICS AND STATISTICS
  // ============================================================================

  async getShopStatistics(): Promise<any> {
    return this.safeAsyncOperation(async () => {
      return await this.model.getShopStatistics();
    }, 'fetch shop statistics');
  }

  async validateShopListing(listingData: NewShopListing): Promise<{ isValid: boolean; errors: string[] }> {
    return this.safeAsyncOperation(async () => {
      const errors: string[] = [];

      try {
        await this.itemModel.findById(listingData.item_id);
      } catch (error) {
        errors.push(`Item with ID ${listingData.item_id} does not exist`);
      }

      try {
        await this.itemModel.findById(listingData.cost_currency_item_id);
      } catch (error) {
        errors.push(`Currency item with ID ${listingData.cost_currency_item_id} does not exist`);
      }

      if (listingData.cost_amount <= 0) {
        errors.push('Cost amount must be greater than 0');
      }

      if (listingData.start_date && listingData.end_date && 
          listingData.start_date >= listingData.end_date) {
        errors.push('Start date must be before end date');
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    }, 'validate shop listing');
  }

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  private validateShopType(shopType: ShopType): void {
    const validTypes: ShopType[] = ['EVENT', 'VIP', 'GENERAL', 'CURRENCY'];
    if (!validTypes.includes(shopType)) {
      throw new Error(`Invalid shop type: ${shopType}. Valid types are: ${validTypes.join(', ')}`);
    }
  }

  private validateCostAmount(amount: number): void {
    if (amount <= 0) {
      throw new Error('Cost amount must be greater than 0');
    }
  }

  // Health check is inherited from BaseService
}

// Export singleton instance
export const shopService = new ShopService();
export default shopService;
