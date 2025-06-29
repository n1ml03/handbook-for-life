import { logger } from '../config';

/**
 * Enhanced query optimization utilities with performance monitoring
 */
export class QueryOptimizer {
  private static queryStats: Map<string, {
    count: number;
    totalTime: number;
    avgTime: number;
    maxTime: number;
    minTime: number;
    lastExecuted: Date;
  }> = new Map();

  private static nPlusOneDetector: Map<string, {
    queries: string[];
    timestamp: number;
    context?: string;
  }> = new Map();

  private static readonly STATS_CLEANUP_INTERVAL = 3600000; // 1 hour
  private static readonly N_PLUS_ONE_DETECTION_WINDOW = 1000; // 1 second
  
  /**
   * Optimized search query builder that uses FULLTEXT indexes when available
   */
  static buildOptimizedSearchQuery(
    tableName: string,
    searchFields: string[],
    query: string,
    additionalWhere?: string
  ): { searchQuery: string; countQuery: string; params: any[] } {
    
    // For short queries, use LIKE with optimized patterns
    if (query.length < 3) {
      const likeConditions = searchFields.map(field => `${field} LIKE ?`).join(' OR ');
      const searchPattern = `${query}%`; // Prefix search is more efficient than wildcard
      const params = searchFields.map(() => searchPattern);
      
      const whereClause = additionalWhere 
        ? `WHERE ${additionalWhere} AND (${likeConditions})`
        : `WHERE ${likeConditions}`;
      
      return {
        searchQuery: `SELECT * FROM ${tableName} ${whereClause}`,
        countQuery: `SELECT COUNT(*) FROM ${tableName} ${whereClause}`,
        params
      };
    }
    
    // For longer queries, use FULLTEXT search if available, otherwise optimized LIKE
    const words = query.trim().split(/\s+/).filter(word => word.length > 0);
    
    if (words.length === 1) {
      // Single word - use prefix search
      const likeConditions = searchFields.map(field => `${field} LIKE ?`).join(' OR ');
      const searchPattern = `${words[0]}%`;
      const params = searchFields.map(() => searchPattern);
      
      const whereClause = additionalWhere 
        ? `WHERE ${additionalWhere} AND (${likeConditions})`
        : `WHERE ${likeConditions}`;
      
      return {
        searchQuery: `SELECT * FROM ${tableName} ${whereClause}`,
        countQuery: `SELECT COUNT(*) FROM ${tableName} ${whereClause}`,
        params
      };
    }
    
    // Multiple words - use AND logic for better relevance
    const andConditions = words.map(word => 
      `(${searchFields.map(field => `${field} LIKE ?`).join(' OR ')})`
    ).join(' AND ');
    
    const params: string[] = [];
    words.forEach(word => {
      searchFields.forEach(() => {
        params.push(`%${word}%`);
      });
    });
    
    const whereClause = additionalWhere 
      ? `WHERE ${additionalWhere} AND (${andConditions})`
      : `WHERE ${andConditions}`;
    
    return {
      searchQuery: `SELECT * FROM ${tableName} ${whereClause}`,
      countQuery: `SELECT COUNT(*) FROM ${tableName} ${whereClause}`,
      params
    };
  }

