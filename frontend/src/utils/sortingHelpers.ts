import { SortDirection } from '@/types';

/**
 * Shared sorting utilities to reduce code duplication
 */

export interface SortableItem {
  name: string;
  [key: string]: any;
}

export class SortingHelpers {
  /**
   * Generic name sorting with multilingual support
   */
  static sortByName<T extends SortableItem>(a: T, b: T, direction: SortDirection = 'asc'): number {
    const aName = a.translations?.['en']?.name || a.name;
    const bName = b.translations?.['en']?.name || b.name;
    const comparison = aName.localeCompare(bName);
    return direction === 'desc' ? -comparison : comparison;
  }

  /**
   * Sort by type/category
   */
  static sortByType<T extends { type?: string }>(a: T, b: T, direction: SortDirection = 'asc'): number {
    const comparison = (a.type || '').localeCompare(b.type || '');
    return direction === 'desc' ? -comparison : comparison;
  }

  /**
   * Sort by rarity (SSR > SR > R)
   */
  static sortByRarity<T extends { rarity?: string }>(a: T, b: T, direction: SortDirection = 'asc'): number {
    const rarityOrder: Record<string, number> = { 'SSR': 3, 'SR': 2, 'R': 1, '': 0 };
    const comparison = (rarityOrder[a.rarity || ''] || 0) - (rarityOrder[b.rarity || ''] || 0);
    return direction === 'desc' ? -comparison : comparison;
  }

  /**
   * Sort by stats total (for items/characters with stats)
   */
  static sortByStatsTotal<T extends { stats?: Record<string, number> }>(
    a: T, 
    b: T, 
    direction: SortDirection = 'asc'
  ): number {
    const aTotal = a.stats ? Object.values(a.stats).reduce((sum, val) => sum + (val || 0), 0) : 0;
    const bTotal = b.stats ? Object.values(b.stats).reduce((sum, val) => sum + (val || 0), 0) : 0;
    const comparison = aTotal - bTotal;
    return direction === 'desc' ? -comparison : comparison;
  }

  /**
   * Generic sorting function that applies multiple sort criteria
   */
  static multiSort<T>(
    items: T[],
    sortCriteria: Array<{
      field: keyof T | 'name' | 'type' | 'rarity' | 'stats';
      direction: SortDirection;
      customCompare?: (a: T, b: T, direction: SortDirection) => number;
    }>
  ): T[] {
    return [...items].sort((a, b) => {
      for (const criteria of sortCriteria) {
        let comparison = 0;

        if (criteria.customCompare) {
          comparison = criteria.customCompare(a, b, criteria.direction);
        } else {
          switch (criteria.field) {
            case 'name':
              comparison = this.sortByName(a as any, b as any, criteria.direction);
              break;
            case 'type':
              comparison = this.sortByType(a as any, b as any, criteria.direction);
              break;
            case 'rarity':
              comparison = this.sortByRarity(a as any, b as any, criteria.direction);
              break;
            case 'stats':
              comparison = this.sortByStatsTotal(a as any, b as any, criteria.direction);
              break;
            default: {
              // Generic field comparison
              const aValue = a[criteria.field];
              const bValue = b[criteria.field];
              if (typeof aValue === 'string' && typeof bValue === 'string') {
                comparison = aValue.localeCompare(bValue);
              } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparison = aValue - bValue;
              }
              comparison = criteria.direction === 'desc' ? -comparison : comparison;
              break;
            }
          }
        }

        if (comparison !== 0) {
          return comparison;
        }
      }
      return 0;
    });
  }
} 