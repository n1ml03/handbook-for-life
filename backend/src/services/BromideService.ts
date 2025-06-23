import { BromideModel } from '../models/BromideModel';
import { Bromide, NewBromide } from '../types/database';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';
import { BaseService } from './BaseService';
import { ValidationHelpers } from '../utils/validationHelpers';

export class BromideService extends BaseService<BromideModel, Bromide, NewBromide> {
  constructor() {
    super(new BromideModel(), 'BromideService');
  }

  async createBromide(bromideData: NewBromide): Promise<Bromide> {
    return this.safeAsyncOperation(async () => {
      ValidationHelpers.validateRequiredString(bromideData.unique_key, 'Bromide unique key');
      ValidationHelpers.validateRequiredString(bromideData.name_en, 'Bromide name');

      this.logOperationStart('Creating', bromideData.name_en, { key: bromideData.unique_key });

      const bromide = await this.model.create(bromideData);

      this.logOperationSuccess('Created', bromide.name_en, { id: bromide.id });
      return bromide;
    }, 'create bromide', bromideData.name_en);
  }

  async getBromides(options: PaginationOptions = {}): Promise<PaginatedResult<Bromide>> {
    return this.safeAsyncOperation(async () => {
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findAll(validatedOptions);
    }, 'fetch bromides');
  }

  async getBromideById(id: string | number): Promise<Bromide> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(id, 'Bromide ID');
      return await this.model.findById(numericId);
    }, 'fetch bromide', id);
  }

  async getBromideByKey(key: string): Promise<Bromide> {
    return this.safeAsyncOperation(async () => {
      this.validateId(key, 'Bromide key');
      return await this.model.findByUniqueKey(key);
    }, 'fetch bromide by key', key);
  }

  async getBromidesByType(type: string, options: PaginationOptions = {}): Promise<PaginatedResult<Bromide>> {
    return this.safeAsyncOperation(async () => {
      ValidationHelpers.validateRequiredString(type, 'Bromide type');
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findByType(type, validatedOptions);
    }, 'fetch bromides by type', type);
  }

  async updateBromide(id: string | number, updates: Partial<NewBromide>): Promise<Bromide> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(id, 'Bromide ID');
      this.validateOptionalString(updates.name_en, 'Bromide name');

      this.logOperationStart('Updating', id, { updates });

      const bromide = await this.model.update(numericId, updates);

      this.logOperationSuccess('Updated', bromide.name_en, { id: bromide.id });
      return bromide;
    }, 'update bromide', id);
  }

  async deleteBromide(id: string | number): Promise<void> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(id, 'Bromide ID');

      // Check if bromide exists before deletion
      await this.model.findById(numericId);

      this.logOperationStart('Deleting', id);
      await this.model.delete(numericId);
      this.logOperationSuccess('Deleted', id);
    }, 'delete bromide', id);
  }

  async searchBromides(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Bromide>> {
    return this.safeAsyncOperation(async () => {
      this.validateSearchQuery(query);
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.search(query.trim(), validatedOptions);
    }, 'search bromides', query);
  }

  // Health check is inherited from BaseService
}

export const bromideService = new BromideService();
export default bromideService; 