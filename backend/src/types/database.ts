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
  // Multi-language age fields
  age_jp?: string; // VARCHAR(50)
  age_en?: string; // VARCHAR(50)
  age_cn?: string; // VARCHAR(50)
  age_tw?: string; // VARCHAR(50)
  age_kr?: string; // VARCHAR(50)
  // Multi-language birthday fields
  birthday_jp?: string; // VARCHAR(100)
  birthday_en?: string; // VARCHAR(100)
  birthday_cn?: string; // VARCHAR(100)
  birthday_tw?: string; // VARCHAR(100)
  birthday_kr?: string; // VARCHAR(100)
  // Multi-language height fields
  height_jp?: string; // VARCHAR(50)
  height_en?: string; // VARCHAR(50)
  height_cn?: string; // VARCHAR(50)
  height_tw?: string; // VARCHAR(50)
  height_kr?: string; // VARCHAR(50)
  // Multi-language measurements fields
  measurements_jp?: string; // VARCHAR(50)
  measurements_en?: string; // VARCHAR(50)
  measurements_cn?: string; // VARCHAR(50)
  measurements_tw?: string; // VARCHAR(50)
  measurements_kr?: string; // VARCHAR(50)
  // Multi-language blood type fields
  blood_jp?: string; // VARCHAR(20)
  blood_en?: string; // VARCHAR(20)
  blood_cn?: string; // VARCHAR(20)
  blood_tw?: string; // VARCHAR(20)
  blood_kr?: string; // VARCHAR(20)
  // Multi-language job fields
  job_jp?: string; // VARCHAR(150)
  job_en?: string; // VARCHAR(150)
  job_cn?: string; // VARCHAR(150)
  job_tw?: string; // VARCHAR(150)
  job_kr?: string; // VARCHAR(150)
  // Multi-language hobby fields
  hobby_jp?: string; // VARCHAR(255)
  hobby_en?: string; // VARCHAR(255)
  hobby_cn?: string; // VARCHAR(255)
  hobby_tw?: string; // VARCHAR(255)
  hobby_kr?: string; // VARCHAR(255)
  // Multi-language food fields
  food_jp?: string; // VARCHAR(255)
  food_en?: string; // VARCHAR(255)
  food_cn?: string; // VARCHAR(255)
  food_tw?: string; // VARCHAR(255)
  food_kr?: string; // VARCHAR(255)
  // Multi-language color fields
  color_jp?: string; // VARCHAR(100)
  color_en?: string; // VARCHAR(100)
  color_cn?: string; // VARCHAR(100)
  color_tw?: string; // VARCHAR(100)
  color_kr?: string; // VARCHAR(100)
  // Multi-language cast/voice actor fields
  cast_jp?: string; // VARCHAR(150)
  cast_en?: string; // VARCHAR(150)
  cast_cn?: string; // VARCHAR(150)
  cast_tw?: string; // VARCHAR(150)
  cast_kr?: string; // VARCHAR(150)
}

export interface NewCharacter {
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
}

// Utility types for character operations
export interface CharacterSearchParams {
  name?: string;
  unique_key?: string;
}

