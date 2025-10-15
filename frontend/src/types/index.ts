import React from "react";

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
// Updated for denormalized schema with multi-language fields
export interface Character {
  id: number;
  unique_key: string;
  name_jp: string;
  name_en: string;
  name_cn: string;
  name_tw: string;
  name_kr: string;
  // Multi-language age fields
  age_jp?: string;
  age_en?: string;
  age_cn?: string;
  age_tw?: string;
  age_kr?: string;
  // Multi-language birthday fields
  birthday_jp?: string;
  birthday_en?: string;
  birthday_cn?: string;
  birthday_tw?: string;
  birthday_kr?: string;
  // Multi-language height fields
  height_jp?: string;
  height_en?: string;
  height_cn?: string;
  height_tw?: string;
  height_kr?: string;
  // Multi-language measurements fields
  measurements_jp?: string;
  measurements_en?: string;
  measurements_cn?: string;
  measurements_tw?: string;
  measurements_kr?: string;
  // Multi-language blood type fields
  blood_jp?: string;
  blood_en?: string;
  blood_cn?: string;
  blood_tw?: string;
  blood_kr?: string;
  // Multi-language job fields
  job_jp?: string;
  job_en?: string;
  job_cn?: string;
  job_tw?: string;
  job_kr?: string;
  // Multi-language hobby fields
  hobby_jp?: string;
  hobby_en?: string;
  hobby_cn?: string;
  hobby_tw?: string;
  hobby_kr?: string;
  // Multi-language food fields
  food_jp?: string;
  food_en?: string;
  food_cn?: string;
  food_tw?: string;
  food_kr?: string;
  // Multi-language color fields
  color_jp?: string;
  color_en?: string;
  color_cn?: string;
  color_tw?: string;
  color_kr?: string;
  // Multi-language cast/voice actor fields
  cast_jp?: string;
  cast_en?: string;
  cast_cn?: string;
  cast_tw?: string;
  cast_kr?: string;
  // Legacy single-language fields (for backward compatibility)
  birthday?: string;
  height?: string;
  blood_type?: string;
  voice_actor_jp?: string;
  measurements?: string;
  // Other fields
  profile_image_data?: string; // Base64 encoded image data
  profile_image_mime_type?: string;
  is_active: boolean;
  game_version?: string;
}

// Swimsuit types and enums
// Updated for denormalized schema - removed obsolete types
export type SwimsuitRarity = "N" | "R" | "SR" | "SSR";

export interface Swimsuit {
  id: number;
  character_key: string; // Changed from character_id (number) to character_key (string)
  unique_key: string;
  name_jp: string;
  name_en: string;
  name_cn: string;
  name_tw: string;
  name_kr: string;
  rarity: string;
  attribute: string;
  // Stat fields - base, max, and growth for each stat
  base_pow?: number;
  max_pow?: number;
  pow_growth?: number;
  base_tec?: number;
  max_tec?: number;
  tec_growth?: number;
  base_stm?: number;
  max_stm?: number;
  stm_growth?: number;
  base_apl?: number;
  max_apl?: number;
  apl_growth?: number;
  // Embedded Skill 1
  skill_id_1?: number;
  skill_key_1?: string;
  skill_name_jp_1?: string;
  skill_name_en_1?: string;
  skill_name_cn_1?: string;
  skill_name_tw_1?: string;
  skill_name_kr_1?: string;
  skill_des_1?: string;
  skill_des_jp_1?: string;
  skill_des_en_1?: string;
  skill_des_cn_1?: string;
  skill_des_tw_1?: string;
  skill_des_kr_1?: string;
  // Embedded Skill 2
  skill_id_2?: number;
  skill_key_2?: string;
  skill_name_jp_2?: string;
  skill_name_en_2?: string;
  skill_name_cn_2?: string;
  skill_name_tw_2?: string;
  skill_name_kr_2?: string;
  skill_des_2?: string;
  skill_des_jp_2?: string;
  skill_des_en_2?: string;
  skill_des_cn_2?: string;
  skill_des_tw_2?: string;
  skill_des_kr_2?: string;
  // Embedded Skill 3
  skill_id_3?: number;
  skill_key_3?: string;
  skill_name_jp_3?: string;
  skill_name_en_3?: string;
  skill_name_cn_3?: string;
  skill_name_tw_3?: string;
  skill_name_kr_3?: string;
  skill_des_3?: string;
  skill_des_jp_3?: string;
  skill_des_en_3?: string;
  skill_des_cn_3?: string;
  skill_des_tw_3?: string;
  skill_des_kr_3?: string;
  // Bromide references
  bromide?: string;
  cossbreak_bromide?: string;
  // Legacy fields (for backward compatibility)
  is_limited?: boolean;
  suit_type?: string;
  description_en?: string;
  total_stats_awakened?: number;
  has_malfunction?: boolean;
  release_date_gl?: string;
  // Optional: populated character data (not from join, but can be fetched separately)
  character?: Character;
}

// Skill types and enums
// NOTE: Skills are now embedded in Swimsuit records, not separate entities
// These types are kept for backward compatibility but may not be used
export type SkillCategory = "ACTIVE" | "PASSIVE" | "POTENTIAL";

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

// REMOVED: SwimsuitSkill junction table interface (skills now embedded in Swimsuit)

// Item types and enums
// Updated for denormalized schema - removed obsolete types
export interface Item {
  id: number;
  unique_key: string;
  name_jp: string;
  name_en: string;
  name_cn: string;
  name_tw: string;
  name_kr: string;
  type: string; // Replaces item_category
  description?: string; // Replaces description_en and source_description_en
  description_en?: string; // Legacy field (for backward compatibility)
  rarity?: string; // Legacy field (for backward compatibility)
  icon_small?: string; // New field
  icon_large?: string; // New field
}

