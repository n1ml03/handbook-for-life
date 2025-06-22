import { SwimsuitSkillModel } from '../models/SwimsuitSkillModel';
import { SwimsuitModel } from '../models/SwimsuitModel';
import { SkillModel } from '../models/SkillModel';
import { SwimsuitSkill, NewSwimsuitSkill, SkillSlot, PaginationOptions, PaginatedResult } from '../types/database';
import { AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export class SwimsuitSkillService {
  private swimsuitSkillModel: SwimsuitSkillModel;
  private swimsuitModel: SwimsuitModel;
  private skillModel: SkillModel;

  constructor() {
    this.swimsuitSkillModel = new SwimsuitSkillModel();
    this.swimsuitModel = new SwimsuitModel();
    this.skillModel = new SkillModel();
  }

  // ============================================================================
  // SWIMSUIT SKILL CRUD OPERATIONS
  // ============================================================================

  async addSkillToSwimsuit(swimsuitSkillData: NewSwimsuitSkill): Promise<SwimsuitSkill> {
    try {
      // Validate that swimsuit and skill exist
      await this.swimsuitModel.findById(swimsuitSkillData.swimsuit_id);
      await this.skillModel.findById(swimsuitSkillData.skill_id);

      // Validate skill configuration before adding
      const validation = await this.validateSkillAddition(swimsuitSkillData);
      if (!validation.isValid) {
        throw new AppError(`Invalid skill configuration: ${validation.errors.join(', ')}`, 400);
      }

      const swimsuitSkill = await this.swimsuitSkillModel.create(swimsuitSkillData);
      logger.info(`Added skill ${swimsuitSkillData.skill_id} to swimsuit ${swimsuitSkillData.swimsuit_id} in slot ${swimsuitSkillData.skill_slot}`);
      return swimsuitSkill;
    } catch (error) {
      logger.error('Failed to add skill to swimsuit:', error);
      throw error;
    }
  }

  async getSkillsBySwimsuitId(swimsuitId: number, options: PaginationOptions = {}): Promise<PaginatedResult<any>> {
    try {
      return await this.swimsuitSkillModel.findBySwimsuitIdWithDetails(swimsuitId, options);
    } catch (error) {
      logger.error(`Failed to get skills for swimsuit ${swimsuitId}:`, error);
      throw error;
    }
  }

  async getSwimsuitsBySkillId(skillId: number, options: PaginationOptions = {}): Promise<PaginatedResult<any>> {
    try {
      return await this.swimsuitSkillModel.findBySkillIdWithDetails(skillId, options);
    } catch (error) {
      logger.error(`Failed to get swimsuits for skill ${skillId}:`, error);
      throw error;
    }
  }

  async updateSwimsuitSkill(swimsuitId: number, skillSlot: SkillSlot, newSkillId: number): Promise<SwimsuitSkill> {
    try {
      // Validate that the new skill exists
      await this.skillModel.findById(newSkillId);

      // Validate the update won't break skill configuration
      const validation = await this.validateSkillUpdate(swimsuitId, skillSlot, newSkillId);
      if (!validation.isValid) {
        throw new AppError(`Invalid skill update: ${validation.errors.join(', ')}`, 400);
      }

      const swimsuitSkill = await this.swimsuitSkillModel.update(swimsuitId, skillSlot, { skill_id: newSkillId });
      logger.info(`Updated skill in slot ${skillSlot} for swimsuit ${swimsuitId} to skill ${newSkillId}`);
      return swimsuitSkill;
    } catch (error) {
      logger.error(`Failed to update swimsuit skill:`, error);
      throw error;
    }
  }

  async removeSkillFromSwimsuit(swimsuitId: number, skillSlot: SkillSlot): Promise<void> {
    try {
      // Validate the removal won't break required skill configuration
      const validation = await this.validateSkillRemoval(swimsuitId, skillSlot);
      if (!validation.isValid) {
        throw new AppError(`Cannot remove skill: ${validation.errors.join(', ')}`, 400);
      }

      await this.swimsuitSkillModel.delete(swimsuitId, skillSlot);
      logger.info(`Removed skill from slot ${skillSlot} for swimsuit ${swimsuitId}`);
    } catch (error) {
      logger.error(`Failed to remove skill from swimsuit:`, error);
      throw error;
    }
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  async setSwimsuitSkills(swimsuitId: number, skills: Omit<NewSwimsuitSkill, 'swimsuit_id'>[]): Promise<SwimsuitSkill[]> {
    try {
      // Validate that swimsuit exists
      await this.swimsuitModel.findById(swimsuitId);

      // Validate all skills exist
      for (const skill of skills) {
        await this.skillModel.findById(skill.skill_id);
      }

      // Validate the complete skill configuration
      const validation = await this.validateCompleteSkillConfiguration(skills);
      if (!validation.isValid) {
        throw new AppError(`Invalid skill configuration: ${validation.errors.join(', ')}`, 400);
      }

      const result = await this.swimsuitSkillModel.replaceSwimsuitSkills(swimsuitId, skills);
      logger.info(`Set ${result.length} skills for swimsuit ${swimsuitId}`);
      return result;
    } catch (error) {
      logger.error(`Failed to set swimsuit skills:`, error);
      throw error;
    }
  }

  async bulkAddSwimsuitSkills(swimsuitSkills: NewSwimsuitSkill[]): Promise<SwimsuitSkill[]> {
    try {
      // Validate all swimsuits and skills exist
      const swimsuitIds = new Set(swimsuitSkills.map(ss => ss.swimsuit_id));
      const skillIds = new Set(swimsuitSkills.map(ss => ss.skill_id));

      for (const swimsuitId of swimsuitIds) {
        await this.swimsuitModel.findById(swimsuitId);
      }

      for (const skillId of skillIds) {
        await this.skillModel.findById(skillId);
      }

      // Group by swimsuit and validate each configuration
      const swimsuitGroups = new Map<number, Omit<NewSwimsuitSkill, 'swimsuit_id'>[]>();
      for (const ss of swimsuitSkills) {
        if (!swimsuitGroups.has(ss.swimsuit_id)) {
          swimsuitGroups.set(ss.swimsuit_id, []);
        }
        swimsuitGroups.get(ss.swimsuit_id)!.push({
          skill_id: ss.skill_id,
          skill_slot: ss.skill_slot
        });
      }

      // Validate each swimsuit's skill configuration
      for (const [swimsuitId, skills] of swimsuitGroups) {
        const validation = await this.validateCompleteSkillConfiguration(skills);
        if (!validation.isValid) {
          throw new AppError(`Invalid skill configuration for swimsuit ${swimsuitId}: ${validation.errors.join(', ')}`, 400);
        }
      }

      const results = await this.swimsuitSkillModel.bulkCreate(swimsuitSkills);
      logger.info(`Bulk added ${results.length} swimsuit skills`);
      return results;
    } catch (error) {
      logger.error('Failed to bulk add swimsuit skills:', error);
      throw error;
    }
  }

  // ============================================================================
  // ANALYTICS AND REPORTING
  // ============================================================================

  async getSwimsuitSkillSummary(swimsuitId: number): Promise<any> {
    try {
      const summary = await this.swimsuitSkillModel.getSwimsuitSkillSummary(swimsuitId);
      logger.info(`Retrieved skill summary for swimsuit ${swimsuitId}`);
      return summary;
    } catch (error) {
      logger.error(`Failed to get swimsuit skill summary:`, error);
      throw error;
    }
  }

  async getSkillUsageStatistics(): Promise<any[]> {
    try {
      const statistics = await this.swimsuitSkillModel.getSkillUsageStatistics();
      logger.info('Retrieved skill usage statistics');
      return statistics;
    } catch (error) {
      logger.error('Failed to get skill usage statistics:', error);
      throw error;
    }
  }

  async getPopularSkillCombinations(limit: number = 10): Promise<any[]> {
    try {
      // This would require a more complex query to find common skill combinations
      // For now, return top skills by usage
      const statistics = await this.getSkillUsageStatistics();
      return statistics.slice(0, limit);
    } catch (error) {
      logger.error('Failed to get popular skill combinations:', error);
      throw error;
    }
  }

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  private async validateSkillAddition(swimsuitSkillData: NewSwimsuitSkill): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check if slot is already occupied
      try {
        await this.swimsuitSkillModel.findByCompositeKey(swimsuitSkillData.swimsuit_id, swimsuitSkillData.skill_slot);
        errors.push(`Skill slot ${swimsuitSkillData.skill_slot} is already occupied`);
      } catch {
        // Slot is free, which is what we want
      }

      // Get current skills for the swimsuit
      const currentSkills = await this.swimsuitSkillModel.findBySwimsuitId(swimsuitSkillData.swimsuit_id);
      const currentSlots = currentSkills.data.map(s => s.skill_slot);

      // Validate slot order logic
      if (swimsuitSkillData.skill_slot === 'PASSIVE_2' && !currentSlots.includes('PASSIVE_1')) {
        errors.push('PASSIVE_2 requires PASSIVE_1 to be present');
      }

      if (swimsuitSkillData.skill_slot.startsWith('POTENTIAL') && 
          (!currentSlots.includes('PASSIVE_1') || !currentSlots.includes('PASSIVE_2'))) {
        errors.push('POTENTIAL skills require both PASSIVE skills to be present');
      }

    } catch (error) {
      errors.push(`Validation failed: ${error}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async validateSkillUpdate(swimsuitId: number, skillSlot: SkillSlot, newSkillId: number): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check if the skill slot exists
      await this.swimsuitSkillModel.findByCompositeKey(swimsuitId, skillSlot);

      // Additional validation logic can be added here
      // For example, checking skill category compatibility with slot type

    } catch (error) {
      errors.push(`Skill slot ${skillSlot} not found for swimsuit ${swimsuitId}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async validateSkillRemoval(swimsuitId: number, skillSlot: SkillSlot): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Get current skills
      const currentSkills = await this.swimsuitSkillModel.findBySwimsuitId(swimsuitId);
      const currentSlots = currentSkills.data.map(s => s.skill_slot);

      // Check if removing this skill would break dependencies
      if (skillSlot === 'ACTIVE') {
        errors.push('Cannot remove ACTIVE skill - it is required');
      }

      if (skillSlot === 'PASSIVE_1' && currentSlots.includes('PASSIVE_2')) {
        errors.push('Cannot remove PASSIVE_1 while PASSIVE_2 is present');
      }

      if ((skillSlot === 'PASSIVE_1' || skillSlot === 'PASSIVE_2') && 
          currentSlots.some(slot => slot.startsWith('POTENTIAL'))) {
        errors.push('Cannot remove PASSIVE skills while POTENTIAL skills are present');
      }

    } catch (error) {
      errors.push(`Validation failed: ${error}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async validateCompleteSkillConfiguration(skills: Omit<NewSwimsuitSkill, 'swimsuit_id'>[]): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    const skillSlots = skills.map(s => s.skill_slot);

    // Check for required active skill
    if (!skillSlots.includes('ACTIVE')) {
      errors.push('Swimsuit must have an ACTIVE skill');
    }

    // Check for duplicate slots
    const uniqueSlots = new Set(skillSlots);
    if (uniqueSlots.size !== skillSlots.length) {
      errors.push('Duplicate skill slots detected');
    }

    // Check slot order logic
    const hasPassive1 = skillSlots.includes('PASSIVE_1');
    const hasPassive2 = skillSlots.includes('PASSIVE_2');
    const hasPotential = skillSlots.some(slot => slot.startsWith('POTENTIAL'));

    if (hasPassive2 && !hasPassive1) {
      errors.push('PASSIVE_2 requires PASSIVE_1 to be present');
    }

    if (hasPotential && (!hasPassive1 || !hasPassive2)) {
      errors.push('POTENTIAL skills require both PASSIVE skills to be present');
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
      const swimsuitSkillHealth = await this.swimsuitSkillModel.healthCheck();
      const swimsuitHealth = await this.swimsuitModel.healthCheck();
      const skillHealth = await this.skillModel.healthCheck();

      if (!swimsuitSkillHealth.isHealthy) {
        errors.push(...swimsuitSkillHealth.errors);
        isHealthy = false;
      }

      if (!swimsuitHealth.isHealthy) {
        errors.push(...swimsuitHealth.errors);
        isHealthy = false;
      }

      if (!skillHealth.isHealthy) {
        errors.push(...skillHealth.errors);
        isHealthy = false;
      }
    } catch (error) {
      errors.push(`SwimsuitSkillService health check failed: ${error}`);
      isHealthy = false;
    }

    return { isHealthy, errors };
  }
}

// Export singleton instance
export const swimsuitSkillService = new SwimsuitSkillService();