export interface Swimsuit {
  id: number; // MEDIUMINT UNSIGNED
  unique_key: string; // VARCHAR(150) UNIQUE
  unique_msg_key?: string; // VARCHAR(150)
  name_jp: string; // VARCHAR(255)
  name_en: string; // VARCHAR(255)
  name_cn: string; // VARCHAR(255)
  name_tw: string; // VARCHAR(255)
  name_kr: string; // VARCHAR(255)
  character_key?: string; // VARCHAR(100) - String reference instead of FK
  rarity?: string; // VARCHAR(20)
  attribute?: string; // VARCHAR(50)
  max_level?: number; // SMALLINT UNSIGNED
  // Base stats
  base_pow?: number; // SMALLINT UNSIGNED
  max_pow?: number; // SMALLINT UNSIGNED
  pow_growth?: number; // DECIMAL(10,2)
  base_tec?: number; // SMALLINT UNSIGNED
  max_tex?: number; // SMALLINT UNSIGNED
  tec_growth?: number; // DECIMAL(10,2)
  base_stm?: number; // SMALLINT UNSIGNED
  max_stm?: number; // SMALLINT UNSIGNED
  stm_growth?: number; // DECIMAL(10,2)
  base_apl?: number; // SMALLINT UNSIGNED
  max_apl?: number; // SMALLINT UNSIGNED
  apl_growth?: number; // DECIMAL(10,2)
  // Embedded Skill 1
  skill_id_1?: number; // INT UNSIGNED
  skill_key_1?: string; // VARCHAR(120)
  skill_name_jp_1?: string; // VARCHAR(150)
  skill_name_en_1?: string; // VARCHAR(150)
  skill_name_cn_1?: string; // VARCHAR(150)
  skill_name_tw_1?: string; // VARCHAR(150)
  skill_name_kr_1?: string; // VARCHAR(150)
  skill_des_1?: string; // TEXT
  skill_des_jp_1?: string; // TEXT
  skill_des_en_1?: string; // TEXT
  skill_des_cn_1?: string; // TEXT
  skill_des_tw_1?: string; // TEXT
  skill_des_kr_1?: string; // TEXT
  // Embedded Skill 2
  skill_id_2?: number; // INT UNSIGNED
  skill_key_2?: string; // VARCHAR(120)
  skill_name_jp_2?: string; // VARCHAR(150)
  skill_name_en_2?: string; // VARCHAR(150)
  skill_name_cn_2?: string; // VARCHAR(150)
  skill_name_tw_2?: string; // VARCHAR(150)
  skill_name_kr_2?: string; // VARCHAR(150)
  skill_des_2?: string; // TEXT
  skill_des_jp_2?: string; // TEXT
  skill_des_en_2?: string; // TEXT
  skill_des_cn_2?: string; // TEXT
  skill_des_tw_2?: string; // TEXT
  skill_des_kr_2?: string; // TEXT
  // Embedded Skill 3
  skill_id_3?: number; // INT UNSIGNED
  skill_key_3?: string; // VARCHAR(120)
  skill_name_jp_3?: string; // VARCHAR(150)
  skill_name_en_3?: string; // VARCHAR(150)
  skill_name_cn_3?: string; // VARCHAR(150)
  skill_name_tw_3?: string; // VARCHAR(150)
  skill_name_kr_3?: string; // VARCHAR(150)
  skill_des_3?: string; // TEXT
  skill_des_jp_3?: string; // TEXT
  skill_des_en_3?: string; // TEXT
  skill_des_cn_3?: string; // TEXT
  skill_des_tw_3?: string; // TEXT
  skill_des_kr_3?: string; // TEXT
  // Bromide references
  bromide?: string; // VARCHAR(255)
  cossbreak_bromide?: string; // VARCHAR(255)
}

export interface NewSwimsuit {
  unique_key: string;
  unique_msg_key?: string;
  name_jp: string;
  name_en: string;
  name_cn: string;
  name_tw: string;
  name_kr: string;
  character_key?: string;
  rarity?: string;
  attribute?: string;
  max_level?: number;
  // Base stats
  base_pow?: number;
  max_pow?: number;
  pow_growth?: number;
  base_tec?: number;
  max_tex?: number;
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
}

