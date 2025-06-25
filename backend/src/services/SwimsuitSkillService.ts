import { SwimsuitSkillModel } from '../models/SwimsuitSkillModel';
import { SwimsuitModel } from '../models/SwimsuitModel';
import { SkillModel } from '../models/SkillModel';
import { SwimsuitSkill, NewSwimsuitSkill, SkillSlot, PaginationOptions, PaginatedResult } from '../types/database';
import { BaseService } from './BaseService';

export class SwimsuitSkillService extends BaseService<SwimsuitSkillModel, SwimsuitSkill, NewSwimsuitSkill> {
  private swimsuitModel: SwimsuitModel;
  private skillModel: SkillModel;

  constructor() {
    super(new SwimsuitSkillModel(), 'SwimsuitSkillService');
    this.swimsuitModel = new SwimsuitModel();
    this.skillModel = new SkillModel();
  }

  // ============================================================================
  // SWIMSUIT SKILL CRUD OPERATIONS
  // ============================================================================

  async addSkillToSwimsuit(swimsuitSkillData: NewSwimsuitSkill): Promise<SwimsuitSkill> {
    return this.safeAsyncOperation(async () => {
      // Validate that swimsuit and skill exist
      await this.swimsuitModel.findById(swimsuitSkillData.swimsuit_id);
      await this.skillModel.findById(swimsuitSkillData.skill_id);

      // Validate skill configuration before adding
      const validation = await this.validateSkillAddition(swimsuitSkillData);
      if (!validation.isValid) {
        throw new Error(`Invalid skill configuration: ${validation.errors.join(', ')}`);
      }

      this.logOperationStart('Adding skill', 
        `skill ${swimsuitSkillData.skill_id} to swimsuit ${swimsuitSkillData.swimsuit_id}`,
        { slot: swimsuitSkillData.skill_slot }
      );

      const swimsuitSkill = await this.model.create(swimsuitSkillData);

      this.logOperationSuccess('Added skill', swimsuitSkill.skill_id);
      return swimsuitSkill;
    }, 'add skill to swimsuit');
  }

