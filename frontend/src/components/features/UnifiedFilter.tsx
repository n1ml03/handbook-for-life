import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronRight, SortAsc, Zap, X } from 'lucide-react';

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
}

export interface SortOption {
  key: string;
  label: string;
}

export interface UnifiedFilterProps {
  // Filter state
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  
  // Filter configuration
  filterFields: FilterField[];
  sortOptions: SortOption[];
  
  // Filter values and handlers
  filterValues: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  onClearFilters: () => void;
  
  // Sort configuration
  sortBy: string;
  sortDirection: SortDirection;
  onSortChange: (sortBy: string, direction: SortDirection) => void;
  
  // Display configuration
  resultCount: number;
  itemLabel?: string; // e.g., "accessories", "swimsuits"
  
  // Theme and styling
  accentColor?: string;
  secondaryColor?: string;
  blackTheme?: boolean; // New prop for black theme
  expandableStats?: boolean;
  isFilterExpanded?: boolean;
  setIsFilterExpanded?: (expanded: boolean) => void;
  
  // Custom content
  additionalFilters?: React.ReactNode;
  headerIcon?: React.ReactNode;
  
  // Layout options
  className?: string;
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
  itemLabel = "items",
  accentColor = "accent-cyan",
  secondaryColor = "accent-purple",
  blackTheme = false,
  expandableStats = false,
  isFilterExpanded = false,
  setIsFilterExpanded,
  additionalFilters,
  headerIcon,
  className = ""
}: UnifiedFilterProps) => {
  // Split filter fields into main and expandable sections
  const mainFields = filterFields.filter(field => !field.key.startsWith('min') || !expandableStats);
  const expandableFields = expandableStats ? filterFields.filter(field => field.key.startsWith('min')) : [];

  const handleSortClick = (key: string) => {
    if (sortBy === key) {
      onSortChange(key, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(key, 'asc');
    }
  };

  // Color scheme configuration
  const getColorScheme = () => {
    if (blackTheme) {
      return {
        filterButton: showFilters
          ? 'bg-gradient-to-r from-gray-900 to-black text-white shadow-lg border border-gray-700'
          : 'bg-gray-800/70 border border-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-900/50',
        sortButton: (active: boolean) => active
          ? 'bg-gradient-to-r from-gray-900 to-black text-white shadow-md border border-gray-700'
          : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-900/50 border border-gray-700/50',
        inputClasses: 'w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-gray-500 transition-all text-white',
        checkboxClasses: 'rounded-sm border-gray-700 text-gray-900 focus:ring-gray-500/20',
        filterContainer: 'bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-700/50',
        accentText: 'text-gray-300',
        headerIcon: 'text-gray-400'
      };
    } else {
      return {
        filterButton: showFilters
          ? `bg-gradient-to-r from-${accentColor} to-${secondaryColor} text-white shadow-lg`
          : `bg-dark-card/70 border border-dark-border/50 text-gray-400 hover:text-white hover:bg-${accentColor}/20`,
        sortButton: (active: boolean) => active
          ? `bg-gradient-to-r from-${accentColor} to-${secondaryColor} text-white shadow-md`
          : `bg-dark-card/50 text-gray-400 hover:text-white hover:bg-${accentColor}/20 border border-dark-border/50`,
        inputClasses: `w-full bg-dark-primary/50 border border-dark-border rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-${accentColor} transition-all`,
        checkboxClasses: `rounded-sm border-dark-border text-${accentColor} focus:ring-${accentColor}/20`,
        filterContainer: 'bg-dark-card/80 backdrop-blur-xl rounded-3xl border border-dark-border/50',
        accentText: `text-${accentColor}`,
        headerIcon: `text-${accentColor}`
      };
    }
  };

  const colorScheme = getColorScheme();

  const SortButton = ({ sortKey, children }: { sortKey: string; children: React.ReactNode }) => (
    <motion.button
      onClick={() => handleSortClick(sortKey)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${colorScheme.sortButton(sortBy === sortKey)}`}
    >
      {children}
      {sortBy === sortKey && (
        <motion.div
          animate={{ rotate: sortDirection === 'desc' ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <SortAsc className="w-3 h-3" />
        </motion.div>
      )}
    </motion.button>
  );

  const renderFilterField = (field: FilterField) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={filterValues[field.key] || ''}
            onChange={(e) => onFilterChange(field.key, e.target.value)}
            className={colorScheme.inputClasses}
            placeholder={field.placeholder}
          />
        );

      case 'select':
        return (
          <select
            value={filterValues[field.key] || ''}
            onChange={(e) => onFilterChange(field.key, e.target.value)}
            className={colorScheme.inputClasses}
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
            type="number"
            value={filterValues[field.key] || ''}
            onChange={(e) => onFilterChange(field.key, e.target.value)}
            className={colorScheme.inputClasses}
            placeholder={field.placeholder || '0'}
            min={field.min}
            max={field.max}
          />
        );

      case 'checkbox':
        return (
          <label className={`flex items-center space-x-3 p-3 ${blackTheme ? 'bg-gray-900/30' : 'bg-dark-primary/30'} rounded-xl border ${blackTheme ? 'border-gray-700/50 hover:border-gray-600/50' : 'border-dark-border/50 hover:border-accent-cyan/50'} transition-all cursor-pointer`}>
            <input
              type="checkbox"
              checked={filterValues[field.key] || false}
              onChange={(e) => onFilterChange(field.key, e.target.checked)}
              className={colorScheme.checkboxClasses}
            />
            <span className={`text-sm ${blackTheme ? 'text-gray-300' : 'text-gray-300'}`}>{field.label}</span>
          </label>
        );

      case 'range':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={filterValues[`${field.key}Min`] || ''}
              onChange={(e) => onFilterChange(`${field.key}Min`, e.target.value)}
              className={colorScheme.inputClasses}
              placeholder="Min"
              min={field.min}
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              value={filterValues[`${field.key}Max`] || ''}
              onChange={(e) => onFilterChange(`${field.key}Max`, e.target.value)}
              className={colorScheme.inputClasses}
              placeholder="Max"
              max={field.max}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`${className}`}>
      {/* Filter Toggle and Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <div className="absolute left-3 top-3 w-4 h-4 text-gray-400">
              {headerIcon || <Filter className="w-4 h-4" />}
            </div>
            {filterFields.find(f => f.key === 'search') && (
              <input
                type="text"
                value={filterValues.search || ''}
                onChange={(e) => onFilterChange('search', e.target.value)}
                className={`w-full ${blackTheme ? 'bg-gray-900/70 border-gray-700/50 focus:border-gray-500' : 'bg-dark-card/70 border-dark-border/50 focus:border-accent-cyan'} backdrop-blur-sm border rounded-xl pl-10 pr-4 py-3 focus:outline-hidden focus:ring-2 ${blackTheme ? 'focus:ring-gray-500/20' : 'focus:ring-accent-cyan/20'} transition-all placeholder-gray-500 text-white`}
                placeholder={filterFields.find(f => f.key === 'search')?.placeholder || `Search ${itemLabel}...`}
              />
            )}
          </div>

          {/* Filter Controls */}
          <div className="flex items-center gap-3">
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${colorScheme.filterButton}`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
            </motion.button>

            <div className={`text-sm ${blackTheme ? 'text-gray-500 bg-gray-900/50 border-gray-700/50' : 'text-gray-500 bg-dark-card/50 border-dark-border/50'} px-3 py-3 rounded-xl border`}>
              <span className={`${colorScheme.accentText} font-medium`}>{resultCount}</span> found
            </div>
          </div>
        </div>
      </motion.div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-8 overflow-hidden"
          >
            <div className={`${colorScheme.filterContainer} p-6`}>
              {/* Filter Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Filter className={`w-5 h-5 mr-2 ${colorScheme.headerIcon}`} />
                  Advanced Filters
                </h3>
                <motion.button
                  onClick={onClearFilters}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${blackTheme ? 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50' : 'bg-dark-card/50 text-gray-400 hover:text-white hover:bg-accent-pink/20'} border ${blackTheme ? 'border-gray-700/50' : 'border-dark-border/50'}`}
                >
                  <X className="w-3 h-3" />
                  Clear All
                </motion.button>
              </div>

              {/* Main Filter Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {mainFields.map((field) => (
                  <div key={field.key}>
                    <label className={`block text-sm font-medium ${blackTheme ? 'text-gray-300' : 'text-gray-300'} mb-2 flex items-center`}>
                      {field.icon}
                      {field.label}
                    </label>
                    {renderFilterField(field)}
                  </div>
                ))}
              </div>

              {/* Expandable Stats Section */}
              {expandableStats && expandableFields.length > 0 && setIsFilterExpanded && (
                <>
                  <motion.button
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full mb-4 p-3 rounded-xl transition-all flex items-center justify-between ${blackTheme ? 'bg-gray-800/50 hover:bg-gray-700/50 border-gray-700/50' : 'bg-dark-primary/30 hover:bg-dark-primary/50 border-dark-border/50'} border`}
                  >
                    <span className={`text-sm font-medium ${blackTheme ? 'text-gray-300' : 'text-gray-300'} flex items-center`}>
                      <Zap className="w-4 h-4 mr-2" />
                      Advanced Stats Filters
                    </span>
                    <motion.div
                      animate={{ rotate: isFilterExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {isFilterExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          {expandableFields.map((field) => (
                            <div key={field.key}>
                              <label className={`block text-sm font-medium mb-2 flex items-center ${field.color || colorScheme.accentText}`}>
                                {field.icon}
                                {field.label}
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
                <div className="mb-6">
                  {additionalFilters}
                </div>
              )}

              {/* Sort Options */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-700/30">
                <span className={`text-sm font-medium ${blackTheme ? 'text-gray-300' : 'text-gray-300'} mr-3 py-2`}>Sort by:</span>
                {sortOptions.map((option) => (
                  <SortButton key={option.key} sortKey={option.key}>
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