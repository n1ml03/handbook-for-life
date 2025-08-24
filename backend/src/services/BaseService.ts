import { AppError } from '../middleware/errorHandler';
import { logger } from '../config';
import { PaginationOptions, PaginatedResult, BaseEntity, NewBaseEntity } from '../models/BaseModel';
import { formatISO } from 'date-fns/formatISO';
import appConfig from '../config/app';

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
 * Performance metrics interface
 */
export interface PerformanceMetrics {
  operationName: string;
  executionTime: number;
  timestamp: number;
  success: boolean;
  errorMessage?: string;
}

/**
 * Optimized base service class with enhanced functionality
 */
export abstract class BaseService<TModel, TEntity extends BaseEntity, TNewEntity extends NewBaseEntity> {
  protected model: TModel;
  protected serviceName: string;
  private performanceMetrics: PerformanceMetrics[] = [];
  private readonly maxMetricsCount = 1000;

  constructor(model: TModel, serviceName: string) {
    this.model = model;
    this.serviceName = serviceName;
  }

  /**
   * Performance tracking wrapper
   */
  protected async trackPerformance<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = process.hrtime.bigint();
    let success = true;
    let errorMessage: string | undefined;
    
    try {
      const result = await operation();
      return result;
    } catch (error) {
      success = false;
      errorMessage = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      const endTime = process.hrtime.bigint();
      const executionTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
      
      const metrics: PerformanceMetrics = {
        operationName: `${this.serviceName}.${operationName}`,
        executionTime,
        timestamp: Date.now(),
        success,
        errorMessage,
      };
      
      this.addMetric(metrics);
      
      // Log slow operations
      if (executionTime > 1000) {
        logger.warn(`Slow operation detected`, {
          service: this.serviceName,
          operation: operationName,
          executionTime: `${executionTime}ms`
        });
      }
    }
  }

  /**
   * Add metric with automatic cleanup
   */
  private addMetric(metric: PerformanceMetrics): void {
    this.performanceMetrics.push(metric);
    
    // Keep only recent metrics to prevent memory leaks
    if (this.performanceMetrics.length > this.maxMetricsCount) {
      this.performanceMetrics = this.performanceMetrics.slice(-this.maxMetricsCount);
    }
  }

  /**
   * Get performance metrics for monitoring
   */
  public getPerformanceMetrics(options: {
    operationName?: string;
    since?: number;
    onlyFailures?: boolean;
  } = {}): PerformanceMetrics[] {
    let metrics = this.performanceMetrics.slice();
    
    if (options.operationName) {
      metrics = metrics.filter(m => m.operationName.includes(options.operationName!));
    }
    
    if (options.since) {
      metrics = metrics.filter(m => m.timestamp >= options.since!);
    }
    
    if (options.onlyFailures) {
      metrics = metrics.filter(m => !m.success);
    }
    
    return metrics;
  }

  /**
   * Enhanced ID validation
   */
  protected validateId(id: string | number, fieldName: string = 'ID'): void {
    if (id === undefined || id === null || (typeof id === 'string' && !id.trim()) || (typeof id === 'number' && isNaN(id))) {
      throw new AppError(`${fieldName} is required and must be valid`, 400);
    }
  }

  /**
   * Parse numeric ID with validation
   */
  protected parseNumericId(id: string | number, fieldName: string = 'ID'): number {
    this.validateId(id, fieldName);

    if (typeof id === 'number') {
      if (id <= 0) {
        throw new AppError(`${fieldName} must be a positive number`, 400);
      }
      return id;
    }

    const numericId = parseInt(id, 10);
    if (isNaN(numericId) || numericId <= 0) {
      throw new AppError(`${fieldName} must be a valid positive number`, 400);
    }

    return numericId;
  }

  /**
   * String validation
   */
  protected validateString(
    value: string | undefined,
    fieldName: string,
    options: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
      trim?: boolean;
    } = {}
  ): void {
    const { required = false, minLength = 0, maxLength = Infinity, trim = true } = options;
    
    if (required && (!value || (trim && !value.trim()))) {
      throw new AppError(`${fieldName} is required`, 400);
    }
    
    if (value) {
      const processedValue = trim ? value.trim() : value;
      
      if (processedValue.length < minLength) {
        throw new AppError(`${fieldName} must be at least ${minLength} characters long`, 400);
      }
      
      if (processedValue.length > maxLength) {
        throw new AppError(`${fieldName} must not exceed ${maxLength} characters`, 400);
      }
    }
  }

  /**
   * Pagination options validation
   */
  protected validatePaginationOptions(options: PaginationOptions = {}): PaginationOptions {
    const { page = 1, limit = appConfig.pagination.defaultLimit, sortBy, sortOrder = 'asc' } = options;
    
    if (page < 1) {
      throw new AppError('Page must be greater than 0', 400);
    }
    
    if (limit < 1 || limit > appConfig.pagination.maxLimit) {
      throw new AppError(`Limit must be between 1 and ${appConfig.pagination.maxLimit}`, 400);
    }
    
    if (sortOrder && !['asc', 'desc'].includes(sortOrder.toLowerCase())) {
      throw new AppError('Sort order must be either "asc" or "desc"', 400);
    }
    
    return { page, limit, sortBy, sortOrder };
  }

  /**
   * Search query validation
   */
  protected validateSearchQuery(
    query: string | undefined,
    options: {
      required?: boolean;
      minLength?: number;
      maxLength?: number;
    } = {}
  ): string | undefined {
    const { required = false, minLength = 1, maxLength = 255 } = options;
    
    if (required && !query?.trim()) {
      throw new AppError('Search query is required', 400);
    }
    
    if (query?.trim()) {
      const trimmedQuery = query.trim();
      
      if (trimmedQuery.length < minLength) {
        throw new AppError(`Search query must be at least ${minLength} characters long`, 400);
      }
      
      if (trimmedQuery.length > maxLength) {
        throw new AppError(`Search query must not exceed ${maxLength} characters`, 400);
      }
      
      return trimmedQuery;
    }
    
    return undefined;
  }

  /**
   * Safe async operation wrapper
   */
  protected async safeAsyncOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    identifier?: string | number,
    context?: Record<string, any>
  ): Promise<T> {
    return this.trackPerformance(operationName, async () => {
      try {
        return await operation();
      } catch (error) {
        // Log error with context
        logger.error(`${this.serviceName} operation failed`, {
          operation: operationName,
          identifier,
          context,
          error: error instanceof Error ? error.message : String(error)
        });
        
        // Re-throw the error for the caller to handle
        throw error;
      }
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<ServiceHealthStatus> {
    const startTime = Date.now();
    const errors: string[] = [];
    const warnings: string[] = [];
    
    try {
      // Check if model has healthCheck method
      if (this.model && typeof (this.model as any).healthCheck === 'function') {
        const modelHealth = await (this.model as any).healthCheck();
        if (!modelHealth.isHealthy) {
          errors.push(...modelHealth.errors);
        }
      }
      
      const responseTime = Date.now() - startTime;
      
      return {
        serviceName: this.serviceName,
        isHealthy: errors.length === 0,
        errors,
        warnings,
        responseTime,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        dependencies: {},
      };
    } catch (error) {
      errors.push(`Health check failed: ${error}`);
      
      return {
        serviceName: this.serviceName,
        isHealthy: false,
        errors,
        warnings,
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        dependencies: {},
      };
    }
  }

  /**
   * Format response with success indicator
   */
  protected formatResponse<T extends Record<string, any>>(data: T, message?: string): { 
    success: true; 
    data: T; 
    message?: string; 
    timestamp: string 
  } {
    return {
      success: true,
      data: this.formatDatesForResponse(data),
      message,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Format paginated response
   */
  protected formatPaginatedResponse<T extends Record<string, any>>(result: PaginatedResult<T>): { 
    success: true; 
    data: T[]; 
    pagination: any; 
    timestamp: string 
  } {
    return {
      success: true,
      data: this.formatArrayDatesForResponse(result.data),
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Format dates in response objects for frontend compatibility
   */
  private formatDatesForResponse<T extends Record<string, any>>(obj: T): T {
    if (!obj || typeof obj !== 'object') return obj;

    const formatted = { ...obj };

    Object.keys(formatted).forEach(key => {
      const value = formatted[key];
      if (value instanceof Date) {
        (formatted as any)[key] = formatISO(value);
      } else if (typeof value === 'object' && value !== null) {
        (formatted as any)[key] = this.formatDatesForResponse(value);
      }
    });

    return formatted;
  }

  /**
   * Format dates in array of response objects
   */
  private formatArrayDatesForResponse<T extends Record<string, any>>(arr: T[]): T[] {
    return arr.map(item => this.formatDatesForResponse(item));
  }

  /**
   * Format paginated dates for response - alias for backward compatibility
   */
  protected formatPaginatedDatesForResponse<T extends Record<string, any>>(result: PaginatedResult<T>): { 
    success: true; 
    data: T[]; 
    pagination: any; 
    timestamp: string 
  } {
    return this.formatPaginatedResponse(result);
  }

  /**
   * Validation helper for required strings
   */
  protected validateRequiredString(value: string | undefined, fieldName: string): void {
    this.validateString(value, fieldName, { required: true, trim: true });
  }

  /**
   * Validation helper for optional strings
   */
  protected validateOptionalString(value: string | undefined, fieldName: string): void {
    if (value !== undefined) {
      this.validateString(value, fieldName, { required: false, trim: true });
    }
  }

  /**
   * Date range validation
   */
  protected validateDateRange(startDate: Date | string, endDate: Date | string): void {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    if (isNaN(start.getTime())) {
      throw new AppError('Start date is invalid', 400);
    }

    if (isNaN(end.getTime())) {
      throw new AppError('End date is invalid', 400);
    }

    if (start >= end) {
      throw new AppError('Start date must be before end date', 400);
    }
  }

  /**
   * Operation logging - start
   */
  protected logOperationStart(operation: string, identifier?: string | number, context?: any): void {
    logger.info(`${this.serviceName} ${operation} started`, {
      service: this.serviceName,
      operation,
      identifier,
      context
    });
  }

  /**
   * Operation logging - success
   */
  protected logOperationSuccess(operation: string, identifier?: string | number, context?: any): void {
    logger.info(`${this.serviceName} ${operation} completed successfully`, {
      service: this.serviceName,
      operation,
      identifier,
      context
    });
  }

  /**
   * Handle service errors with context
   */
  protected handleServiceError(operation: string, identifier?: string | number, error?: any, context?: any): void {
    logger.error(`${this.serviceName} ${operation} failed`, {
      service: this.serviceName,
      operation,
      identifier,
      context,
      error: error instanceof Error ? error.message : String(error)
    });
  }

  /**
   * Get performance statistics
   */
  protected getPerformanceStats(): { 
    totalOperations: number; 
    averageTime: number; 
    successRate: number; 
    recentMetrics: PerformanceMetrics[] 
  } {
    const metrics = this.performanceMetrics;
    const totalOperations = metrics.length;
    
    if (totalOperations === 0) {
      return {
        totalOperations: 0,
        averageTime: 0,
        successRate: 100,
        recentMetrics: []
      };
    }

    const averageTime = metrics.reduce((sum, m) => sum + m.executionTime, 0) / totalOperations;
    const successfulOperations = metrics.filter(m => m.success).length;
    const successRate = (successfulOperations / totalOperations) * 100;
    const recentMetrics = metrics.slice(-10); // Last 10 operations

    return {
      totalOperations,
      averageTime,
      successRate,
      recentMetrics
    };
  }
}

export default BaseService;
