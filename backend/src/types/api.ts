// API-specific types and response wrappers

import { PaginatedResult } from './database';

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiSuccess<T = any> {
  success: true;
  data: T;
  message?: string;
  timestamp: Date;
}

export interface ApiError {
  success: false;
  error: string;
  details?: any;
  timestamp: Date;
  statusCode?: number;
}

export type ApiResponse<T = any> = ApiSuccess<T> | ApiError;

// Helper function to create successful API responses
export function createSuccessResponse<T>(data: T, message?: string): ApiSuccess<T> {
  return {
    success: true,
    data,
    message,
    timestamp: new Date()
  };
}

// Helper function to create error API responses
export function createErrorResponse(error: string, details?: any, statusCode?: number): ApiError {
  return {
    success: false,
    error,
    details,
    statusCode,
    timestamp: new Date()
  };
}

// ============================================================================
// REQUEST/RESPONSE PATTERNS
// ============================================================================

// Standard list response with pagination
export interface ListResponse<T> extends ApiSuccess<PaginatedResult<T>> {}

// Standard single item response
export interface ItemResponse<T> extends ApiSuccess<T> {}

// Standard creation response
export interface CreateResponse<T> extends ApiSuccess<T> {
  message: 'Created successfully';
}

// Standard update response
export interface UpdateResponse<T> extends ApiSuccess<T> {
  message: 'Updated successfully';
}

// Standard deletion response
export interface DeleteResponse extends ApiSuccess<null> {
  message: 'Deleted successfully';
}

// Health check response
export interface HealthCheckApiResponse extends ApiSuccess<{
  isHealthy: boolean;
  services: Array<{
    serviceName: string;
    isHealthy: boolean;
    errors: string[];
  }>;
}> {}

// ============================================================================
// QUERY PARAMETERS
// ============================================================================

// Standard pagination query parameters
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Standard search query parameters
export interface SearchQuery extends PaginationQuery {
  q?: string;
  search?: string;
}

// Date range query parameters
export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
  start_date?: string;
  end_date?: string;
}

// Filter query parameters for different entities
export interface CharacterQueryParams extends PaginationQuery, SearchQuery {
  is_active?: string;
  birthday_month?: string;
  birthday_day?: string;
}

export interface SwimsuitQueryParams extends PaginationQuery, SearchQuery {
  character_id?: string;
  rarity?: string;
  suit_type?: string;
  has_malfunction?: string;
  is_limited?: string;
  min_stats?: string;
  max_stats?: string;
}

export interface SkillQueryParams extends PaginationQuery, SearchQuery {
  category?: string;
  effect_type?: string;
}

export interface ItemQueryParams extends PaginationQuery, SearchQuery {
  category?: string;
  rarity?: string;
}

export interface BromideQueryParams extends PaginationQuery, SearchQuery {
  type?: string;
  rarity?: string;
}

export interface EventQueryParams extends PaginationQuery, SearchQuery, DateRangeQuery {
  type?: string;
  is_active?: string;
}

export interface EpisodeQueryParams extends PaginationQuery, SearchQuery {
  episode_type?: string;
  related_entity_type?: string;
  related_entity_id?: string;
}

export interface DocumentQueryParams extends PaginationQuery, SearchQuery {
  is_published?: string;
}

// ============================================================================
// FILE UPLOAD TYPES
// ============================================================================

export interface FileUploadResponse extends ApiSuccess<{
  filename: string;
  originalName: string;
  size: number;
  url: string;
  mimeType: string;
}> {}

export interface BulkUploadResponse extends ApiSuccess<{
  uploaded: Array<{
    filename: string;
    url: string;
  }>;
  failed: Array<{
    filename: string;
    error: string;
  }>;
  summary: {
    total: number;
    uploaded: number;
    failed: number;
  };
}> {}

// ============================================================================
// CSV IMPORT/EXPORT TYPES
// ============================================================================

export interface CSVImportRequest {
  file: File | Buffer;
  options?: {
    skipHeaders?: boolean;
    delimiter?: string;
    encoding?: string;
  };
}

export interface CSVImportResponse<T> extends ApiSuccess<{
  imported: T[];
  failed: Array<{
    row: number;
    data: any;
    errors: string[];
  }>;
  summary: {
    totalRows: number;
    imported: number;
    failed: number;
  };
}> {}

export interface CSVExportResponse extends ApiSuccess<{
  filename: string;
  url: string;
  recordCount: number;
  generatedAt: Date;
}> {}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationErrorResponse extends ApiError {
  error: 'Validation failed';
  details: ValidationError[];
}

// ============================================================================
// AUTHENTICATION & AUTHORIZATION
// ============================================================================

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse extends ApiSuccess<{
  user: AuthUser;
  token: string;
  expiresAt: Date;
}> {}

export interface RefreshTokenResponse extends ApiSuccess<{
  token: string;
  expiresAt: Date;
}> {}

// ============================================================================
// STATISTICAL TYPES
// ============================================================================

export interface EntityStats {
  total: number;
  active?: number;
  inactive?: number;
  byCategory?: Record<string, number>;
  byRarity?: Record<string, number>;
  recentlyAdded?: number;
  recentlyUpdated?: number;
}

export interface StatsResponse extends ApiSuccess<{
  characters: EntityStats;
  swimsuits: EntityStats;
  skills: EntityStats;
  items: EntityStats;
  bromides: EntityStats;
  events: EntityStats;
  episodes: EntityStats;
  documents: EntityStats;
  lastUpdated: Date;
}> {}

// ============================================================================
// WEBHOOK TYPES
// ============================================================================

export interface WebhookPayload<T = any> {
  event: string;
  timestamp: Date;
  data: T;
  source: string;
}

export interface WebhookResponse extends ApiSuccess<{
  received: boolean;
  processed: boolean;
}> {}

// ============================================================================
// CACHE TYPES
// ============================================================================

export interface CacheInfo {
  key: string;
  ttl: number;
  createdAt: Date;
  size: number;
}

export interface CacheStatsResponse extends ApiSuccess<{
  totalKeys: number;
  totalSize: number;
  hitRate: number;
  keys: CacheInfo[];
}> {}

// ============================================================================
// TYPE GUARDS FOR API RESPONSES
// ============================================================================

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.success === true;
}

export function isApiError(response: ApiResponse): response is ApiError {
  return response.success === false;
}

export function isValidationError(response: ApiResponse): response is ValidationErrorResponse {
  return !response.success && response.error === 'Validation failed';
}

// ============================================================================
// MIDDLEWARE TYPES
// ============================================================================

export interface RequestContext {
  user?: AuthUser;
  startTime: Date;
  requestId: string;
  ip: string;
  userAgent: string;
}

export interface RequestWithContext extends Request {
  context: RequestContext;
}

// ============================================================================
// LOGGING TYPES
// ============================================================================

export interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  error?: Error;
}

export interface LogQueryParams {
  level?: string;
  startDate?: string;
  endDate?: string;
  limit?: string;
  search?: string;
}

export interface LogsResponse extends ApiSuccess<PaginatedResult<LogEntry>> {} 