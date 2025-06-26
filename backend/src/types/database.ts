// Database entity types matching the MySQL schema

// ============================================================================
// CORE ENTITIES
// ============================================================================

export interface Character {
  id: number; // SMALLINT UNSIGNED
  unique_key: string; // VARCHAR(100) UNIQUE
  name_jp: string; // VARCHAR(100)
  name_en: string; // VARCHAR(100)
  name_cn: string; // VARCHAR(100)
  name_tw: string; // VARCHAR(100)
  name_kr: string; // VARCHAR(100)
  birthday?: Date; // DATE
  height?: number; // SMALLINT UNSIGNED
  measurements?: string; // VARCHAR(20)
  blood_type?: string; // VARCHAR(5)
  voice_actor_jp?: string; // VARCHAR(100)
  profile_image_url?: string; // VARCHAR(255)
  is_active: boolean; // BOOLEAN DEFAULT TRUE
  game_version?: string; // VARCHAR(30)
}

export interface NewCharacter {
  unique_key: string;
  name_jp: string;
  name_en: string;
  name_cn: string;
  name_tw: string;
  name_kr: string;
  birthday?: Date;
  height?: number;
  measurements?: string;
  blood_type?: string;
  voice_actor_jp?: string;
  profile_image_url?: string;
  is_active?: boolean;
  game_version?: string;
}

// Utility types for character operations
export interface CharacterSearchParams {
  name?: string;
  birthday_month?: number;
  birthday_day?: number;
  is_active?: boolean;
}

export type SwimsuitRarity = 'N' | 'R' | 'SR' | 'SSR' | 'SSR+';
export type SuitType = 'POW' | 'TEC' | 'STM' | 'APL' | 'N/A';

export interface Swimsuit {
  id: number; // MEDIUMINT UNSIGNED
  character_id: number; // SMALLINT UNSIGNED
  unique_key: string; // VARCHAR(150) UNIQUE
  name_jp: string; // VARCHAR(255)
  name_en: string; // VARCHAR(255)
  name_cn: string; // VARCHAR(255)
  name_tw: string; // VARCHAR(255)
  name_kr: string; // VARCHAR(255)
  description_en?: string; // TEXT
  rarity: SwimsuitRarity; // ENUM
  suit_type: SuitType; // ENUM
  total_stats_awakened: number; // SMALLINT UNSIGNED DEFAULT 0
  has_malfunction: boolean; // BOOLEAN DEFAULT FALSE
  is_limited: boolean; // BOOLEAN DEFAULT TRUE
  release_date_gl?: Date; // DATE
  game_version?: string; // VARCHAR(30)
}

export interface NewSwimsuit {
  character_id: number;
  unique_key: string;
  name_jp: string;
  name_en: string;
  name_cn: string;
  name_tw: string;
  name_kr: string;
  description_en?: string;
  rarity: SwimsuitRarity;
  suit_type: SuitType;
  total_stats_awakened?: number;
  has_malfunction?: boolean;
  is_limited?: boolean;
  release_date_gl?: Date;
  game_version?: string;
}

// Utility types for swimsuit filtering
export interface SwimsuitFilterParams {
  character_id?: number;
  rarity?: SwimsuitRarity | SwimsuitRarity[];
  suit_type?: SuitType | SuitType[];
  has_malfunction?: boolean;
  is_limited?: boolean;
  min_stats?: number;
  max_stats?: number;
}

export type SkillCategory = 'ACTIVE' | 'PASSIVE' | 'POTENTIAL';

export interface Skill {
  id: number; // INT UNSIGNED
  unique_key: string; // VARCHAR(120) UNIQUE
  name_jp: string; // VARCHAR(150)
  name_en: string; // VARCHAR(150)
  name_cn: string; // VARCHAR(150)
  name_tw: string; // VARCHAR(150)
  name_kr: string; // VARCHAR(150)
  description_en?: string; // TEXT
  skill_category: SkillCategory; // ENUM
  effect_type?: string; // VARCHAR(50)
  game_version?: string; // VARCHAR(30)
}

