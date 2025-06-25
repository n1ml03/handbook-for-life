import { AppError } from '../middleware/errorHandler';

/**
 * Comprehensive validation schemas and utilities for all services
 */

export interface ValidationRule<T = any> {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date' | 'email' | 'url';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: T[];
  custom?: (value: any) => string | null; // Returns error message or null if valid
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export class Validator {
  /**
   * Validate an object against a schema
   */
  static validate<T extends Record<string, any>>(
    data: T, 
    schema: ValidationSchema, 
    options: { allowExtraFields?: boolean } = {}
  ): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    for (const [fieldName, rule] of Object.entries(schema)) {
      const value = data[fieldName];
      
      if (rule.required && (value === undefined || value === null)) {
        errors.push(`${rule.field || fieldName} is required`);
        continue;
      }

      if (value !== undefined && value !== null) {
        const fieldErrors = this.validateField(value, rule, fieldName);
        errors.push(...fieldErrors);
      }
    }

    // Check for extra fields if not allowed
    if (!options.allowExtraFields) {
      const schemaFields = Object.keys(schema);
      const dataFields = Object.keys(data);
      const extraFields = dataFields.filter(field => !schemaFields.includes(field));
      
      if (extraFields.length > 0) {
        warnings.push(`Unexpected fields: ${extraFields.join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate a single field against a rule
   */
  private static validateField(value: any, rule: ValidationRule, fieldName: string): string[] {
    const errors: string[] = [];
    const displayName = rule.field || fieldName;

    // Type validation
    if (rule.type) {
      const typeError = this.validateType(value, rule.type, displayName);
      if (typeError) {
        errors.push(typeError);
        return errors; // Don't continue if type is wrong
      }
    }

    // String validations
    if (rule.type === 'string' && typeof value === 'string') {
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        errors.push(`${displayName} must be at least ${rule.minLength} characters long`);
      }
      
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        errors.push(`${displayName} must be no more than ${rule.maxLength} characters long`);
      }
      
      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(`${displayName} format is invalid`);
      }
    }

    // Number validations
    if (rule.type === 'number' && typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        errors.push(`${displayName} must be at least ${rule.min}`);
      }
      
      if (rule.max !== undefined && value > rule.max) {
        errors.push(`${displayName} must be no more than ${rule.max}`);
      }
    }

    // Array validations
    if (rule.type === 'array' && Array.isArray(value)) {
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        errors.push(`${displayName} must have at least ${rule.minLength} items`);
      }
      
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        errors.push(`${displayName} must have no more than ${rule.maxLength} items`);
      }
    }

    // Enum validation
    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(`${displayName} must be one of: ${rule.enum.join(', ')}`);
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        errors.push(customError);
      }
    }

    return errors;
  }

  /**
   * Validate type of a value
   */
  private static validateType(value: any, expectedType: string, fieldName: string): string | null {
    switch (expectedType) {
      case 'string':
        if (typeof value !== 'string') {
          return `${fieldName} must be a string`;
        }
        break;
      
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          return `${fieldName} must be a valid number`;
        }
        break;
      
      case 'boolean':
        if (typeof value !== 'boolean') {
          return `${fieldName} must be a boolean`;
        }
        break;
      
      case 'array':
        if (!Array.isArray(value)) {
          return `${fieldName} must be an array`;
        }
        break;
      
      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          return `${fieldName} must be an object`;
        }
        break;
      
      case 'date':
        if (!(value instanceof Date) && !this.isValidDateString(value)) {
          return `${fieldName} must be a valid date`;
        }
        break;
      
      case 'email':
        if (typeof value !== 'string' || !this.isValidEmail(value)) {
          return `${fieldName} must be a valid email address`;
        }
        break;
      
      case 'url':
        if (typeof value !== 'string' || !this.isValidUrl(value)) {
          return `${fieldName} must be a valid URL`;
        }
        break;
    }
    
    return null;
  }

  /**
   * Check if a string is a valid email
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if a string is a valid URL
   */
  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a value is a valid date string
   */
  private static isValidDateString(value: any): boolean {
    if (typeof value !== 'string') return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  /**
   * Sanitize input by removing potentially dangerous characters
   */
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return input;
    
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  /**
   * Validate and throw error if validation fails
   */
  static validateAndThrow<T extends Record<string, any>>(
    data: T, 
    schema: ValidationSchema, 
    options: { allowExtraFields?: boolean } = {}
  ): void {
    const result = this.validate(data, schema, options);
    
    if (!result.isValid) {
      throw new AppError(`Validation failed: ${result.errors.join(', ')}`, 400);
    }
  }
}

// Common validation schemas
export const CommonSchemas = {
  id: {
    type: 'number' as const,
    required: true,
    min: 1,
    field: 'ID'
  },

  uniqueKey: {
    type: 'string' as const,
    required: true,
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9_-]+$/,
    field: 'Unique key'
  },

  name: {
    type: 'string' as const,
    required: true,
    minLength: 1,
    maxLength: 255,
    field: 'Name'
  },

  description: {
    type: 'string' as const,
    required: false,
    maxLength: 1000,
    field: 'Description'
  },

  email: {
    type: 'email' as const,
    required: true,
    field: 'Email'
  },

  url: {
    type: 'url' as const,
    required: false,
    field: 'URL'
  },

  date: {
    type: 'date' as const,
    required: false,
    field: 'Date'
  },

  tags: {
    type: 'array' as const,
    required: false,
    maxLength: 10,
    field: 'Tags'
  }
};

// Service-specific validation schemas
export const ServiceSchemas = {
  Character: {
    create: {
      unique_key: CommonSchemas.uniqueKey,
      name_en: CommonSchemas.name,
      name_jp: { ...CommonSchemas.name, required: false },
      name_cn: { ...CommonSchemas.name, required: false },
      name_tw: { ...CommonSchemas.name, required: false },
      name_kr: { ...CommonSchemas.name, required: false },
      birthday: { ...CommonSchemas.date, required: false },
      is_active: { type: 'boolean' as const, required: false, field: 'Active status' },
      game_version: { type: 'string' as const, required: false, maxLength: 50, field: 'Game version' }
    },
    update: {
      name_en: { ...CommonSchemas.name, required: false },
      name_jp: { ...CommonSchemas.name, required: false },
      name_cn: { ...CommonSchemas.name, required: false },
      name_tw: { ...CommonSchemas.name, required: false },
      name_kr: { ...CommonSchemas.name, required: false },
      birthday: { ...CommonSchemas.date, required: false },
      is_active: { type: 'boolean' as const, required: false, field: 'Active status' },
      game_version: { type: 'string' as const, required: false, maxLength: 50, field: 'Game version' }
    }
  },

  Gacha: {
    create: {
      unique_key: CommonSchemas.uniqueKey,
      name_en: CommonSchemas.name,
      name_jp: { ...CommonSchemas.name, required: false },
      gacha_subtype: {
        type: 'string' as const,
        required: true,
        enum: ['NORMAL', 'PREMIUM', 'LIMITED', 'SPECIAL'],
        field: 'Gacha subtype'
      },
      start_date: { type: 'date' as const, required: true, field: 'Start date' },
      end_date: { type: 'date' as const, required: true, field: 'End date' },
      cost_per_pull: { type: 'number' as const, required: true, min: 1, field: 'Cost per pull' },
      cost_currency_item_id: { type: 'number' as const, required: true, min: 1, field: 'Currency item ID' }
    }
  },

  UpdateLog: {
    create: {
      version: {
        type: 'string' as const,
        required: true,
        pattern: /^v?\d+\.\d+(\.\d+)?(-[a-zA-Z0-9]+)?$/,
        field: 'Version'
      },
      title: { ...CommonSchemas.name, maxLength: 255 },
      content: { type: 'string' as const, required: true, minLength: 1, maxLength: 65535, field: 'Content' },
      description: { ...CommonSchemas.description, required: false },
      date: { ...CommonSchemas.date, required: false },
      tags: { ...CommonSchemas.tags, required: false },
      is_published: { type: 'boolean' as const, required: false, field: 'Published status' },
      screenshots: { type: 'array' as const, required: false, maxLength: 10, field: 'Screenshots' }
    }
  },

  Document: {
    create: {
      unique_key: CommonSchemas.uniqueKey,
      title_en: { ...CommonSchemas.name, maxLength: 255, field: 'Document title' },
      summary_en: { ...CommonSchemas.description, maxLength: 1000, field: 'Summary' },
      content_json_en: { type: 'object' as const, required: false, field: 'Content' },
      is_published: { type: 'boolean' as const, required: false, field: 'Published status' },
      screenshots: { type: 'array' as const, required: false, maxLength: 10, field: 'Screenshots' }
    },
    update: {
      unique_key: { ...CommonSchemas.uniqueKey, required: false },
      title_en: { ...CommonSchemas.name, maxLength: 255, required: false, field: 'Document title' },
      summary_en: { ...CommonSchemas.description, maxLength: 1000, required: false, field: 'Summary' },
      content_json_en: { type: 'object' as const, required: false, field: 'Content' },
      is_published: { type: 'boolean' as const, required: false, field: 'Published status' },
      screenshots: { type: 'array' as const, required: false, maxLength: 10, field: 'Screenshots' }
    }
  },

  Bromide: {
    create: {
      unique_key: CommonSchemas.uniqueKey,
      name_en: CommonSchemas.name,
      name_jp: { ...CommonSchemas.name, required: false },
      bromide_type: {
        type: 'string' as const,
        required: true,
        enum: ['NORMAL', 'SPECIAL', 'LIMITED'],
        field: 'Bromide type'
      },
      rarity: {
        type: 'number' as const,
        required: true,
        min: 1,
        max: 5,
        field: 'Rarity'
      }
    }
  }
};

export default Validator;
