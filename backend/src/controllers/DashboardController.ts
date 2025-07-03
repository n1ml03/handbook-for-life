import { Request, Response } from 'express';
import { CharacterService } from '@services/CharacterService';
import { SwimsuitService } from '@services/SwimsuitService';
import { SkillService } from '@services/SkillService';
import { ItemService } from '@services/ItemService';
import { BromideService } from '@services/BromideService';

import { executeQuery } from '@config/database';
import { CacheService, CacheKeys, CacheTTL } from '@services/CacheService';
import logger from '@config/logger';

/**
 * Dashboard Controller
 *
 * Handles dashboard-specific API endpoints that provide aggregated data
 * for the frontend dashboard components. Implements caching strategies
 * for optimal performance and reduced database load.
 *
 * @class DashboardController
 * @version 2.0.0
 * @author DOAXVV Handbook Team
 */
export class DashboardController {
  private characterService: CharacterService;
  private swimsuitsService: SwimsuitService;
  private skillsService: SkillService;
  private itemsService: ItemService;
  private bromidesService: BromideService;


  constructor() {
    this.characterService = new CharacterService();
    this.swimsuitsService = new SwimsuitService();
    this.skillsService = new SkillService();
    this.itemsService = new ItemService();
    this.bromidesService = new BromideService();

  }

