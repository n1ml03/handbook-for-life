/**
 * Dashboard Controller
 * Handles dashboard-related requests and aggregates data from multiple sources
 */

import { Request, Response } from 'express';
import { SwimsuitModel } from '../models/SwimsuitModel';
import { ItemModel } from '../models/ItemModel';
import { SkillModel } from '../models/SkillModel';
import { BromideModel } from '../models/BromideModel';
import { CharacterModel } from '../models/CharacterModel';
import logger from '../config/logger';

export class DashboardController {
  private swimsuitModel: SwimsuitModel;
  private itemModel: ItemModel;
  private skillModel: SkillModel;
  private bromideModel: BromideModel;
  private characterModel: CharacterModel;

  constructor() {
    this.swimsuitModel = new SwimsuitModel();
    this.itemModel = new ItemModel();
    this.skillModel = new SkillModel();
    this.bromideModel = new BromideModel();
    this.characterModel = new CharacterModel();
  }

  /**
   * Get dashboard overview data
   * Combines data from swimsuits, accessories, skills, and bromides
   */
  async getOverview(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      // Fetch data from all models in parallel
      const [swimsuits, items, skills, bromides] = await Promise.all([
        this.swimsuitModel.findAll({ page, limit, sortBy: 'id', sortOrder: 'DESC' }),
        this.itemModel.findAll({ page, limit, sortBy: 'id', sortOrder: 'DESC' }),
        this.skillModel.findAll({ page, limit, sortBy: 'id', sortOrder: 'DESC' }),
        this.bromideModel.findAll({ page, limit, sortBy: 'id', sortOrder: 'DESC' })
      ]);

      // Get total counts
      const [totalSwimsuits, totalItems, totalSkills, totalBromides] = await Promise.all([
        this.swimsuitModel.count(),
        this.itemModel.count(),
        this.skillModel.count(),
        this.bromideModel.count()
      ]);

      const overviewData = {
        swimsuits,
        items,
        skills,
        bromides,
        summary: {
          totalSwimsuits,
          totalItems,
          totalSkills,
          totalBromides,
          lastUpdated: new Date().toISOString()
        }
      };

      logger.info('Dashboard overview data retrieved successfully');

      res.success(overviewData, 'Dashboard overview retrieved successfully');
    } catch (error: any) {
      logger.error('Error fetching dashboard overview:', error);
      res.error('Failed to fetch dashboard overview', 500, {
        message: error.message
      });
    }
  }

  /**
   * Get character statistics
   * Returns statistical data about characters and swimsuits
   */
  async getCharacterStats(req: Request, res: Response): Promise<void> {
    try {
      // Get total counts
      const [totalCharacters, totalSwimsuits] = await Promise.all([
        this.characterModel.count(),
        this.swimsuitModel.count()
      ]);

      // Calculate average swimsuits per character
      const averageSwimsuitsPerCharacter = totalCharacters > 0
        ? (totalSwimsuits / totalCharacters).toFixed(2)
        : '0.00';

      // Get swimsuits by rarity
      const swimsuitsByRarity = await this.swimsuitModel.countByRarity();

      // Get recently added characters and swimsuits (sorted by ID descending)
      const [recentCharacters, recentSwimsuits] = await Promise.all([
        this.characterModel.findAll({ page: 1, limit: 5, sortBy: 'id', sortOrder: 'DESC' }),
        this.swimsuitModel.findAll({ page: 1, limit: 5, sortBy: 'id', sortOrder: 'DESC' })
      ]);

      const statsData = {
        totalCharacters,
        totalSwimsuits,
        averageSwimsuitsPerCharacter,
        swimsuitsByRarity,
        recentlyAdded: {
          characters: recentCharacters.data,
          swimsuits: recentSwimsuits.data
        }
      };

      logger.info('Character statistics retrieved successfully');

      res.success(statsData, 'Character statistics retrieved successfully');
    } catch (error: any) {
      logger.error('Error fetching character statistics:', error);
      res.error('Failed to fetch character statistics', 500, {
        message: error.message
      });
    }
  }
}

