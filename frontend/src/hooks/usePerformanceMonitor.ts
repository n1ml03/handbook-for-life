import { useCallback, useRef, useState, useEffect } from 'react';

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

interface PerformanceStats {
  totalOperations: number;
  averageDuration: number;
  successRate: number;
  slowestOperation: PerformanceMetric | null;
  fastestOperation: PerformanceMetric | null;
  recentOperations: PerformanceMetric[];
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const activeOperations = useRef<Map<string, number>>(new Map());

  // Start monitoring an operation
  const startOperation = useCallback((operationId: string, operationName: string) => {
    const startTime = performance.now();
    activeOperations.current.set(operationId, startTime);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 Started operation: ${operationName} (ID: ${operationId})`);
    }
    
    return operationId;
  }, []);

  // End monitoring an operation
  const endOperation = useCallback((
    operationId: string, 
    operationName: string, 
    success: boolean = true, 
    error?: string,
    metadata?: Record<string, any>
  ) => {
    const startTime = activeOperations.current.get(operationId);
    if (!startTime) {
      console.warn(`⚠️ No start time found for operation: ${operationName} (ID: ${operationId})`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    
    const metric: PerformanceMetric = {
      operation: operationName,
      duration,
      timestamp: Date.now(),
      success,
      error,
      metadata
    };

    setMetrics(prev => {
      const updated = [...prev, metric];
      // Keep only the last 100 metrics to prevent memory issues
      return updated.slice(-100);
    });

    activeOperations.current.delete(operationId);

    // Log performance in development
    if (process.env.NODE_ENV === 'development') {
      const emoji = success ? '✅' : '❌';
      const durationFormatted = duration.toFixed(2);
      console.log(`${emoji} Completed operation: ${operationName} in ${durationFormatted}ms`);
      
      // Warn about slow operations (>2 seconds)
      if (duration > 2000) {
        console.warn(`🐌 Slow operation detected: ${operationName} took ${durationFormatted}ms`);
      }
    }

    return metric;
  }, []);

  // Measure a function execution
  const measureOperation = useCallback(async <T>(
    operationName: string,
    operation: () => Promise<T> | T,
    metadata?: Record<string, any>
  ): Promise<T> => {
    const operationId = `${operationName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    startOperation(operationId, operationName);
    
    try {
      const result = await operation();
      endOperation(operationId, operationName, true, undefined, metadata);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      endOperation(operationId, operationName, false, errorMessage, metadata);
      throw error;
    }
  }, [startOperation, endOperation]);

  // Calculate performance statistics
  const getStats = useCallback((): PerformanceStats => {
    if (metrics.length === 0) {
      return {
        totalOperations: 0,
        averageDuration: 0,
        successRate: 0,
        slowestOperation: null,
        fastestOperation: null,
        recentOperations: []
      };
    }

    const successfulOperations = metrics.filter(m => m.success);
    const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
    const sortedByDuration = [...metrics].sort((a, b) => a.duration - b.duration);

    return {
      totalOperations: metrics.length,
      averageDuration: totalDuration / metrics.length,
      successRate: (successfulOperations.length / metrics.length) * 100,
      slowestOperation: sortedByDuration[sortedByDuration.length - 1] || null,
      fastestOperation: sortedByDuration[0] || null,
      recentOperations: metrics.slice(-10).reverse() // Last 10 operations, most recent first
    };
  }, [metrics]);

  // Get metrics for a specific operation type
  const getOperationMetrics = useCallback((operationName: string) => {
    return metrics.filter(m => m.operation === operationName);
  }, [metrics]);

  // Clear all metrics
  const clearMetrics = useCallback(() => {
    setMetrics([]);
    activeOperations.current.clear();
  }, []);

  // Toggle monitoring
  const toggleMonitoring = useCallback(() => {
    setIsMonitoring(prev => !prev);
  }, []);

  // Enhanced performance monitoring effect with scroll tracking
  useEffect(() => {
    if (!isMonitoring) return;

    // Monitor page performance
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'measure' || entry.entryType === 'navigation') {
          console.log(`📊 Performance entry: ${entry.name} - ${entry.duration?.toFixed(2)}ms`);
        }

        // Monitor layout shifts that can cause scroll jank
        if (entry.entryType === 'layout-shift') {
          const layoutShift = entry as any;
          if (layoutShift.value > 0.1) {
            console.warn(`⚠️ Layout shift detected: ${layoutShift.value.toFixed(4)} - ${layoutShift.sources?.[0]?.node || 'Unknown element'}`);
          }
        }

        // Monitor long tasks that can block scrolling
        if (entry.entryType === 'longtask') {
          console.warn(`🐌 Long task detected: ${entry.duration.toFixed(2)}ms`);
        }
      });
    });

    // Observe multiple entry types for comprehensive monitoring
    try {
      observer.observe({ entryTypes: ['measure', 'navigation', 'layout-shift', 'longtask'] });
    } catch (e) {
      // Fallback for browsers that don't support all entry types
      observer.observe({ entryTypes: ['measure', 'navigation'] });
    }

    // Scroll performance monitoring
    let scrollStartTime = 0;
    let scrollEndTimeout: NodeJS.Timeout;
    let frameCount = 0;
    let lastFrameTime = performance.now();

    const handleScrollStart = () => {
      scrollStartTime = performance.now();
      frameCount = 0;
      lastFrameTime = scrollStartTime;
    };

    const handleScrollEnd = () => {
      const scrollDuration = performance.now() - scrollStartTime;
      const fps = frameCount > 0 ? (frameCount / (scrollDuration / 1000)) : 0;

      if (fps < 30) {
        console.warn(`🎯 Scroll performance warning: ${fps.toFixed(1)} FPS during ${scrollDuration.toFixed(2)}ms scroll`);
      } else {
        console.log(`✅ Scroll performance: ${fps.toFixed(1)} FPS during ${scrollDuration.toFixed(2)}ms scroll`);
      }
    };

    const handleScroll = () => {
      if (scrollStartTime === 0) {
        handleScrollStart();
      }

      // Count frames during scroll
      const now = performance.now();
      if (now - lastFrameTime >= 16.67) { // ~60fps threshold
        frameCount++;
        lastFrameTime = now;
      }

      // Reset timeout for scroll end detection
      clearTimeout(scrollEndTimeout);
      scrollEndTimeout = setTimeout(() => {
        handleScrollEnd();
        scrollStartTime = 0;
      }, 150);
    };

    // Add scroll listener with passive option for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollEndTimeout);
    };
  }, [isMonitoring]);

  // Auto-clear old metrics periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        return prev.filter(m => m.timestamp > oneHourAgo);
      });
    }, 5 * 60 * 1000); // Clean up every 5 minutes

    return () => clearInterval(interval);
  }, []);

  // Scroll performance utilities
  const measureScrollPerformance = useCallback((elementId?: string) => {
    const element = elementId ? document.getElementById(elementId) : window;
    if (!element) return;

    let isScrolling = false;
    let scrollStartTime = 0;
    let frameCount = 0;

    const handleScrollStart = () => {
      if (!isScrolling) {
        isScrolling = true;
        scrollStartTime = performance.now();
        frameCount = 0;
        performance.mark('scroll-start');
      }
    };

    const handleScrollEnd = () => {
      if (isScrolling) {
        isScrolling = false;
        performance.mark('scroll-end');
        performance.measure('scroll-duration', 'scroll-start', 'scroll-end');

        const scrollDuration = performance.now() - scrollStartTime;
        const fps = frameCount > 0 ? (frameCount / (scrollDuration / 1000)) : 0;

        console.log(`📊 Scroll Performance - Duration: ${scrollDuration.toFixed(2)}ms, FPS: ${fps.toFixed(1)}`);
      }
    };

    const handleScroll = () => {
      handleScrollStart();
      frameCount++;

      // Debounce scroll end detection
      clearTimeout((handleScroll as any).timeout);
      (handleScroll as any).timeout = setTimeout(handleScrollEnd, 100);
    };

    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
      clearTimeout((handleScroll as any).timeout);
    };
  }, []);

  return {
    // Core functions
    startOperation,
    endOperation,
    measureOperation,

    // Data access
    metrics,
    getStats,
    getOperationMetrics,

    // Controls
    clearMetrics,
    isMonitoring,
    toggleMonitoring,

    // Scroll performance
    measureScrollPerformance,

    // Computed values
    stats: getStats()
  };
}

// Helper hook for measuring React component render performance
export function useRenderPerformance(componentName: string) {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(0);

  useEffect(() => {
    renderCount.current += 1;
    const now = performance.now();
    
    if (lastRenderTime.current > 0) {
      const timeSinceLastRender = now - lastRenderTime.current;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 ${componentName} render #${renderCount.current} (${timeSinceLastRender.toFixed(2)}ms since last render)`);
        
        // Warn about frequent re-renders
        if (timeSinceLastRender < 16) { // Less than one frame (60fps)
          console.warn(`⚡ Frequent re-render detected in ${componentName}`);
        }
      }
    }
    
    lastRenderTime.current = now;
  });

  return {
    renderCount: renderCount.current
  };
}

export default usePerformanceMonitor;