export interface NewSkill {
  unique_key: string;
  name_jp: string;
  name_en: string;
  name_cn: string;
  name_tw: string;
  name_kr: string;
  description_en?: string;
  skill_category: SkillCategory;
  effect_type?: string;
  game_version?: string;
}

export type ItemCategory = 'CURRENCY' | 'UPGRADE_MATERIAL' | 'CONSUMABLE' | 'GIFT' | 'ACCESSORY' | 'FURNITURE' | 'SPECIAL';
export type ItemRarity = 'N' | 'R' | 'SR' | 'SSR';

export interface Item {
  id: number; // INT UNSIGNED
  unique_key: string; // VARCHAR(120) UNIQUE
  name_jp: string; // VARCHAR(150)
  name_en: string; // VARCHAR(150)
  name_cn: string; // VARCHAR(150)
  name_tw: string; // VARCHAR(150)
  name_kr: string; // VARCHAR(150)
  description_en?: string; // TEXT
  source_description_en?: string; // TEXT
  item_category: ItemCategory; // ENUM
  rarity: ItemRarity; // ENUM
  icon_url?: string; // VARCHAR(255)
  game_version?: string; // VARCHAR(30)
}

export interface NewItem {
  unique_key: string;
  name_jp: string;
  name_en: string;
  name_cn: string;
  name_tw: string;
  name_kr: string;
  description_en?: string;
  source_description_en?: string;
  item_category: ItemCategory;
  rarity: ItemRarity;
  icon_url?: string;
  game_version?: string;
}

export type BromideType = 'DECO' | 'OWNER';
export type BromideRarity = 'R' | 'SR' | 'SSR';

export interface Bromide {
  id: number; // INT UNSIGNED
  unique_key: string; // VARCHAR(120) UNIQUE
  name_jp: string; // VARCHAR(150)
  name_en: string; // VARCHAR(150)
  name_cn: string; // VARCHAR(150)
  name_tw: string; // VARCHAR(150)
  name_kr: string; // VARCHAR(150)
  bromide_type: BromideType; // ENUM DEFAULT 'DECO'
  rarity: BromideRarity; // ENUM
  skill_id?: number; // INT UNSIGNED NULL
  art_url?: string; // VARCHAR(255)
  game_version?: string; // VARCHAR(30)
}

export interface NewBromide {
  unique_key: string;
  name_jp: string;
  name_en: string;
  name_cn: string;
  name_tw: string;
  name_kr: string;
  bromide_type?: BromideType;
  rarity: BromideRarity;
  skill_id?: number;
  art_url?: string;
  game_version?: string;
}

export type EpisodeType = 'MAIN' | 'CHARACTER' | 'EVENT' | 'SWIMSUIT' | 'ITEM';

export interface Episode {
  id: number; // INT UNSIGNED
  unique_key: string; // VARCHAR(200) UNIQUE
  title_jp: string; // VARCHAR(255)
  title_en: string; // VARCHAR(255)
  title_cn: string; // VARCHAR(255)
  title_tw: string; // VARCHAR(255)
  title_kr: string; // VARCHAR(255)
  unlock_condition_en?: string; // TEXT
  episode_type: EpisodeType; // ENUM
  related_entity_type?: string; // VARCHAR(64)
  related_entity_id?: number; // INT UNSIGNED
  game_version?: string; // VARCHAR(30)
}

export interface NewEpisode {
  unique_key: string;
  title_jp: string;
  title_en: string;
  title_cn: string;
  title_tw: string;
  title_kr: string;
  unlock_condition_en?: string;
  episode_type: EpisodeType;
  related_entity_type?: string;
  related_entity_id?: number;
  game_version?: string;
}

// ============================================================================
// CONTENT & EVENT TABLES (Bảng nội dung & sự kiện)
// ============================================================================

export type EventType = 'FESTIVAL_RANKING' | 'FESTIVAL_CUMULATIVE' | 'TOWER' | 'ROCK_CLIMBING' | 'BUTT_BATTLE' | 'LOGIN_BONUS' | 'STORY';

