import { EventModel } from '../models/EventModel';
import { Event, NewEvent, EventType } from '../types/database';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';
import { BaseService } from './BaseService';

export class EventService extends BaseService<EventModel, Event, NewEvent> {
  constructor() {
    super(new EventModel(), 'EventService');
  }

  async createEvent(eventData: NewEvent): Promise<Event> {
    return this.safeAsyncOperation(async () => {
      this.validateRequiredString(eventData.unique_key, 'Event unique key');
      this.validateRequiredString(eventData.name_en, 'Event name');
      
      if (!eventData.start_date || !eventData.end_date) {
        throw new Error('Event start and end dates are required');
      }

      this.validateDateRange(new Date(eventData.start_date), new Date(eventData.end_date));

      this.logOperationStart('Creating', eventData.name_en, { 
        key: eventData.unique_key,
        startDate: eventData.start_date,
        endDate: eventData.end_date
      });

      const event = await this.model.create(eventData);

      this.logOperationSuccess('Created', event.name_en, { id: event.id });
      return event;
    }, 'create event', eventData.name_en);
  }

  async getEvents(options: PaginationOptions = {}): Promise<PaginatedResult<Event>> {
    return this.safeAsyncOperation(async () => {
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findAll(validatedOptions);
    }, 'fetch events');
  }

  async getEventById(id: string | number): Promise<Event> {
    return this.safeAsyncOperation(async () => {
      this.validateId(id, 'Event ID');
      return await this.model.findById(id);
    }, 'fetch event', id);
  }

  async getEventByKey(key: string): Promise<Event> {
    return this.safeAsyncOperation(async () => {
      this.validateId(key, 'Event key');
      return await this.model.findByKey(key);
    }, 'fetch event by key', key);
  }

  async getEventsByType(type: string, options: PaginationOptions = {}): Promise<PaginatedResult<Event>> {
    return this.safeAsyncOperation(async () => {
      this.validateRequiredString(type, 'Event type');
      const eventType = this.validateEventType(type);
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findByType(eventType, validatedOptions);
    }, 'fetch events by type', type);
  }

  async getActiveEvents(options: PaginationOptions = {}): Promise<PaginatedResult<Event>> {
    return this.safeAsyncOperation(async () => {
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findActive(validatedOptions);
    }, 'fetch active events');
  }

  async getUpcomingEvents(options: PaginationOptions = {}): Promise<PaginatedResult<Event>> {
    return this.safeAsyncOperation(async () => {
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findUpcoming(validatedOptions);
    }, 'fetch upcoming events');
  }

  async getEventsByDateRange(startDate: Date, endDate: Date, options: PaginationOptions = {}): Promise<PaginatedResult<Event>> {
    return this.safeAsyncOperation(async () => {
      this.validateDateRange(startDate, endDate);
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.findByDateRange(startDate, endDate, validatedOptions);
    }, 'fetch events by date range');
  }

  async updateEvent(id: string | number, updates: Partial<NewEvent>): Promise<Event> {
    return this.safeAsyncOperation(async () => {
      this.validateId(id, 'Event ID');
      this.validateOptionalString(updates.name_en, 'Event name');

      if (updates.start_date && updates.end_date) {
        this.validateDateRange(new Date(updates.start_date), new Date(updates.end_date));
      }

      this.logOperationStart('Updating', id, { updates });

      const event = await this.model.update(id, updates);

      this.logOperationSuccess('Updated', event.name_en, { id: event.id });
      return event;
    }, 'update event', id);
  }

  async deleteEvent(id: string | number): Promise<void> {
    return this.safeAsyncOperation(async () => {
      this.validateId(id, 'Event ID');

      // Check if event exists before deletion
      await this.model.findById(id);

      this.logOperationStart('Deleting', id);
      await this.model.delete(id);
      this.logOperationSuccess('Deleted', id);
    }, 'delete event', id);
  }

  async searchEvents(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Event>> {
    return this.safeAsyncOperation(async () => {
      this.validateSearchQuery(query);
      const validatedOptions = this.validatePaginationOptions(options);
      return await this.model.search(query.trim(), validatedOptions);
    }, 'search events', query);
  }

  // ============================================================================
  // VALIDATION HELPERS
  // ============================================================================

  private validateEventType(type: string): EventType {
    const validTypes: EventType[] = ['REGULAR', 'LIMITED', 'SEASONAL', 'COLLABORATION', 'ANNIVERSARY'];
    
    if (!validTypes.includes(type as EventType)) {
      throw new Error(`Invalid event type: ${type}. Valid types are: ${validTypes.join(', ')}`);
    }
    
    return type as EventType;
  }

  // Health check is inherited from BaseService
}

// Export singleton instance
export const eventService = new EventService();
export default eventService; 