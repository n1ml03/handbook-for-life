import React from 'react'

// ============================================================================
// CORE ENTITY TYPES - Matching Backend Database Schema
// ============================================================================

// Multi-language names interface used across entities
export interface MultiLanguageNames {
  name_jp: string;
  name_en: string;
  name_cn: string;
  name_tw: string;
  name_kr: string;
}

// Character entity matching database schema exactly
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
  profile_image_data?: string; // Base64 encoded image data
  profile_image_mime_type?: string;
  is_active: boolean;
  game_version?: string;
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
  game_version?: string;
  // Binary image data fields (matching backend schema)
  image_before_data?: string; // Base64 encoded image data
  image_before_mime_type?: string;
  image_after_data?: string; // Base64 encoded image data
  image_after_mime_type?: string;
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
  game_version?: string;
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
  game_version?: string;
  // Binary image data fields (matching backend schema)
  icon_data?: string; // Base64 encoded image data
  icon_mime_type?: string;
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
  game_version?: string;
  // Binary image data fields (matching backend schema)
  art_data?: string; // Base64 encoded image data
  art_mime_type?: string;
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
  game_version?: string;
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
  game_version?: string;
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
  game_version?: string;
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

// Document types - matching backend ExtendedDocument schema exactly
export type DocumentType = 'checklist' | 'guide' | 'tutorial';

export interface Document {
  id: number;
  unique_key: string;
  title_en: string;
  summary_en?: string;
  document_type: DocumentType; // Type of document for categorization
  content_json_en?: Record<string, unknown>; // TipTap JSON content
  screenshots_data?: Array<{data: string; mimeType: string; filename: string}>; // Binary screenshot data
  // PDF file storage fields
  pdf_data?: string; // Base64 encoded PDF data
  pdf_filename?: string; // Original PDF filename
  pdf_mime_type?: string; // PDF MIME type
  pdf_size?: number; // PDF file size in bytes
  has_pdf_file?: boolean; // Flag indicating if document has PDF attachment
  // Enhanced PDF metadata
  pdf_metadata?: {
    pages?: number; // Number of pages
    hasText?: boolean; // Whether PDF contains extractable text
    textLength?: number; // Length of extracted text
    version?: string; // PDF version
    info?: any; // PDF info object
    extractedAt?: string; // When metadata was extracted
    textPreview?: string; // First 200 chars of extracted text
    // Compression metadata
    compressed?: boolean; // Whether PDF was compressed
    compressionQuality?: 'low' | 'medium' | 'high'; // Compression quality used
    originalSize?: number; // Original file size before compression
    compressedSize?: number; // Final file size after compression
    savings?: number; // Bytes saved through compression
    savingsPercentage?: number; // Percentage reduction
    compressionRatio?: number; // Compression ratio
  }; // PDF metadata
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  // Extended fields for frontend compatibility (from backend ExtendedDocument)
  title: string; // Maps to title_en
  content: string; // Maps to content_json_en converted to HTML
  category: string; // Generated category
  tags: string[]; // Generated tags
  author: string; // Default author
}

// Update log types - matching backend schema exactly
export interface UpdateLog {
  id: number;
  unique_key: string;
  version: string;
  title: string;
  content: string;
  description?: string;
  date: string; // ISO date string
  tags?: string[]; // JSON array from backend
  screenshots_data?: Array<{data: string; mimeType: string; filename: string}>; // Binary screenshot data
  metrics?: {
    performanceImprovement: string;
    userSatisfaction: string;
    bugReports: number;
  }; // JSON object from backend
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

// Timeline view (for HomePage)
export interface TimelineView {
  type: 'EVENT' | 'GACHA';
  unique_key: string;
  activity_date: string; // ISO datetime string
  title: string;
}

// ============================================================================
// API RESPONSE TYPES - Matching Backend Exactly
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
  errorId?: string;
  details?: Record<string, unknown>;
  timestamp: string;
  statusCode?: number;
  // Development-only fields (may be present in development mode)
  stack?: string;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

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

export interface PaginatedApiResponse<T> extends ApiSuccess<T[]> {
  pagination: PaginationInfo;
}

export type ListResponse<T> = PaginatedApiResponse<T>;

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
  category?: string;
}

// ============================================================================
// UTILITY TYPES
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
// COMPONENT PROPS TYPES
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
// DASHBOARD TYPES
// ============================================================================

export interface DashboardOverviewData {
  swimsuits: PaginatedResult<Swimsuit>;
  accessories: PaginatedResult<Item>;
  skills: PaginatedResult<Skill>;
  bromides: PaginatedResult<Bromide>;
  summary: {
    totalSwimsuits: number;
    totalAccessories: number;
    totalSkills: number;
    totalBromides: number;
    lastUpdated: string;
  };
}

export interface DashboardOverviewResponse extends ApiSuccess<DashboardOverviewData> {}

export interface DashboardCharacterStatsResponse {
  totalCharacters: number;
  totalSwimsuits: number;
  averageSwimsuitsPerCharacter: string;
  charactersByBirthday: Record<string, number>;
  swimsuitsByRarity: Record<string, number>;
  recentlyAdded: {
    characters: Character[];
    swimsuits: Swimsuit[];
  };
}

// ============================================================================
// STATE TYPES
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
// ADMIN TYPES
// ============================================================================

export type DocumentViewMode = 'list' | 'document';
export type DocumentSection = 'checklist-creation' | 'checking-guide' | 'tutorial';

export interface DocumentSectionInfo {
  id: DocumentSection;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'active' | 'inactive' | 'draft';
}

export interface DocumentCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

// Document categories data
export const documentCategoriesData: DocumentCategory[] = [
  {
    id: 'checklist',
    name: 'Checklist',
    color: 'text-blue-600 border-blue-200 bg-blue-50'
  },
  {
    id: 'guide',
    name: 'Guide',
    color: 'text-green-600 border-green-200 bg-green-50'
  },

  {
    id: 'reference',
    name: 'Reference',
    color: 'text-orange-600 border-orange-200 bg-orange-50'
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

export interface TestingTool {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'database' | 'api' | 'monitoring' | 'testing' | 'documentation' | 'server' | 'tool' | 'health';
  status: 'active' | 'inactive' | 'maintenance';
  port?: number;
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
// THEME TYPES
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

// ============================================================================
// MEMORY TYPES
// ============================================================================

export interface Memory {
  id: string;
  name: string;
  name_jp?: string;
  name_en?: string;
  name_cn?: string;
  name_tw?: string;
  name_kr?: string;
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

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiSuccess<T> {
  return response.success === true;
}

export function isApiError(response: ApiResponse): response is ApiError {
  return response.success === false;
}

export function getLocalizedName(entity: MultiLanguageNames, lang: Language = 'en'): string {
  switch (lang) {
    case 'jp': return entity.name_jp;
    case 'en': return entity.name_en;
    case 'cn': return entity.name_cn;
    case 'tw': return entity.name_tw;
    case 'kr': return entity.name_kr;
    default: return entity.name_en;
  }
}

// ============================================================================
// UNIFIED ITEM TYPES
// ============================================================================

export type ItemType = 'swimsuit' | 'accessory' | 'skill' | 'bromide';

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

// ============================================================================
// HELPER UTILITY TYPES
// ============================================================================

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
} 