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
    id: z.string(),
    name: z.string().min(1).max(255),
    nameJp: z.string().max(255).optional(),
    nameEn: z.string().max(255).optional(),
    nameZh: z.string().max(255).optional()
  }),
  updateCharacter: z.object({
    name: z.string().min(1).max(255).optional(),
    nameJp: z.string().max(255).optional(),
    nameEn: z.string().max(255).optional(),
    nameZh: z.string().max(255).optional()
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
  })
}; 