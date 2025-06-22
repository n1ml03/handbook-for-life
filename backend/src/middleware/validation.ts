import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import logger from '../config/logger';

export const validate = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      logger.warn('Validation error:', result.error.errors[0]?.message);
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: result.error.errors[0]?.message
      });
      return;
    }
    req.body = result.data;
    next();
  };
};

export const validateParams = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      logger.warn('Parameter validation error:', result.error.errors[0]?.message);
      res.status(400).json({
        success: false,
        error: 'Parameter validation error',
        details: result.error.errors[0]?.message
      });
      return;
    }
    req.params = result.data;
    next();
  };
};

export const validateQuery = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      logger.warn('Query validation error:', result.error.errors[0]?.message);
      res.status(400).json({
        success: false,
        error: 'Query validation error',
        details: result.error.errors[0]?.message
      });
      return;
    }
    req.query = result.data;
    next();
  };
};

// Common validation schemas (Zod)
export const schemas = {
  id: z.object({
    id: z.string().min(1)
  }),
  createCharacter: z.object({
    unique_key: z.string().min(1).max(100),
    name_jp: z.string().min(1).max(100),
    name_en: z.string().min(1).max(100),
    name_cn: z.string().min(1).max(100),
    name_tw: z.string().min(1).max(100),
    name_kr: z.string().min(1).max(100),
    birthday: z.coerce.date().optional(),
    height: z.number().int().positive().optional(),
    measurements: z.string().max(20).optional(),
    blood_type: z.string().max(5).optional(),
    voice_actor_jp: z.string().max(100).optional(),
    profile_image_url: z.string().max(255).optional(),
    is_active: z.boolean().default(true),
    game_version: z.string().max(30).optional()
  }),
  updateCharacter: z.object({
    unique_key: z.string().min(1).max(100).optional(),
    name_jp: z.string().min(1).max(100).optional(),
    name_en: z.string().min(1).max(100).optional(),
    name_cn: z.string().min(1).max(100).optional(),
    name_tw: z.string().min(1).max(100).optional(),
    name_kr: z.string().min(1).max(100).optional(),
    birthday: z.coerce.date().optional(),
    height: z.number().int().positive().optional(),
    measurements: z.string().max(20).optional(),
    blood_type: z.string().max(5).optional(),
    voice_actor_jp: z.string().max(100).optional(),
    profile_image_url: z.string().max(255).optional(),
    is_active: z.boolean().optional(),
    game_version: z.string().max(30).optional()
  }),
  createSkill: z.object({
    id: z.string(),
    name: z.string().min(1).max(255),
    type: z.string(),
    description: z.string().optional(),
    icon: z.string().optional()
  }),
  updateSkill: z.object({
    name: z.string().min(1).max(255).optional(),
    type: z.string().optional(),
    description: z.string().optional(),
    icon: z.string().optional()
  }),
  createSwimsuit: z.object({
    id: z.string(),
    name: z.string().min(1).max(255),
    characterId: z.string(),
    rarity: z.enum(['SSR', 'SR', 'R']),
    pow: z.number().int().min(0),
    tec: z.number().int().min(0),
    stm: z.number().int().min(0),
    apl: z.number().int().min(0),
    releaseDate: z.coerce.date(),
    reappearDate: z.coerce.date().optional(),
    image: z.string().optional()
  }),
  updateSwimsuit: z.object({
    name: z.string().min(1).max(255).optional(),
    characterId: z.string().optional(),
    rarity: z.enum(['SSR', 'SR', 'R']).optional(),
    pow: z.number().int().min(0).optional(),
    tec: z.number().int().min(0).optional(),
    stm: z.number().int().min(0).optional(),
    apl: z.number().int().min(0).optional(),
    releaseDate: z.coerce.date().optional(),
    reappearDate: z.coerce.date().optional(),
    image: z.string().optional()
  }),
  createGirl: z.object({
    id: z.string(),
    name: z.string().min(1).max(255),
    type: z.enum(['pow', 'tec', 'stm']),
    level: z.number().int().min(1).max(100),
    pow: z.number().int().min(0),
    tec: z.number().int().min(0),
    stm: z.number().int().min(0),
    apl: z.number().int().min(0),
    maxPow: z.number().int().min(0),
    maxTec: z.number().int().min(0),
    maxStm: z.number().int().min(0),
    maxApl: z.number().int().min(0),
    birthday: z.coerce.date(),
    swimsuitId: z.string().optional()
  }),
  updateGirl: z.object({
    name: z.string().min(1).max(255).optional(),
    type: z.enum(['pow', 'tec', 'stm']).optional(),
    level: z.number().int().min(1).max(100).optional(),
    pow: z.number().int().min(0).optional(),
    tec: z.number().int().min(0).optional(),
    stm: z.number().int().min(0).optional(),
    apl: z.number().int().min(0).optional(),
    maxPow: z.number().int().min(0).optional(),
    maxTec: z.number().int().min(0).optional(),
    maxStm: z.number().int().min(0).optional(),
    maxApl: z.number().int().min(0).optional(),
    birthday: z.coerce.date().optional(),
    swimsuitId: z.string().optional()
  }),
  createAccessory: z.object({
    id: z.string(),
    name: z.string().min(1).max(255),
    type: z.enum(['head', 'face', 'hand']),
    skillId: z.string(),
    pow: z.number().int().min(0).optional(),
    tec: z.number().int().min(0).optional(),
    stm: z.number().int().min(0).optional(),
    apl: z.number().int().min(0).optional()
  }),
  updateAccessory: z.object({
    name: z.string().min(1).max(255).optional(),
    type: z.enum(['head', 'face', 'hand']).optional(),
    skillId: z.string().optional(),
    pow: z.number().int().min(0).optional(),
    tec: z.number().int().min(0).optional(),
    stm: z.number().int().min(0).optional(),
    apl: z.number().int().min(0).optional()
  }),
  createVenusBoard: z.object({
    girlId: z.string(),
    pow: z.number().int().min(0),
    tec: z.number().int().min(0),
    stm: z.number().int().min(0),
    apl: z.number().int().min(0)
  }),
  updateVenusBoard: z.object({
    pow: z.number().int().min(0).optional(),
    tec: z.number().int().min(0).optional(),
    stm: z.number().int().min(0).optional(),
    apl: z.number().int().min(0).optional()
  }),
  createMemory: z.object({
    id: z.string(),
    name: z.string().min(1).max(255),
    description: z.string().optional(),
    type: z.enum(['photo', 'video', 'story', 'scene']),
    date: z.coerce.date(),
    characters: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    thumbnail: z.string().optional(),
    favorite: z.boolean().optional(),
    unlocked: z.boolean().optional()
  }),
  updateMemory: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    type: z.enum(['photo', 'video', 'story', 'scene']).optional(),
    date: z.coerce.date().optional(),
    characters: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    thumbnail: z.string().optional(),
    favorite: z.boolean().optional(),
    unlocked: z.boolean().optional()
  }),
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('asc')
  }),

  // ============================================================================
  // GACHA VALIDATION SCHEMAS
  // ============================================================================
  createGacha: z.object({
    unique_key: z.string().min(1).max(150),
    name_jp: z.string().min(1).max(255),
    name_en: z.string().min(1).max(255),
    name_cn: z.string().min(1).max(255),
    name_tw: z.string().min(1).max(255),
    name_kr: z.string().min(1).max(255),
    gacha_subtype: z.enum(['TRENDY', 'NOSTALGIC', 'BIRTHDAY', 'ANNIVERSARY', 'PAID', 'FREE', 'ETC']),
    game_version: z.string().max(30).optional(),
    start_date: z.coerce.date(),
    end_date: z.coerce.date()
  }).refine(data => data.start_date < data.end_date, {
    message: "Start date must be before end date",
    path: ["start_date"]
  }),

  updateGacha: z.object({
    unique_key: z.string().min(1).max(150).optional(),
    name_jp: z.string().min(1).max(255).optional(),
    name_en: z.string().min(1).max(255).optional(),
    name_cn: z.string().min(1).max(255).optional(),
    name_tw: z.string().min(1).max(255).optional(),
    name_kr: z.string().min(1).max(255).optional(),
    gacha_subtype: z.enum(['TRENDY', 'NOSTALGIC', 'BIRTHDAY', 'ANNIVERSARY', 'PAID', 'FREE', 'ETC']).optional(),
    game_version: z.string().max(30).optional(),
    start_date: z.coerce.date().optional(),
    end_date: z.coerce.date().optional()
  }),

  createGachaPool: z.object({
    pool_item_type: z.enum(['SWIMSUIT', 'BROMIDE', 'ITEM']),
    item_id: z.number().int().positive(),
    drop_rate: z.number().min(0).max(1),
    is_featured: z.boolean().default(false)
  }),

  updateGachaPool: z.object({
    pool_item_type: z.enum(['SWIMSUIT', 'BROMIDE', 'ITEM']).optional(),
    item_id: z.number().int().positive().optional(),
    drop_rate: z.number().min(0).max(1).optional(),
    is_featured: z.boolean().optional()
  }),

  bulkCreateGachaPool: z.object({
    items: z.array(z.object({
      pool_item_type: z.enum(['SWIMSUIT', 'BROMIDE', 'ITEM']),
      item_id: z.number().int().positive(),
      drop_rate: z.number().min(0).max(1),
      is_featured: z.boolean().default(false)
    }))
  }),

  // ============================================================================
  // SHOP LISTING VALIDATION SCHEMAS
  // ============================================================================
  createShopListing: z.object({
    shop_type: z.enum(['EVENT', 'VIP', 'GENERAL', 'CURRENCY']),
    item_id: z.number().int().positive(),
    cost_currency_item_id: z.number().int().positive(),
    cost_amount: z.number().int().positive(),
    start_date: z.coerce.date().optional(),
    end_date: z.coerce.date().optional()
  }).refine(data => {
    if (data.start_date && data.end_date) {
      return data.start_date < data.end_date;
    }
    return true;
  }, {
    message: "Start date must be before end date",
    path: ["start_date"]
  }),

  updateShopListing: z.object({
    shop_type: z.enum(['EVENT', 'VIP', 'GENERAL', 'CURRENCY']).optional(),
    item_id: z.number().int().positive().optional(),
    cost_currency_item_id: z.number().int().positive().optional(),
    cost_amount: z.number().int().positive().optional(),
    start_date: z.coerce.date().optional(),
    end_date: z.coerce.date().optional()
  }),

  bulkCreateShopListings: z.object({
    listings: z.array(z.object({
      shop_type: z.enum(['EVENT', 'VIP', 'GENERAL', 'CURRENCY']),
      item_id: z.number().int().positive(),
      cost_currency_item_id: z.number().int().positive(),
      cost_amount: z.number().int().positive(),
      start_date: z.coerce.date().optional(),
      end_date: z.coerce.date().optional()
    }))
  }),

  // ============================================================================
  // SWIMSUIT SKILL VALIDATION SCHEMAS
  // ============================================================================
  addSwimsuitSkill: z.object({
    skill_id: z.number().int().positive(),
    skill_slot: z.enum(['ACTIVE', 'PASSIVE_1', 'PASSIVE_2', 'POTENTIAL_1', 'POTENTIAL_2', 'POTENTIAL_3', 'POTENTIAL_4'])
  }),

  updateSwimsuitSkill: z.object({
    skill_id: z.number().int().positive()
  }),

  setSwimsuitSkills: z.object({
    skills: z.array(z.object({
      skill_id: z.number().int().positive(),
      skill_slot: z.enum(['ACTIVE', 'PASSIVE_1', 'PASSIVE_2', 'POTENTIAL_1', 'POTENTIAL_2', 'POTENTIAL_3', 'POTENTIAL_4'])
    }))
  }),

  // ============================================================================
  // UPDATE LOG VALIDATION SCHEMAS
  // ============================================================================
  createUpdateLog: z.object({
    unique_key: z.string().min(1).max(150).optional(),
    version: z.string().min(1).max(50),
    title: z.string().min(1).max(255),
    content: z.string().min(1),
    description: z.string().optional(),
    date: z.coerce.date(),
    tags: z.array(z.string()).optional(),
    isPublished: z.boolean().default(true),
    technicalDetails: z.array(z.string()).optional(),
    bugFixes: z.array(z.string()).optional(),
    screenshots: z.array(z.string()).optional(),
    metrics: z.object({
      performanceImprovement: z.string().default('0%'),
      userSatisfaction: z.string().default('0%'),
      bugReports: z.number().int().min(0).default(0)
    }).optional()
  }),

  updateUpdateLog: z.object({
    unique_key: z.string().min(1).max(150).optional(),
    version: z.string().min(1).max(50).optional(),
    title: z.string().min(1).max(255).optional(),
    content: z.string().min(1).optional(),
    description: z.string().optional(),
    date: z.coerce.date().optional(),
    tags: z.array(z.string()).optional(),
    isPublished: z.boolean().optional(),
    technicalDetails: z.array(z.string()).optional(),
    bugFixes: z.array(z.string()).optional(),
    screenshots: z.array(z.string()).optional(),
    metrics: z.object({
      performanceImprovement: z.string(),
      userSatisfaction: z.string(),
      bugReports: z.number().int().min(0)
    }).optional()
  }),

  // ============================================================================
  // DOCUMENT VALIDATION SCHEMAS
  // ============================================================================
  createDocument: z.object({
    unique_key: z.string().min(1).max(150),
    title_en: z.string().min(1).max(255),
    summary_en: z.string().optional(),
    content_json_en: z.any().optional(), // TipTap JSON content
    is_published: z.boolean().default(false)
  }),

  updateDocument: z.object({
    unique_key: z.string().min(1).max(150).optional(),
    title_en: z.string().min(1).max(255).optional(),
    summary_en: z.string().optional(),
    content_json_en: z.any().optional(), // TipTap JSON content
    is_published: z.boolean().optional()
  }),

  // ============================================================================
  // EPISODE VALIDATION SCHEMAS
  // ============================================================================
  createEpisode: z.object({
    unique_key: z.string().min(1).max(200),
    title_jp: z.string().min(1).max(255),
    title_en: z.string().min(1).max(255),
    title_cn: z.string().min(1).max(255),
    title_tw: z.string().min(1).max(255),
    title_kr: z.string().min(1).max(255),
    unlock_condition_en: z.string().optional(),
    episode_type: z.enum(['MAIN', 'CHARACTER', 'EVENT', 'SWIMSUIT', 'ITEM']),
    related_entity_type: z.string().max(64).optional(),
    related_entity_id: z.number().int().positive().optional()
  }),

  updateEpisode: z.object({
    unique_key: z.string().min(1).max(200).optional(),
    title_jp: z.string().min(1).max(255).optional(),
    title_en: z.string().min(1).max(255).optional(),
    title_cn: z.string().min(1).max(255).optional(),
    title_tw: z.string().min(1).max(255).optional(),
    title_kr: z.string().min(1).max(255).optional(),
    unlock_condition_en: z.string().optional(),
    episode_type: z.enum(['MAIN', 'CHARACTER', 'EVENT', 'SWIMSUIT', 'ITEM']).optional(),
    related_entity_type: z.string().max(64).optional(),
    related_entity_id: z.number().int().positive().optional()
  }),

  // ============================================================================
  // EVENT VALIDATION SCHEMAS
  // ============================================================================
  createEvent: z.object({
    unique_key: z.string().min(1).max(150),
    name_jp: z.string().min(1).max(255),
    name_en: z.string().min(1).max(255),
    name_cn: z.string().min(1).max(255),
    name_tw: z.string().min(1).max(255),
    name_kr: z.string().min(1).max(255),
    type: z.enum(['FESTIVAL_RANKING', 'FESTIVAL_CUMULATIVE', 'TOWER', 'ROCK_CLIMBING', 'BUTT_BATTLE', 'LOGIN_BONUS', 'STORY']),
    start_date: z.coerce.date(),
    end_date: z.coerce.date()
  }).refine(data => data.start_date < data.end_date, {
    message: "Start date must be before end date",
    path: ["start_date"]
  }),

  updateEvent: z.object({
    unique_key: z.string().min(1).max(150).optional(),
    name_jp: z.string().min(1).max(255).optional(),
    name_en: z.string().min(1).max(255).optional(),
    name_cn: z.string().min(1).max(255).optional(),
    name_tw: z.string().min(1).max(255).optional(),
    name_kr: z.string().min(1).max(255).optional(),
    type: z.enum(['FESTIVAL_RANKING', 'FESTIVAL_CUMULATIVE', 'TOWER', 'ROCK_CLIMBING', 'BUTT_BATTLE', 'LOGIN_BONUS', 'STORY']).optional(),
    start_date: z.coerce.date().optional(),
    end_date: z.coerce.date().optional()
  }),

  // ============================================================================
  // ITEM VALIDATION SCHEMAS
  // ============================================================================
  createItem: z.object({
    unique_key: z.string().min(1).max(120),
    name_jp: z.string().min(1).max(150),
    name_en: z.string().min(1).max(150),
    name_cn: z.string().min(1).max(150),
    name_tw: z.string().min(1).max(150),
    name_kr: z.string().min(1).max(150),
    description_en: z.string().optional(),
    source_description_en: z.string().optional(),
    item_category: z.enum(['CURRENCY', 'UPGRADE_MATERIAL', 'CONSUMABLE', 'GIFT', 'ACCESSORY', 'FURNITURE', 'SPECIAL']),
    rarity: z.enum(['N', 'R', 'SR', 'SSR']),
    icon_url: z.string().max(255).optional()
  }),

  updateItem: z.object({
    unique_key: z.string().min(1).max(120).optional(),
    name_jp: z.string().min(1).max(150).optional(),
    name_en: z.string().min(1).max(150).optional(),
    name_cn: z.string().min(1).max(150).optional(),
    name_tw: z.string().min(1).max(150).optional(),
    name_kr: z.string().min(1).max(150).optional(),
    description_en: z.string().optional(),
    source_description_en: z.string().optional(),
    item_category: z.enum(['CURRENCY', 'UPGRADE_MATERIAL', 'CONSUMABLE', 'GIFT', 'ACCESSORY', 'FURNITURE', 'SPECIAL']).optional(),
    rarity: z.enum(['N', 'R', 'SR', 'SSR']).optional(),
    icon_url: z.string().max(255).optional()
  }),

  // ============================================================================
  // BROMIDE VALIDATION SCHEMAS
  // ============================================================================
  createBromide: z.object({
    unique_key: z.string().min(1).max(120),
    name_jp: z.string().min(1).max(150),
    name_en: z.string().min(1).max(150),
    name_cn: z.string().min(1).max(150),
    name_tw: z.string().min(1).max(150),
    name_kr: z.string().min(1).max(150),
    bromide_type: z.enum(['DECO', 'OWNER']).default('DECO'),
    rarity: z.enum(['R', 'SR', 'SSR']),
    skill_id: z.number().int().positive().optional(),
    art_url: z.string().max(255).optional()
  }),

  updateBromide: z.object({
    unique_key: z.string().min(1).max(120).optional(),
    name_jp: z.string().min(1).max(150).optional(),
    name_en: z.string().min(1).max(150).optional(),
    name_cn: z.string().min(1).max(150).optional(),
    name_tw: z.string().min(1).max(150).optional(),
    name_kr: z.string().min(1).max(150).optional(),
    bromide_type: z.enum(['DECO', 'OWNER']).optional(),
    rarity: z.enum(['R', 'SR', 'SSR']).optional(),
    skill_id: z.number().int().positive().optional(),
    art_url: z.string().max(255).optional()
  })
};