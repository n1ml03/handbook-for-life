import { BaseModel, PaginationOptions, PaginatedResult } from './BaseModel';
import { Event, NewEvent, EventType } from '../types/database';
import { executeQuery } from '@config/database';
import { AppError } from '@middleware/errorHandler';

export class EventModel extends BaseModel {
  constructor() {
    super('events');
  }

  // Mapper function to convert database row to Event object
  private mapEventRow(row: any): Event {
    return {
      id: row.id,
      unique_key: row.unique_key,
      name_jp: row.name_jp,
      name_en: row.name_en,
      name_cn: row.name_cn,
      name_tw: row.name_tw,
      name_kr: row.name_kr,
      type: row.type as EventType,
      start_date: row.start_date,
      end_date: row.end_date,
      is_active: Boolean(row.is_active),
      game_version: row.game_version,
    };
  }

  async create(event: NewEvent): Promise<Event> {
    try {
      const [result] = await executeQuery(
        `INSERT INTO events (unique_key, name_jp, name_en, name_cn, name_tw, name_kr,
         type, start_date, end_date, game_version)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          event.unique_key,
          event.name_jp,
          event.name_en,
          event.name_cn,
          event.name_tw,
          event.name_kr,
          event.type,
          event.start_date,
          event.end_date,
          event.game_version,
        ]
      ) as [any, any];

      return this.findById(result.insertId);
    } catch (error: any) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AppError('Event with this unique_key already exists', 409);
      }
      throw new AppError('Failed to create event', 500);
    }
  }

  async findAll(options: PaginationOptions = {}): Promise<PaginatedResult<Event>> {
    return this.getPaginatedResults(
      'SELECT * FROM events',
      'SELECT COUNT(*) FROM events',
      options,
      this.mapEventRow
    );
  }

  async findById(id: number): Promise<Event>;
  async findById<T>(id: string | number, mapFunction: (row: any) => T): Promise<T>;
  
  async findById<T = Event>(id: string | number, mapFunction?: (row: any) => T): Promise<T | Event> {
    if (mapFunction) {
      return super.findById<T>(id, mapFunction);
    }
    return super.findById<Event>(id as number, this.mapEventRow);
  }

  async findByUniqueKey(unique_key: string): Promise<Event> {
    const [rows] = await executeQuery('SELECT * FROM events WHERE unique_key = ?', [unique_key]) as [any[], any];
    if (rows.length === 0) {
      throw new AppError('Event not found', 404);
    }
    return this.mapEventRow(rows[0]);
  }

  async findActiveEvents(options: PaginationOptions = {}): Promise<PaginatedResult<Event>> {
    return this.getPaginatedResults(
      'SELECT * FROM events WHERE is_active = TRUE',
      'SELECT COUNT(*) FROM events WHERE is_active = TRUE',
      options,
      this.mapEventRow
    );
  }

  async findUpcomingEvents(options: PaginationOptions = {}): Promise<PaginatedResult<Event>> {
    return this.getPaginatedResults(
      'SELECT * FROM events WHERE start_date > NOW()',
      'SELECT COUNT(*) FROM events WHERE start_date > NOW()',
      options,
      this.mapEventRow
    );
  }

  async findByType(event_type: EventType, options: PaginationOptions = {}): Promise<PaginatedResult<Event>> {
    return this.getPaginatedResults(
      'SELECT * FROM events WHERE type = ?',
      'SELECT COUNT(*) FROM events WHERE type = ?',
      options,
      this.mapEventRow,
      [event_type]
    );
  }

  async update(id: number, updates: Partial<NewEvent>): Promise<Event> {
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
    if (updates.type !== undefined) {
      setClause.push(`type = ?`);
      params.push(updates.type);
    }
    if (updates.start_date !== undefined) {
      setClause.push(`start_date = ?`);
      params.push(updates.start_date);
    }
    if (updates.end_date !== undefined) {
      setClause.push(`end_date = ?`);
      params.push(updates.end_date);
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
      `UPDATE events SET ${setClause.join(', ')} WHERE id = ?`,
      params
    );

    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.deleteById(id);
  }

  async search(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Event>> {
    const searchPattern = `%${query}%`;
    return this.getPaginatedResults(
      `SELECT * FROM events WHERE 
       name_jp LIKE ? OR name_en LIKE ? OR name_cn LIKE ? OR name_tw LIKE ? OR name_kr LIKE ? OR unique_key LIKE ?`,
      `SELECT COUNT(*) FROM events WHERE 
       name_jp LIKE ? OR name_en LIKE ? OR name_cn LIKE ? OR name_tw LIKE ? OR name_kr LIKE ? OR unique_key LIKE ?`,
      options,
      this.mapEventRow,
      [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]
    );
  }
} 