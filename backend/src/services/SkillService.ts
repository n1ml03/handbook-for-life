import { SkillModel } from '../models/SkillModel';
import { Skill, NewSkill } from '../types/database';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config';

export class SkillService {
  private skillModel: SkillModel;

  constructor() {
    this.skillModel = new SkillModel();
  }

  async createSkill(skillData: NewSkill): Promise<Skill> {
    try {
      if (!skillData.unique_key?.trim()) {
        throw new AppError('Skill unique key is required', 400);
      }

      if (!skillData.name_en?.trim()) {
        throw new AppError('Skill name is required', 400);
      }

      logger.info(`Creating skill: ${skillData.name_en}`, { key: skillData.unique_key });
      
      const skill = await this.skillModel.create(skillData);
      
      logger.info(`Skill created successfully: ${skill.name_en}`, { id: skill.id });
      return skill;
    } catch (error) {
      logger.error(`Failed to create skill: ${skillData.name_en}`, { 
        error: error instanceof Error ? error.message : error 
      });
      throw error;
    }
  }

  async getSkills(options: PaginationOptions = {}): Promise<PaginatedResult<Skill>> {
    try {
      return await this.skillModel.findAll(options);
    } catch (error) {
      logger.error('Failed to fetch skills', { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch skills', 500);
    }
  }

  async getSkillById(id: string): Promise<Skill> {
    try {
      if (!id?.trim()) {
        throw new AppError('Skill ID is required', 400);
      }

      return await this.skillModel.findById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to fetch skill: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch skill', 500);
    }
  }

  async getSkillByKey(key: string): Promise<Skill> {
    try {
      if (!key?.trim()) {
        throw new AppError('Skill key is required', 400);
      }

      return await this.skillModel.findByKey(key);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to fetch skill by key: ${key}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch skill', 500);
    }
  }

  async getSkillsByCategory(category: string, options: PaginationOptions = {}): Promise<PaginatedResult<Skill>> {
    try {
      if (!category?.trim()) {
        throw new AppError('Skill category is required', 400);
      }

      return await this.skillModel.findByCategory(category, options);
    } catch (error) {
      logger.error(`Failed to fetch skills by category: ${category}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch skills by category', 500);
    }
  }

  async getSkillsByEffectType(effectType: string, options: PaginationOptions = {}): Promise<PaginatedResult<Skill>> {
    try {
      if (!effectType?.trim()) {
        throw new AppError('Effect type is required', 400);
      }

      return await this.skillModel.findByEffectType(effectType, options);
    } catch (error) {
      logger.error(`Failed to fetch skills by effect type: ${effectType}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch skills by effect type', 500);
    }
  }

  async updateSkill(id: string, updates: Partial<NewSkill>): Promise<Skill> {
    try {
      if (!id?.trim()) {
        throw new AppError('Skill ID is required', 400);
      }

      if (updates.name_en !== undefined && !updates.name_en?.trim()) {
        throw new AppError('Skill name cannot be empty', 400);
      }

      logger.info(`Updating skill: ${id}`, { updates });
      
      const skill = await this.skillModel.update(id, updates);
      
      logger.info(`Skill updated successfully: ${skill.name_en}`, { id: skill.id });
      return skill;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to update skill: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to update skill', 500);
    }
  }

  async deleteSkill(id: string): Promise<void> {
    try {
      if (!id?.trim()) {
        throw new AppError('Skill ID is required', 400);
      }

      await this.skillModel.findById(id);
      
      logger.info(`Deleting skill: ${id}`);
      await this.skillModel.delete(id);
      logger.info(`Skill deleted successfully: ${id}`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to delete skill: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to delete skill', 500);
    }
  }

  async searchSkills(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Skill>> {
    try {
      if (!query?.trim()) {
        throw new AppError('Search query is required', 400);
      }

      return await this.skillModel.search(query.trim(), options);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to search skills: ${query}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to search skills', 500);
    }
  }

  async healthCheck(): Promise<{ isHealthy: boolean; errors: string[] }> {
    try {
      const modelHealth = await this.skillModel.healthCheck();
      return {
        isHealthy: modelHealth.isHealthy,
        errors: modelHealth.errors
      };
    } catch (error) {
      return {
        isHealthy: false,
        errors: [`Skill service health check failed: ${error instanceof Error ? error.message : error}`]
      };
    }
  }
}

export const skillService = new SkillService();
export default skillService; 