export interface Event {
  id: number; // INT UNSIGNED
  unique_key: string; // VARCHAR(150) UNIQUE
  name_jp: string; // VARCHAR(255)
  name_en: string; // VARCHAR(255)
  name_cn: string; // VARCHAR(255)
  name_tw: string; // VARCHAR(255)
  name_kr: string; // VARCHAR(255)
  type: EventType; // ENUM
  start_date: Date; // DATETIME
  end_date: Date; // DATETIME
  is_active?: boolean; // BOOLEAN GENERATED ALWAYS (computed field)
  game_version?: string; // VARCHAR(30)
}

export interface NewEvent {
  unique_key: string;
  name_jp: string;
  name_en: string;
  name_cn: string;
  name_tw: string;
  name_kr: string;
  type: EventType;
  start_date: Date;
  end_date: Date;
  game_version?: string;
}

// Utility types for event filtering
export interface EventFilterParams {
  type?: EventType | EventType[];
  is_active?: boolean;
  start_date_from?: Date;
  start_date_to?: Date;
  end_date_from?: Date;
  end_date_to?: Date;
}

export type GachaSubtype = 'TRENDY' | 'NOSTALGIC' | 'BIRTHDAY' | 'ANNIVERSARY' | 'PAID' | 'FREE' | 'ETC';

export interface Gacha {
  id: number; // INT UNSIGNED
  unique_key: string; // VARCHAR(150) UNIQUE
  name_jp: string; // VARCHAR(255)
  name_en: string; // VARCHAR(255)
  name_cn: string; // VARCHAR(255)
  name_tw: string; // VARCHAR(255)
  name_kr: string; // VARCHAR(255)
  gacha_subtype: GachaSubtype; // ENUM
  start_date: Date; // DATETIME
  end_date: Date; // DATETIME
  game_version?: string; // VARCHAR(30)
}

export interface NewGacha {
  unique_key: string;
  name_jp: string;
  name_en: string;
  name_cn: string;
  name_tw: string;
  name_kr: string;
  gacha_subtype: GachaSubtype;
  start_date: Date;
  end_date: Date;
  game_version?: string;
}

export type ShopType = 'EVENT' | 'VIP' | 'GENERAL' | 'CURRENCY';

export interface ShopListing {
  id: number; // INT UNSIGNED
  shop_type: ShopType; // ENUM
  item_id: number; // INT UNSIGNED
  cost_currency_item_id: number; // INT UNSIGNED
  cost_amount: number; // INT UNSIGNED
  start_date?: Date; // DATETIME
  end_date?: Date; // DATETIME
}

export interface NewShopListing {
  shop_type: ShopType;
  item_id: number;
  cost_currency_item_id: number;
  cost_amount: number;
  start_date?: Date;
  end_date?: Date;
}

export interface Document {
  id: number; // INT UNSIGNED
  unique_key: string; // VARCHAR(150) UNIQUE
  title_en: string; // VARCHAR(255)
  summary_en?: string; // TEXT
  content_json_en?: any; // JSON - TipTap editor content
  is_published: boolean; // BOOLEAN DEFAULT FALSE
  screenshots?: string[]; // JSON - Array of screenshot URLs
  created_at: Date; // TIMESTAMP
  updated_at: Date; // TIMESTAMP
}

export interface NewDocument {
  unique_key: string;
  title_en: string;
  summary_en?: string;
  content_json_en?: any; // TipTap JSON content
  is_published?: boolean;
  screenshots?: string[]; // Array of screenshot URLs
}

export interface UpdateLog {
  id: number; // INT UNSIGNED
  unique_key: string; // VARCHAR(150) UNIQUE
  version: string; // VARCHAR(50)
  title: string; // VARCHAR(255)
  content: string; // TEXT
  description?: string; // TEXT
  date: Date; // DATETIME
  tags: string[]; // JSON
  is_published: boolean; // BOOLEAN DEFAULT TRUE
  screenshots: string[]; // JSON
  metrics: {
    performanceImprovement: string;
    userSatisfaction: string;
    bugReports: number;
  }; // JSON
  created_at: Date; // TIMESTAMP
  updated_at: Date; // TIMESTAMP
}

