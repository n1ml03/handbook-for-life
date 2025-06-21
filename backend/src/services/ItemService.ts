import { ItemModel } from '../models/ItemModel';
import { Item, NewItem } from '../types/database';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config';

export class ItemService {
  private itemModel: ItemModel;

  constructor() {
    this.itemModel = new ItemModel();
  }

  async createItem(itemData: NewItem): Promise<Item> {
    try {
      if (!itemData.unique_key?.trim()) {
        throw new AppError('Item unique key is required', 400);
      }

      if (!itemData.name_en?.trim()) {
        throw new AppError('Item name is required', 400);
      }

      logger.info(`Creating item: ${itemData.name_en}`, { key: itemData.unique_key });
      
      const item = await this.itemModel.create(itemData);
      
      logger.info(`Item created successfully: ${item.name_en}`, { id: item.id });
      return item;
    } catch (error) {
      logger.error(`Failed to create item: ${itemData.name_en}`, { 
        error: error instanceof Error ? error.message : error 
      });
      throw error;
    }
  }

  async getItems(options: PaginationOptions = {}): Promise<PaginatedResult<Item>> {
    try {
      return await this.itemModel.findAll(options);
    } catch (error) {
      logger.error('Failed to fetch items', { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch items', 500);
    }
  }

  async getItemById(id: string): Promise<Item> {
    try {
      if (!id?.trim()) {
        throw new AppError('Item ID is required', 400);
      }

      return await this.itemModel.findById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to fetch item: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch item', 500);
    }
  }

  async getItemByKey(key: string): Promise<Item> {
    try {
      if (!key?.trim()) {
        throw new AppError('Item key is required', 400);
      }

      return await this.itemModel.findByKey(key);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to fetch item by key: ${key}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch item', 500);
    }
  }

  async getItemsByCategory(category: string, options: PaginationOptions = {}): Promise<PaginatedResult<Item>> {
    try {
      if (!category?.trim()) {
        throw new AppError('Item category is required', 400);
      }

      return await this.itemModel.findByCategory(category, options);
    } catch (error) {
      logger.error(`Failed to fetch items by category: ${category}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch items by category', 500);
    }
  }

  async getItemsByRarity(rarity: string, options: PaginationOptions = {}): Promise<PaginatedResult<Item>> {
    try {
      if (!rarity?.trim()) {
        throw new AppError('Rarity is required', 400);
      }

      return await this.itemModel.findByRarity(rarity, options);
    } catch (error) {
      logger.error(`Failed to fetch items by rarity: ${rarity}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch items by rarity', 500);
    }
  }

  async updateItem(id: string, updates: Partial<NewItem>): Promise<Item> {
    try {
      if (!id?.trim()) {
        throw new AppError('Item ID is required', 400);
      }

      if (updates.name_en !== undefined && !updates.name_en?.trim()) {
        throw new AppError('Item name cannot be empty', 400);
      }

      logger.info(`Updating item: ${id}`, { updates });
      
      const item = await this.itemModel.update(id, updates);
      
      logger.info(`Item updated successfully: ${item.name_en}`, { id: item.id });
      return item;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to update item: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to update item', 500);
    }
  }

  async deleteItem(id: string): Promise<void> {
    try {
      if (!id?.trim()) {
        throw new AppError('Item ID is required', 400);
      }

      await this.itemModel.findById(id);
      
      logger.info(`Deleting item: ${id}`);
      await this.itemModel.delete(id);
      logger.info(`Item deleted successfully: ${id}`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to delete item: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to delete item', 500);
    }
  }

  async searchItems(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Item>> {
    try {
      if (!query?.trim()) {
        throw new AppError('Search query is required', 400);
      }

      return await this.itemModel.search(query.trim(), options);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to search items: ${query}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to search items', 500);
    }
  }

  async healthCheck(): Promise<{ isHealthy: boolean; errors: string[] }> {
    try {
      const modelHealth = await this.itemModel.healthCheck();
      return {
        isHealthy: modelHealth.isHealthy,
        errors: modelHealth.errors
      };
    } catch (error) {
      return {
        isHealthy: false,
        errors: [`Item service health check failed: ${error instanceof Error ? error.message : error}`]
      };
    }
  }
}

export const itemService = new ItemService();
export default itemService; 