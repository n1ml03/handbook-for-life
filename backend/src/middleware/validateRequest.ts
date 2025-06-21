import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from './errorHandler';

interface ValidationSchemas {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
}

export function validateRequest(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (schemas.body) {
        const result = schemas.body.safeParse(req.body);
        if (!result.success) {
          throw new AppError(`Validation error: ${result.error.errors[0]?.message}`, 400);
        }
        req.body = result.data;
      }

      // Validate query parameters
      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) {
          throw new AppError(`Query validation error: ${result.error.errors[0]?.message}`, 400);
        }
        req.query = result.data;
      }

      // Validate route parameters
      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (!result.success) {
          throw new AppError(`Params validation error: ${result.error.errors[0]?.message}`, 400);
        }
        req.params = result.data;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
} 