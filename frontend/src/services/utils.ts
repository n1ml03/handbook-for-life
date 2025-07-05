import React from 'react'
import { twMerge } from "tailwind-merge"
import { Language, MultiLanguageNames } from '@/types'

export function cn(...inputs: (string | undefined)[]) {
  return twMerge(...inputs.filter(Boolean))
}

// =============================================================================
// BACKEND DATA HELPERS - Functions for working with backend response format
// =============================================================================

/**
 * Extract localized name from multi-language entity
 */
export function getLocalizedName(entity: MultiLanguageNames, lang: Language = 'en'): string {
  switch (lang) {
    case 'jp': return entity.name_jp || entity.name_en || '';
    case 'en': return entity.name_en || entity.name_jp || '';
    case 'cn': return entity.name_cn || entity.name_en || '';
    case 'tw': return entity.name_tw || entity.name_en || '';
    case 'kr': return entity.name_kr || entity.name_en || '';
    default: return entity.name_en || entity.name_jp || '';
  }
}

/**
 * Create data URL from binary image data and mime type
 */
export function createImageDataUrl(imageData?: string, mimeType?: string): string | undefined {
  if (!imageData || !mimeType) {
    return undefined;
  }
  return `data:${mimeType};base64,${imageData}`;
}

/**
 * Extract character profile image URL from character data
 */
export function getCharacterProfileImageUrl(character: { profile_image_data?: string; profile_image_mime_type?: string }): string | undefined {
  return createImageDataUrl(character.profile_image_data, character.profile_image_mime_type);
}

/**
 * Extract swimsuit images from swimsuit data
 */
export function getSwimsuitImages(swimsuit: { 
  image_before_data?: string; 
  image_before_mime_type?: string;
  image_after_data?: string;
  image_after_mime_type?: string;
}): {
  beforeImage?: string;
  afterImage?: string;
} {
  return {
    beforeImage: createImageDataUrl(swimsuit.image_before_data, swimsuit.image_before_mime_type),
    afterImage: createImageDataUrl(swimsuit.image_after_data, swimsuit.image_after_mime_type),
  };
}

/**
 * Extract item icon URL from item data
 */
export function getItemIconUrl(item: { icon_data?: string; icon_mime_type?: string }): string | undefined {
  return createImageDataUrl(item.icon_data, item.icon_mime_type);
}

/**
 * Extract bromide art URL from bromide data
 */
export function getBromideArtUrl(bromide: { art_data?: string; art_mime_type?: string }): string | undefined {
  return createImageDataUrl(bromide.art_data, bromide.art_mime_type);
}

/**
 * Extract screenshot URLs from screenshots_data array
 */
export function extractScreenshotUrls(screenshotsData?: Array<{data: string; mimeType: string; filename: string}>): string[] {
  if (!screenshotsData || !Array.isArray(screenshotsData)) {
    return [];
  }
  
  return screenshotsData
    .filter(screenshot => screenshot.data && screenshot.mimeType)
    .map(screenshot => createImageDataUrl(screenshot.data, screenshot.mimeType))
    .filter(Boolean) as string[];
}

/**
 * Format ISO date string to display format
 */
