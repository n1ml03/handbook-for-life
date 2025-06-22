import { BaseModel, PaginationOptions, PaginatedResult } from './BaseModel';
import { Skill, NewSkill, SkillCategory } from '../types/database';
import { executeQuery } from '@config/database';
import { AppError } from '@middleware/errorHandler';

export class SkillModel extends BaseModel {
  constructor() {
    super('skills');
  }

  // Mapper function to convert database row to Skill object
  private mapSkillRow(row: any): Skill {
    return {
      id: row.id,
      unique_key: row.unique_key,
      name_jp: row.name_jp,
      name_en: row.name_en,
      name_cn: row.name_cn,
      name_tw: row.name_tw,
      name_kr: row.name_kr,
      description_en: row.description_en,
      skill_category: row.skill_category as SkillCategory,
      effect_type: row.effect_type,
      game_version: row.game_version,
    };
  }

  async create(skill: NewSkill): Promise<Skill> {
    try {
      const [result] = await executeQuery(
        `INSERT INTO skills (unique_key, name_jp, name_en, name_cn, name_tw, name_kr,
         description_en, skill_category, effect_type, game_version)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          skill.unique_key,
          skill.name_jp,
          skill.name_en,
          skill.name_cn,
          skill.name_tw,
          skill.name_kr,
          skill.description_en,
          skill.skill_category,
          skill.effect_type,
          skill.game_version,
        ]
      ) as [any, any];

      return this.findById(result.insertId);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError('Skill with this unique_key already exists', 409);
      }
      throw new AppError('Failed to create skill', 500);
    }
  }

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<Skill>> {
    return this.getPaginatedResults(
      'SELECT * FROM skills',
      'SELECT COUNT(*) FROM skills',
      options,
      this.mapSkillRow
    );
  }

  async findById(id: number): Promise<Skill>;
  async findById<T>(id: string | number, mapFunction: (row: any) => T): Promise<T>;
  
  async findById<T = Skill>(id: string | number, mapFunction?: (row: any) => T): Promise<T | Skill> {
    if (mapFunction) {
      return super.findById<T>(id, mapFunction);
    }
    return super.findById<Skill>(id as number, this.mapSkillRow);
  }

  async findByUniqueKey(unique_key: string): Promise<Skill> {
    const [rows] = await executeQuery('SELECT * FROM skills WHERE unique_key = ?', [unique_key]) as [any[], any];
    if (rows.length === 0) {
      throw new AppError('Skill not found', 404);
    }
    return this.mapSkillRow(rows[0]);
  }

  async findByCategory(category: SkillCategory, options: PaginationOptions = {}): Promise<PaginatedResult<Skill>> {
    return this.getPaginatedResults(
      'SELECT * FROM skills WHERE skill_category = ?',
      'SELECT COUNT(*) FROM skills WHERE skill_category = ?',
      options,
      this.mapSkillRow,
      [category]
    );
  }

  async findByEffectType(effect_type: string, options: PaginationOptions = {}): Promise<PaginatedResult<Skill>> {
    return this.getPaginatedResults(
      'SELECT * FROM skills WHERE effect_type = ?',
      'SELECT COUNT(*) FROM skills WHERE effect_type = ?',
      options,
      this.mapSkillRow,
      [effect_type]
    );
  }

  async update(id: number, updates: Partial<NewSkill>): Promise<Skill> {
    const setClause: string[] = [];
    const params: any[] = [];

    if (updates.unique_key !== undefined) {
      setClause.push(`unique_key = ?`);
      params.push(updates.unique_key);
    }
    if (updates.name_jp !== undefined) {
      setClause.push(`name_jp = ?`);
      params.push(updates.name_jp);
    }
    if (updates.name_en !== undefined) {
      setClause.push(`name_en = ?`);
      params.push(updates.name_en);
    }
    if (updates.name_cn !== undefined) {
      setClause.push(`name_cn = ?`);
      params.push(updates.name_cn);
    }
    if (updates.name_tw !== undefined) {
      setClause.push(`name_tw = ?`);
      params.push(updates.name_tw);
    }
    if (updates.name_kr !== undefined) {
      setClause.push(`name_kr = ?`);
      params.push(updates.name_kr);
    }
    if (updates.description_en !== undefined) {
      setClause.push(`description_en = ?`);
      params.push(updates.description_en);
    }
    if (updates.skill_category !== undefined) {
      setClause.push(`skill_category = ?`);
      params.push(updates.skill_category);
    }
    if (updates.effect_type !== undefined) {
      setClause.push(`effect_type = ?`);
      params.push(updates.effect_type);
    }
    if (updates.game_version !== undefined) {
      setClause.push(`game_version = ?`);
      params.push(updates.game_version);
    }

    if (setClause.length === 0) {
      return this.findById(id);
    }

    params.push(id);

    await executeQuery(
      `UPDATE skills SET ${setClause.join(', ')} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.deleteById(id);
  }

  async search(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Skill>> {
    const searchPattern = `%${query}%`;
    return this.getPaginatedResults(
      `SELECT * FROM skills WHERE 
       name_jp LIKE ? OR name_en LIKE ? OR name_cn LIKE ? OR name_tw LIKE ? OR name_kr LIKE ? OR unique_key LIKE ?`,
      `SELECT COUNT(*) FROM skills WHERE 
       name_jp LIKE ? OR name_en LIKE ? OR name_cn LIKE ? OR name_tw LIKE ? OR name_kr LIKE ? OR unique_key LIKE ?`,
      options,
      this.mapSkillRow,
      [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]
    );
  }

  async getSkillsByEffectTypes(effect_types: string[]): Promise<Skill[]> {
    const placeholders = effect_types.map(() => '?').join(',');
    const [rows] = await executeQuery(
      `SELECT * FROM skills WHERE effect_type IN (${placeholders})`,
      effect_types
    ) as [any[], any];
    
    return rows.map(this.mapSkillRow);
  }
} 