// Bromide types and enums
export type BromideType = "DECO" | "OWNER";
export type BromideRarity = "R" | "SR" | "SSR";

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
export type EpisodeType = "MAIN" | "CHARACTER" | "EVENT" | "SWIMSUIT" | "ITEM";

export interface Episode {
  id: number;
  unique_key: string;
  name_jp: string; // Changed from title_jp
  name_en: string; // Changed from title_en
  name_cn: string; // Changed from title_cn
  name_tw: string; // Changed from title_tw
  name_kr: string; // Changed from title_kr
  type?: string; // New field
  release_data?: string; // New field
  release_version?: string; // New field
}

// Event types and enums
export type EventType =
  | "FESTIVAL_RANKING"
  | "FESTIVAL_CUMULATIVE"
  | "TOWER"
  | "ROCK_CLIMBING"
  | "BUTT_BATTLE"
  | "LOGIN_BONUS"
  | "STORY";

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
export type GachaSubtype =
  | "TRENDY"
  | "NOSTALGIC"
  | "BIRTHDAY"
  | "ANNIVERSARY"
  | "PAID"
  | "FREE"
  | "ETC";

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
}

// REMOVED: GachaPool junction table interface (denormalized schema)

// ShopListing interface (for backward compatibility)
export interface ShopListing {
  id: number;
  item_id: number;
  shop_type: string;
  cost: number;
  currency: string;
  cost_amount?: number;
  cost_currency_item?: Item;
  start_date?: string;
  end_date?: string;
  item?: Item;
}

// Document types - matching backend ExtendedDocument schema exactly
export type DocumentType = "checklist" | "guide" | "tutorial";

export interface Document {
  id: number;
  unique_key: string;
  title_en: string;
  summary_en?: string;
  document_type: DocumentType; // Type of document for categorization
  content_json_en?: Record<string, unknown>; // TipTap JSON content
  screenshots_data?: Array<{
    data: string;
    mimeType: string;
    filename: string;
  }>; // Binary screenshot data
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
    compressionQuality?: "low" | "medium" | "high"; // Compression quality used
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
  screenshots_data?: Array<{
    data: string;
    mimeType: string;
    filename: string;
  }>; // Binary screenshot data
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
  type: "EVENT" | "GACHA";
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
  sortOrder?: "asc" | "desc";
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
  character_key?: string; // Changed from character_id
  rarity?: string;
  // Removed: suit_type, has_malfunction, is_limited (fields no longer exist)
}

export interface SkillQueryParams extends PaginationQuery, SearchQuery {
  category?: string;
  effect_type?: string;
}

export interface ItemQueryParams extends PaginationQuery, SearchQuery {
  type?: string; // Changed from category
  // Removed: rarity (field no longer exists)
}

export interface BromideQueryParams extends PaginationQuery, SearchQuery {
  type?: string;
  rarity?: string;
}

export interface EventQueryParams
  extends PaginationQuery,
    SearchQuery,
    DateRangeQuery {
  type?: string;
  is_active?: string;
}

export interface EpisodeQueryParams extends PaginationQuery, SearchQuery {
  type?: string; // Changed from episode_type
  // Removed: related_entity_type, related_entity_id (fields no longer exist)
}

export interface DocumentQueryParams extends PaginationQuery, SearchQuery {
  category?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SortDirection = "asc" | "desc";
export type ViewMode =
  | "gallery"
  | "showcase"
  | "minimal"
  | "list"
  | "card"
  | "table";
export type FilterType =
  | "text"
  | "select"
  | "number"
  | "checkbox"
  | "range"
  | "date";
export type Language = "jp" | "en" | "cn" | "tw" | "kr";

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

export interface DashboardOverviewResponse
  extends ApiSuccess<DashboardOverviewData> {}

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

export type DocumentViewMode = "list" | "document";
export type DocumentSection =
  | "checklist-creation"
  | "checking-guide"
  | "tutorial";

export interface DocumentSectionInfo {
  id: DocumentSection;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "active" | "inactive" | "draft";
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
    id: "checklist",
    name: "Checklist",
    color: "text-blue-600 border-blue-200 bg-blue-50",
  },
  {
    id: "guide",
    name: "Guide",
    color: "text-green-600 border-green-200 bg-green-50",
  },

  {
    id: "reference",
    name: "Reference",
    color: "text-orange-600 border-orange-200 bg-orange-50",
  },
];

export interface AdminSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  lastUpdated: string;
  status: "active" | "inactive" | "draft";
}

export interface ExportOptions {
  format: "csv" | "excel" | "json";
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
  category:
    | "database"
    | "api"
    | "monitoring"
    | "testing"
    | "documentation"
    | "server"
    | "tool"
    | "health";
  status: "active" | "inactive" | "maintenance";
  port?: number;
}

export interface NotificationState {
  id: string;
  type: "success" | "error" | "warning" | "info" | "loading";
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

export function isApiSuccess<T>(
  response: ApiResponse<T>,
): response is ApiSuccess<T> {
  return response.success === true;
}

export function isApiError(response: ApiResponse): response is ApiError {
  return response.success === false;
}

export function getLocalizedName(
  entity: MultiLanguageNames,
  lang: Language = "en",
): string {
  switch (lang) {
    case "jp":
      return entity.name_jp;
    case "en":
      return entity.name_en;
    case "cn":
      return entity.name_cn;
    case "tw":
      return entity.name_tw;
    case "kr":
      return entity.name_kr;
    default:
      return entity.name_en;
  }
}

// ============================================================================
// UNIFIED ITEM TYPES
// ============================================================================

export type ItemType = "swimsuit" | "accessory" | "skill" | "bromide";

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
  translations?: Record<
    Language,
    {
      name?: string;
      description?: string;
    }
  >;
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