  async getSkillsBySwimsuitId(swimsuitId: number, options: PaginationOptions = {}): Promise<PaginatedResult<any>> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(swimsuitId, 'Swimsuit ID');
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findBySwimsuitIdWithDetails(numericId, validatedOptions);
    }, 'fetch skills by swimsuit', swimsuitId);
  }

  async getSwimsuitsBySkillId(skillId: number, options: PaginationOptions = {}): Promise<PaginatedResult<any>> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(skillId, 'Skill ID');
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findBySkillIdWithDetails(numericId, validatedOptions);
    }, 'fetch swimsuits by skill', skillId);
  }

  async updateSwimsuitSkill(swimsuitId: number, skillSlot: SkillSlot, newSkillId: number): Promise<SwimsuitSkill> {
    return this.safeAsyncOperation(async () => {
      const numericSwimsuitId = this.parseNumericId(swimsuitId, 'Swimsuit ID');
      const numericSkillId = this.parseNumericId(newSkillId, 'New skill ID');

      // Validate that the new skill exists
      await this.skillModel.findById(numericSkillId);

      // Validate the update won't break skill configuration
      const validation = await this.validateSkillUpdate(numericSwimsuitId, skillSlot, numericSkillId);
      if (!validation.isValid) {
        throw new Error(`Invalid skill update: ${validation.errors.join(', ')}`);
      }

      this.logOperationStart('Updating swimsuit skill', 
        `slot ${skillSlot} for swimsuit ${numericSwimsuitId}`,
        { newSkillId: numericSkillId }
      );

      const swimsuitSkill = await this.model.update(numericSwimsuitId, skillSlot, { skill_id: numericSkillId });

      this.logOperationSuccess('Updated swimsuit skill', swimsuitSkill.skill_id);
      return swimsuitSkill;
    }, 'update swimsuit skill');
  }

  async removeSkillFromSwimsuit(swimsuitId: number, skillSlot: SkillSlot): Promise<void> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(swimsuitId, 'Swimsuit ID');

      // Validate the removal won't break required skill configuration
      const validation = await this.validateSkillRemoval(numericId, skillSlot);
      if (!validation.isValid) {
        throw new Error(`Cannot remove skill: ${validation.errors.join(', ')}`);
      }

      this.logOperationStart('Removing skill', 
        `from slot ${skillSlot} for swimsuit ${numericId}`
      );

      await this.model.delete(numericId, skillSlot);
      
      this.logOperationSuccess('Removed skill', `${numericId}:${skillSlot}`);
    }, 'remove skill from swimsuit');
  }

  // ============================================================================
  // BULK OPERATIONS
  // ============================================================================

  async setSwimsuitSkills(swimsuitId: number, skills: Omit<NewSwimsuitSkill, 'swimsuit_id'>[]): Promise<SwimsuitSkill[]> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(swimsuitId, 'Swimsuit ID');

      // Validate that swimsuit exists
      await this.swimsuitModel.findById(numericId);

      // Validate all skills exist
      for (const skill of skills) {
        await this.skillModel.findById(skill.skill_id);
      }

      // Validate the complete skill configuration
      const validation = await this.validateCompleteSkillConfiguration(skills);
      if (!validation.isValid) {
        throw new Error(`Invalid skill configuration: ${validation.errors.join(', ')}`);
      }

      this.logOperationStart('Setting swimsuit skills', 
        `${skills.length} skills for swimsuit ${numericId}`
      );

      const result = await this.model.replaceSwimsuitSkills(numericId, skills);

      this.logOperationSuccess('Set swimsuit skills', result.length);
      return result;
    }, 'set swimsuit skills');
  }

  async bulkAddSwimsuitSkills(swimsuitSkills: NewSwimsuitSkill[]): Promise<SwimsuitSkill[]> {
    return this.safeAsyncOperation(async () => {
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
          throw new Error(`Invalid skill configuration for swimsuit ${swimsuitId}: ${validation.errors.join(', ')}`);
        }
      }

      this.logOperationStart('Bulk adding swimsuit skills', `${swimsuitSkills.length} skills`);

      const results = await this.model.bulkCreate(swimsuitSkills);

      this.logOperationSuccess('Bulk added swimsuit skills', results.length);
      return results;
    }, 'bulk add swimsuit skills');
  }

  // ============================================================================
  // ANALYTICS AND REPORTING
  // ============================================================================

  async getSwimsuitSkillSummary(swimsuitId: number): Promise<any> {
    return this.safeAsyncOperation(async () => {
      const numericId = this.parseNumericId(swimsuitId, 'Swimsuit ID');
      return await this.model.getSwimsuitSkillSummary(numericId);
    }, 'fetch swimsuit skill summary', swimsuitId);
  }

  async getSkillUsageStatistics(): Promise<any[]> {
    return this.safeAsyncOperation(async () => {
      return await this.model.getSkillUsageStatistics();
    }, 'fetch skill usage statistics');
  }

  async getPopularSkillCombinations(limit: number = 10): Promise<any[]> {
    return this.safeAsyncOperation(async () => {
      if (limit <= 0 || limit > 100) {
        throw new Error('Limit must be between 1 and 100');
      }
      // This would require a more complex query to find common skill combinations
      // For now, return top skills by usage
      const statistics = await this.getSkillUsageStatistics();
      return statistics.slice(0, limit);
    }, 'fetch popular skill combinations');
  }

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  private async validateSkillAddition(swimsuitSkillData: NewSwimsuitSkill): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check if slot is already occupied
      const existingSkills = await this.model.findBySwimsuitId(swimsuitSkillData.swimsuit_id);
      const slotTaken = existingSkills.some(skill => skill.skill_slot === swimsuitSkillData.skill_slot);
      
      if (slotTaken) {
        errors.push(`Skill slot ${swimsuitSkillData.skill_slot} is already occupied`);
      }

      // Validate skill slot is valid
      if (!this.isValidSkillSlot(swimsuitSkillData.skill_slot)) {
        errors.push(`Invalid skill slot: ${swimsuitSkillData.skill_slot}`);
      }
    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : error}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async validateSkillUpdate(swimsuitId: number, skillSlot: SkillSlot, newSkillId: number): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check if the slot exists for this swimsuit
      const existingSkills = await this.model.findBySwimsuitId(swimsuitId);
      const slotExists = existingSkills.some(skill => skill.skill_slot === skillSlot);
      
      if (!slotExists) {
        errors.push(`No skill found in slot ${skillSlot} for swimsuit ${swimsuitId}`);
      }

      // Validate skill slot is valid
      if (!this.isValidSkillSlot(skillSlot)) {
        errors.push(`Invalid skill slot: ${skillSlot}`);
      }
    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : error}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async validateSkillRemoval(swimsuitId: number, skillSlot: SkillSlot): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check if the slot exists for this swimsuit
      const existingSkills = await this.model.findBySwimsuitId(swimsuitId);
      const slotExists = existingSkills.some(skill => skill.skill_slot === skillSlot);
      
      if (!slotExists) {
        errors.push(`No skill found in slot ${skillSlot} for swimsuit ${swimsuitId}`);
      }

      // Add any business logic for mandatory skills if needed
      // For example, maybe main skills cannot be removed
    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : error}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async validateCompleteSkillConfiguration(skills: Omit<NewSwimsuitSkill, 'swimsuit_id'>[]): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      // Check for duplicate slots
      const slots = skills.map(skill => skill.skill_slot);
      const uniqueSlots = new Set(slots);
      
      if (slots.length !== uniqueSlots.size) {
        errors.push('Duplicate skill slots detected');
      }

      // Validate all slots are valid
      for (const skill of skills) {
        if (!this.isValidSkillSlot(skill.skill_slot)) {
          errors.push(`Invalid skill slot: ${skill.skill_slot}`);
        }
      }

      // Add any other business rules for skill configuration
    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : error}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidSkillSlot(slot: SkillSlot): boolean {
    const validSlots: SkillSlot[] = ['MAIN', 'SUB1', 'SUB2', 'POTENTIAL1', 'POTENTIAL2'];
    return validSlots.includes(slot);
  }

  // Health check is inherited from BaseService
}

// Export singleton instance
export const swimsuitSkillService = new SwimsuitSkillService();
export default swimsuitSkillService;
