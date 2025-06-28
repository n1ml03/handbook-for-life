import { useMemo } from 'react';
import { calculateTotalPages, getPaginatedItems } from './utils';

export type Language = 'EN' | 'CN' | 'TW' | 'KO' | 'JP';

export interface Translation {
  name: string;
  description?: string;
}

export interface MultiLanguageItem {
  id: string;
  name: string;
  description?: string;
  [key: string]: any;
  translations?: {
    [key in Language]?: Translation;
  };
}

// Generate mock translations for any item
export const generateItemTranslations = (item: any): { [key in Language]: Translation } => {
  const languagePrefixes = {
    EN: '',
    CN: '中文_',
    TW: '繁體_',
    KO: '한국_',
    JP: '日本_'
  };

  const translations: { [key in Language]: Translation } = {} as { [key in Language]: Translation };

  Object.keys(languagePrefixes).forEach(lang => {
    const prefix = languagePrefixes[lang as Language];
    translations[lang as Language] = {
      name: prefix ? `${prefix}${item.name}` : item.name,
      description: item.description ? (prefix ? `${prefix}${item.description}` : item.description) : undefined
    };
  });

  return translations;
};

// Add translations to any item
export const addTranslationsToItem = <T extends { id: string; name: string; description?: string }>(
  item: T
): T & { translations: { [key in Language]: Translation } } => {
  return {
    ...item,
    translations: generateItemTranslations(item)
  };
};

// Add translations to array of items
export const addTranslationsToItems = <T extends { id: string; name: string; description?: string }>(
  items: T[]
): (T & { translations: { [key in Language]: Translation } })[] => {
  return items.map(addTranslationsToItem);
};

// Multi-language search function
export const searchInAllLanguages = (
  item: MultiLanguageItem,
  searchText: string
): boolean => {
  if (!searchText) return true;
  
  const searchLower = searchText.toLowerCase();
  
  // Search in original name and description
  const originalNameMatch = item.name.toLowerCase().includes(searchLower);
  const originalDescMatch = item.description?.toLowerCase().includes(searchLower) || false;
  
  // Search across ALL language translations
  const translationMatches = Object.values(item.translations || {}).some(translation => {
    const nameMatch = translation?.name?.toLowerCase().includes(searchLower) || false;
    const descMatch = translation?.description?.toLowerCase().includes(searchLower) || false;
    return nameMatch || descMatch;
  });
  
  return originalNameMatch || originalDescMatch || translationMatches;
};

// Hook for multi-language filtering (legacy compatibility)
export const useMultiLanguageFilter = <T extends MultiLanguageItem>(
  items: T[],
  searchText: string,
  additionalFilters?: (item: T) => boolean
) => {
  return useMemo(() => {
    return items.filter(item => {
      const searchMatch = searchInAllLanguages(item, searchText);
      const additionalMatch = additionalFilters ? additionalFilters(item) : true;
      return searchMatch && additionalMatch;
    });
  }, [items, searchText, additionalFilters]);
};

// Get display name in specific language
export const getDisplayName = (
  item: MultiLanguageItem,
  language: Language = 'EN'
): string => {
  return item.translations?.[language]?.name || item.name;
};

// Get display description in specific language
export const getDisplayDescription = (
  item: MultiLanguageItem,
  language: Language = 'EN'
): string | undefined => {
  return item.translations?.[language]?.description || item.description;
};

// Language options for UI
export const languageOptions = [
  { value: 'EN' as Language, label: 'English' },
  { value: 'CN' as Language, label: '中文' },
  { value: 'TW' as Language, label: '繁體' },
  { value: 'KO' as Language, label: '한국어' },
  { value: 'JP' as Language, label: '日本語' }
];

// =============================================================================
// CONSOLIDATED MULTI-LANGUAGE SEARCH HOOKS
// =============================================================================