  /**
   * Get overview data for dashboard
   *
   * Combines multiple resources (swimsuits, accessories, skills, bromides) in a single request
   * to optimize frontend performance. This replaces the need for 4 separate API calls.
   *
   * Features:
   * - Optimized database queries with single summary query
   * - Reduced payload (20 items per category instead of 100)
   * - 5-minute caching for improved performance
   * - Comprehensive error handling and logging
   *
   * @param {Request} _req - Express request object (unused)
   * @param {Response} res - Express response object
   * @returns {Promise<void>} Promise that resolves when response is sent
   *
   * @example
   * GET /api/dashboard/overview
   * Response: {
   *   success: true,
   *   data: {
   *     swimsuits: { data: [...], pagination: {...} },
   *     accessories: { data: [...], pagination: {...} },
   *     skills: { data: [...], pagination: {...} },
   *     bromides: { data: [...], pagination: {...} },
   *     summary: { totalSwimsuits: 150, totalAccessories: 75, ... }
   *   }
   * }
   */
  async getOverview(_req: Request, res: Response): Promise<void> {
    const cacheKey = CacheKeys.dashboard.overview();

    try {
      // Try cache first
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        logger.info('Serving dashboard overview from cache');
        res.success(cached, 'Dashboard overview data retrieved from cache');
        return;
      }

      logger.info('Fetching optimized dashboard overview data');

      // First, get summary counts with a single optimized query
      const summaryQuery = `
        SELECT
          (SELECT COUNT(*) FROM swimsuits) as total_swimsuits,
          (SELECT COUNT(*) FROM items WHERE item_category = 'ACCESSORY') as total_accessories,
          (SELECT COUNT(*) FROM skills) as total_skills,
          (SELECT COUNT(*) FROM bromides) as total_bromides
      `;

      const [summaryResult] = await executeQuery(summaryQuery) as [any[], any];
      const summary = summaryResult[0];

      // Fetch recent data only (reduced payload from 100 to 20 items each)
      const [
        swimsuitsResult,
        accessoriesResult,
        skillsResult,
        bromidesResult
      ] = await Promise.all([
        this.swimsuitsService.getSwimsuits({ limit: 20, page: 1, sortBy: 'id', sortOrder: 'desc' }),
        this.itemsService.getItemsByCategory('ACCESSORY', { limit: 20, page: 1, sortBy: 'id', sortOrder: 'desc' }),
        this.skillsService.getSkills({ limit: 20, page: 1, sortBy: 'id', sortOrder: 'desc' }),
        this.bromidesService.getBromides({ limit: 20, page: 1, sortBy: 'id', sortOrder: 'desc' })
      ]);

      // Combine all data into a single response with accurate totals
      const overviewData = {
        swimsuits: {
          data: swimsuitsResult.data,
          pagination: { ...swimsuitsResult.pagination, total: summary.total_swimsuits }
        },
        accessories: {
          data: accessoriesResult.data,
          pagination: { ...accessoriesResult.pagination, total: summary.total_accessories }
        },
        skills: {
          data: skillsResult.data,
          pagination: { ...skillsResult.pagination, total: summary.total_skills }
        },
        bromides: {
          data: bromidesResult.data,
          pagination: { ...bromidesResult.pagination, total: summary.total_bromides }
        },
        summary: {
          totalSwimsuits: summary.total_swimsuits,
          totalAccessories: summary.total_accessories,
          totalSkills: summary.total_skills,
          totalBromides: summary.total_bromides,
          lastUpdated: new Date().toISOString()
        }
      };

      logger.info('Dashboard overview data fetched successfully', {
        swimsuits: overviewData.swimsuits.data.length,
        accessories: overviewData.accessories.data.length,
        skills: overviewData.skills.data.length,
        bromides: overviewData.bromides.data.length,
        totalItems: summary.total_swimsuits + summary.total_accessories + summary.total_skills + summary.total_bromides
      });

      // Cache the result for 5 minutes
      await CacheService.set(cacheKey, overviewData, CacheTTL.MEDIUM);

      res.success(overviewData, 'Dashboard overview data retrieved successfully');

    } catch (error) {
      logger.error('Error fetching dashboard overview:', error);
      res.error('Failed to fetch dashboard overview data', 500, {
        operation: 'getOverview',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Get character statistics for dashboard
   */
  async getCharacterStats(_req: Request, res: Response): Promise<void> {
    const cacheKey = CacheKeys.dashboard.characterStats();

    try {
      // Try cache first
      const cached = await CacheService.get(cacheKey);
      if (cached) {
        logger.info('Serving character statistics from cache');
        res.success(cached, 'Character statistics retrieved from cache');
        return;
      }

      logger.info('Fetching character statistics');

      const [
        charactersResult,
        swimsuitsResult
      ] = await Promise.all([
        this.characterService.getCharacters({ limit: 1000, page: 1 }),
        this.swimsuitsService.getSwimsuits({ limit: 1000, page: 1 })
      ]);

      // Calculate statistics
      const characters = charactersResult.data;
      const swimsuits = swimsuitsResult.data;

      const stats = {
        totalCharacters: characters.length,
        totalSwimsuits: swimsuits.length,
        averageSwimsuitsPerCharacter: characters.length > 0 ? (swimsuits.length / characters.length).toFixed(2) : '0',
        charactersByBirthday: this.groupCharactersByMonth(characters),
        swimsuitsByRarity: this.groupSwimsuitssByRarity(swimsuits),
        recentlyAdded: {
          characters: characters.slice(-5), // Last 5 characters
          swimsuits: swimsuits.slice(-5)   // Last 5 swimsuits
        }
      };

      // Cache the result for 5 minutes
      await CacheService.set(cacheKey, stats, CacheTTL.MEDIUM);

      res.success(stats, 'Character statistics retrieved successfully');

    } catch (error) {
      logger.error('Error fetching character statistics:', error);
      res.error('Failed to fetch character statistics', 500, {
        operation: 'getCharacterStats',
        timestamp: new Date().toISOString()
      });
    }
  }

  private groupCharactersByMonth(characters: any[]): Record<string, number> {
    const monthCounts: Record<string, number> = {};
    
    characters.forEach(char => {
      if (char.birthday) {
        const month = new Date(char.birthday).getMonth() + 1;
        const monthName = new Date(2024, month - 1).toLocaleString('default', { month: 'long' });
        monthCounts[monthName] = (monthCounts[monthName] || 0) + 1;
      }
    });

    return monthCounts;
  }

  private groupSwimsuitssByRarity(swimsuits: any[]): Record<string, number> {
    const rarityCounts: Record<string, number> = {};
    
    swimsuits.forEach(swimsuit => {
      if (swimsuit.rarity) {
        rarityCounts[swimsuit.rarity] = (rarityCounts[swimsuit.rarity] || 0) + 1;
      }
    });

    return rarityCounts;
  }
}