export interface NewUpdateLog {
  unique_key?: string;
  version: string;
  title: string;
  content: string;
  description?: string;
  date: Date;
  tags?: string[];
  is_published?: boolean;
  screenshots?: string[];
  metrics?: {
    performanceImprovement: string;
    userSatisfaction: string;
    bugReports: number;
  };
}

// ============================================================================
// LINKING TABLES (Bảng liên kết)
// ============================================================================

export type SkillSlot = 'ACTIVE' | 'PASSIVE_1' | 'PASSIVE_2' | 'POTENTIAL_1' | 'POTENTIAL_2' | 'POTENTIAL_3' | 'POTENTIAL_4';

export interface SwimsuitSkill {
  id: number; // Composite ID for consistency with BaseEntity
  swimsuit_id: number; // MEDIUMINT UNSIGNED
  skill_id: number; // INT UNSIGNED
  skill_slot: SkillSlot; // ENUM
}

export interface NewSwimsuitSkill {
  swimsuit_id: number;
  skill_id: number;
  skill_slot: SkillSlot;
}

export type PoolItemType = 'SWIMSUIT' | 'BROMIDE' | 'ITEM';

export interface GachaPool {
  id: number; // INT UNSIGNED
  gacha_id: number; // INT UNSIGNED
  pool_item_type: PoolItemType; // ENUM
  item_id: number; // INT UNSIGNED
  drop_rate: number; // DECIMAL(6,4)
  is_featured: boolean; // BOOLEAN DEFAULT FALSE
}

export interface NewGachaPool {
  gacha_id: number;
  pool_item_type: PoolItemType;
  item_id: number;
  drop_rate: number;
  is_featured?: boolean;
}

// ============================================================================
// VIEWS & UTILITY TYPES (Views và types tiện ích)
// ============================================================================

// Timeline view from v_timeline
export interface TimelineView {
  type: 'EVENT' | 'GACHA';
  unique_key: string;
  activity_date: Date;
  title: string;
}

// ============================================================================
// PAGINATION & QUERY TYPES (Types cho phân trang và truy vấn)
// ============================================================================

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============================================================================
// ADDITIONAL UTILITY TYPES (Types tiện ích bổ sung)
// ============================================================================

// Common search parameters for multi-language entities
export interface MultiLanguageSearchParams {
  query?: string;
  language?: 'jp' | 'en' | 'cn' | 'tw' | 'kr';
}

// Common date range parameters
export interface DateRangeParams {
  start_date?: Date;
  end_date?: Date;
}

// Common rarity filter
export type AllRarityTypes = ItemRarity | SwimsuitRarity | BromideRarity;

