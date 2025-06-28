import { z } from 'zod';
import { AppError } from '../middleware/errorHandler';

/**
 * Optimized validation system using Zod for better type safety and performance
 */

// ============================================================================
// COMMON VALIDATION PATTERNS
// ============================================================================

// Base field patterns
const uniqueKeyPattern = z.string()
  .min(1, 'Unique key is required')
  .max(150, 'Unique key must be no more than 150 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Unique key can only contain alphanumeric characters, underscores, and hyphens');

const namePattern = z.string()
  .min(1, 'Name is required')
  .max(255, 'Name must be no more than 255 characters')
  .trim();

const multiLanguageNames = z.object({
  name_jp: namePattern,
  name_en: namePattern,
  name_cn: namePattern,
  name_tw: namePattern,
  name_kr: namePattern,
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').optional(),
  limit: z.coerce.number().int().min(1, 'Limit must be at least 1').max(1000, 'Limit cannot exceed 1000').optional(),
  sortBy: z.string().max(50, 'Sort field name too long').regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Invalid sort field format').optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const searchSchema = z.object({
  q: z.string()
    .min(2, 'Search query must be at least 2 characters')
    .max(100, 'Search query must be no more than 100 characters')
    .optional(),
  search: z.string()
    .min(2, 'Search query must be at least 2 characters')
    .max(100, 'Search query must be no more than 100 characters')
    .optional(),
});

const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

// ============================================================================
// ENTITY-SPECIFIC SCHEMAS
// ============================================================================

// Character schemas
const characterBase = z.object({
  unique_key: uniqueKeyPattern,
  ...multiLanguageNames.shape,
  birthday: z.string().datetime().optional(),
  height: z.number().int().min(1).max(300).optional(),
  measurements: z.string().max(20).optional(),
  blood_type: z.string().max(5).optional(),
  voice_actor_jp: z.string().max(100).optional(),
  profile_image_url: z.string().url().max(255).optional(),
  is_active: z.boolean().default(true),
  game_version: z.string().max(30).optional(),
});

export const characterSchemas = {
  create: characterBase,
  update: characterBase.partial(),
  batchCreate: z.array(characterBase).min(1).max(100, 'Cannot create more than 100 characters at once'),
  query: paginationSchema.merge(searchSchema).merge(z.object({
    is_active: z.coerce.boolean().optional(),
    birthday_month: z.coerce.number().int().min(1).max(12).optional(),
    birthday_day: z.coerce.number().int().min(1).max(31).optional(),
  })),
};

// Swimsuit schemas
const swimsuitBase = z.object({
  character_id: z.number().int().positive(),
  unique_key: uniqueKeyPattern,
  ...multiLanguageNames.shape,
  description_en: z.string().max(1000).optional(),
  rarity: z.enum(['N', 'R', 'SR', 'SSR', 'SSR+']),
  suit_type: z.enum(['POW', 'TEC', 'STM', 'APL', 'N/A']),
  total_stats_awakened: z.number().int().min(0).default(0),
  has_malfunction: z.boolean().default(false),
  is_limited: z.boolean().default(true),
  release_date_gl: z.string().datetime().optional(),
  game_version: z.string().max(30).optional(),
});

export const swimsuitSchemas = {
  create: swimsuitBase,
  update: swimsuitBase.partial(),
  query: paginationSchema.merge(searchSchema).merge(z.object({
    character_id: z.coerce.number().int().positive().optional(),
    rarity: z.enum(['N', 'R', 'SR', 'SSR', 'SSR+']).optional(),
    suit_type: z.enum(['POW', 'TEC', 'STM', 'APL', 'N/A']).optional(),
    has_malfunction: z.coerce.boolean().optional(),
    is_limited: z.coerce.boolean().optional(),
    min_stats: z.coerce.number().int().min(0).optional(),
    max_stats: z.coerce.number().int().min(0).optional(),
  })),
};

