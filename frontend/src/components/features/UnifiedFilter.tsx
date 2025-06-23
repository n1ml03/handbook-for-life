import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronRight, SortAsc, Zap, X, Search } from 'lucide-react';
import { cn } from '@/services/utils';

// Base types for the filter system
export type SortDirection = 'asc' | 'desc';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'checkbox' | 'range';
  placeholder?: string;
  options?: FilterOption[];
  min?: number;
  max?: number;
  icon?: React.ReactNode;
  color?: string;
  gridCols?: number; // For responsive layout
  required?: boolean;
  disabled?: boolean;
}

export interface SortOption {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export interface UnifiedFilterProps {
  // Filter state
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;

  // Filter configuration
  filterFields: FilterField[];
  sortOptions: SortOption[];

  // Filter values and handlers
  filterValues: Record<string, string | number | boolean>;
  onFilterChange: (key: string, value: string | number | boolean) => void;
  onClearFilters: () => void;

  // Sort configuration
  sortBy: string;
  sortDirection: SortDirection;
  onSortChange: (sortBy: string, direction: SortDirection) => void;

  // Display configuration
  resultCount: number;
  totalCount?: number;
  itemLabel?: string; // e.g., "accessories", "swimsuits"

  // Theme and styling
  accentColor?: string;
  secondaryColor?: string;
  expandableStats?: boolean;
  isFilterExpanded?: boolean;
  setIsFilterExpanded?: (expanded: boolean) => void;

  // Custom content
  additionalFilters?: React.ReactNode;
  headerIcon?: React.ReactNode;

  // Layout options
  className?: string;

