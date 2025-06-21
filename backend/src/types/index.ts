// Central export file for all type definitions

// Database types
export * from './database';

// API types
export * from './api';

// Re-export commonly used types for convenience
export type {
  // Core entities
  Character,
  NewCharacter,
  Swimsuit,
  NewSwimsuit,
  Skill,
  NewSkill,
  Item,
  NewItem,
  Bromide,
  NewBromide,
  Episode,
  NewEpisode,
  Event,
  NewEvent,
  Document,
  NewDocument,
  
  // Linking tables
  SwimsuitSkill,
  NewSwimsuitSkill,
  GachaPool,
  NewGachaPool,
  
  // Enums
  SwimsuitRarity,
  SuitType,
  SkillCategory,
  ItemCategory,
  ItemRarity,
  BromideType,
  BromideRarity,
  EpisodeType,
  EventType,
  GachaSubtype,
  ShopType,
  SkillSlot,
  PoolItemType,
  
  // Utility types
  PaginationOptions,
  PaginatedResult,
  FilterAndSortParams,
  MultiLanguageSearchParams,
  DateRangeParams,
  HealthCheckResponse,
  CSVImportResult,
  BulkCreateResult,
  
  // API types
  ApiResponse,
} from './database';

export type {
  // API specific exports
  createSuccessResponse,
  createErrorResponse,
  isApiSuccess,
  isApiError,
  isValidationError,
} from './api'; 