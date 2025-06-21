import { EpisodeModel } from '../models/EpisodeModel';
import { Episode, NewEpisode } from '../types/database';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../config';

export class EpisodeService {
  private episodeModel: EpisodeModel;

  constructor() {
    this.episodeModel = new EpisodeModel();
  }

  async createEpisode(episodeData: NewEpisode): Promise<Episode> {
    try {
      if (!episodeData.unique_key?.trim()) {
        throw new AppError('Episode unique key is required', 400);
      }

      if (!episodeData.title_en?.trim()) {
        throw new AppError('Episode title is required', 400);
      }

      logger.info(`Creating episode: ${episodeData.title_en}`, { key: episodeData.unique_key });
      
      const episode = await this.episodeModel.create(episodeData);
      
      logger.info(`Episode created successfully: ${episode.title_en}`, { id: episode.id });
      return episode;
    } catch (error) {
      logger.error(`Failed to create episode: ${episodeData.title_en}`, { 
        error: error instanceof Error ? error.message : error 
      });
      throw error;
    }
  }

  async getEpisodes(options: PaginationOptions = {}): Promise<PaginatedResult<Episode>> {
    try {
      return await this.episodeModel.findAll(options);
    } catch (error) {
      logger.error('Failed to fetch episodes', { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch episodes', 500);
    }
  }

  async getEpisodeById(id: string): Promise<Episode> {
    try {
      if (!id?.trim()) {
        throw new AppError('Episode ID is required', 400);
      }

      return await this.episodeModel.findById(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to fetch episode: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch episode', 500);
    }
  }

  async getEpisodeByKey(key: string): Promise<Episode> {
    try {
      if (!key?.trim()) {
        throw new AppError('Episode key is required', 400);
      }

      return await this.episodeModel.findByKey(key);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to fetch episode by key: ${key}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch episode', 500);
    }
  }

  async getEpisodesByType(type: string, options: PaginationOptions = {}): Promise<PaginatedResult<Episode>> {
    try {
      if (!type?.trim()) {
        throw new AppError('Episode type is required', 400);
      }

      return await this.episodeModel.findByType(type, options);
    } catch (error) {
      logger.error(`Failed to fetch episodes by type: ${type}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch episodes by type', 500);
    }
  }

  async getEpisodesByRelatedEntity(entityType: string, entityId: number, options: PaginationOptions = {}): Promise<PaginatedResult<Episode>> {
    try {
      if (!entityType?.trim()) {
        throw new AppError('Entity type is required', 400);
      }

      if (!entityId) {
        throw new AppError('Entity ID is required', 400);
      }

      return await this.episodeModel.findByRelatedEntity(entityType, entityId, options);
    } catch (error) {
      logger.error(`Failed to fetch episodes by related entity: ${entityType}:${entityId}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to fetch episodes by related entity', 500);
    }
  }

  async updateEpisode(id: string, updates: Partial<NewEpisode>): Promise<Episode> {
    try {
      if (!id?.trim()) {
        throw new AppError('Episode ID is required', 400);
      }

      if (updates.title_en !== undefined && !updates.title_en?.trim()) {
        throw new AppError('Episode title cannot be empty', 400);
      }

      logger.info(`Updating episode: ${id}`, { updates });
      
      const episode = await this.episodeModel.update(id, updates);
      
      logger.info(`Episode updated successfully: ${episode.title_en}`, { id: episode.id });
      return episode;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to update episode: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to update episode', 500);
    }
  }

  async deleteEpisode(id: string): Promise<void> {
    try {
      if (!id?.trim()) {
        throw new AppError('Episode ID is required', 400);
      }

      await this.episodeModel.findById(id);
      
      logger.info(`Deleting episode: ${id}`);
      await this.episodeModel.delete(id);
      logger.info(`Episode deleted successfully: ${id}`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to delete episode: ${id}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to delete episode', 500);
    }
  }

  async searchEpisodes(query: string, options: PaginationOptions = {}): Promise<PaginatedResult<Episode>> {
    try {
      if (!query?.trim()) {
        throw new AppError('Search query is required', 400);
      }

      return await this.episodeModel.search(query.trim(), options);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error(`Failed to search episodes: ${query}`, { error: error instanceof Error ? error.message : error });
      throw new AppError('Failed to search episodes', 500);
    }
  }

  async healthCheck(): Promise<{ isHealthy: boolean; errors: string[] }> {
    try {
      const modelHealth = await this.episodeModel.healthCheck();
      return {
        isHealthy: modelHealth.isHealthy,
        errors: modelHealth.errors
      };
    } catch (error) {
      return {
        isHealthy: false,
        errors: [`Episode service health check failed: ${error instanceof Error ? error.message : error}`]
      };
    }
  }
}

export const episodeService = new EpisodeService();
export default episodeService; 