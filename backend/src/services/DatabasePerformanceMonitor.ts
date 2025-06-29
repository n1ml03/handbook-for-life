import { logger } from '../config';
import { getPoolStats, getConnectionStatus } from '../config/database';
import { QueryOptimizer } from './QueryOptimizer';

/**
 * Database performance monitoring service
 */
export class DatabasePerformanceMonitor {
  private static instance: DatabasePerformanceMonitor;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private performanceHistory: Array<{
    timestamp: Date;
    connectionStats: any;
    queryStats: any;
    systemMetrics: any;
  }> = [];

  private readonly MAX_HISTORY_SIZE = 1000;
  private readonly MONITORING_INTERVAL = 60000; // 1 minute

  private constructor() {}

  static getInstance(): DatabasePerformanceMonitor {
    if (!DatabasePerformanceMonitor.instance) {
      DatabasePerformanceMonitor.instance = new DatabasePerformanceMonitor();
    }
    return DatabasePerformanceMonitor.instance;
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(): void {
    if (this.monitoringInterval) {
      logger.warn('Database performance monitoring is already running');
      return;
    }

    logger.info('Starting database performance monitoring');

    this.monitoringInterval = setInterval(() => {
      this.collectPerformanceMetrics();
    }, this.MONITORING_INTERVAL);

    // Initialize query optimizer monitoring
    QueryOptimizer.initializePerformanceMonitoring();
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info('Database performance monitoring stopped');
    }
  }

  /**
   * Collect current performance metrics
   */
  private collectPerformanceMetrics(): void {
    try {
      const connectionStats = getPoolStats();
      const connectionStatus = getConnectionStatus();
      const queryStats = QueryOptimizer.getPerformanceStats();
      const systemMetrics = this.getSystemMetrics();

      const metrics = {
        timestamp: new Date(),
        connectionStats,
        connectionStatus,
        queryStats: {
          totalQueries: queryStats.length,
          slowQueries: queryStats.filter(q => q.avgTime > 1000).length,
          topSlowQueries: queryStats.slice(0, 5)
        },
        systemMetrics
      };

      this.performanceHistory.push(metrics);

      // Trim history if it gets too large
      if (this.performanceHistory.length > this.MAX_HISTORY_SIZE) {
        this.performanceHistory = this.performanceHistory.slice(-this.MAX_HISTORY_SIZE);
      }

      // Log warnings for performance issues
      this.checkPerformanceThresholds(metrics);

    } catch (error) {
      logger.error('Error collecting performance metrics:', error);
    }
  }

  /**
   * Get basic system metrics
   */
  private getSystemMetrics(): any {
    const memUsage = process.memoryUsage();
    return {
      memoryUsage: {
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024) // MB
      },
      uptime: Math.round(process.uptime()),
      cpuUsage: process.cpuUsage()
    };
  }

  /**
   * Check performance thresholds and log warnings
   */
  private checkPerformanceThresholds(metrics: any): void {
    const { connectionStats, queryStats, systemMetrics } = metrics;

    // Check connection pool usage
    const connectionUsage = connectionStats.totalConnections > 0 
      ? connectionStats.acquiredConnections / connectionStats.totalConnections 
      : 0;

    if (connectionUsage > 0.9) {
      logger.warn('High database connection usage detected', {
        usage: Math.round(connectionUsage * 100) + '%',
        acquired: connectionStats.acquiredConnections,
        total: connectionStats.totalConnections
      });
    }

    // Check for connection queue buildup
    if (connectionStats.queuedConnections > 10) {
      logger.warn('Database connection queue buildup detected', {
        queuedConnections: connectionStats.queuedConnections
      });
    }

    // Check for slow queries
    if (queryStats.slowQueries > 0) {
      logger.warn('Slow queries detected in monitoring period', {
        slowQueryCount: queryStats.slowQueries,
        totalQueries: queryStats.totalQueries
      });
    }

    // Check memory usage
    if (systemMetrics.memoryUsage.heapUsed > 500) { // 500MB threshold
      logger.warn('High memory usage detected', {
        heapUsed: systemMetrics.memoryUsage.heapUsed + 'MB',
        heapTotal: systemMetrics.memoryUsage.heapTotal + 'MB'
      });
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    currentMetrics: any;
    trends: any;
    recommendations: string[];
  } {
    const latest = this.performanceHistory[this.performanceHistory.length - 1];
    const recommendations: string[] = [];

    if (!latest) {
      return {
        currentMetrics: null,
        trends: null,
        recommendations: ['No performance data available yet']
      };
    }

    // Generate recommendations based on current metrics
    const connectionUsage = latest.connectionStats.totalConnections > 0 
      ? latest.connectionStats.acquiredConnections / latest.connectionStats.totalConnections 
      : 0;

    if (connectionUsage > 0.8) {
      recommendations.push('Consider increasing database connection pool size');
    }

    if (latest.queryStats.slowQueries > 0) {
      recommendations.push('Optimize slow queries - check query execution plans');
    }

    if (latest.systemMetrics.memoryUsage.heapUsed > 400) {
      recommendations.push('Monitor memory usage - consider implementing query result caching');
    }

    // Calculate trends if we have enough history
    const trends = this.calculateTrends();

    return {
      currentMetrics: latest,
      trends,
      recommendations
    };
  }

  /**
   * Calculate performance trends
   */
  private calculateTrends(): any {
    if (this.performanceHistory.length < 10) {
      return null;
    }

    const recent = this.performanceHistory.slice(-10);
    const older = this.performanceHistory.slice(-20, -10);

    if (older.length === 0) {
      return null;
    }

    const recentAvgConnections = recent.reduce((sum, m) => 
      sum + m.connectionStats.acquiredConnections, 0) / recent.length;
    const olderAvgConnections = older.reduce((sum, m) => 
      sum + m.connectionStats.acquiredConnections, 0) / older.length;

    const recentAvgMemory = recent.reduce((sum, m) => 
      sum + m.systemMetrics.memoryUsage.heapUsed, 0) / recent.length;
    const olderAvgMemory = older.reduce((sum, m) => 
      sum + m.systemMetrics.memoryUsage.heapUsed, 0) / older.length;

    return {
      connectionUsageTrend: recentAvgConnections - olderAvgConnections,
      memoryUsageTrend: recentAvgMemory - olderAvgMemory,
      dataPoints: recent.length
    };
  }

  /**
   * Get detailed performance history
   */
  getPerformanceHistory(limit: number = 100): any[] {
    return this.performanceHistory.slice(-limit);
  }

  /**
   * Clear performance history
   */
  clearHistory(): void {
    this.performanceHistory = [];
    logger.info('Performance history cleared');
  }
}

export default DatabasePerformanceMonitor;
