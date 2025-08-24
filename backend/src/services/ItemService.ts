import { ItemModel } from '../models/ItemModel';
import { Item, NewItem, ItemCategory, ItemRarity } from '../types/database';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';
import { BaseService } from './BaseService';

export class ItemService extends BaseService<ItemModel, Item, NewItem> {
  constructor() {
    super(new ItemModel(), 'ItemService');
  }

  async createItem(itemData: NewItem): Promise<Item> {
    return this.safeAsyncOperation(async () => {
      this.validateRequiredString(itemData.unique_key, 'Item unique key');
      this.validateRequiredString(itemData.name_en, 'Item name');

      this.logOperationStart('Creating', itemData.name_en, { key: itemData.unique_key });

      const item = await this.model.create(itemData);

      this.logOperationSuccess('Created', item.name_en, { id: item.id });
      return item;
    }, 'create item', itemData.name_en);
  }

  async getItems(options: PaginationOptions = {}): Promise<PaginatedResult<Item>> {
    return this.safeAsyncOperation(async () => {
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findAll(validatedOptions);
    }, 'fetch items');
  }

  async getItemById(id: string | number): Promise<Item> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(id, 'Item ID');
      return await this.model.findById(numericId);
    }, 'fetch item', id);
  }

  async getItemByKey(key: string): Promise<Item> {
    return this.safeAsyncOperation(async () => {
      this.validateId(key, 'Item key');
      return await this.model.findByKey(key);
    }, 'fetch item by key', key);
  }

  async getItemsByCategory(category: string, options: PaginationOptions = {}): Promise<PaginatedResult<Item>> {
    return this.safeAsyncOperation(async () => {
      this.validateRequiredString(category, 'Item category');
      const itemCategory = this.validateItemCategory(category);
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findByCategory(itemCategory, validatedOptions);
    }, 'fetch items by category', category);
  }

  async getItemsByRarity(rarity: string, options: PaginationOptions = {}): Promise<PaginatedResult<Item>> {
    return this.safeAsyncOperation(async () => {
      this.validateRequiredString(rarity, 'Rarity');
      const itemRarity = this.validateItemRarity(rarity);
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findByRarity(itemRarity, validatedOptions);
    }, 'fetch items by rarity', rarity);
  }

  async updateItem(id: string | number, updates: Partial<NewItem>): Promise<Item> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(id, 'Item ID');
      this.validateOptionalString(updates.name_en, 'Item name');

      this.logOperationStart('Updating', id, { updates });

      const item = await this.model.update(numericId, updates);

      this.logOperationSuccess('Updated', item.name_en, { id: item.id });
      return item;
    }, 'update item', id);
  }

  async deleteItem(id: string | number): Promise<void> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(id, 'Item ID');

      // Check if item exists before deletion
      await this.model.findById(numericId);

      this.logOperationStart('Deleting', id);
      await this.model.delete(numericId);
      this.logOperationSuccess('Deleted', id);
    }, 'delete item', id);
  }

  async searchItems(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Item>> {
    return this.safeAsyncOperation(async () => {
      this.validateSearchQuery(query);
      const validatedOptions = this.validatePaginationOptions(options);
      const searchFields = ['name_jp', 'name_en', 'name_cn', 'name_tw', 'name_kr', 'unique_key'];
      return await this.model.search(searchFields, query.trim(), validatedOptions);
    }, 'search items', query);
  }

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  private validateItemCategory(category: string): ItemCategory {
    const validCategories: ItemCategory[] = ['CURRENCY', 'UPGRADE_MATERIAL', 'CONSUMABLE', 'GIFT', 'ACCESSORY', 'FURNITURE', 'SPECIAL'];
    
    if (!validCategories.includes(category as ItemCategory)) {
      throw new Error(`Invalid item category: ${category}. Valid categories are: ${validCategories.join(', ')}`);
    }
    
    return category as ItemCategory;
  }

  private validateItemRarity(rarity: string): ItemRarity {
    const validRarities: ItemRarity[] = ['N', 'R', 'SR', 'SSR'];
    
    if (!validRarities.includes(rarity as ItemRarity)) {
      throw new Error(`Invalid item rarity: ${rarity}. Valid rarities are: ${validRarities.join(', ')}`);
    }
    
    return rarity as ItemRarity;
  }

  // Health check is inherited from BaseService
}

// Export singleton instance
export const itemService = new ItemService();
export default itemService; 