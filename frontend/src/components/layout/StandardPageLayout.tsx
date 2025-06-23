import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/services/utils';
import { Search, Filter } from 'lucide-react';

export interface StandardPageLayoutProps {
  children: ReactNode;

  // Page header configuration
  title: string;
  subtitle?: string;
  icon?: ReactNode;

  // Layout options
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  spacing?: 'compact' | 'normal' | 'relaxed';

  // Header customization
  headerActions?: ReactNode;
  headerContent?: ReactNode;

  // Search and filter integration
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showFilters?: boolean;
  onFiltersToggle?: () => void;
  filtersExpanded?: boolean;
  filterCount?: number;

  // Animation options
  animateEntrance?: boolean;
  staggerChildren?: boolean;

  // Accessibility
  pageRole?: string;
  ariaLabel?: string;
  searchAriaLabel?: string;
  filtersAriaLabel?: string;

  // Custom styling
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  searchClassName?: string;
}

const containerSizes = {
  sm: 'modern-container-sm',
  md: 'modern-container',
  lg: 'modern-container-lg',
  xl: 'max-w-7xl mx-auto px-6',
  full: 'w-full px-4'
};

const spacingClasses = {
  compact: 'space-y-4',
  normal: 'space-y-6',
  relaxed: 'space-y-8'
};

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.4,
      delay: 0.2,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  }
};

export const StandardPageLayout = ({
  children,
  title,
  subtitle,
  icon,
  containerSize = 'lg',
  spacing = 'normal',
  headerActions,
  headerContent,
  showSearch = false,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  showFilters = false,
  onFiltersToggle,
  filtersExpanded = false,
  filterCount = 0,
  animateEntrance = true,
  staggerChildren = false,
  pageRole = 'main',
  ariaLabel,
  searchAriaLabel,
  filtersAriaLabel,
  className,
  headerClassName,
  contentClassName,
  searchClassName
}: StandardPageLayoutProps) => {
  const containerClass = containerSizes[containerSize];
  const spacingClass = spacingClasses[spacing];

  const PageWrapper = animateEntrance ? motion.div : 'div';
  const HeaderWrapper = animateEntrance ? motion.div : 'div';
  const ContentWrapper = animateEntrance ? motion.div : 'div';

  const pageProps = animateEntrance ? {
    variants: pageVariants,
    initial: "hidden",
    animate: "visible"
  } : {};

  const headerProps = animateEntrance ? {
    variants: headerVariants,
    initial: "hidden",
    animate: "visible"
  } : {};

  const contentProps = animateEntrance ? {
    variants: staggerChildren ? contentVariants : undefined,
    initial: "hidden",
    animate: "visible"
  } : {};

  return (
    <PageWrapper
      className={cn('modern-page', className)}
      role={pageRole}
      aria-label={ariaLabel || title}
      {...pageProps}
    >
      <div className={containerClass}>
        {/* Page Header */}
        <HeaderWrapper
          className={cn('modern-page-header', headerClassName)}
          {...headerProps}
        >
          {/* Icon and Title Section */}
          <div className="flex flex-col items-center text-center space-y-4">
            {icon && (
              <motion.div 
                className="p-4 rounded-2xl modern-glass"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {icon}
              </motion.div>
            )}
            
            <div className="space-y-2">
              <h1 className="modern-page-title">
                {title}
              </h1>
              {subtitle && (
                <p className="modern-page-subtitle">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Header Actions */}
          {headerActions && (
            <motion.div 
              className="flex justify-center mt-6"
              initial={animateEntrance ? { opacity: 0, y: 10 } : undefined}
              animate={animateEntrance ? { opacity: 1, y: 0 } : undefined}
              transition={animateEntrance ? { delay: 0.3 } : undefined}
            >
              {headerActions}
            </motion.div>
          )}

          {/* Unified Search and Filter Bar */}
          {(showSearch || showFilters) && (
            <motion.div
              className="mt-8"
              initial={animateEntrance ? { opacity: 0, y: 10 } : undefined}
              animate={animateEntrance ? { opacity: 1, y: 0 } : undefined}
              transition={animateEntrance ? { delay: 0.4 } : undefined}
            >
              <div className={cn(
                'flex flex-col lg:flex-row gap-4 items-stretch lg:items-center',
                'modern-glass rounded-2xl border border-border/30 p-6',
                'backdrop-blur-xl shadow-xl',
                searchClassName
              )}>
                {/* Search Bar */}
                {showSearch && (
                  <div className="relative flex-1">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={searchValue}
                      onChange={(e) => onSearchChange?.(e.target.value)}
                      className={cn(
                        'w-full pl-12 pr-4 py-3 text-base',
                        'modern-glass border-2 transition-all duration-300',
                        'border-border/30 hover:border-border/50',
                        'focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20',
                        'placeholder:text-muted-foreground',
                        'rounded-xl backdrop-blur-sm'
                      )}
                      placeholder={searchPlaceholder}
                      aria-label={searchAriaLabel || `Search ${title.toLowerCase()}`}
                      role="searchbox"
                    />
                  </div>
                )}

                {/* Filter Controls */}
                {showFilters && (
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <motion.button
                      onClick={onFiltersToggle}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'px-6 py-3 rounded-xl font-medium transition-all duration-200',
                        'flex items-center gap-2 min-h-[44px]',
                        filtersExpanded
                          ? 'bg-accent-cyan text-white shadow-lg border border-accent-cyan'
                          : 'modern-glass border border-border/30 hover:border-accent-cyan/50 text-foreground hover:text-accent-cyan'
                      )}
                      aria-label={filtersAriaLabel || `${filtersExpanded ? 'Hide' : 'Show'} filters`}
                      aria-expanded={filtersExpanded}
                      aria-controls="filter-panel"
                    >
                      <Filter className="w-4 h-4" />
                      <span>Filters</span>
                      {filterCount > 0 && (
                        <span className="w-2 h-2 bg-accent-pink rounded-full" aria-label={`${filterCount} active filters`} />
                      )}
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Additional Header Content */}
          {headerContent && (
            <motion.div
              className="mt-6"
              initial={animateEntrance ? { opacity: 0, y: 10 } : undefined}
              animate={animateEntrance ? { opacity: 1, y: 0 } : undefined}
              transition={animateEntrance ? { delay: 0.5 } : undefined}
            >
              {headerContent}
            </motion.div>
          )}
        </HeaderWrapper>

        {/* Page Content */}
        <ContentWrapper
          className={cn(spacingClass, contentClassName)}
          {...contentProps}
        >
          {children}
        </ContentWrapper>
      </div>
    </PageWrapper>
  );
};

// Convenience components for common page sections
export const PageSection = ({ 
  children, 
  className,
  title,
  subtitle,
  actions,
  ...props 
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  [key: string]: any;
}) => (
  <motion.section 
    className={cn('space-y-6', className)}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.5 }}
    {...props}
  >
    {(title || subtitle || actions) && (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          {title && (
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    )}
    {children}
  </motion.section>
);

export const PageCard = ({ 
  children, 
  className,
  hover = true,
  ...props 
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  [key: string]: any;
}) => (
  <motion.div 
    className={cn(
      'modern-card p-6',
      hover && 'modern-interactive',
      className
    )}
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
    {...props}
  >
    {children}
  </motion.div>
);

export default StandardPageLayout;
