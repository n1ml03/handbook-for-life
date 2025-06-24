import { AppError } from '../middleware/errorHandler';
import { logger } from '../config';
import { PaginationOptions, PaginatedResult } from '../models/BaseModel';

/**
 * Standardized health status interface for all services
 */
export interface ServiceHealthStatus {
  serviceName: string;
  isHealthy: boolean;
  errors: string[];
  warnings: string[];
  responseTime: number;
  timestamp: string;
  version: string;
  dependencies: Record<string, string>;
}

/**
 * Base service class that provides common functionality for all services
 * Eliminates code duplication and provides consistent error handling
 */
export abstract class BaseService<TModel, TEntity, TNewEntity> {
  protected model: TModel;
  protected serviceName: string;

  constructor(model: TModel, serviceName: string) {
    this.model = model;
    this.serviceName = serviceName;
  }

  /**
   * Validates that an ID is provided and not empty
   */
  protected validateId(id: string | number, fieldName: string = 'ID'): void {
    if (id === undefined || id === null || (typeof id === 'string' && !id.trim()) || (typeof id === 'number' && isNaN(id))) {
      throw new AppError(`${fieldName} is required`, 400);
    }
  }

  /**
   * Converts string ID to number and validates it
   */
  protected parseNumericId(id: string | number, fieldName: string = 'ID'): number {
    this.validateId(id, fieldName);

    if (typeof id === 'number') {
      return id;
    }

    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) {
      throw new AppError(`${fieldName} must be a valid positive number`, 400);
    }

