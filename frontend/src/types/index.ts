import React from 'react'

// ============================================================================
// CORE ENTITY TYPES - Matching Backend Database Schema
// ============================================================================

// Multi-language names interface used across entities
export interface MultiLanguageNames {
  jp: string;
  en: string;
  cn: string;
  tw: string;
  kr: string;
}

// Character entity matching database schema
export interface Character {
  id: number;
  unique_key: string;
  name_jp: string;
  name_en: string;
  name_cn: string;
  name_tw: string;
  name_kr: string;
  birthday?: string; // ISO date string
  height?: number;
  measurements?: string;
  blood_type?: string;
  voice_actor_jp?: string;
  profile_image_url?: string;
  is_active: boolean;
}

// Swimsuit types and enums
export type SwimsuitRarity = 'N' | 'R' | 'SR' | 'SSR' | 'SSR+';
export type SuitType = 'POW' | 'TEC' | 'STM' | 'APL' | 'N/A';

export interface Swimsuit {
  id: number;
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
  total_stats_awakened: number;
  has_malfunction: boolean;
  is_limited: boolean;
  release_date_gl?: string; // ISO date string
  // Populated fields from joins
  character?: Character;
  skills?: SwimsuitSkill[];
}

// Skill types and enums
export type SkillCategory = 'ACTIVE' | 'PASSIVE' | 'POTENTIAL';
export type SkillSlot = 'ACTIVE' | 'PASSIVE_1' | 'PASSIVE_2' | 'POTENTIAL_1' | 'POTENTIAL_2' | 'POTENTIAL_3' | 'POTENTIAL_4';

export interface Skill {
  id: number;
  unique_key: string;
  name_jp: string;
  name_en: string;
  name_cn: string;
  name_tw: string;
  name_kr: string;
  description_en?: string;
  skill_category: SkillCategory;
  effect_type?: string;
}

export interface SwimsuitSkill {
  swimsuit_id: number;
  skill_id: number;
  skill_slot: SkillSlot;
  skill?: Skill; // Populated from join
}

// Item types and enums
export type ItemCategory = 'CURRENCY' | 'UPGRADE_MATERIAL' | 'CONSUMABLE' | 'GIFT' | 'ACCESSORY' | 'FURNITURE' | 'SPECIAL';
export type ItemRarity = 'N' | 'R' | 'SR' | 'SSR';

export interface Item {
  id: number;
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
}

// Bromide types and enums
export type BromideType = 'DECO' | 'OWNER';
export type BromideRarity = 'R' | 'SR' | 'SSR';

export interface Bromide {
  id: number;
  unique_key: string;
  name_jp: string;
  name_en: string;
  name_cn: string;
  name_tw: string;
  name_kr: string;
  bromide_type: BromideType;
  rarity: BromideRarity;
  skill_id?: number;
  art_url?: string;
  // Populated fields from joins
  skill?: Skill;
}

// Episode types and enums
export type EpisodeType = 'MAIN' | 'CHARACTER' | 'EVENT' | 'SWIMSUIT' | 'ITEM';

export interface Episode {
  id: number;
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
}

// Event types and enums
export type EventType = 'FESTIVAL_RANKING' | 'FESTIVAL_CUMULATIVE' | 'TOWER' | 'ROCK_CLIMBING' | 'BUTT_BATTLE' | 'LOGIN_BONUS' | 'STORY';

export interface Event {
  id: number;
  unique_key: string;
  name_jp: string;
  name_en: string;
  name_cn: string;
  name_tw: string;
  name_kr: string;
  type: EventType;
  start_date: string; // ISO datetime string
  end_date: string; // ISO datetime string
  is_active?: boolean; // Computed field
}

// Gacha types and enums
export type GachaSubtype = 'TRENDY' | 'NOSTALGIC' | 'BIRTHDAY' | 'ANNIVERSARY' | 'PAID' | 'FREE' | 'ETC';
export type PoolItemType = 'SWIMSUIT' | 'BROMIDE' | 'ITEM';

