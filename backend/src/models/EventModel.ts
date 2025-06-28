import { BaseModel, PaginationOptions, PaginatedResult } from './BaseModel';
import { Event, NewEvent, EventType } from '../types/database';
import { executeQuery } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config';

export class EventModel extends BaseModel<Event, NewEvent> {
  constructor() {
    super('events');
  }

  // Implementation of abstract methods
  protected mapRow(row: any): Event {
    return {
      id: row.id,
      unique_key: row.unique_key,
      name_jp: row.name_jp,
      name_en: row.name_en,
      name_cn: row.name_cn,
      name_tw: row.name_tw,
      name_kr: row.name_kr,
      type: row.type,
      start_date: new Date(row.start_date),
      end_date: new Date(row.end_date),
      is_active: Boolean(row.is_active),
      game_version: row.game_version,
    };
  }

  protected getCreateFields(): (keyof NewEvent)[] {
    return [
      'unique_key',
      'name_jp',
      'name_en',
      'name_cn',
      'name_tw',
      'name_kr',
      'type',
      'start_date',
      'end_date',
      'game_version'
    ];
  }

  protected getUpdateFields(): (keyof NewEvent)[] {
    return this.getCreateFields(); // Same fields can be updated
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

      logger.info(`Event created: ${event.name_en}`, { id: result.insertId });
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
      return super.findById(id) as Promise<T>;
    }
    return super.findById(id as number);
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

    logger.info(`Event updated: ${id}`);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    return super.delete(id);
  }

  async search(
    searchFields: string[],
    query: string,
    options: PaginationOptions = {},
    additionalWhere?: string
  ): Promise<PaginatedResult<Event>> {
    return super.search(searchFields, query, options, additionalWhere);
  }

  async findByKey(key: string): Promise<Event> {
    return this.findByUniqueKey(key);
  }

  async findActive(options: PaginationOptions = {}): Promise<PaginatedResult<Event>> {
    const now = new Date();
    const whereClause = 'WHERE start_date <= ? AND end_date >= ?';
    const values = [now, now];

    return this.findWithPagination(whereClause, values, options);
  }

  async findUpcoming(options: PaginationOptions = {}): Promise<PaginatedResult<Event>> {
    const now = new Date();
    const whereClause = 'WHERE start_date > ?';
    const values = [now];

    return this.findWithPagination(whereClause, values, options);
  }

  async findByDateRange(startDate: Date, endDate: Date, options: PaginationOptions = {}): Promise<PaginatedResult<Event>> {
    const whereClause = 'WHERE start_date >= ? AND end_date <= ?';
    const values = [startDate, endDate];

    return this.findWithPagination(whereClause, values, options);
  }

  private async findWithPagination(
    whereClause: string,
    values: any[],
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<Event>> {
    const { offset, limit, sortBy, sortOrder } = this.processPaginationOptions(options);

    // Count total records
    const countSql = `SELECT COUNT(*) as total FROM events ${whereClause}`;
    const [countRows] = await executeQuery(countSql, values);
    const total = (countRows as any[])[0].total;

    // Fetch paginated data
    const dataSql = `
      SELECT * FROM events 
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `;
    const dataValues = [...values, limit, offset];
    const [dataRows] = await executeQuery(dataSql, dataValues);

    return this.buildPaginatedResult(dataRows as Event[], total, options);
  }

  async healthCheck(): Promise<{ isHealthy: boolean; tableName: string; errors: string[] }> {
    const errors: string[] = [];

    try {
      await executeQuery('SELECT 1');
      await executeQuery('SELECT COUNT(*) FROM events LIMIT 1');
      
      // Update is_active status for all events
      await this.updateActiveStatus();
    } catch (error) {
      const errorMsg = `EventModel health check failed: ${error instanceof Error ? error.message : error}`;
      errors.push(errorMsg);
    }

    return {
      isHealthy: errors.length === 0,
      tableName: this.tableName,
      errors
    };
  }

  /**
   * Update the is_active status for all events based on current timestamp
   */
  async updateActiveStatus(): Promise<{ updated: number }> {
    try {
      // Set is_active = TRUE for events that are currently running
      const [activeResult] = await executeQuery(
        'UPDATE events SET is_active = TRUE WHERE NOW() BETWEEN start_date AND end_date AND is_active = FALSE'
      ) as [any, any];

      // Set is_active = FALSE for events that are no longer running
      const [inactiveResult] = await executeQuery(
        'UPDATE events SET is_active = FALSE WHERE (NOW() < start_date OR NOW() > end_date) AND is_active = TRUE'
      ) as [any, any];

      const totalUpdated = activeResult.affectedRows + inactiveResult.affectedRows;
      
      if (totalUpdated > 0) {
        logger.info(`Updated is_active status for ${totalUpdated} events`);
      }

      return { updated: totalUpdated };
    } catch (error: any) {
      logger.error('Failed to update event active status', { error });
      throw new AppError('Failed to update event active status', 500);
    }
  }

  // Convenience search method for events
  async searchEvents(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Event>> {
    const searchFields = ['title_jp', 'title_en', 'title_cn', 'title_tw', 'title_kr', 'unique_key'];
    return this.search(searchFields, query, options);
  }

  // Helper method for processing pagination options
  protected processPaginationOptions(options: PaginationOptions): {
    offset: number;
    limit: number;
    sortBy: string;
    sortOrder: string;
  } {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const offset = (page - 1) * limit;
    const sortBy = options.sortBy || 'id';
    const sortOrder = (options.sortOrder || 'asc').toUpperCase();

    return { offset, limit, sortBy, sortOrder };
  }
} 