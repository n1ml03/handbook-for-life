import { logger } from '../config';

/**
 * Query optimization utilities and recommendations
 */
export class QueryOptimizer {
  
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
      'CREATE INDEX idx_documents_published ON documents(is_published);',
      'CREATE INDEX idx_documents_search ON documents(title_en, unique_key);',
      
      // Update logs optimizations
      'CREATE INDEX idx_update_logs_published_date ON update_logs(is_published, date DESC);',
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
   * Log slow query analysis
   */
  static logSlowQuery(query: string, params: any[], executionTime: number): void {
    const suggestions = this.analyzeQueryPerformance(query, executionTime);
    
    logger.warn('Slow query detected', {
      query: query.substring(0, 200) + (query.length > 200 ? '...' : ''),
      executionTime,
      paramCount: params?.length || 0,
      suggestions
    });
  }
}

export default QueryOptimizer;