export interface Gacha {
  id: number;
  unique_key: string;
  name_jp: string;
  name_en: string;
  name_cn: string;
  name_tw: string;
  name_kr: string;
  gacha_subtype: GachaSubtype;
  start_date: string; // ISO datetime string
  end_date: string; // ISO datetime string
  pools?: GachaPool[];
}

export interface GachaPool {
  id: number;
  gacha_id: number;
  pool_item_type: PoolItemType;
  item_id: number;
  drop_rate: number;
  is_featured: boolean;
}

// Shop types and enums
export type ShopType = 'EVENT' | 'VIP' | 'GENERAL' | 'CURRENCY';

export interface ShopListing {
  id: number;
  shop_type: ShopType;
  item_id: number;
  cost_currency_item_id: number;
  cost_amount: number;
  start_date?: string; // ISO datetime string
  end_date?: string; // ISO datetime string
  // Populated fields from joins
  item?: Item;
  cost_currency_item?: Item;
}

// Document types
export type DocumentViewMode = 'list' | 'document';
export type DocumentSection = 'checklist-creation' | 'checking-guide';

export interface DocumentSectionInfo {
  id: DocumentSection;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  status: 'active' | 'inactive' | 'draft';
}

export interface Document {
  id: number;
  unique_key: string;
  title_en: string;
  summary_en?: string;
  content_json_en?: Record<string, unknown>; // TipTap JSON content
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  // Extended properties for UI compatibility
  title: string; // Maps to title_en
  content: string; // Maps to content_json_en converted to HTML
  category: string; // Category based on tags or type
  tags: string[]; // Generated from category and type
  author: string; // Default or computed author
  screenshots: string[]; // Screenshot URLs for visual documentation
}

// Timeline view (for HomePage)
export interface TimelineView {
  type: 'EVENT' | 'GACHA';
  unique_key: string;
  activity_date: string; // ISO datetime string
  title: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, unknown>;
  timestamp: string;
  statusCode?: number;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// Pagination types
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationInfo;
}

export type ListResponse<T> = ApiSuccess<PaginatedResult<T>>

// ============================================================================
// QUERY PARAMETER TYPES
// ============================================================================

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchQuery extends PaginationQuery {
  q?: string;
  search?: string;
}

export interface DateRangeQuery {
  startDate?: string;
  endDate?: string;
  start_date?: string;
  end_date?: string;
}

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
// UTILITY AND UI TYPES
// ============================================================================

export type SortDirection = 'asc' | 'desc';
export type ViewMode = 'gallery' | 'showcase' | 'minimal' | 'list' | 'card' | 'table';
export type FilterType = 'text' | 'select' | 'number' | 'checkbox' | 'range' | 'date';
export type Language = 'jp' | 'en' | 'cn' | 'tw' | 'kr';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: FilterType;
  placeholder?: string;
  options?: FilterOption[];
  min?: number;
  max?: number;
  icon?: React.ReactNode;
  color?: string;
  gridCols?: number;
}