// Skill schemas
const skillBase = z.object({
  unique_key: uniqueKeyPattern,
  ...multiLanguageNames.shape,
  description_en: z.string().max(1000).optional(),
  skill_category: z.enum(['ACTIVE', 'PASSIVE', 'POTENTIAL']),
  effect_type: z.string().max(50).optional(),
  game_version: z.string().max(30).optional(),
});

export const skillSchemas = {
  create: skillBase,
  update: skillBase.partial(),
  query: paginationSchema.merge(searchSchema).merge(z.object({
    category: z.enum(['ACTIVE', 'PASSIVE', 'POTENTIAL']).optional(),
    effect_type: z.string().max(50).optional(),
  })),
};

// Item schemas
const itemBase = z.object({
  unique_key: uniqueKeyPattern,
  ...multiLanguageNames.shape,
  description_en: z.string().max(1000).optional(),
  source_description_en: z.string().max(1000).optional(),
  item_category: z.enum(['CURRENCY', 'UPGRADE_MATERIAL', 'CONSUMABLE', 'GIFT', 'ACCESSORY', 'FURNITURE', 'SPECIAL']),
  rarity: z.enum(['N', 'R', 'SR', 'SSR']),
  icon_url: z.string().url().max(255).optional(),
  game_version: z.string().max(30).optional(),
});

export const itemSchemas = {
  create: itemBase,
  update: itemBase.partial(),
  query: paginationSchema.merge(searchSchema).merge(z.object({
    category: z.enum(['CURRENCY', 'UPGRADE_MATERIAL', 'CONSUMABLE', 'GIFT', 'ACCESSORY', 'FURNITURE', 'SPECIAL']).optional(),
    rarity: z.enum(['N', 'R', 'SR', 'SSR']).optional(),
  })),
};

// Document schemas with enhanced TipTap content validation
const tiptapContentSchema = z.union([
  z.string().refine((val) => {
    if (!val) return true; // Allow empty strings
    try {
      const parsed = JSON.parse(val);
      return validateTipTapStructure(parsed);
    } catch {
      return false;
    }
  }, 'Must be valid TipTap JSON format'),
  z.object({
    type: z.string().optional(),
    content: z.array(z.any()).optional(),
  }).passthrough().refine((obj) => {
    return validateTipTapStructure(obj);
  }, 'Must be valid TipTap document structure'),
  z.null(),
]);

// Helper function to validate TipTap structure
function validateTipTapStructure(doc: any): boolean {
  if (!doc || typeof doc !== 'object') return false;
  
  // Root document should have type 'doc' or no type (legacy)
  if (doc.type && doc.type !== 'doc') return false;
  
  // Content should be an array if present
  if (doc.content && !Array.isArray(doc.content)) return false;
  
  // Validate content size (prevent extremely large documents)
  const contentString = JSON.stringify(doc);
  if (contentString.length > 1024 * 1024) return false; // 1MB limit
  
  return true;
}

const documentBase = z.object({
  unique_key: uniqueKeyPattern,
  title_en: z.string().min(1, 'Title is required').max(255, 'Title too long').trim(),
  summary_en: z.string().max(1000, 'Summary too long').optional(),
  content_json_en: tiptapContentSchema.optional(),
  screenshots: z.array(z.string().url().max(500, 'Screenshot URL too long'))
    .max(20, 'Cannot have more than 20 screenshots')
    .optional(),
});

export const documentSchemas = {
  create: documentBase,
  update: documentBase.partial(),
  query: paginationSchema.merge(searchSchema).merge(z.object({
    category: z.string().max(50).optional(),
  })),
};

// Event schemas with enhanced date validation
const eventBaseFields = z.object({
  unique_key: uniqueKeyPattern,
  ...multiLanguageNames.shape,
  type: z.enum(['FESTIVAL_RANKING', 'FESTIVAL_CUMULATIVE', 'TOWER', 'ROCK_CLIMBING', 'BUTT_BATTLE', 'LOGIN_BONUS', 'STORY']),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  game_version: z.string().max(30).optional(),
});

const eventBase = eventBaseFields.refine((data) => {
  return new Date(data.start_date) < new Date(data.end_date);
}, {
  message: 'Start date must be before end date',
  path: ['end_date'],
});

