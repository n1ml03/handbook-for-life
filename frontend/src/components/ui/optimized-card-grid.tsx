import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/services/utils';

interface OptimizedCardGridProps<T> {
  items: T[];
  renderCard: (item: T, index: number) => React.ReactNode;
  className?: string;
  itemsPerPage?: number;
  enableVirtualization?: boolean;
  enableLazyLoading?: boolean;
  gridCols?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  animationDelay?: number;
  enableAnimations?: boolean;
}

// Optimized card grid with virtual scrolling and lazy loading
export function OptimizedCardGrid<T extends { id: string | number }>({
  items,
  renderCard,
  className,
  itemsPerPage = 20,
  enableLazyLoading = true,
  gridCols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  animationDelay = 0.02,
  enableAnimations = true
}: OptimizedCardGridProps<T>) {
  const [visibleItems, setVisibleItems] = useState<T[]>([]);
  const [loadedCount, setLoadedCount] = useState(itemsPerPage);
  const [isLoading, setIsLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Memoize grid classes for performance
  const gridClasses = useMemo(() => {
    const gapClasses = {
      sm: 'gap-2',
      md: 'gap-3 md:gap-4',
      lg: 'gap-4 md:gap-5'
    };

    const colClasses = {
      mobile: `grid-cols-${gridCols.mobile}`,
      tablet: `md:grid-cols-${gridCols.tablet}`,
      desktop: `lg:grid-cols-${gridCols.desktop}`
    };

    return cn(
      'grid',
      gapClasses[gap],
      colClasses.mobile,
      colClasses.tablet,
      colClasses.desktop,
      className
    );
  }, [gap, gridCols, className]);

  // Initialize visible items
  useEffect(() => {
    if (enableLazyLoading) {
      setVisibleItems(items.slice(0, loadedCount));
    } else {
      setVisibleItems(items);
    }
  }, [items, loadedCount, enableLazyLoading]);

  // Enhanced lazy loading with intersection observer
  useEffect(() => {
    if (!enableLazyLoading || !loadMoreRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoading && loadedCount < items.length) {
          setIsLoading(true);

          // Use requestAnimationFrame for better performance
          requestAnimationFrame(() => {
            // Batch update for better performance
            const nextCount = Math.min(loadedCount + itemsPerPage, items.length);
            setLoadedCount(nextCount);
            setIsLoading(false);
          });
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px' // Start loading earlier for smoother experience
      }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enableLazyLoading, isLoading, loadedCount, items.length, itemsPerPage]);

  // Optimized card renderer with memoization
  const renderOptimizedCard = useCallback((item: T, index: number) => {
    if (!enableAnimations) {
      return (
        <div key={item.id} className="w-full">
          {renderCard(item, index)}
        </div>
      );
    }

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: Math.min(index * animationDelay, 0.1),
          duration: 0.15,
          ease: "easeOut"
        }}
        className="w-full"
      >
        {renderCard(item, index)}
      </motion.div>
    );
  }, [renderCard, enableAnimations, animationDelay]);

  return (
    <div className="w-full scroll-optimized">
      <div className={cn(gridClasses, 'scroll-container')}>
        {visibleItems.map((item, index) => renderOptimizedCard(item, index))}
      </div>

      {/* Enhanced lazy loading trigger */}
      {enableLazyLoading && loadedCount < items.length && (
        <div ref={loadMoreRef} className="lazy-load-trigger w-full py-8 flex justify-center">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-4 h-4 border-2 border-muted border-t-accent-cyan rounded-full animate-spin" />
              <span>Loading more content...</span>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground/60">Scroll to load more</div>
          )}
        </div>
      )}
    </div>
  );
}

// Enhanced card wrapper for better scroll performance
export const OptimizedCard = React.memo<{
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}>(({ children, className, onClick, hover = true }) => {
  const cardClasses = useMemo(() => cn(
    'bg-card/95 backdrop-blur-sm border border-border/50 rounded-lg',
    'transition-all duration-200 ease-out',
    'scroll-optimized content-container', // Add scroll optimization classes
    hover ? 'hover:border-border hover:shadow-lg hover:bg-card' : '',
    onClick ? 'cursor-pointer' : '',
    className
  ), [className, hover, onClick]);

  if (onClick) {
    return (
      <div onClick={onClick} className={cardClasses}>
        {children}
      </div>
    );
  }

  return (
    <div className={cardClasses}>
      {children}
    </div>
  );
});

OptimizedCard.displayName = 'OptimizedCard';

// Performance-optimized pagination component
export const OptimizedPagination = React.memo<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}>(({ currentPage, totalPages, onPageChange, className }) => {
  const pages = useMemo(() => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      {pages.map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...' || page === currentPage}
          className={cn(
            'px-3 py-1.5 text-sm rounded-md transition-colors duration-150',
            page === currentPage
              ? 'bg-accent-cyan text-white'
              : typeof page === 'number'
              ? 'text-gray-400 hover:text-white hover:bg-white/10'
              : 'text-gray-600 cursor-default'
          )}
        >
          {page}
        </button>
      ))}
    </div>
  );
});

OptimizedPagination.displayName = 'OptimizedPagination';

export default OptimizedCardGrid;
