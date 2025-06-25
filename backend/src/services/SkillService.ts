import { SkillModel } from '../models/SkillModel';
import { Skill, NewSkill, SkillCategory } from '../types/database';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';
import { BaseService } from './BaseService';

export class SkillService extends BaseService<SkillModel, Skill, NewSkill> {
  constructor() {
    super(new SkillModel(), 'SkillService');
  }

  async createSkill(skillData: NewSkill): Promise<Skill> {
    return this.safeAsyncOperation(async () => {
      this.validateRequiredString(skillData.unique_key, 'Skill unique key');
      this.validateRequiredString(skillData.name_en, 'Skill name');

      this.logOperationStart('Creating', skillData.name_en, { key: skillData.unique_key });

      const skill = await this.model.create(skillData);

      this.logOperationSuccess('Created', skill.name_en, { id: skill.id });
      return skill;
    }, 'create skill', skillData.name_en);
  }

  async getSkills(options: PaginationOptions = {}): Promise<PaginatedResult<Skill>> {
    return this.safeAsyncOperation(async () => {
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findAll(validatedOptions);
    }, 'fetch skills');
  }

  async getSkillById(id: string | number): Promise<Skill> {
    return this.safeAsyncOperation(async () => {
      this.validateId(id, 'Skill ID');
      return await this.model.findById(id);
    }, 'fetch skill', id);
  }

  async getSkillByKey(key: string): Promise<Skill> {
    return this.safeAsyncOperation(async () => {
      this.validateId(key, 'Skill key');
      return await this.model.findByKey(key);
    }, 'fetch skill by key', key);
  }

  async getSkillsByCategory(category: string, options: PaginationOptions = {}): Promise<PaginatedResult<Skill>> {
    return this.safeAsyncOperation(async () => {
      this.validateRequiredString(category, 'Skill category');
      const skillCategory = this.validateSkillCategory(category);
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findByCategory(skillCategory, validatedOptions);
    }, 'fetch skills by category', category);
  }

  async getSkillsByEffectType(effectType: string, options: PaginationOptions = {}): Promise<PaginatedResult<Skill>> {
    return this.safeAsyncOperation(async () => {
      this.validateRequiredString(effectType, 'Effect type');
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findByEffectType(effectType, validatedOptions);
    }, 'fetch skills by effect type', effectType);
  }

  async updateSkill(id: string | number, updates: Partial<NewSkill>): Promise<Skill> {
    return this.safeAsyncOperation(async () => {
      this.validateId(id, 'Skill ID');
      this.validateOptionalString(updates.name_en, 'Skill name');

      this.logOperationStart('Updating', id, { updates });

      const skill = await this.model.update(id, updates);

      this.logOperationSuccess('Updated', skill.name_en, { id: skill.id });
      return skill;
    }, 'update skill', id);
  }

  async deleteSkill(id: string | number): Promise<void> {
    return this.safeAsyncOperation(async () => {
      this.validateId(id, 'Skill ID');

      // Check if skill exists before deletion
      await this.model.findById(id);

      this.logOperationStart('Deleting', id);
      await this.model.delete(id);
      this.logOperationSuccess('Deleted', id);
    }, 'delete skill', id);
  }

  async searchSkills(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Skill>> {
    return this.safeAsyncOperation(async () => {
      this.validateSearchQuery(query);
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.search(query.trim(), validatedOptions);
    }, 'search skills', query);
  }

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  private validateSkillCategory(category: string): SkillCategory {
    const validCategories: SkillCategory[] = ['ACTIVE', 'PASSIVE', 'POTENTIAL'];
    
    if (!validCategories.includes(category as SkillCategory)) {
      throw new Error(`Invalid skill category: ${category}. Valid categories are: ${validCategories.join(', ')}`);
    }
    
    return category as SkillCategory;
  }

  // Health check is inherited from BaseService
}

// Export singleton instance
export const skillService = new SkillService();
export default skillService; 