import { useMemo } from 'react';
import { calculateTotalPages, getPaginatedItems, createPaginationMetadata } from '@/services/utils';

export interface UsePaginationProps<T> {
  items: T[];
  currentPage: number;
  itemsPerPage: number;
}

export interface UsePaginationResult<T> {
  paginatedItems: T[];
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  startIndex: number;
  endIndex: number;
}

/**
 * Reusable pagination hook that consolidates common pagination patterns
 */
export function usePagination<T>({
  items,
  currentPage,
  itemsPerPage
}: UsePaginationProps<T>): UsePaginationResult<T> {
  const paginationData = useMemo(() => {
    const totalItems = items.length;
    const totalPages = calculateTotalPages(totalItems, itemsPerPage);
    const paginatedItems = getPaginatedItems(items, currentPage, itemsPerPage);
    const metadata = createPaginationMetadata(totalItems, currentPage, itemsPerPage);
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    
    return {
      paginatedItems,
      totalPages,
      totalItems,
      hasNextPage: metadata.hasNextPage,
      hasPrevPage: metadata.hasPrevPage,
      startIndex: startIndex + 1, // 1-based for display
      endIndex
    };
  }, [items, currentPage, itemsPerPage]);

  return paginationData;
}

/**
 * Enhanced pagination hook with search and filter support
 */
export function usePaginationWithFilters<T>({
  items,
  currentPage,
  itemsPerPage,
  searchText,
  filters,
  sortBy,
  sortDirection = 'asc'
}: UsePaginationProps<T> & {
  searchText?: string;
  filters?: (item: T) => boolean;
  sortBy?: keyof T | string;
  sortDirection?: 'asc' | 'desc';
}): UsePaginationResult<T> & {
  filteredItems: T[];
  filteredCount: number;
} {
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];
    
    // Apply filters
    if (filters) {
      result = result.filter(filters);
    }
    
    // Apply search
    if (searchText && searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      result = result.filter(item => {
        // Generic search - look for searchText in string properties
        return Object.values(item as any).some(value => 
          typeof value === 'string' && value.toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Apply sorting
    if (sortBy) {
      result.sort((a, b) => {
        const getNestedValue = (obj: any, path: string) => {
          return path.split('.').reduce((current, key) => current?.[key], obj);
        };

        const aValue = getNestedValue(a, sortBy as string);
        const bValue = getNestedValue(b, sortBy as string);
        
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
    
    return result;
  }, [items, filters, searchText, sortBy, sortDirection]);

  const paginationResult = usePagination({
    items: filteredAndSortedItems,
    currentPage,
    itemsPerPage
  });

  return {
    ...paginationResult,
    filteredItems: filteredAndSortedItems,
    filteredCount: filteredAndSortedItems.length
  };
} 