export const eventSchemas = {
  create: eventBase,
  update: eventBaseFields.partial(),
  query: paginationSchema.merge(searchSchema).merge(dateRangeSchema).merge(z.object({
    type: z.enum(['FESTIVAL_RANKING', 'FESTIVAL_CUMULATIVE', 'TOWER', 'ROCK_CLIMBING', 'BUTT_BATTLE', 'LOGIN_BONUS', 'STORY']).optional(),
    is_active: z.coerce.boolean().optional(),
  })),
};

// Gacha schemas
const gachaBaseFields = z.object({
  unique_key: uniqueKeyPattern,
  ...multiLanguageNames.shape,
  gacha_subtype: z.enum(['TRENDY', 'NOSTALGIC', 'BIRTHDAY', 'ANNIVERSARY', 'PAID', 'FREE', 'ETC']),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  game_version: z.string().max(30).optional(),
});

const gachaBase = gachaBaseFields.refine((data) => {
  return new Date(data.start_date) < new Date(data.end_date);
}, {
  message: 'Start date must be before end date',
  path: ['end_date'],
});

export const gachaSchemas = {
  create: gachaBase,
  update: gachaBaseFields.partial(),
  query: paginationSchema.merge(searchSchema).merge(dateRangeSchema).merge(z.object({
    gacha_subtype: z.enum(['TRENDY', 'NOSTALGIC', 'BIRTHDAY', 'ANNIVERSARY', 'PAID', 'FREE', 'ETC']).optional(),
    is_active: z.coerce.boolean().optional(),
  })),
};

// Bromide schemas
const bromideBase = z.object({
  unique_key: uniqueKeyPattern,
  ...multiLanguageNames.shape,
  bromide_type: z.enum(['DECO', 'OWNER']).default('DECO'),
  rarity: z.enum(['R', 'SR', 'SSR']),
  skill_id: z.number().int().positive().optional(),
  art_url: z.string().url().max(255).optional(),
  game_version: z.string().max(30).optional(),
});

export const bromideSchemas = {
  create: bromideBase,
  update: bromideBase.partial(),
  query: paginationSchema.merge(searchSchema).merge(z.object({
    type: z.enum(['DECO', 'OWNER']).optional(),
    rarity: z.enum(['R', 'SR', 'SSR']).optional(),
  })),
};

// Episode schemas
const episodeBase = z.object({
  unique_key: uniqueKeyPattern,
  title_jp: namePattern,
  title_en: namePattern,
  title_cn: namePattern,
  title_tw: namePattern,
  title_kr: namePattern,
  unlock_condition_en: z.string().max(1000).optional(),
  episode_type: z.enum(['MAIN', 'CHARACTER', 'EVENT', 'SWIMSUIT', 'ITEM']),
  related_entity_type: z.string().max(64).optional(),
  related_entity_id: z.number().int().positive().optional(),
  game_version: z.string().max(30).optional(),
});

export const episodeSchemas = {
  create: episodeBase,
  update: episodeBase.partial(),
  query: paginationSchema.merge(searchSchema).merge(z.object({
    episode_type: z.enum(['MAIN', 'CHARACTER', 'EVENT', 'SWIMSUIT', 'ITEM']).optional(),
    related_entity_type: z.string().max(64).optional(),
    related_entity_id: z.coerce.number().int().positive().optional(),
  })),
};

// Update Log schemas with enhanced validation
const updateLogBase = z.object({
  unique_key: uniqueKeyPattern.optional(),
  version: z.string().min(1, 'Version is required').max(50),
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().min(1, 'Content is required'),
  description: z.string().max(1000).optional(),
  date: z.string().datetime(),
  tags: z.array(z.string().max(50)).max(10, 'Too many tags').optional(),
  screenshots: z.array(z.string().url().max(500)).max(20, 'Too many screenshots').optional(),
  metrics: z.object({
    performanceImprovement: z.string().max(100),
    userSatisfaction: z.string().max(100),
    bugReports: z.number().int().min(0),
  }).optional(),
});

