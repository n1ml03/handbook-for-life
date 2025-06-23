import { AppError } from '../middleware/errorHandler';

/**
 * Shared validation utilities to reduce code duplication
 */

export class ValidationHelpers {
  /**
   * Validates that required fields are present and not empty
   */
  static validateRequiredFields<T extends Record<string, any>>(
    obj: T,
    requiredFields: (keyof T)[],
    objectName: string = 'Object'
  ): void {
    const missingFields = requiredFields.filter(field =>
      obj[field] === undefined || 
      obj[field] === null ||
      (typeof obj[field] === 'string' && !obj[field].trim())
    );

    if (missingFields.length > 0) {
      throw new AppError(
        `${objectName} is missing required fields: ${missingFields.join(', ')}`,
        400
      );
    }
  }

  /**
   * Validates that a required string field is provided and not empty
   */
  static validateRequiredString(value: string | undefined, fieldName: string): void {
    if (!value?.trim()) {
      throw new AppError(`${fieldName} is required`, 400);
    }
  }

  /**
   * Validates date range (start must be before end)
   */
  static validateDateRange(startDate: string | Date, endDate: string | Date, fieldPrefix: string = ''): void {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
      throw new AppError(`${fieldPrefix}Start date must be before end date`, 400);
    }
  }

  /**
   * Validates positive number
   */
  static validatePositiveNumber(value: number, fieldName: string): void {
    if (value <= 0) {
      throw new AppError(`${fieldName} must be greater than 0`, 400);
    }
  }

  /**
   * Validates that a string matches a specific pattern
   */
  static validatePattern(
    value: string | undefined, 
    pattern: RegExp, 
    fieldName: string, 
    description: string
  ): void {
    if (value !== undefined && value.trim() && !pattern.test(value.trim())) {
      throw new AppError(`${fieldName} ${description}`, 400);
    }
  }

  /**
   * Common skill slot validation for swimsuit skills
   */
  static validateSkillSlotConfiguration(skillSlots: string[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check for required active skill
    if (!skillSlots.includes('ACTIVE')) {
      errors.push('Swimsuit must have an ACTIVE skill');
    }

    // Check for duplicate slots
    const uniqueSlots = new Set(skillSlots);
    if (uniqueSlots.size !== skillSlots.length) {
      errors.push('Duplicate skill slots detected');
    }

    // Check slot order logic
    const hasPassive1 = skillSlots.includes('PASSIVE_1');
    const hasPassive2 = skillSlots.includes('PASSIVE_2');
    const hasPotential = skillSlots.some(slot => slot.startsWith('POTENTIAL'));

    if (hasPassive2 && !hasPassive1) {
      errors.push('PASSIVE_2 requires PASSIVE_1 to be present');
    }

    if (hasPotential && (!hasPassive1 || !hasPassive2)) {
      errors.push('POTENTIAL skills require both PASSIVE skills to be present');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 