// Health check response type
export interface HealthCheckResponse {
  isHealthy: boolean;
  errors: string[];
  timestamp?: Date;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

// Bulk operation types
export interface BulkCreateResult<T> {
  created: T[];
  failed: Array<{
    data: any;
    error: string;
  }>;
  summary: {
    total: number;
    created: number;
    failed: number;
  };
}

// Update tracking
export interface UpdateTrackingFields {
  created_at?: Date;
  updated_at?: Date;
}

// Export types for CSV/data import
export interface CSVImportResult<T> {
  successful: T[];
  failed: Array<{
    row: number;
    data: any;
    errors: string[];
  }>;
  summary: {
    totalRows: number;
    processed: number;
    successful: number;
    failed: number;
  };
}

// Type guards for runtime type checking
export function isCharacter(obj: any): obj is Character {
  return obj && typeof obj.id === 'number' && typeof obj.unique_key === 'string' && typeof obj.name_en === 'string';
}

export function isSwimsuit(obj: any): obj is Swimsuit {
  return obj && typeof obj.id === 'number' && typeof obj.character_id === 'number' && typeof obj.unique_key === 'string';
}

export function isSkill(obj: any): obj is Skill {
  return obj && typeof obj.id === 'number' && typeof obj.unique_key === 'string' && typeof obj.skill_category === 'string';
}

export function isItem(obj: any): obj is Item {
  return obj && typeof obj.id === 'number' && typeof obj.unique_key === 'string' && typeof obj.item_category === 'string';
}

export function isBromide(obj: any): obj is Bromide {
  return obj && typeof obj.id === 'number' && typeof obj.unique_key === 'string' && typeof obj.bromide_type === 'string';
}

export function isEvent(obj: any): obj is Event {
  return obj && typeof obj.id === 'number' && typeof obj.unique_key === 'string' && typeof obj.type === 'string';
}

export function isEpisode(obj: any): obj is Episode {
  return obj && typeof obj.id === 'number' && typeof obj.unique_key === 'string' && typeof obj.episode_type === 'string';
}

export function isDocument(obj: any): obj is Document {
  return obj && typeof obj.id === 'number' && typeof obj.unique_key === 'string' && typeof obj.title_en === 'string';
}

// Constants for enum values validation
export const SWIMSUIT_RARITIES: SwimsuitRarity[] = ['N', 'R', 'SR', 'SSR', 'SSR+'];
export const SUIT_TYPES: SuitType[] = ['POW', 'TEC', 'STM', 'APL', 'N/A'];
export const SKILL_CATEGORIES: SkillCategory[] = ['ACTIVE', 'PASSIVE', 'POTENTIAL'];
export const ITEM_CATEGORIES: ItemCategory[] = ['CURRENCY', 'UPGRADE_MATERIAL', 'CONSUMABLE', 'GIFT', 'ACCESSORY', 'FURNITURE', 'SPECIAL'];
export const ITEM_RARITIES: ItemRarity[] = ['N', 'R', 'SR', 'SSR'];
export const BROMIDE_TYPES: BromideType[] = ['DECO', 'OWNER'];
export const BROMIDE_RARITIES: BromideRarity[] = ['R', 'SR', 'SSR'];
export const EPISODE_TYPES: EpisodeType[] = ['MAIN', 'CHARACTER', 'EVENT', 'SWIMSUIT', 'ITEM'];
export const EVENT_TYPES: EventType[] = ['FESTIVAL_RANKING', 'FESTIVAL_CUMULATIVE', 'TOWER', 'ROCK_CLIMBING', 'BUTT_BATTLE', 'LOGIN_BONUS', 'STORY'];
export const GACHA_SUBTYPES: GachaSubtype[] = ['TRENDY', 'NOSTALGIC', 'BIRTHDAY', 'ANNIVERSARY', 'PAID', 'FREE', 'ETC'];
export const SHOP_TYPES: ShopType[] = ['EVENT', 'VIP', 'GENERAL', 'CURRENCY'];
export const SKILL_SLOTS: SkillSlot[] = ['ACTIVE', 'PASSIVE_1', 'PASSIVE_2', 'POTENTIAL_1', 'POTENTIAL_2', 'POTENTIAL_3', 'POTENTIAL_4'];
export const POOL_ITEM_TYPES: PoolItemType[] = ['SWIMSUIT', 'BROMIDE', 'ITEM'];

// Validation helper functions
export function isValidSwimsuitRarity(rarity: string): rarity is SwimsuitRarity {
  return SWIMSUIT_RARITIES.includes(rarity as SwimsuitRarity);
}

export function isValidSuitType(type: string): type is SuitType {
  return SUIT_TYPES.includes(type as SuitType);
}

export function isValidSkillCategory(category: string): category is SkillCategory {
  return SKILL_CATEGORIES.includes(category as SkillCategory);
}

export function isValidItemCategory(category: string): category is ItemCategory {
  return ITEM_CATEGORIES.includes(category as ItemCategory);
}

export function isValidEventType(type: string): type is EventType {
  return EVENT_TYPES.includes(type as EventType);
}

// Type for filtering/sorting utilities
export interface FilterAndSortParams extends PaginationOptions {
  filters?: Record<string, any>;
  search?: string;
  dateRange?: DateRangeParams;
}