export const updateLogSchemas = {
  create: updateLogBase,
  update: updateLogBase.partial(),
  query: paginationSchema.merge(searchSchema).merge(dateRangeSchema).merge(z.object({
    version: z.string().max(50).optional(),
  })),
};

// Shop Listing schemas
const shopListingBaseFields = z.object({
  shop_type: z.enum(['EVENT', 'VIP', 'GENERAL', 'CURRENCY']),
  item_id: z.number().int().positive(),
  cost_currency_item_id: z.number().int().positive(),
  cost_amount: z.number().int().positive(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

const shopListingBase = shopListingBaseFields.refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) < new Date(data.end_date);
  }
  return true;
}, {
  message: 'Start date must be before end date',
  path: ['end_date'],
});

export const shopListingSchemas = {
  create: shopListingBase,
  update: shopListingBaseFields.partial(),
  query: paginationSchema.merge(searchSchema).merge(dateRangeSchema).merge(z.object({
    shop_type: z.enum(['EVENT', 'VIP', 'GENERAL', 'CURRENCY']).optional(),
    available_only: z.coerce.boolean().optional(),
  })),
};

// ============================================================================
// LEGACY SCHEMA EXPORTS (for backward compatibility)
// ============================================================================

// Export individual schemas for legacy support
export const schemas = {
  pagination: paginationSchema,
  search: searchSchema,
  dateRange: dateRangeSchema,
  
  // Entity schemas
  characterSchemas,
  swimsuitSchemas,
  skillSchemas,
  itemSchemas,
  documentSchemas,
  eventSchemas,
  gachaSchemas,
  bromideSchemas,
  episodeSchemas,
  updateLogSchemas,
  shopListingSchemas,
  
  // Legacy individual schemas (deprecated - use entitySchemas instead)
  createCharacter: characterSchemas.create,
  updateCharacter: characterSchemas.update,
  queryCharacter: characterSchemas.query,
  
  createDocument: documentSchemas.create,
  updateDocument: documentSchemas.update,
  queryDocument: documentSchemas.query,
  
  createEvent: eventSchemas.create,
  updateEvent: eventSchemas.update,
  queryEvent: eventSchemas.query,
};

// ============================================================================
// VALIDATION HELPER FUNCTIONS
// ============================================================================

/**
 * Enhanced middleware factory for request body validation
 */
export function createValidator(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: formattedErrors,
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Internal validation error',
        timestamp: new Date().toISOString()
      });
    }
  };
}

/**
 * Enhanced middleware factory for query parameter validation
 */
export function createQueryValidator(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return res.status(400).json({
          success: false,
          error: 'Query validation failed',
          details: formattedErrors,
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Internal validation error',
        timestamp: new Date().toISOString()
      });
    }
  };
}

/**
 * Enhanced middleware factory for route parameter validation
 */
export function createParamsValidator(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        return res.status(400).json({
          success: false,
          error: 'Parameter validation failed',
          details: formattedErrors,
          timestamp: new Date().toISOString()
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Internal validation error',
        timestamp: new Date().toISOString()
      });
    }
  };
}

// ============================================================================
// LEGACY COMPATIBILITY EXPORTS
// ============================================================================

// Legacy validation functions for backward compatibility
export const validate = createValidator;
export const validateQuery = createQueryValidator;
export const validateParams = createParamsValidator;

// ============================================================================
// ADDITIONAL VALIDATION UTILITIES
// ============================================================================

/**
 * Validate data against schema without throwing
 */
export function validateData<T>(data: unknown, schema: z.ZodSchema<T>): {
  success: boolean;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
} {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return { success: false, errors };
    }
    return { success: false, errors: [{ field: 'unknown', message: 'Validation error' }] };
  }
}

/**
 * Validate data and throw AppError on failure
 */
export function validateAndThrow<T>(data: unknown, schema: z.ZodSchema<T>): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      throw new AppError(
        `Validation failed: ${firstError.message}`,
        400
      );
    }
    throw new AppError('Validation error', 400);
  }
}