// Generic hook for multi-language search and filtering
export function useMultiLanguageSearch<T extends { id: string; name: string; description?: string }>(
  items: T[],
  searchText: string,
  additionalFilters?: (item: T & { translations: any }) => boolean,
  sortBy?: string,
  sortDirection?: 'asc' | 'desc'
) {
  // Add translations to items
  const multiLanguageItems = useMemo(() => {
    return addTranslationsToItems(items);
  }, [items]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    const filtered = multiLanguageItems.filter(item => {
      // Multi-language search
      const searchMatch = searchInAllLanguages(item, searchText);
      
      // Additional filters
      const additionalMatch = additionalFilters ? additionalFilters(item) : true;
      
      return searchMatch && additionalMatch;
    });

    // Sort if sortBy is provided
    if (sortBy) {
      // Handle nested property access
      const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((current, key) => current?.[key], obj);
      };

      filtered.sort((a, b) => {
        const aValue: any = getNestedValue(a, sortBy);
        const bValue: any = getNestedValue(b, sortBy);
        
        // Handle different data types
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
          return sortDirection === 'desc' ? -comparison : comparison;
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'desc' ? bValue - aValue : aValue - bValue;
        } else {
          // Fallback to string comparison
          const aStr = String(aValue || '').toLowerCase();
          const bStr = String(bValue || '').toLowerCase();
          const comparison = aStr.localeCompare(bStr);
          return sortDirection === 'desc' ? -comparison : comparison;
        }
      });
    }

    return filtered;
  }, [multiLanguageItems, searchText, additionalFilters, sortBy, sortDirection]);

  return {
    items: filteredAndSortedItems,
    originalItems: multiLanguageItems,
    count: filteredAndSortedItems.length
  };
}

// Hook specifically for pages with pagination
export function useMultiLanguageSearchWithPagination<T extends { id: string; name: string; description?: string }>(
  items: T[],
  searchText: string,
  currentPage: number,
  itemsPerPage: number,
  additionalFilters?: (item: T & { translations: any }) => boolean,
  sortBy?: string,
  sortDirection?: 'asc' | 'desc'
) {
  const { items: filteredItems, originalItems, count } = useMultiLanguageSearch(
    items,
    searchText,
    additionalFilters,
    sortBy,
    sortDirection
  );

  const paginatedItems = useMemo(() => {
    return getPaginatedItems(filteredItems, currentPage, itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return calculateTotalPages(count, itemsPerPage);
  }, [count, itemsPerPage]);

  return {
    items: paginatedItems,
    allFilteredItems: filteredItems,
    originalItems,
    count,
    totalPages,
    currentPage,
    itemsPerPage
  };
}

// =============================================================================
// FILTER UTILITIES - Consolidated from useMultiLanguageSearch.ts
// =============================================================================

// Utility function to create search filter function for common use cases
export function createSearchFilter(searchText: string) {
  return (item: MultiLanguageItem) => searchInAllLanguages(item, searchText);
}

// Utility function to create combined filters
export function combineFilters<T extends MultiLanguageItem>(
  ...filters: Array<(item: T) => boolean>
) {
  return (item: T) => filters.every(filter => filter(item));
}

// Common filter creators
export const createRarityFilter = (rarity: string) => <T extends { rarity?: string }>(item: T) => 
  !rarity || item.rarity === rarity;

export const createTypeFilter = (type: string) => <T extends { type?: string }>(item: T) => 
  !type || item.type === type;

export const createCharacterFilter = (character: string) => <T extends { character?: string }>(item: T) => 
  !character || item.character === character;

export const createMinStatFilter = (statName: string, minValue: string) => <T extends { stats?: { [key: string]: number } }>(item: T) => 
  !minValue || (item.stats?.[statName] || 0) >= parseInt(minValue);

export const createBooleanFilter = <T extends Record<string, any>>(key: string, value: boolean) => (item: T) => 
  !value || Boolean(item[key]);

// Advanced search with multiple criteria
export function createAdvancedFilter<T extends MultiLanguageItem>(criteria: {
  search?: string;
  rarity?: string;
  type?: string;
  character?: string;
  minStats?: { [key: string]: string };
  booleanFilters?: { [key: string]: boolean };
}) {
  return (item: T & { 
    rarity?: string; 
    type?: string; 
    character?: string; 
    stats?: { [key: string]: number };
    [key: string]: any;
  }) => {
    // Search filter
    if (criteria.search && !searchInAllLanguages(item, criteria.search)) return false;
    
    // Rarity filter
    if (criteria.rarity && item.rarity !== criteria.rarity) return false;
    
    // Type filter
    if (criteria.type && item.type !== criteria.type) return false;
    
    // Character filter
    if (criteria.character && item.character !== criteria.character) return false;
    
    // Min stats filters
    if (criteria.minStats) {
      for (const [stat, minValue] of Object.entries(criteria.minStats)) {
        if (minValue && (item.stats?.[stat] || 0) < parseInt(minValue)) return false;
      }
    }
    
    // Boolean filters
    if (criteria.booleanFilters) {
      for (const [key, value] of Object.entries(criteria.booleanFilters)) {
        if (value && !item[key]) return false;
      }
    }
    
    return true;
  };
} 