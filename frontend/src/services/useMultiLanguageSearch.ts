import { useMemo } from 'react';
import { 
  addTranslationsToItems, 
  searchInAllLanguages, 
  type MultiLanguageItem,
  type Language 
} from './multiLanguageSearch';

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
      filtered.sort((a, b) => {
        let aValue: any, bValue: any;
        
        // Handle nested property access
        const getNestedValue = (obj: any, path: string) => {
          return path.split('.').reduce((current, key) => current?.[key], obj);
        };

        aValue = getNestedValue(a, sortBy);
        bValue = getNestedValue(b, sortBy);

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
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  }, [filteredItems, currentPage, itemsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(count / itemsPerPage);
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