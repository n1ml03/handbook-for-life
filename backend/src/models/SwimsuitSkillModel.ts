import { BaseModel, PaginationOptions, PaginatedResult } from './BaseModel';
import { SwimsuitSkill, NewSwimsuitSkill, SkillSlot } from '../types/database';
import { executeQuery } from '@config/database';
import { AppError } from '@middleware/errorHandler';

export class SwimsuitSkillModel extends BaseModel {
  constructor() {
    super('swimsuit_skills');
  }

  // Mapper function to convert database row to SwimsuitSkill object
  private mapSwimsuitSkillRow(row: any): SwimsuitSkill {
    return {
      swimsuit_id: row.swimsuit_id,
      skill_id: row.skill_id,
      skill_slot: row.skill_slot as SkillSlot,
    };
  }

  async create(swimsuitSkill: NewSwimsuitSkill): Promise<SwimsuitSkill> {
    try {
      await executeQuery(
        `INSERT INTO swimsuit_skills (swimsuit_id, skill_id, skill_slot)
         VALUES (?, ?, ?)`,
        [
          swimsuitSkill.swimsuit_id,
          swimsuitSkill.skill_id,
          swimsuitSkill.skill_slot,
        ]
      );

      return this.findByCompositeKey(swimsuitSkill.swimsuit_id, swimsuitSkill.skill_slot);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError('Skill slot already occupied for this swimsuit', 409);
      }
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new AppError('Referenced swimsuit or skill does not exist', 400);
      }
      throw new AppError('Failed to create swimsuit skill link', 500);
    }
  }

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<SwimsuitSkill>> {
    return this.getPaginatedResults(
      'SELECT * FROM swimsuit_skills',
      'SELECT COUNT(*) FROM swimsuit_skills',
      options,
      this.mapSwimsuitSkillRow
    );
  }

  async findByCompositeKey(swimsuitId: number, skillSlot: SkillSlot): Promise<SwimsuitSkill> {
    const [rows] = await executeQuery(
      'SELECT * FROM swimsuit_skills WHERE swimsuit_id = ? AND skill_slot = ?',
      [swimsuitId, skillSlot]
    ) as [any[], any];
    
    if (rows.length === 0) {
      throw new AppError('Swimsuit skill link not found', 404);
    }
    
    return this.mapSwimsuitSkillRow(rows[0]);
  }

  async findBySwimsuitId(swimsuitId: number, options: PaginationOptions = {}): Promise<PaginatedResult<SwimsuitSkill>> {
    return this.getPaginatedResults(
      `SELECT * FROM swimsuit_skills WHERE swimsuit_id = ?`,
      `SELECT COUNT(*) FROM swimsuit_skills WHERE swimsuit_id = ?`,
      options,
      this.mapSwimsuitSkillRow,
      [swimsuitId]
    );
  }

  async findBySwimsuitIdWithDetails(swimsuitId: number, options: PaginationOptions = {}): Promise<PaginatedResult<any>> {
    const baseQuery = `
      SELECT 
        ss.*,
        s.name_en as skill_name,
        s.skill_category,
        s.effect_type,
        s.description_en as skill_description
      FROM swimsuit_skills ss
      LEFT JOIN skills s ON ss.skill_id = s.id
      WHERE ss.swimsuit_id = ?
    `;

    const countQuery = `SELECT COUNT(*) FROM swimsuit_skills WHERE swimsuit_id = ?`;

    return this.getPaginatedResults(
      baseQuery,
      countQuery,
      options,
      (row: any) => ({
        ...this.mapSwimsuitSkillRow(row),
        skill_name: row.skill_name,
        skill_category: row.skill_category,
        effect_type: row.effect_type,
        skill_description: row.skill_description,
      }),
      [swimsuitId]
    );
  }

  async findBySkillId(skillId: number, options: PaginationOptions = {}): Promise<PaginatedResult<SwimsuitSkill>> {
    return this.getPaginatedResults(
      `SELECT * FROM swimsuit_skills WHERE skill_id = ?`,
      `SELECT COUNT(*) FROM swimsuit_skills WHERE skill_id = ?`,
      options,
      this.mapSwimsuitSkillRow,
      [skillId]
    );
  }

  async findBySkillIdWithDetails(skillId: number, options: PaginationOptions = {}): Promise<PaginatedResult<any>> {
    const baseQuery = `
      SELECT 
        ss.*,
        sw.name_en as swimsuit_name,
        sw.rarity as swimsuit_rarity,
        c.name_en as character_name
      FROM swimsuit_skills ss
      LEFT JOIN swimsuits sw ON ss.swimsuit_id = sw.id
      LEFT JOIN characters c ON sw.character_id = c.id
      WHERE ss.skill_id = ?
    `;

    const countQuery = `SELECT COUNT(*) FROM swimsuit_skills WHERE skill_id = ?`;

    return this.getPaginatedResults(
      baseQuery,
      countQuery,
      options,
      (row: any) => ({
        ...this.mapSwimsuitSkillRow(row),
        swimsuit_name: row.swimsuit_name,
        swimsuit_rarity: row.swimsuit_rarity,
        character_name: row.character_name,
      }),
      [skillId]
    );
  }

  async findBySkillSlot(skillSlot: SkillSlot, options: PaginationOptions = {}): Promise<PaginatedResult<SwimsuitSkill>> {
    return this.getPaginatedResults(
      `SELECT * FROM swimsuit_skills WHERE skill_slot = ?`,
      `SELECT COUNT(*) FROM swimsuit_skills WHERE skill_slot = ?`,
      options,
      this.mapSwimsuitSkillRow,
      [skillSlot]
    );
  }

  async update(swimsuitId: number, skillSlot: SkillSlot, updates: { skill_id: number }): Promise<SwimsuitSkill> {
    try {
      await executeQuery(
        `UPDATE swimsuit_skills SET skill_id = ? WHERE swimsuit_id = ? AND skill_slot = ?`,
        [updates.skill_id, swimsuitId, skillSlot]
      );

      return this.findByCompositeKey(swimsuitId, skillSlot);
    } catch (error: any) {
      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        throw new AppError('Referenced skill does not exist', 400);
      }
      throw new AppError('Failed to update swimsuit skill link', 500);
    }
  }

  async delete(swimsuitId: number, skillSlot: SkillSlot): Promise<void> {
    const [result] = await executeQuery(
      `DELETE FROM swimsuit_skills WHERE swimsuit_id = ? AND skill_slot = ?`,
      [swimsuitId, skillSlot]
    ) as [any, any];

    if (result.affectedRows === 0) {
      throw new AppError('Swimsuit skill link not found', 404);
    }
  }

  async deleteBySwimsuitId(swimsuitId: number): Promise<void> {
    await executeQuery('DELETE FROM swimsuit_skills WHERE swimsuit_id = ?', [swimsuitId]);
  }

  async deleteBySkillId(skillId: number): Promise<void> {
    await executeQuery('DELETE FROM swimsuit_skills WHERE skill_id = ?', [skillId]);
  }

  async bulkCreate(swimsuitSkills: NewSwimsuitSkill[]): Promise<SwimsuitSkill[]> {
    if (swimsuitSkills.length === 0) {
      return [];
    }

    return this.withTransaction(async (connection) => {
      const results: SwimsuitSkill[] = [];
      
      for (const swimsuitSkill of swimsuitSkills) {
        await connection.execute(
          `INSERT INTO swimsuit_skills (swimsuit_id, skill_id, skill_slot)
           VALUES (?, ?, ?)`,
          [
            swimsuitSkill.swimsuit_id,
            swimsuitSkill.skill_id,
            swimsuitSkill.skill_slot,
          ]
        );

        const created = await this.findByCompositeKey(swimsuitSkill.swimsuit_id, swimsuitSkill.skill_slot);
        results.push(created);
      }

      return results;
    });
  }

  async replaceSwimsuitSkills(swimsuitId: number, newSkills: Omit<NewSwimsuitSkill, 'swimsuit_id'>[]): Promise<SwimsuitSkill[]> {
    return this.withTransaction(async (connection) => {
      // Delete existing skills for this swimsuit
      await connection.execute('DELETE FROM swimsuit_skills WHERE swimsuit_id = ?', [swimsuitId]);

      // Insert new skills
      const results: SwimsuitSkill[] = [];
      for (const skill of newSkills) {
        await connection.execute(
          `INSERT INTO swimsuit_skills (swimsuit_id, skill_id, skill_slot)
           VALUES (?, ?, ?)`,
          [swimsuitId, skill.skill_id, skill.skill_slot]
        );

        const created = await this.findByCompositeKey(swimsuitId, skill.skill_slot);
        results.push(created);
      }

      return results;
    });
  }

  async getSwimsuitSkillSummary(swimsuitId: number): Promise<any> {
    const [rows] = await executeQuery(`
      SELECT 
        ss.skill_slot,
        s.name_en as skill_name,
        s.skill_category,
        s.effect_type
      FROM swimsuit_skills ss
      LEFT JOIN skills s ON ss.skill_id = s.id
      WHERE ss.swimsuit_id = ?
      ORDER BY 
        CASE ss.skill_slot
          WHEN 'ACTIVE' THEN 1
          WHEN 'PASSIVE_1' THEN 2
          WHEN 'PASSIVE_2' THEN 3
          WHEN 'POTENTIAL_1' THEN 4
          WHEN 'POTENTIAL_2' THEN 5
          WHEN 'POTENTIAL_3' THEN 6
          WHEN 'POTENTIAL_4' THEN 7
        END
    `, [swimsuitId]) as [any[], any];

    return rows.map(row => ({
      skill_slot: row.skill_slot,
      skill_name: row.skill_name,
      skill_category: row.skill_category,
      effect_type: row.effect_type,
    }));
  }

  async getSkillUsageStatistics(): Promise<any[]> {
    const [rows] = await executeQuery(`
      SELECT 
        s.id as skill_id,
        s.name_en as skill_name,
        s.skill_category,
        COUNT(ss.swimsuit_id) as usage_count,
        GROUP_CONCAT(DISTINCT ss.skill_slot) as used_in_slots
      FROM skills s
      LEFT JOIN swimsuit_skills ss ON s.id = ss.skill_id
      GROUP BY s.id, s.name_en, s.skill_category
      ORDER BY usage_count DESC, s.name_en
    `) as [any[], any];

    return rows.map(row => ({
      skill_id: row.skill_id,
      skill_name: row.skill_name,
      skill_category: row.skill_category,
      usage_count: row.usage_count,
      used_in_slots: row.used_in_slots ? row.used_in_slots.split(',') : [],
    }));
  }

  async validateSwimsuitSkillConfiguration(swimsuitId: number): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      const skills = await this.findBySwimsuitId(swimsuitId);
      const skillSlots = skills.data.map(s => s.skill_slot);

      // Check for required active skill
      if (!skillSlots.includes('ACTIVE')) {
        errors.push('Swimsuit must have an ACTIVE skill');
      }

      // Check for duplicate slots (should not happen due to primary key constraint)
      const uniqueSlots = new Set(skillSlots);
      if (uniqueSlots.size !== skillSlots.length) {
        errors.push('Duplicate skill slots detected');
      }

      // Check slot order logic (passive skills should come before potential skills)
      const hasPassive1 = skillSlots.includes('PASSIVE_1');
      const hasPassive2 = skillSlots.includes('PASSIVE_2');
      const hasPotential1 = skillSlots.includes('POTENTIAL_1');

      if (hasPassive2 && !hasPassive1) {
        errors.push('PASSIVE_2 requires PASSIVE_1 to be present');
      }

      if (hasPotential1 && (!hasPassive1 || !hasPassive2)) {
        errors.push('POTENTIAL skills require both PASSIVE skills to be present');
      }

    } catch (error) {
      errors.push(`Failed to validate swimsuit skill configuration: ${error}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