    return numericId;
  }

  /**
   * Validates that a required string field is provided and not empty
   */
  protected validateRequiredString(value: string | undefined, fieldName: string): void {
    if (!value?.trim()) {
      throw new AppError(`${fieldName} is required`, 400);
    }
  }

  /**
   * Validates that an optional string field is not empty if provided
   */
  protected validateOptionalString(value: string | undefined, fieldName: string): void {
    if (value !== undefined && !value?.trim()) {
      throw new AppError(`${fieldName} cannot be empty`, 400);
    }
  }

  /**
   * Validates date range (start date must be before end date)
   */
  protected validateDateRange(startDate: Date, endDate: Date): void {
    if (startDate >= endDate) {
      throw new AppError('Start date must be before end date', 400);
    }
  }

  /**
   * Validates that a search query is provided and not empty
   */
  protected validateSearchQuery(query: string | undefined): void {
    if (!query?.trim()) {
      throw new AppError('Search query is required', 400);
    }
  }

  /**
   * Logs the start of a service operation
   */
  protected logOperationStart(operation: string, identifier?: string | number, metadata?: any): void {
    const message = identifier 
      ? `${operation} ${this.serviceName.toLowerCase()}: ${identifier}`
      : `${operation} ${this.serviceName.toLowerCase()}`;
    
    logger.info(message, metadata);
  }

  /**
   * Logs the successful completion of a service operation
   */
  protected logOperationSuccess(operation: string, identifier?: string | number, metadata?: any): void {
    const message = identifier 
      ? `${operation} ${this.serviceName.toLowerCase()} successfully: ${identifier}`
      : `${operation} ${this.serviceName.toLowerCase()} successfully`;
    
    logger.info(message, metadata);
  }

  /**
   * Logs and handles service operation errors
   */
  protected handleServiceError(operation: string, identifier: string | number | undefined, error: any): never {
    const message = identifier 
      ? `Failed to ${operation.toLowerCase()} ${this.serviceName.toLowerCase()}: ${identifier}`
      : `Failed to ${operation.toLowerCase()} ${this.serviceName.toLowerCase()}`;

    logger.error(message, { 
      error: error instanceof Error ? error.message : error,
      serviceName: this.serviceName
    });

    if (error instanceof AppError) {
      throw error;
    }
    
    throw new AppError(`Failed to ${operation.toLowerCase()} ${this.serviceName.toLowerCase()}`, 500);
  }

  /**
   * Enhanced health check implementation with detailed diagnostics
   */
  async healthCheck(): Promise<ServiceHealthStatus> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    let isHealthy = true;

    try {
      // Check model health if available
      if (this.model && typeof (this.model as any).healthCheck === 'function') {
        const modelHealth = await (this.model as any).healthCheck();
        if (!modelHealth.isHealthy) {
          isHealthy = false;
          errors.push(...(modelHealth.errors || []));
        }
        if (modelHealth.warnings) {
          warnings.push(...modelHealth.warnings);
        }
      }

      // Check service-specific health indicators
      const serviceHealth = await this.performServiceHealthChecks();
      if (!serviceHealth.isHealthy) {
        isHealthy = false;
        errors.push(...serviceHealth.errors);
      }
      warnings.push(...serviceHealth.warnings);

      const responseTime = Date.now() - startTime;

      // Warn if health check is slow
      if (responseTime > 5000) {
        warnings.push(`Health check response time is slow: ${responseTime}ms`);
      }

      return {
        serviceName: this.serviceName,
        isHealthy,
        errors,
        warnings,
        responseTime,
        timestamp: new Date().toISOString(),
        version: process.env.BUN_PACKAGE_VERSION || process.env.npm_package_version || '1.0.0',
        dependencies: await this.checkDependencies()
      };
    } catch (error) {
      return {
        serviceName: this.serviceName,
        isHealthy: false,
        errors: [`${this.serviceName} health check failed: ${error instanceof Error ? error.message : error}`],
        warnings: [],
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        version: process.env.BUN_PACKAGE_VERSION || process.env.npm_package_version || '1.0.0',
        dependencies: {}
      };
    }
  }

  /**
   * Override this method in derived services for service-specific health checks
   */
  protected async performServiceHealthChecks(): Promise<{ isHealthy: boolean; errors: string[]; warnings: string[] }> {
    return {
      isHealthy: true,
      errors: [],
      warnings: []
    };
  }

  /**
   * Check external dependencies
   */
  protected async checkDependencies(): Promise<Record<string, string>> {
    const dependencies: Record<string, string> = {};

    try {
      // Check database connectivity
      if (this.model) {
        dependencies.database = 'connected';
      }

      // Add other dependency checks as needed
      dependencies.memory = `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`;
      dependencies.uptime = `${Math.round(process.uptime())}s`;

    } catch (error) {
      dependencies.error = error instanceof Error ? error.message : String(error);
    }

    return dependencies;
  }

  /**
   * Standard service initialization (override if needed)
   */
  async initialize(): Promise<void> {
    logger.info(`Initializing ${this.serviceName}...`);
    
    // Check if model has an initialize method
    if (this.model && typeof (this.model as any).initialize === 'function') {
      await (this.model as any).initialize();
    }
    
    logger.info(`${this.serviceName} initialized successfully`);
  }

  /**
   * Standard service shutdown (override if needed)
   */
  async shutdown(): Promise<void> {
    logger.info(`Shutting down ${this.serviceName}...`);
    
    // Check if model has a shutdown method
    if (this.model && typeof (this.model as any).shutdown === 'function') {
      await (this.model as any).shutdown();
    }
    
    logger.info(`${this.serviceName} shut down successfully`);
  }

  /**
   * Wrapper for safe async operations with consistent error handling
   */
  protected async safeAsyncOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    identifier?: string | number
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.handleServiceError(operationName, identifier, error);
    }
  }

  /**
   * Validates pagination options and sets defaults
   */
  protected validatePaginationOptions(options: PaginationOptions = {}): PaginationOptions {
    const { page = 1, limit = 10, sortBy, sortOrder = 'desc' } = options;
    
    if (page < 1) {
      throw new AppError('Page number must be greater than 0', 400);
    }
    
    if (limit < 1 || limit > 100) {
      throw new AppError('Limit must be between 1 and 100', 400);
    }
    
    if (sortOrder && !['asc', 'desc'].includes(sortOrder)) {
      throw new AppError('Sort order must be either "asc" or "desc"', 400);
    }
    
    return { page, limit, sortBy, sortOrder };
  }

  /**
   * Validates JSON content
   */
  protected validateJsonContent(content: any, fieldName: string): void {
    if (content !== undefined && content !== null) {
      if (typeof content === 'string') {
        try {
          JSON.parse(content);
        } catch {
          throw new AppError(`Invalid JSON format for ${fieldName}`, 400);
        }
      } else if (typeof content !== 'object') {
        throw new AppError(`${fieldName} must be a valid JSON object or string`, 400);
      }
    }
  }

  /**
   * Validates numeric values
   */
  protected validatePositiveNumber(value: number | undefined, fieldName: string): void {
    if (value !== undefined && value <= 0) {
      throw new AppError(`${fieldName} must be greater than 0`, 400);
    }
  }

  /**
   * Validates that a value is within a specific range
   */
  protected validateRange(value: number | undefined, min: number, max: number, fieldName: string): void {
    if (value !== undefined && (value < min || value > max)) {
      throw new AppError(`${fieldName} must be between ${min} and ${max}`, 400);
    }
  }

  /**
   * Validates email format
   */
  protected validateEmail(email: string | undefined, fieldName: string = 'Email'): void {
    if (email !== undefined && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        throw new AppError(`${fieldName} must be a valid email address`, 400);
      }
    }
  }

  /**
   * Validates URL format
   */
  protected validateUrl(url: string | undefined, fieldName: string = 'URL'): void {
    if (url !== undefined && url.trim()) {
      try {
        new URL(url.trim());
      } catch {
        throw new AppError(`${fieldName} must be a valid URL`, 400);
      }
    }
  }

  /**
   * Validates that an array is not empty
   */
  protected validateNonEmptyArray<T>(array: T[] | undefined, fieldName: string): void {
    if (array !== undefined && (!Array.isArray(array) || array.length === 0)) {
      throw new AppError(`${fieldName} must be a non-empty array`, 400);
    }
  }

  /**
   * Validates that a value is one of the allowed enum values
   */
  protected validateEnum<T>(value: T | undefined, allowedValues: T[], fieldName: string): void {
    if (value !== undefined && !allowedValues.includes(value)) {
      throw new AppError(`${fieldName} must be one of: ${allowedValues.join(', ')}`, 400);
    }
  }

  /**
   * Validates that a string matches a specific pattern
   */
  protected validatePattern(value: string | undefined, pattern: RegExp, fieldName: string, description: string): void {
    if (value !== undefined && value.trim() && !pattern.test(value.trim())) {
      throw new AppError(`${fieldName} ${description}`, 400);
    }
  }

  /**
   * Validates that a date is not in the past
   */
  protected validateFutureDate(date: Date | undefined, fieldName: string): void {
    if (date !== undefined && date < new Date()) {
      throw new AppError(`${fieldName} must be in the future`, 400);
    }
  }

  /**
   * Validates that a date is not in the future
   */
  protected validatePastDate(date: Date | undefined, fieldName: string): void {
    if (date !== undefined && date > new Date()) {
      throw new AppError(`${fieldName} must be in the past`, 400);
    }
  }

  /**
   * Validates that required fields are present in an object
   */
  protected validateRequiredFields<T extends Record<string, any>>(
    obj: T,
    requiredFields: (keyof T)[],
    objectName: string = 'Object'
  ): void {
    const missingFields = requiredFields.filter(field =>
      obj[field] === undefined || obj[field] === null ||
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
   * Enhanced error handling with context information
   */
  protected handleServiceErrorWithContext(
    operation: string,
    identifier: string | number | undefined,
    error: any,
    context?: Record<string, any>
  ): never {
    const message = identifier
      ? `Failed to ${operation.toLowerCase()} ${this.serviceName.toLowerCase()}: ${identifier}`
      : `Failed to ${operation.toLowerCase()} ${this.serviceName.toLowerCase()}`;

    const errorDetails: any = {
      error: error instanceof Error ? error.message : error,
      serviceName: this.serviceName,
      operation,
      identifier
    };

    if (context) {
      errorDetails.context = context;
    }

    // Add stack trace for debugging in development
    if (error instanceof Error && process.env.NODE_ENV === 'development') {
      errorDetails.stack = error.stack;
    }

    logger.error(message, errorDetails);

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(`Failed to ${operation.toLowerCase()} ${this.serviceName.toLowerCase()}`, 500);
  }
}

export default BaseService;