export interface SortOption {
  key: string;
  label: string;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

export interface SwimsuitCardProps {
  swimsuit: Swimsuit;
  viewMode?: ViewMode;
  onClick?: () => void;
}

export interface CharacterCardProps {
  character: Character;
  onClick?: () => void;
}

export interface SkillCardProps {
  skill: Skill;
  onClick?: () => void;
}

export interface BromideCardProps {
  bromide: Bromide;
  onClick?: () => void;
}

export interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

export interface GachaCardProps {
  gacha: Gacha;
  onClick?: () => void;
}

// ============================================================================
// STATE AND CONTEXT TYPES
// ============================================================================

export interface ErrorState {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface LoadingState {
  isLoading: boolean;
  progress?: number;
  message?: string;
}

export interface SearchState {
  query: string;
  filters: Record<string, unknown>;
  sortBy: string;
  sortDirection: SortDirection;
  currentPage: number;
  itemsPerPage: number;
}

export interface FilterState {
  search: string;
  categories: string[];
  tags: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  customFilters: Record<string, unknown>;
}

// ============================================================================
// ADMIN AND UPDATE LOG TYPES
// ============================================================================

export interface UpdateLog {
  id: string;
  version: string;
  title: string;
  content: string;
  description: string;
  date: string;
  tags: string[];
  screenshots: string[];
  metrics?: {
    performanceImprovement: string;
    userSatisfaction: string;
    bugReports: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DocumentCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

// Default document categories data
export const documentCategoriesData: DocumentCategory[] = [
  {
    id: 'game-mechanics',
    name: 'Game Mechanics',
    description: 'Core game mechanics and systems',
    color: 'text-blue-400 border-blue-400/30 bg-blue-400/10'
  },
  {
    id: 'characters',
    name: 'Characters',
    description: 'Character guides and information',
    color: 'text-pink-400 border-pink-400/30 bg-pink-400/10'
  },
  {
    id: 'swimsuits',
    name: 'Swimsuits',
    description: 'Swimsuit guides and stats',
    color: 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10'
  },
  {
    id: 'events',
    name: 'Events',
    description: 'Event guides and strategies',
    color: 'text-purple-400 border-purple-400/30 bg-purple-400/10'
  },
  {
    id: 'skills',
    name: 'Skills',
    description: 'Skill guides and explanations',
    color: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
  },
  {
    id: 'items',
    name: 'Items',
    description: 'Item guides and usage',
    color: 'text-green-400 border-green-400/30 bg-green-400/10'
  },
  {
    id: 'strategies',
    name: 'Strategies',
    description: 'Tips and strategies',
    color: 'text-orange-400 border-orange-400/30 bg-orange-400/10'
  },
  {
    id: 'updates',
    name: 'Updates',
    description: 'Game updates and changelogs',
    color: 'text-red-400 border-red-400/30 bg-red-400/10'
  }
];

export interface AdminSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  lastUpdated: string;
  status: 'active' | 'inactive' | 'draft';
}

export interface CSVValidationError {
  row: number;
  column: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface CSVPreviewData {
  headers: string[];
  rows: unknown[][];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: CSVValidationError[];
}

export interface ColumnMapping {
  csvColumn: string;
  dbField: string;
  isRequired: boolean;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'array';
}

export interface ImportProgress {
  stage: 'uploading' | 'parsing' | 'validating' | 'importing' | 'complete';
  progress: number;
  processedRows: number;
  totalRows: number;
  errors: number;
  message: string;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'json';
  selectedColumns: string[];
  filters: {
    dateRange?: { start: string; end: string };
    categories?: string[];
    status?: string[];
    searchText?: string;
  };
  includeHeaders: boolean;
  customFilename?: string;
}

export interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
}

// ============================================================================
// THEME AND UI TYPES
// ============================================================================

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
}

export interface ComponentTheme {
  colors: ThemeColors;
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

// Memory types for episodes page
export interface Memory {
  id: string;
  name: string;
  description: string;
  date: string;
  thumbnail: string;
  characters: string[];
  tags: string[];
  favorite?: boolean;
}

export interface MemoryCardProps {
  memory: Memory;
  onToggleFavorite?: (id: string) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

// ============================================================================
// TYPE GUARDS AND UTILITIES
// ============================================================================

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.success === true;
}

export function isApiError(response: ApiResponse): response is ApiError {
  return response.success === false;
}

// Helper function to get multi-language name
export function getLocalizedName(entity: { name_jp: string; name_en: string; name_cn: string; name_tw: string; name_kr: string }, lang: Language = 'en'): string {
  switch (lang) {
    case 'jp': return entity.name_jp;
    case 'en': return entity.name_en;
    case 'cn': return entity.name_cn;
    case 'tw': return entity.name_tw;
    case 'kr': return entity.name_kr;
    default: return entity.name_en;
  }
}

// Add ItemType enum for unified items
export type ItemType = 'swimsuit' | 'accessory' | 'skill' | 'bromide';

// Add UnifiedItem interface for items page
export interface UnifiedItem {
  id: string;
  name: string;
  type: ItemType;
  category?: string;
  rarity?: string;
  stats?: {
    pow?: number;
    tec?: number;
    stm?: number;
    apl?: number;
  };
  character?: string;
  description?: string;
  image?: string;
  translations?: Record<Language, {
    name?: string;
    description?: string;
  }>;
} 