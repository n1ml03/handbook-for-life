import logger from '../config/logger';

/**
 * Simple in-memory cache service for development
 * In production, this should be replaced with Redis or similar
 */
export class CacheService {
  private static cache = new Map<string, { data: any; expiry: number }>();
  private static readonly DEFAULT_TTL = 300; // 5 minutes in seconds

  /**
   * Get cached data by key
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = this.cache.get(key);
      
      if (!cached) {
        return null;
      }

      // Check if cache has expired
      if (Date.now() > cached.expiry) {
        this.cache.delete(key);
        logger.debug('Cache expired and removed', { key });
        return null;
      }

      logger.debug('Cache hit', { key });
      return cached.data as T;
    } catch (error) {
      logger.error('Cache get error:', { key, error });
      return null;
    }
  }

  /**
   * Set cached data with TTL
   */
  static async set<T>(key: string, data: T, ttlSeconds: number = this.DEFAULT_TTL): Promise<void> {
    try {
      const expiry = Date.now() + (ttlSeconds * 1000);
      this.cache.set(key, { data, expiry });
      
      logger.debug('Cache set', { key, ttlSeconds, expiry: new Date(expiry).toISOString() });
    } catch (error) {
      logger.error('Cache set error:', { key, error });
    }
  }

  /**
   * Delete cached data by key
   */
  static async delete(key: string): Promise<void> {
    try {
      const deleted = this.cache.delete(key);
      if (deleted) {
        logger.debug('Cache deleted', { key });
      }
    } catch (error) {
      logger.error('Cache delete error:', { key, error });
    }
  }

  /**
   * Clear all cached data matching pattern
   */
  static async invalidate(pattern: string): Promise<void> {
    try {
      const keysToDelete: string[] = [];
      
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      }

      for (const key of keysToDelete) {
        this.cache.delete(key);
      }

      logger.debug('Cache invalidated', { pattern, deletedKeys: keysToDelete.length });
    } catch (error) {
      logger.error('Cache invalidation error:', { pattern, error });
    }
  }

  /**
   * Clear all cached data
   */
  static async clear(): Promise<void> {
    try {
      const size = this.cache.size;
      this.cache.clear();
      logger.debug('Cache cleared', { previousSize: size });
    } catch (error) {
      logger.error('Cache clear error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  static getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Clean up expired entries
   */
  static cleanup(): void {
    try {
      const now = Date.now();
      const expiredKeys: string[] = [];

      for (const [key, value] of this.cache.entries()) {
        if (now > value.expiry) {
          expiredKeys.push(key);
        }
      }

      for (const key of expiredKeys) {
        this.cache.delete(key);
      }

      if (expiredKeys.length > 0) {
        logger.debug('Cache cleanup completed', { expiredKeys: expiredKeys.length });
      }
    } catch (error) {
      logger.error('Cache cleanup error:', error);
    }
  }

  /**
   * Initialize cache service with periodic cleanup
   */
  static initialize(): void {
    logger.info('Cache service initialized (in-memory)');
    
    // Run cleanup every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }
}

/**
 * Cache key generators for consistent naming
 */
export const CacheKeys = {
  dashboard: {
    overview: () => 'dashboard:overview',
    characterStats: () => 'dashboard:character-stats',
  },
  characters: {
    list: (page: number, limit: number) => `characters:list:${page}:${limit}`,
    detail: (id: string) => `characters:detail:${id}`,
  },
  swimsuits: {
    list: (page: number, limit: number) => `swimsuits:list:${page}:${limit}`,
    detail: (id: string) => `swimsuits:detail:${id}`,
  },
  skills: {
    list: (page: number, limit: number) => `skills:list:${page}:${limit}`,
    detail: (id: string) => `skills:detail:${id}`,
  },
  items: {
    list: (page: number, limit: number, category?: string) => 
      `items:list:${page}:${limit}${category ? `:${category}` : ''}`,
    detail: (id: string) => `items:detail:${id}`,
  },
  bromides: {
    list: (page: number, limit: number) => `bromides:list:${page}:${limit}`,
    detail: (id: string) => `bromides:detail:${id}`,
  },
};

/**
 * Cache TTL constants (in seconds)
 */
export const CacheTTL = {
  SHORT: 60,        // 1 minute
  MEDIUM: 300,      // 5 minutes
  LONG: 1800,       // 30 minutes
  VERY_LONG: 3600,  // 1 hour
};