  // Accessibility
  searchAriaLabel?: string;
  filterAriaLabel?: string;
}

export const UnifiedFilter = ({
  showFilters,
  setShowFilters,
  filterFields,
  sortOptions,
  filterValues,
  onFilterChange,
  onClearFilters,
  sortBy,
  sortDirection,
  onSortChange,
  resultCount,
  totalCount,
  itemLabel = "items",
  accentColor = "accent-cyan",
  secondaryColor = "accent-purple",
  expandableStats = false,
  isFilterExpanded = false,
  setIsFilterExpanded,
  additionalFilters,
  headerIcon,
  className = "",
  searchAriaLabel,
  filterAriaLabel
}: UnifiedFilterProps) => {
  // Split filter fields into main and expandable sections
  const mainFields = filterFields.filter(field => !field.key.startsWith('min') || !expandableStats);
  const expandableFields = expandableStats ? filterFields.filter(field => field.key.startsWith('min')) : [];
  const searchField = filterFields.find(field => field.key === 'search');

  const handleSortClick = (key: string) => {
    if (sortBy === key) {
      onSortChange(key, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(key, 'asc');
    }
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filterValues).some(value => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.trim() !== '';
    if (typeof value === 'number') return value > 0;
    return false;
  });

  // Enhanced color scheme with proper theme support
  const getColorScheme = () => {
    return {
      // Search bar styling
      searchContainer: 'relative flex-1',
      searchInput: cn(
        'w-full pl-12 pr-4 py-3 text-base',
        'modern-glass border-2 transition-all duration-300',
        'border-border/30 hover:border-border/50',
        'focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20',
        'placeholder:text-muted-foreground',
        'rounded-xl backdrop-blur-sm'
      ),
      searchIcon: 'absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground',

      // Filter button styling
      filterButton: cn(
        'px-6 py-3 rounded-xl font-medium transition-all duration-200',
        'flex items-center gap-2 min-h-[44px]',
        showFilters
          ? 'bg-accent-cyan text-white shadow-lg border border-accent-cyan'
          : 'modern-glass border border-border/30 hover:border-accent-cyan/50 text-foreground hover:text-accent-cyan'
      ),

      // Sort button styling
      sortButton: (active: boolean) => cn(
        'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
        'flex items-center gap-2 min-h-[36px]',
        active
          ? 'bg-accent-cyan text-white shadow-md border border-accent-cyan'
          : 'modern-glass border border-border/30 hover:border-accent-cyan/50 text-muted-foreground hover:text-accent-cyan'
      ),

      // Input styling
      inputClasses: cn(
        'w-full px-3 py-2 text-sm rounded-lg transition-all duration-200',
        'modern-glass border border-border/30',
        'hover:border-border/50 focus:border-accent-cyan',
        'focus:ring-2 focus:ring-accent-cyan/20',
        'placeholder:text-muted-foreground'
      ),

      // Checkbox styling
      checkboxClasses: cn(
        'w-4 h-4 rounded border-2 border-border',
        'text-accent-cyan focus:ring-accent-cyan/20 focus:ring-2',
        'transition-colors duration-200'
      ),

      // Container styling
      filterContainer: cn(
        'modern-glass rounded-2xl border border-border/30 p-6',
        'backdrop-blur-xl shadow-xl'
      ),

      // Text colors
      accentText: `text-${accentColor}`,
      headerIcon: `text-${accentColor}`,

      // Results counter
      resultsCounter: cn(
        'px-4 py-3 rounded-xl text-sm font-medium',
        'modern-glass border border-border/30',
        'text-muted-foreground'
      )
    };
  };

  const colorScheme = getColorScheme();

  const SortButton = ({ sortKey, children, icon }: { sortKey: string; children: React.ReactNode; icon?: React.ReactNode }) => (
    <motion.button
      onClick={() => handleSortClick(sortKey)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={colorScheme.sortButton(sortBy === sortKey)}
      aria-label={`Sort by ${children} ${sortBy === sortKey ? (sortDirection === 'asc' ? 'ascending' : 'descending') : ''}`}
      aria-pressed={sortBy === sortKey}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      <span>{children}</span>
      {sortBy === sortKey && (
        <motion.div
          animate={{ rotate: sortDirection === 'desc' ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-4 h-4"
        >
          <SortAsc className="w-4 h-4" />
        </motion.div>
      )}
    </motion.button>
  );

  const renderFilterField = (field: FilterField) => {
    const fieldId = `filter-${field.key}`;
    const isRequired = field.required || false;
    const isDisabled = field.disabled || false;

    switch (field.type) {
      case 'text':
        return (
          <input
            id={fieldId}
            type="text"
            value={String(filterValues[field.key] || '')}
            onChange={(e) => onFilterChange(field.key, e.target.value)}
            className={cn(colorScheme.inputClasses, isDisabled ? 'opacity-50 cursor-not-allowed' : '')}
            placeholder={field.placeholder}
            required={isRequired}
            disabled={isDisabled}
            aria-label={field.label}
          />
        );

      case 'select':
        return (
          <select
            id={fieldId}
            value={String(filterValues[field.key] || '')}
            onChange={(e) => onFilterChange(field.key, e.target.value)}
            className={cn(colorScheme.inputClasses, isDisabled ? 'opacity-50 cursor-not-allowed' : '')}
            required={isRequired}
            disabled={isDisabled}
            aria-label={field.label}
          >
            <option value="">{field.placeholder || `All ${field.label}`}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        );

      case 'number':
        return (
          <input
            id={fieldId}
            type="number"
            value={String(filterValues[field.key] || '')}
            onChange={(e) => onFilterChange(field.key, e.target.value)}
            className={cn(colorScheme.inputClasses, isDisabled ? 'opacity-50 cursor-not-allowed' : '')}
            placeholder={field.placeholder || '0'}
            min={field.min}
            max={field.max}
            required={isRequired}
            disabled={isDisabled}
            aria-label={field.label}
          />
        );

      case 'checkbox':
        return (
          <label
            className={cn(
              'flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer',
              'modern-glass border-border/30 hover:border-accent-cyan/50',
              isDisabled ? 'opacity-50 cursor-not-allowed' : ''
            )}
            htmlFor={fieldId}
          >
            <input
              id={fieldId}
              type="checkbox"
              checked={Boolean(filterValues[field.key]) || false}
              onChange={(e) => onFilterChange(field.key, e.target.checked)}
              className={colorScheme.checkboxClasses}
              disabled={isDisabled}
              aria-describedby={`${fieldId}-description`}
            />
            <span className="text-sm text-foreground">{field.label}</span>
          </label>
        );

      case 'range':
        return (
          <div className="flex items-center space-x-2">
            <input
              id={`${fieldId}-min`}
              type="number"
              value={String(filterValues[`${field.key}Min`] || '')}
              onChange={(e) => onFilterChange(`${field.key}Min`, e.target.value)}
              className={cn(colorScheme.inputClasses, isDisabled ? 'opacity-50 cursor-not-allowed' : '')}
              placeholder="Min"
              min={field.min}
              disabled={isDisabled}
              aria-label={`${field.label} minimum`}
            />
            <span className="text-muted-foreground">-</span>
            <input
              id={`${fieldId}-max`}
              type="number"
              value={String(filterValues[`${field.key}Max`] || '')}
              onChange={(e) => onFilterChange(`${field.key}Max`, e.target.value)}
              className={cn(colorScheme.inputClasses, isDisabled ? 'opacity-50 cursor-not-allowed' : '')}
              placeholder="Max"
              max={field.max}
              disabled={isDisabled}
              aria-label={`${field.label} maximum`}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-6', className)} role="search" aria-label={searchAriaLabel || `Search and filter ${itemLabel}`}>
      {/* Enhanced Search and Filter Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-4"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          {/* Enhanced Search Bar */}
          {searchField && (
            <div className={colorScheme.searchContainer}>
              <div className={colorScheme.searchIcon}>
                {headerIcon || <Search className="w-5 h-5" />}
              </div>
              <input
                type="text"
                value={String(filterValues.search || '')}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className={colorScheme.searchInput}
                placeholder={searchField.placeholder || `Search ${itemLabel}...`}
                aria-label={searchAriaLabel || `Search ${itemLabel}`}
                role="searchbox"
              />
            </div>
          )}

          {/* Filter Controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={colorScheme.filterButton}
              aria-label={filterAriaLabel || `${showFilters ? 'Hide' : 'Show'} filters`}
              aria-expanded={showFilters}
              aria-controls="filter-panel"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-accent-pink rounded-full" aria-label="Active filters" />
              )}
            </motion.button>

            {/* Enhanced Results Counter */}
            <div className={colorScheme.resultsCounter}>
              <span className={colorScheme.accentText}>{resultCount}</span>
              {totalCount && totalCount !== resultCount && (
                <span className="text-muted-foreground"> of {totalCount}</span>
              )}
              <span className="text-muted-foreground ml-1">{itemLabel}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Advanced Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
            id="filter-panel"
            role="region"
            aria-label="Filter options"
          >
            <div className={colorScheme.filterContainer}>
              {/* Enhanced Filter Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-foreground flex items-center">
                  <Filter className={`w-5 h-5 mr-2 ${colorScheme.headerIcon}`} />
                  Advanced Filters
                </h3>
                <motion.button
                  onClick={onClearFilters}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    'flex items-center gap-2 min-h-[36px]',
                    'modern-glass border border-border/30',
                    'hover:border-destructive/50 hover:text-destructive',
                    'focus:ring-2 focus:ring-destructive/20'
                  )}
                  disabled={!hasActiveFilters}
                  aria-label="Clear all filters"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </motion.button>
              </div>

              {/* Enhanced Main Filter Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {mainFields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <label
                      htmlFor={`filter-${field.key}`}
                      className="block text-sm font-medium text-foreground flex items-center gap-2"
                    >
                      {field.icon && <span className={field.color || colorScheme.accentText}>{field.icon}</span>}
                      <span>{field.label}</span>
                      {field.required && <span className="text-destructive">*</span>}
                    </label>
                    {renderFilterField(field)}
                  </div>
                ))}
              </div>

              {/* Enhanced Expandable Stats Section */}
              {expandableStats && expandableFields.length > 0 && setIsFilterExpanded && (
                <>
                  <motion.button
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={cn(
                      'w-full mb-4 p-4 rounded-xl transition-all',
                      'flex items-center justify-between',
                      'modern-glass border border-border/30',
                      'hover:border-accent-cyan/50',
                      'focus:ring-2 focus:ring-accent-cyan/20'
                    )}
                    aria-expanded={isFilterExpanded}
                    aria-controls="expandable-stats"
                  >
                    <span className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Zap className="w-4 h-4 text-accent-gold" />
                      Advanced Stats Filters
                    </span>
                    <motion.div
                      animate={{ rotate: isFilterExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-4 h-4 text-muted-foreground"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {isFilterExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                        id="expandable-stats"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 rounded-xl modern-glass border border-border/20">
                          {expandableFields.map((field) => (
                            <div key={field.key} className="space-y-2">
                              <label
                                htmlFor={`filter-${field.key}`}
                                className={cn(
                                  'block text-sm font-medium flex items-center gap-2',
                                  field.color || colorScheme.accentText
                                )}
                              >
                                {field.icon}
                                <span>{field.label}</span>
                              </label>
                              {renderFilterField(field)}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* Additional Filters */}
              {additionalFilters && (
                <div className="mb-6 p-4 rounded-xl modern-glass border border-border/20">
                  {additionalFilters}
                </div>
              )}

              {/* Enhanced Sort Options */}
              <div className="flex flex-wrap gap-3 pt-6 border-t border-border/30">
                <span className="text-sm font-medium text-foreground mr-3 py-2 flex items-center gap-2">
                  <SortAsc className="w-4 h-4" />
                  Sort by:
                </span>
                {sortOptions.map((option) => (
                  <SortButton key={option.key} sortKey={option.key} icon={option.icon}>
                    {option.label}
                  </SortButton>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UnifiedFilter; 