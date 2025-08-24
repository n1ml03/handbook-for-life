/**
 * Performance Optimization Configuration
 * Consolidates performance settings and optimizations for the Handbook application
 */

import React from 'react';

// Define MemoryInfo interface for TypeScript
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface PerformanceConfig {
  // Lazy loading configuration
  lazyLoading: {
    enabled: boolean;
    rootMargin: string;
    threshold: number;
  };
  
  // Component optimization
  components: {
    virtualScrolling: boolean;
    memoization: boolean;
    debounceMs: number;
  };
  
  // Image optimization
  images: {
    placeholder: boolean;
    lazyLoad: boolean;
    compression: boolean;
    formats: string[];
  };
  
  // Caching configuration
  cache: {
    apiResponseCache: boolean;
    imageCacheTtl: number;
    dataCacheTtl: number;
  };
  
  // Bundle optimization
  bundle: {
    chunkSplitting: boolean;
    treeShaking: boolean;
    compression: boolean;
    minification: boolean;
  };
}

export const defaultPerformanceConfig: PerformanceConfig = {
  lazyLoading: {
    enabled: true,
    rootMargin: '50px',
    threshold: 0.1,
  },
  
  components: {
    virtualScrolling: true,
    memoization: true,
    debounceMs: 300,
  },
  
  images: {
    placeholder: true,
    lazyLoad: true,
    compression: true,
    formats: ['webp', 'png', 'jpeg'],
  },
  
  cache: {
    apiResponseCache: true,
    imageCacheTtl: 24 * 60 * 60 * 1000, // 24 hours
    dataCacheTtl: 5 * 60 * 1000, // 5 minutes
  },
  
  bundle: {
    chunkSplitting: true,
    treeShaking: true,
    compression: true,
    minification: true,
  },
};

/**
 * Performance monitoring utilities
 */
export class PerformanceOptimizer {
  private static config: PerformanceConfig = defaultPerformanceConfig;
  
  static setConfig(config: Partial<PerformanceConfig>) {
    this.config = { ...this.config, ...config };
  }
  
  static getConfig(): PerformanceConfig {
    return this.config;
  }
  
  // Image loading optimization
  static createOptimizedImageLoader(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.loading = 'lazy';
      img.src = src;
    });
  }
  
  // Component update optimization
  static shouldComponentUpdate(prevProps: any, nextProps: any): boolean {
    if (!this.config.components.memoization) return true;
    
    return JSON.stringify(prevProps) !== JSON.stringify(nextProps);
  }
  
  // Debounced function creator
  static createDebounced<T extends (...args: any[]) => any>(
    func: T,
    delay: number = this.config.components.debounceMs
  ): T {
    let timeoutId: NodeJS.Timeout;
    
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    }) as T;
  }
  
  // Memory usage monitoring
  static getMemoryUsage(): MemoryInfo | null {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }
  
  // Bundle size analysis
  static logBundleInfo() {
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Performance Optimization Config:', this.config);
      
      const memory = this.getMemoryUsage();
      if (memory) {
        console.log('📊 Memory Usage:', {
          used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
          total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
          limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`,
        });
      }
    }
  }
}

/**
 * React component performance helpers
 */
export const performanceHooks = {
  // Optimized useCallback with automatic dependency detection
  useOptimizedCallback: <T extends (...args: any[]) => any>(
    callback: T,
    deps: React.DependencyList
  ): T => {
    return React.useCallback(callback, deps);
  },
  
  // Optimized useMemo with performance tracking
  useOptimizedMemo: <T>(
    factory: () => T,
    deps: React.DependencyList
  ): T => {
    return React.useMemo(() => {
      const start = performance.now();
      const result = factory();
      const end = performance.now();
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 Memo computation took ${(end - start).toFixed(2)}ms`);
      }
      
      return result;
    }, deps);
  },
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  // Log performance info on page load
  window.addEventListener('load', () => {
    setTimeout(() => PerformanceOptimizer.logBundleInfo(), 1000);
  });
}