export function formatDisplayDate(isoDateString?: string): string {
  if (!isoDateString) {
    return '';
  }
  
  try {
    const date = new Date(isoDateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return isoDateString;
  }
}

/**
 * Format ISO datetime string to display format
 */
export function formatDisplayDateTime(isoDateTimeString?: string): string {
  if (!isoDateTimeString) {
    return '';
  }
  
  try {
    const date = new Date(isoDateTimeString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return isoDateTimeString;
  }
}

/**
 * Extract content HTML from TipTap JSON content
 */
export function extractContentHtml(contentJson?: Record<string, unknown>): string {
  if (!contentJson || typeof contentJson !== 'object') {
    return '';
  }
  
  // This is a simple extraction for TipTap JSON
  // For a full implementation, you might want to use a TipTap HTML serializer
  try {
    const content = contentJson.content as any[];
    if (!Array.isArray(content)) {
      return '';
    }
    
    return content
      .map(node => {
        if (node.type === 'paragraph' && node.content) {
          return node.content
            .map((textNode: any) => textNode.text || '')
            .join('');
        }
        return '';
      })
      .filter(text => text.length > 0)
      .join('\n\n');
  } catch {
    return '';
  }
}

/**
 * Extract plain text from TipTap JSON content for search/display
 */
export function extractContentText(contentJson?: Record<string, unknown>): string {
  const html = extractContentHtml(contentJson);
  // Remove HTML tags if any were preserved
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Check if an event is currently active based on start/end dates
 */
export function isEventActive(event: { start_date: string; end_date: string }): boolean {
  const now = new Date();
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);
  
  return now >= startDate && now <= endDate;
}

/**
 * Check if a gacha is currently active based on start/end dates
 */
export function isGachaActive(gacha: { start_date: string; end_date: string }): boolean {
  const now = new Date();
  const startDate = new Date(gacha.start_date);
  const endDate = new Date(gacha.end_date);
  
  return now >= startDate && now <= endDate;
}

/**
 * Generate category from document tags or content
 */
export function generateDocumentCategory(document: {
  title_en?: string;
  content_json_en?: Record<string, unknown>;
  summary_en?: string;
}): string {
  // Safely handle potentially undefined title_en
  const title = document.title_en?.toLowerCase() || '';
  const summary = document.summary_en?.toLowerCase() || '';
  const content = extractContentText(document.content_json_en).toLowerCase();
  const text = `${title} ${summary} ${content}`;

  if (text.includes('character') || text.includes('girl')) {
    return 'characters';
  }
  if (text.includes('swimsuit') || text.includes('outfit')) {
    return 'swimsuits';
  }
  if (text.includes('skill') || text.includes('ability')) {
    return 'skills';
  }
  if (text.includes('event') || text.includes('festival')) {
    return 'events';
  }
  if (text.includes('item') || text.includes('currency')) {
    return 'items';
  }
  if (text.includes('guide') || text.includes('tutorial')) {
    return 'guides';
  }
  if (text.includes('update') || text.includes('changelog')) {
    return 'updates';
  }

  return 'general';
}

/**
 * Generate tags from document content and category
 */
export function generateDocumentTags(document: {
  title_en?: string;
  content_json_en?: Record<string, unknown>;
  summary_en?: string;
}): string[] {
  const category = generateDocumentCategory(document);
  const tags = [category];

  // Safely handle potentially undefined title_en
  const title = document.title_en?.toLowerCase() || '';
  const summary = document.summary_en?.toLowerCase() || '';
  const content = extractContentText(document.content_json_en).toLowerCase();
  const text = `${title} ${summary} ${content}`;
  
  // Add specific tags based on content
  const tagPatterns = [
    { pattern: /beginner|new|start/i, tag: 'beginner' },
    { pattern: /advanced|expert|pro/i, tag: 'advanced' },
    { pattern: /strategy|tactic|tip/i, tag: 'strategy' },
    { pattern: /stats|number|calculation/i, tag: 'stats' },
    { pattern: /ssr\+|ssr|sr|r|n/i, tag: 'rarity' },
    { pattern: /limited|exclusive|special/i, tag: 'limited' },
    { pattern: /malfunction|awakening/i, tag: 'enhancement' },
  ];
  
  tagPatterns.forEach(({ pattern, tag }) => {
    if (pattern.test(text) && !tags.includes(tag)) {
      tags.push(tag);
    }
  });
  
  return tags;
}

/**
 * Safe comparison of entity IDs (handles string/number conversion)
 */
export function compareEntityIds(id1: any, id2: any): boolean {
  return String(id1) === String(id2);
}

/**
 * Extract rarity display color class
 */
export function getRarityColorClass(rarity: string): string {
  switch (rarity.toUpperCase()) {
    case 'SSR+': return 'text-rainbow bg-gradient-to-r from-purple-400 via-pink-400 to-red-400';
    case 'SSR': return 'text-yellow-400';
    case 'SR': return 'text-purple-400';
    case 'R': return 'text-blue-400';
    case 'N': return 'text-gray-400';
    default: return 'text-gray-400';
  }
}

/**
 * Extract suit type display color class
 */
export function getSuitTypeColorClass(suitType: string): string {
  switch (suitType.toUpperCase()) {
    case 'POW': return 'text-red-400';
    case 'TEC': return 'text-blue-400';
    case 'STM': return 'text-green-400';
    case 'APL': return 'text-pink-400';
    default: return 'text-gray-400';
  }
}

// =============================================================================
// TYPE UTILITIES - Comprehensive type utilities for better type safety
// =============================================================================

// Generic utility types
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type NonEmptyArray<T> = [T, ...T[]];

export type ValueOf<T> = T[keyof T];

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// React utility types
export type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

export type PropsWithChildren<P = unknown> = P & { children?: React.ReactNode };

export type StrictPropsWithChildren<P = unknown> = P & { children: React.ReactNode };

// Event handler types
export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;
export type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;
export type SubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;
export type KeyboardHandler = (event: React.KeyboardEvent<HTMLElement>) => void;

// API utility types
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type PickByType<T, U> = Pick<T, KeysOfType<T, U>>;

// Common data transformation types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// Status and state types
export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export type RequestState = 'idle' | 'loading' | 'success' | 'error';

// Form utility types
export type FormField<T> = {
  value: T;
  error?: string;
  touched?: boolean;
  required?: boolean;
};

export type FormState<T> = {
  [K in keyof T]: FormField<T[K]>;
};

// Component state types
export type Expandable = {
  isExpanded: boolean;
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
};

export type Selectable<T> = {
  selected: T | null;
  select: (item: T) => void;
  deselect: () => void;
  isSelected: (item: T) => boolean;
};

export type Toggleable = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

// Collection utility types
export type CollectionActions<T> = {
  add: (item: T) => void;
  remove: (id: string) => void;
  update: (id: string, updates: Partial<T>) => void;
  clear: () => void;
  reset: () => void;
};

export type PaginatedData<T> = {
  items: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type SortableCollection<T> = {
  items: T[];
  sortBy: keyof T;
  sortDirection: 'asc' | 'desc';
  sort: (field: keyof T, direction?: 'asc' | 'desc') => void;
};

export type FilterableCollection<T> = {
  items: T[];
  filters: Record<string, any>;
  filteredItems: T[];
  setFilter: (key: string, value: any) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;
};

// Search utility types
export type SearchResult<T> = {
  item: T;
  score: number;
  matches: string[];
};

export type SearchState<T> = {
  query: string;
  results: SearchResult<T>[];
  loading: boolean;
  error: string | null;
};

// Theme and styling utility types
export type ThemeVariant = 'light' | 'dark' | 'auto';
export type ColorScheme = 'blue' | 'green' | 'purple' | 'pink' | 'orange' | 'gray';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Spacing = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;

// Animation utility types
export type AnimationState = 'idle' | 'enter' | 'exit';
export type TransitionDuration = 'fast' | 'normal' | 'slow';

// Validation utility types
export type ValidationRule<T> = {
  test: (value: T) => boolean;
  message: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

// Type guards
export const isNonNull = <T>(value: T | null): value is T => value !== null;
export const isNonUndefined = <T>(value: T | undefined): value is T => value !== undefined;
export const isNonNullish = <T>(value: T | null | undefined): value is T => 
  value !== null && value !== undefined;

export const isString = (value: any): value is string => typeof value === 'string';
export const isNumber = (value: any): value is number => typeof value === 'number';
export const isBoolean = (value: any): value is boolean => typeof value === 'boolean';
export const isArray = <T>(value: any): value is T[] => Array.isArray(value);
export const isObject = (value: any): value is object => 
  typeof value === 'object' && value !== null && !Array.isArray(value);

// Helper function types
export type Predicate<T> = (value: T) => boolean;
export type Mapper<T, U> = (value: T) => U;
export type Reducer<T, U> = (accumulator: U, current: T) => U;
export type Comparator<T> = (a: T, b: T) => number;

// Error handling types
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

// Configuration types
export type Config<T> = Readonly<T>;
export type FeatureFlags = Record<string, boolean>;

// Branded types for better type safety
export type Brand<T, B> = T & { __brand: B };
export type ID<T = string> = Brand<T, 'ID'>;
export type Email = Brand<string, 'Email'>;
export type URL = Brand<string, 'URL'>;
export type Timestamp = Brand<number, 'Timestamp'>;

// Helper to create branded types
export const createBrand = <T, B>(value: T): Brand<T, B> => value as Brand<T, B>;

// Constants for type safety
export const SORT_DIRECTIONS = ['asc', 'desc'] as const;
export const VIEW_MODES = ['gallery', 'showcase', 'minimal', 'list', 'card', 'table'] as const;
export const LANGUAGES = ['EN', 'CN', 'TW', 'KO', 'JP'] as const;
export const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
export const THEME_VARIANTS = ['light', 'dark', 'auto'] as const;

// =============================================================================
// API UTILITIES - Consolidated from apiHelpers.ts
// =============================================================================

/**
 * Safely extracts array data from API responses
 */
export function safeExtractArrayData<T>(
  response: any, 
  apiName: string = 'API'
): T[] {
  const responseData = response?.data || [];
  
  if (!Array.isArray(responseData)) {
    console.warn(`Expected array from ${apiName}, received:`, responseData);
    return [];
  }
  
  return responseData;
}

/**
 * Safely extracts single object data from API responses
 */
export function safeExtractObjectData<T>(
  response: any, 
  apiName: string = 'API'
): T | null {
  if (!response?.data) {
    console.warn(`Expected data from ${apiName}, received:`, response);
    return null;
  }
  
  return response.data;
}

/**
 * Safely converts any value to string for text operations
 */
export function safeToString(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (typeof value === 'string') {
    return value;
  }
  
  if (typeof value === 'object') {
    // If it's an object with name property, use that
    if (value.name && typeof value.name === 'string') {
      return value.name;
    }
    // If it's an object with title property, use that
    if (value.title && typeof value.title === 'string') {
      return value.title;
    }
    // If it's an object with id property, use that
    if (value.id) {
      return String(value.id);
    }
    // Otherwise, try to stringify
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  
  return String(value);
}

/**
 * Safely normalizes tags array to ensure all elements are strings
 */
export function safeNormalizeTags(tags: any): string[] {
  if (!tags) {
    return [];
  }
  
  // If it's already an array, normalize each element to string
  if (Array.isArray(tags)) {
    return tags.map(tag => safeToString(tag)).filter(tag => tag.length > 0);
  }
  
  // If it's a single value, convert to string and wrap in array
  const stringValue = safeToString(tags);
  return stringValue.length > 0 ? [stringValue] : [];
}

/**
 * Safely converts ID to string for comparison
 */
export function safeIdToString(id: any): string {
  return String(id);
}

/**
 * Safely compares two IDs that might be strings or numbers
 */
export function safeIdCompare(id1: any, id2: any): boolean {
  return safeIdToString(id1) === safeIdToString(id2);
}

/**
 * Safely extracts pagination data from API responses
 */
export function safeExtractPaginationData(
  response: any, 
  dataLength: number = 0
): {
  totalPages: number;
  total: number;
  currentPage?: number;
  limit?: number;
} {
  const paginationData = response?.pagination || {};
  
  return {
    totalPages: paginationData.totalPages || 1,
    total: paginationData.total || dataLength,
    currentPage: paginationData.currentPage,
    limit: paginationData.limit,
  };
}

// =============================================================================
// PAGINATION UTILITIES - Consolidate common pagination patterns
// =============================================================================

/**
 * Calculate total pages from item count and items per page
 */
export function calculateTotalPages(totalItems: number, itemsPerPage: number): number {
  return Math.ceil(totalItems / itemsPerPage);
}

/**
 * Get paginated slice of items
 */
export function getPaginatedItems<T>(
  items: T[], 
  currentPage: number, 
  itemsPerPage: number
): T[] {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return items.slice(startIndex, endIndex);
}

/**
 * Create pagination metadata
 */
export function createPaginationMetadata(
  totalItems: number,
  currentPage: number,
  itemsPerPage: number
): PaginatedData<never> {
  const totalPages = calculateTotalPages(totalItems, itemsPerPage);
  
  return {
    items: [],
    totalItems,
    currentPage,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
}