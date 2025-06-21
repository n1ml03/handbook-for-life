import { EventModel } from '../models/EventModel';
import { Event, NewEvent } from '../types/database';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config';

export class EventService {
  private eventModel: EventModel;

  constructor() {
    this.eventModel = new EventModel();
  }

  async createEvent(eventData: NewEvent): Promise<Event> {
    try {
      if (!eventData.unique_key?.trim()) {
        throw new AppError('Event unique key is required', 400);
      }

      if (!eventData.name_en?.trim()) {
        throw new AppError('Event name is required', 400);
      }

      if (!eventData.start_date || !eventData.end_date) {
        throw new AppError('Event start and end dates are required', 400);
      }

      if (new Date(eventData.start_date) >= new Date(eventData.end_date)) {
        throw new AppError('Event start date must be before end date', 400);
      }

      logger.info(`Creating event: ${eventData.name_en}`, { 
        key: eventData.unique_key,
        startDate: eventData.start_date,
        endDate: eventData.end_date
      });
      
      const event = await this.eventModel.create(eventData);
      
      logger.info(`Event created successfully: ${event.name_en}`, { id: event.id });
      return event;
    } catch (error) {
      logger.error(`Failed to create event: ${eventData.name_en}`, { 
        error: error instanceof Error ? error.message : error 
      });
      throw error;
    }
  }

  async getEvents(options: PaginationOptions = {}): Promise<PaginatedResult<Event>> {
    try {
      return await this.eventModel.findAll(options);
    } catch (error) {
      logger.error('Failed to fetch events', { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch events', 500);
    }
  }

  async getEventById(id: string): Promise<Event> {
    try {
      if (!id?.trim()) {
        throw new AppError('Event ID is required', 400);
      }

      return await this.eventModel.findById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to fetch event: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch event', 500);
    }
  }

  async getEventByKey(key: string): Promise<Event> {
    try {
      if (!key?.trim()) {
        throw new AppError('Event key is required', 400);
      }

      return await this.eventModel.findByKey(key);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to fetch event by key: ${key}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch event', 500);
    }
  }

  async getEventsByType(type: string, options: PaginationOptions = {}): Promise<PaginatedResult<Event>> {
    try {
      if (!type?.trim()) {
        throw new AppError('Event type is required', 400);
      }

      return await this.eventModel.findByType(type, options);
    } catch (error) {
      logger.error(`Failed to fetch events by type: ${type}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch events by type', 500);
    }
  }

  async getActiveEvents(options: PaginationOptions = {}): Promise<PaginatedResult<Event>> {
    try {
      return await this.eventModel.findActive(options);
    } catch (error) {
      logger.error('Failed to fetch active events', { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch active events', 500);
    }
  }

  async getUpcomingEvents(options: PaginationOptions = {}): Promise<PaginatedResult<Event>> {
    try {
      return await this.eventModel.findUpcoming(options);
    } catch (error) {
      logger.error('Failed to fetch upcoming events', { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch upcoming events', 500);
    }
  }

  async getEventsByDateRange(startDate: Date, endDate: Date, options: PaginationOptions = {}): Promise<PaginatedResult<Event>> {
    try {
      if (!startDate || !endDate) {
        throw new AppError('Start and end dates are required', 400);
      }

      if (startDate >= endDate) {
        throw new AppError('Start date must be before end date', 400);
      }

      return await this.eventModel.findByDateRange(startDate, endDate, options);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to fetch events by date range: ${startDate} to ${endDate}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch events by date range', 500);
    }
  }

  async updateEvent(id: string, updates: Partial<NewEvent>): Promise<Event> {
    try {
      if (!id?.trim()) {
        throw new AppError('Event ID is required', 400);
      }

      if (updates.name_en !== undefined && !updates.name_en?.trim()) {
        throw new AppError('Event name cannot be empty', 400);
      }

      if (updates.start_date && updates.end_date && 
          new Date(updates.start_date) >= new Date(updates.end_date)) {
        throw new AppError('Event start date must be before end date', 400);
      }

      logger.info(`Updating event: ${id}`, { updates });
      
      const event = await this.eventModel.update(id, updates);
      
      logger.info(`Event updated successfully: ${event.name_en}`, { id: event.id });
      return event;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to update event: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to update event', 500);
    }
  }

  async deleteEvent(id: string): Promise<void> {
    try {
      if (!id?.trim()) {
        throw new AppError('Event ID is required', 400);
      }

      await this.eventModel.findById(id);
      
      logger.info(`Deleting event: ${id}`);
      await this.eventModel.delete(id);
      logger.info(`Event deleted successfully: ${id}`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to delete event: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to delete event', 500);
    }
  }

  async searchEvents(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Event>> {
    try {
      if (!query?.trim()) {
        throw new AppError('Search query is required', 400);
      }

      return await this.eventModel.search(query.trim(), options);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to search events: ${query}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to search events', 500);
    }
  }

  async healthCheck(): Promise<{ isHealthy: boolean; errors: string[] }> {
    try {
      const modelHealth = await this.eventModel.healthCheck();
      return {
        isHealthy: modelHealth.isHealthy,
        errors: modelHealth.errors
      };
    } catch (error) {
      return {
        isHealthy: false,
        errors: [`Event service health check failed: ${error instanceof Error ? error.message : error}`]
      };
    }
  }
}

export const eventService = new EventService();
export default eventService; 