// Utility types for swimsuit filtering
export interface SwimsuitFilterParams {
  character_key?: string;
  rarity?: string;
  attribute?: string;
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

export interface Item {
  id: number; // INT UNSIGNED
  unique_key: string; // VARCHAR(120) UNIQUE
  type?: string; // VARCHAR(100) - Item type/category
  name_jp: string; // VARCHAR(150)
  name_en: string; // VARCHAR(150)
  name_cn: string; // VARCHAR(150)
  name_tw: string; // VARCHAR(150)
  name_kr: string; // VARCHAR(150)
  description?: string; // TEXT - Item description
  icon_small?: string; // VARCHAR(255) - Small icon path or URL
  icon_large?: string; // VARCHAR(255) - Large icon path or URL
}

export interface NewItem {
  unique_key: string;
  type?: string;
  name_jp: string;
  name_en: string;
  name_cn: string;
  name_tw: string;
  name_kr: string;
  description?: string;
  icon_small?: string;
  icon_large?: string;
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
  art_data?: Buffer; // LONGBLOB
  art_mime_type?: string; // VARCHAR(50)
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
  art_data?: Buffer;
  art_mime_type?: string;
  game_version?: string;
}

export interface Episode {
  id: number; // INT UNSIGNED
  name_jp: string; // VARCHAR(255) - Renamed from title_jp
  name_en: string; // VARCHAR(255) - Renamed from title_en
  name_cn: string; // VARCHAR(255) - Renamed from title_cn
  name_tw: string; // VARCHAR(255) - Renamed from title_tw
  name_kr: string; // VARCHAR(255) - Renamed from title_kr
  type?: string; // VARCHAR(100) - Episode type
  unique_key: string; // VARCHAR(200) UNIQUE
  release_data?: Date; // DATE - Release date
  release_version?: string; // VARCHAR(50) - Release version
}

export interface NewEpisode {
  name_jp: string;
  name_en: string;
  name_cn: string;
  name_tw: string;
  name_kr: string;
  type?: string;
  unique_key: string;
  release_data?: Date;
  release_version?: string;
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
  banner_image_data?: Buffer; // LONGBLOB
  banner_image_mime_type?: string; // VARCHAR(50)
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
  banner_image_data?: Buffer;
  banner_image_mime_type?: string;
}

export type DocumentType = 'checklist' | 'guide' | 'tutorial';

export interface Document {
  id: number; // INT UNSIGNED
  unique_key: string; // VARCHAR(150) UNIQUE
  title_en: string; // VARCHAR(255)
  summary_en?: string; // TEXT
  document_type: DocumentType; // ENUM - Type of document for categorization
  content_json_en?: any; // JSON - TipTap editor content
  screenshots_data?: Array<{data: string; mimeType: string; filename: string}>; // JSON - Array of screenshot objects with base64 data
  // PDF file storage fields
  pdf_data?: Buffer; // LONGBLOB - Binary PDF file data
  pdf_filename?: string; // VARCHAR(255) - Original PDF filename
  pdf_mime_type?: string; // VARCHAR(100) - PDF MIME type (default: application/pdf)
  pdf_size?: number; // INT UNSIGNED - PDF file size in bytes
  has_pdf_file?: boolean; // BOOLEAN - Flag indicating if document has PDF attachment
  // Enhanced PDF metadata fields
  pdf_metadata?: {
    pages?: number; // Number of pages
    hasText?: boolean; // Whether PDF contains extractable text
    textLength?: number; // Length of extracted text
    version?: string; // PDF version
    info?: any; // PDF info object
    extractedAt?: string; // When metadata was extracted
    textPreview?: string; // First 200 chars of extracted text
  }; // JSON - PDF metadata
  created_at: Date; // TIMESTAMP
  updated_at: Date; // TIMESTAMP
}

export interface NewDocument {
  unique_key: string;
  title_en: string;
  summary_en?: string;
  document_type?: DocumentType; // Optional, defaults to 'general'
  content_json_en?: any; // TipTap JSON content
  screenshots_data?: Array<{data: string; mimeType: string; filename: string}>; // Array of screenshot objects with base64 data
  // PDF file fields for creating documents with PDF attachments
  pdf_data?: Buffer | string; // Binary PDF file data (Buffer) or base64 string
  pdf_filename?: string; // Original PDF filename
  pdf_mime_type?: string; // PDF MIME type (default: application/pdf)
  pdf_size?: number; // PDF file size in bytes
  has_pdf_file?: boolean; // Flag indicating if document has PDF attachment
  // Enhanced PDF metadata
  pdf_metadata?: {
    pages?: number;
    hasText?: boolean;
    textLength?: number;
    version?: string;
    info?: any;
    extractedAt?: string;
    textPreview?: string;
  }; // PDF metadata
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
  screenshots_data: Array<{data: string; mimeType: string; filename: string}>; // JSON - Array of screenshot objects with base64 data
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
  screenshots_data?: Array<{data: string; mimeType: string; filename: string}>;
  metrics?: {
    performanceImprovement: string;
    userSatisfaction: string;
    bugReports: number;
  };
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

// Common rarity filter (now using string types for denormalized schema)
export type AllRarityTypes = BromideRarity;

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

// ============================================================================
// IMAGE HANDLING TYPES
// ============================================================================

// Supported image MIME types
export type ImageMimeType = 'image/jpeg' | 'image/jpg' | 'image/png' | 'image/gif' | 'image/webp';

// Image data structure for API responses
export interface ImageData {
  data: string; // Base64 encoded image data
  mimeType: ImageMimeType;
  filename?: string;
  size?: number;
}

// Image upload structure for API requests
export interface ImageUpload {
  data: Buffer | string; // Buffer for server-side, base64 string for client-side
  mimeType: ImageMimeType;
  filename?: string;
}

// Screenshot data structure for documents and update logs
export interface ScreenshotData {
  data: string; // Base64 encoded image data
  mimeType: ImageMimeType;
  filename: string;
}



// Type guards for runtime type checking
export function isCharacter(obj: any): obj is Character {
  return obj && typeof obj.id === 'number' && typeof obj.unique_key === 'string' && typeof obj.name_en === 'string';
}

export function isSwimsuit(obj: any): obj is Swimsuit {
  return obj && typeof obj.id === 'number' && typeof obj.unique_key === 'string';
}

export function isSkill(obj: any): obj is Skill {
  return obj && typeof obj.id === 'number' && typeof obj.unique_key === 'string' && typeof obj.skill_category === 'string';
}

export function isItem(obj: any): obj is Item {
  return obj && typeof obj.id === 'number' && typeof obj.unique_key === 'string';
}

export function isBromide(obj: any): obj is Bromide {
  return obj && typeof obj.id === 'number' && typeof obj.unique_key === 'string' && typeof obj.bromide_type === 'string';
}

export function isEvent(obj: any): obj is Event {
  return obj && typeof obj.id === 'number' && typeof obj.unique_key === 'string' && typeof obj.type === 'string';
}

export function isEpisode(obj: any): obj is Episode {
  return obj && typeof obj.id === 'number' && typeof obj.unique_key === 'string';
}

export function isDocument(obj: any): obj is Document {
  return obj && typeof obj.id === 'number' && typeof obj.unique_key === 'string' && typeof obj.title_en === 'string';
}

// Constants for enum values validation
export const SKILL_CATEGORIES: SkillCategory[] = ['ACTIVE', 'PASSIVE', 'POTENTIAL'];
export const BROMIDE_TYPES: BromideType[] = ['DECO', 'OWNER'];
export const BROMIDE_RARITIES: BromideRarity[] = ['R', 'SR', 'SSR'];
export const EVENT_TYPES: EventType[] = ['FESTIVAL_RANKING', 'FESTIVAL_CUMULATIVE', 'TOWER', 'ROCK_CLIMBING', 'BUTT_BATTLE', 'LOGIN_BONUS', 'STORY'];
export const GACHA_SUBTYPES: GachaSubtype[] = ['TRENDY', 'NOSTALGIC', 'BIRTHDAY', 'ANNIVERSARY', 'PAID', 'FREE', 'ETC'];
export const DOCUMENT_TYPES: DocumentType[] = ['checklist', 'guide'];

// Validation helper functions
export function isValidDocumentType(type: string): type is DocumentType {
  return DOCUMENT_TYPES.includes(type as DocumentType);
}

export function isValidSkillCategory(category: string): category is SkillCategory {
  return SKILL_CATEGORIES.includes(category as SkillCategory);
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