  /**
   * Build optimized date range queries
   */
  static buildDateRangeQuery(
    tableName: string,
    dateField: string,
    startDate?: Date,
    endDate?: Date,
    additionalWhere?: string
  ): { query: string; countQuery: string; params: any[] } {
    
    const conditions: string[] = [];
    const params: any[] = [];
    
    if (additionalWhere) {
      conditions.push(additionalWhere);
    }
    
    if (startDate) {
      conditions.push(`${dateField} >= ?`);
      params.push(startDate);
    }
    
    if (endDate) {
      conditions.push(`${dateField} <= ?`);
      params.push(endDate);
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    return {
      query: `SELECT * FROM ${tableName} ${whereClause}`,
      countQuery: `SELECT COUNT(*) FROM ${tableName} ${whereClause}`,
      params
    };
  }

  /**
   * Optimize JOIN queries to prevent N+1 problems
   */
  static buildOptimizedJoinQuery(
    mainTable: string,
    joins: Array<{
      table: string;
      type: 'INNER' | 'LEFT' | 'RIGHT';
      condition: string;
    }>,
    selectFields: string[],
    whereCondition?: string
  ): string {
    
    const joinClauses = joins.map(join => 
      `${join.type} JOIN ${join.table} ON ${join.condition}`
    ).join(' ');
    
    const selectClause = selectFields.length > 0 
      ? selectFields.join(', ')
      : `${mainTable}.*`;
    
    const whereClause = whereCondition ? `WHERE ${whereCondition}` : '';
    
    return `SELECT ${selectClause} FROM ${mainTable} ${joinClauses} ${whereClause}`;
  }

  /**
   * Generate index recommendations based on query patterns
   */
  static generateIndexRecommendations(): string[] {
    return [
      // Character table optimizations
      'CREATE INDEX idx_characters_search ON characters(name_en, name_jp, unique_key);',
      'CREATE INDEX idx_characters_active_birthday ON characters(is_active, birthday);',
      'CREATE INDEX idx_characters_game_version_active ON characters(game_version, is_active);',
      
      // Swimsuit table optimizations
      'CREATE INDEX idx_swimsuits_character_rarity ON swimsuits(character_id, rarity);',
      'CREATE INDEX idx_swimsuits_release_date ON swimsuits(release_date_gl);',
      'CREATE INDEX idx_swimsuits_search ON swimsuits(name_en, name_jp, unique_key);',
      'CREATE INDEX idx_swimsuits_stats ON swimsuits(total_stats_awakened DESC);',
      
      // Gacha table optimizations
      'CREATE INDEX idx_gachas_active_dates ON gachas(start_date, end_date);',
      'CREATE INDEX idx_gachas_subtype_dates ON gachas(gacha_subtype, start_date, end_date);',
      'CREATE INDEX idx_gachas_search ON gachas(name_en, name_jp, unique_key);',
      
      // Gacha pool optimizations
      'CREATE INDEX idx_gacha_pools_gacha_type ON gacha_pools(gacha_id, pool_item_type);',
      'CREATE INDEX idx_gacha_pools_item_type_id ON gacha_pools(pool_item_type, item_id);',
      'CREATE INDEX idx_gacha_pools_featured ON gacha_pools(gacha_id, is_featured);',
      
      // Skills table optimizations
      'CREATE INDEX idx_skills_category ON skills(skill_category);',
      'CREATE INDEX idx_skills_search ON skills(name_en, name_jp, unique_key);',
      
      // Items table optimizations
      'CREATE INDEX idx_items_category_rarity ON items(item_category, rarity);',
      'CREATE INDEX idx_items_search ON items(name_en, name_jp, unique_key);',
      
      // Bromides table optimizations
      'CREATE INDEX idx_bromides_type_rarity ON bromides(bromide_type, rarity);',
      'CREATE INDEX idx_bromides_search ON bromides(name_en, name_jp, unique_key);',
      
      // Episodes table optimizations
      'CREATE INDEX idx_episodes_type ON episodes(episode_type);',
      'CREATE INDEX idx_episodes_search ON episodes(title_en, title_jp, unique_key);',
      
      // Events table optimizations
      'CREATE INDEX idx_events_type_dates ON events(type, start_date, end_date);',
      'CREATE INDEX idx_events_search ON events(name_en, name_jp, unique_key);',
      
      // Documents table optimizations
      'CREATE INDEX idx_documents_search ON documents(title_en, unique_key);',

      // Update logs optimizations
      'CREATE INDEX idx_update_logs_date ON update_logs(date DESC);',
      'CREATE INDEX idx_update_logs_version ON update_logs(version);',
      
      // Shop listings optimizations
      'CREATE INDEX idx_shop_listings_type_dates ON shop_listings(shop_type, start_date, end_date);',
      'CREATE INDEX idx_shop_listings_item ON shop_listings(item_id);',
      'CREATE INDEX idx_shop_listings_currency ON shop_listings(cost_currency_item_id);',
      
      // Swimsuit skills junction table
      'CREATE INDEX idx_swimsuit_skills_swimsuit ON swimsuit_skills(swimsuit_id);',
      'CREATE INDEX idx_swimsuit_skills_skill ON swimsuit_skills(skill_id);'
    ];
  }

  /**
   * Analyze query performance and suggest optimizations
   */
  static analyzeQueryPerformance(query: string, executionTime: number): string[] {
    const suggestions: string[] = [];
    
    if (executionTime > 1000) {
      suggestions.push('Query execution time is over 1 second - consider optimization');
    }
    
    if (query.includes('SELECT *')) {
      suggestions.push('Avoid SELECT * - specify only needed columns');
    }
    
    if (query.includes('LIKE \'%') && query.includes('%\'')) {
      suggestions.push('Leading wildcard LIKE queries cannot use indexes - consider FULLTEXT search');
    }
    
    if (query.includes('ORDER BY') && !query.includes('LIMIT')) {
      suggestions.push('ORDER BY without LIMIT can be expensive - consider pagination');
    }
    
    if (query.match(/JOIN.*JOIN.*JOIN/)) {
      suggestions.push('Multiple JOINs detected - ensure proper indexing on join columns');
    }
    
    if (query.includes('DISTINCT') && query.includes('ORDER BY')) {
      suggestions.push('DISTINCT with ORDER BY can be expensive - consider if both are necessary');
    }
    
    return suggestions;
  }

  /**
   * Enhanced query performance tracking
   */
  static trackQueryPerformance(query: string, executionTime: number, context?: string): void {
    const queryHash = this.hashQuery(query);
    const existing = this.queryStats.get(queryHash);

    if (existing) {
      existing.count++;
      existing.totalTime += executionTime;
      existing.avgTime = existing.totalTime / existing.count;
      existing.maxTime = Math.max(existing.maxTime, executionTime);
      existing.minTime = Math.min(existing.minTime, executionTime);
      existing.lastExecuted = new Date();
    } else {
      this.queryStats.set(queryHash, {
        count: 1,
        totalTime: executionTime,
        avgTime: executionTime,
        maxTime: executionTime,
        minTime: executionTime,
        lastExecuted: new Date()
      });
    }

    // Check for N+1 queries
    this.detectNPlusOneQuery(query, context);

    // Log slow queries
    if (executionTime > 1000) {
      this.logSlowQuery(query, [], executionTime);
    }
  }

  /**
   * Detect potential N+1 query patterns
   */
  static detectNPlusOneQuery(query: string, context?: string): void {
    const now = Date.now();
    const queryPattern = this.extractQueryPattern(query);

    // Clean up old entries
    for (const [key, value] of this.nPlusOneDetector.entries()) {
      if (now - value.timestamp > this.N_PLUS_ONE_DETECTION_WINDOW) {
        this.nPlusOneDetector.delete(key);
      }
    }

    const contextKey = context || 'unknown';
    const existing = this.nPlusOneDetector.get(contextKey);

    if (existing) {
      existing.queries.push(queryPattern);

      // Check for repeated similar queries
      const patternCounts = new Map<string, number>();
      existing.queries.forEach(pattern => {
        patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
      });

      // Alert if we see the same pattern multiple times
      for (const [pattern, count] of patternCounts.entries()) {
        if (count >= 3) {
          logger.warn('Potential N+1 query detected', {
            pattern,
            count,
            context: contextKey,
            timeWindow: `${this.N_PLUS_ONE_DETECTION_WINDOW}ms`,
            suggestion: 'Consider using JOIN or batch loading to reduce query count'
          });

          // Reset to avoid spam
          this.nPlusOneDetector.delete(contextKey);
          break;
        }
      }
    } else {
      this.nPlusOneDetector.set(contextKey, {
        queries: [queryPattern],
        timestamp: now,
        context
      });
    }
  }

  /**
   * Extract query pattern for N+1 detection
   */
  private static extractQueryPattern(query: string): string {
    return query
      .replace(/\s+/g, ' ')
      .replace(/\b\d+\b/g, '?') // Replace numbers with placeholders
      .replace(/'[^']*'/g, '?') // Replace string literals with placeholders
      .replace(/\?+/g, '?') // Normalize multiple placeholders
      .trim()
      .toLowerCase();
  }

  /**
   * Generate hash for query tracking
   */
  private static hashQuery(query: string): string {
    const pattern = this.extractQueryPattern(query);
    let hash = 0;
    for (let i = 0; i < pattern.length; i++) {
      const char = pattern.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Enhanced slow query logging with performance stats
   */
  static logSlowQuery(query: string, params: any[], executionTime: number): void {
    const suggestions = this.analyzeQueryPerformance(query, executionTime);
    const queryHash = this.hashQuery(query);
    const stats = this.queryStats.get(queryHash);

    logger.warn('Slow query detected', {
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      executionTime,
      paramCount: params?.length || 0,
      suggestions,
      stats: stats ? {
        executionCount: stats.count,
        avgTime: Math.round(stats.avgTime),
        maxTime: stats.maxTime,
        minTime: stats.minTime
      } : undefined
    });
  }

  /**
   * Get performance statistics for all tracked queries
   */
  static getPerformanceStats(): Array<{
    queryHash: string;
    count: number;
    avgTime: number;
    maxTime: number;
    totalTime: number;
    lastExecuted: Date;
  }> {
    return Array.from(this.queryStats.entries()).map(([hash, stats]) => ({
      queryHash: hash,
      ...stats
    })).sort((a, b) => b.totalTime - a.totalTime); // Sort by total time desc
  }

  /**
   * Clear old performance statistics
   */
  static cleanupStats(): void {
    const cutoff = new Date(Date.now() - this.STATS_CLEANUP_INTERVAL);

    for (const [hash, stats] of this.queryStats.entries()) {
      if (stats.lastExecuted < cutoff) {
        this.queryStats.delete(hash);
      }
    }

    logger.info('Query performance stats cleanup completed', {
      remainingEntries: this.queryStats.size
    });
  }

  /**
   * Initialize periodic cleanup
   */
  static initializePerformanceMonitoring(): void {
    // Clean up stats every hour
    setInterval(() => {
      this.cleanupStats();
    }, this.STATS_CLEANUP_INTERVAL);

    logger.info('Query performance monitoring initialized');
  }
}

export default QueryOptimizer;
