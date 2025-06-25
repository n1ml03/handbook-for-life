import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Zap,
  Heart,
  User,
  Filter,
} from 'lucide-react';
import { girlsApi } from '@/services/api';
import { type Girl, type GirlCardProps, type SortDirection, type Swimsuit, getLocalizedName } from '@/types';
import UnifiedFilter, { FilterField, SortOption } from '@/components/features/UnifiedFilter';
import { addTranslationsToItems, searchInAllLanguages } from '@/services/multiLanguageSearch';
import { Button } from '@/components/ui/button';
import { PageLoadingState } from '@/components/ui';
import { useDebounce } from '@/hooks/useDebounce';
import React from 'react';

// Optimized GirlCard with better memoization
const GirlCard = React.memo(function GirlCard({ girl, onClick }: GirlCardProps) {
  const getTypeColor = useCallback((type: string) => {
    switch (type.toLowerCase()) {
      case 'pow': return 'from-red-400 to-pink-500';
      case 'tec': return 'from-cyan-400 to-blue-500';
      case 'stm': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-600';
    }
  }, []);

  const getStatColor = useCallback((stat: string) => {
    switch (stat.toLowerCase()) {
      case 'pow': return 'text-red-400';
      case 'tec': return 'text-cyan-400';
      case 'stm': return 'text-yellow-400';
      case 'apl': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  }, []);

  const typeColor = useMemo(() => getTypeColor(girl.type), [girl.type, getTypeColor]);
  const statsEntries = useMemo(() => Object.entries(girl.stats), [girl.stats]);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative modern-card p-6 overflow-hidden group cursor-pointer transition-all duration-300 hover:border-accent-cyan/50"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/5 via-accent-cyan/5 to-accent-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-accent-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-white text-lg">{girl.name}</h3>
              <motion.div
                className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${typeColor} text-white shadow-lg`}
                whileHover={{ scale: 1.1 }}
              >
                {girl.type.toUpperCase()}
              </motion.div>
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-400">
              <span className="flex items-center">
                <Zap className="w-4 h-4 mr-1 text-accent-gold" />
                Level {girl.level}
              </span>
              <span className="flex items-center">
                <Heart className="w-4 h-4 mr-1 text-accent-pink" />
                {girl.birthday}
              </span>
            </div>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-xl flex items-center justify-center border border-accent-cyan/20">
            <User className="w-8 h-8 text-accent-cyan" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {statsEntries.map(([stat, value]) => (
            <motion.div 
              key={stat} 
              className="flex justify-between items-center p-2 bg-dark-primary/30 rounded-lg border border-dark-border/30"
              whileHover={{ scale: 1.05 }}
            >
              <span className={`uppercase font-bold text-xs ${getStatColor(stat)}`}>
                {stat}
              </span>
              <span className="font-bold text-white">{value as number}</span>
            </motion.div>
          ))}
        </div>

        {/* Equipped Items */}
        <div className="space-y-3">
          {/* Swimsuit */}
          {girl.swimsuit && (
            <div className="bg-dark-primary/50 rounded-xl p-3 border border-dark-border/30">
              <p className="text-xs font-bold text-accent-cyan mb-2 flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                Equipped Swimsuit
              </p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white font-medium truncate">
                  {getLocalizedName(girl.swimsuit as Swimsuit, 'en')}
                </span>
                <span className={`text-xs font-bold ${
                  girl.swimsuit.rarity === 'SSR' ? 'text-yellow-400' :
                  girl.swimsuit.rarity === 'SR' ? 'text-purple-400' :
                  'text-blue-400'
                }`}>
                  {girl.swimsuit.rarity}
                </span>
              </div>
            </div>
          )}

          {/* Accessories */}
          {girl.accessories.length > 0 && (
            <div className="bg-dark-primary/50 rounded-xl p-3 border border-dark-border/30">
              <p className="text-xs font-bold text-accent-purple mb-2 flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                Accessories ({girl.accessories.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {girl.accessories.slice(0, 3).map((accessory: any) => (
                  <span 
                    key={accessory.id}
                    className="text-xs bg-accent-purple/20 text-accent-purple px-2 py-1 rounded-sm border border-accent-purple/30"
                  >
                    {accessory.type}
                  </span>
                ))}
                {girl.accessories.length > 3 && (
                  <span className="text-xs text-gray-400 px-2 py-1">
                    +{girl.accessories.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ID and Click Indicator */}
        <div className="mt-4 pt-3 border-t border-dark-border/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-mono bg-dark-primary/30 px-2 py-1 rounded-sm">
              {girl.id}
            </span>
            <motion.div
              className="text-xs text-accent-cyan/60 group-hover:text-accent-cyan transition-colors"
              whileHover={{ scale: 1.1 }}
            >
              Click to view details →
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// Add display name for better debugging
GirlCard.displayName = 'GirlCard';

export default function GirlListPage() {
  const navigate = useNavigate();
  
  // Optimized state management
  const [girlsData, setGirlsData] = useState({
    girls: [] as Girl[],
    loading: true,
    error: null as string | null,
  });
  
  const [uiState, setUiState] = useState({
    currentPage: 1,
    showFilters: false,
    isFilterExpanded: false,
  });
  
  const [sortState, setSortState] = useState({
    sortBy: 'name',
    sortDirection: 'asc' as SortDirection,
  });
  
  const [filterValues, setFilterValues] = useState({
    search: '',
    type: '',
    minLevel: '',
    maxLevel: '',
    minPow: '',
    minTec: '',
    minStm: '',
    minApl: '',
    hasSwimsuit: false,
    hasAccessories: false
  });

  // Debounce search to improve performance
  const debouncedSearchTerm = useDebounce(filterValues.search, 300);

  const itemsPerPage = 8;

  // Optimized fetch function with useCallback
  const fetchGirls = useCallback(async () => {
    try {
      setGirlsData(prev => ({ ...prev, loading: true, error: null }));
      const response = await girlsApi.getGirls({ limit: 1000 });
      setGirlsData(prev => ({ ...prev, girls: response.data, loading: false }));
    } catch (err) {
      console.error('Failed to fetch girls:', err);
      setGirlsData(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to fetch girls. Please try again.' 
      }));
    }
  }, []);

  useEffect(() => {
    fetchGirls();
  }, [fetchGirls]);

  // Add multi-language support to girls data with optimized memoization
  const multiLanguageGirls = useMemo(() => {
    return addTranslationsToItems(girlsData.girls);
  }, [girlsData.girls]);

  // Filter fields configuration - memoized to prevent recreation
  const filterFields: FilterField[] = useMemo(() => [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search girls in all languages...',
      icon: <Search className="w-3 h-3 mr-1" />,
    },
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      placeholder: 'All Types',
      options: [
        { value: 'pow', label: 'POW' },
        { value: 'tec', label: 'TEC' },
        { value: 'stm', label: 'STM' }
      ],
      icon: <Filter className="w-3 h-3 mr-1" />,
    },
    {
      key: 'minLevel',
      label: 'Min Level',
      type: 'number',
      placeholder: '0',
      min: 1,
      icon: <Zap className="w-3 h-3 mr-1" />,
    },
    {
      key: 'maxLevel',
      label: 'Max Level',
      type: 'number',
      placeholder: '99',
      min: 1,
      icon: <Zap className="w-3 h-3 mr-1" />,
    },
    {
      key: 'hasSwimsuit',
      label: 'Has Swimsuit',
      type: 'checkbox',
      icon: <User className="w-3 h-3 mr-1" />,
    },
    {
      key: 'hasAccessories',
      label: 'Has Accessories',
      type: 'checkbox',
      icon: <User className="w-3 h-3 mr-1" />,
    },
    // Stat filters (expandable)
    {
      key: 'minPow',
      label: 'Min POW',
      type: 'number',
      placeholder: '0',
      min: 0,
      icon: <Zap className="w-3 h-3 mr-1" />,
      color: 'text-red-400',
    },
    {
      key: 'minTec',
      label: 'Min TEC',
      type: 'number',
      placeholder: '0',
      min: 0,
      icon: <Zap className="w-3 h-3 mr-1" />,
      color: 'text-cyan-400',
    },
    {
      key: 'minStm',
      label: 'Min STM',
      type: 'number',
      placeholder: '0',
      min: 0,
      icon: <Zap className="w-3 h-3 mr-1" />,
      color: 'text-yellow-400',
    },
    {
      key: 'minApl',
      label: 'Min APL',
      type: 'number',
      placeholder: '0',
      min: 0,
      icon: <Zap className="w-3 h-3 mr-1" />,
      color: 'text-purple-400',
    }
  ], []);

  // Sort options - memoized to prevent recreation
  const sortOptions: SortOption[] = useMemo(() => [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type' },
    { key: 'level', label: 'Level' },
    { key: 'total', label: 'Total Power' }
  ], []);

  // Optimized filtering and sorting with debounced search
  const filteredAndSortedGirls = useMemo(() => {
    const filterValuesWithDebouncedSearch = {
      ...filterValues,
      search: debouncedSearchTerm
    };

    const filtered = multiLanguageGirls.filter(girl => {
      if (filterValuesWithDebouncedSearch.type && girl.type !== filterValuesWithDebouncedSearch.type) return false;
      if (filterValuesWithDebouncedSearch.search && !searchInAllLanguages(girl, filterValuesWithDebouncedSearch.search)) return false;
      if (filterValuesWithDebouncedSearch.minLevel && girl.level < Number(filterValuesWithDebouncedSearch.minLevel)) return false;
      if (filterValuesWithDebouncedSearch.maxLevel && girl.level > Number(filterValuesWithDebouncedSearch.maxLevel)) return false;
      if (filterValuesWithDebouncedSearch.minPow && girl.stats.pow < Number(filterValuesWithDebouncedSearch.minPow)) return false;
      if (filterValuesWithDebouncedSearch.minTec && girl.stats.tec < Number(filterValuesWithDebouncedSearch.minTec)) return false;
      if (filterValuesWithDebouncedSearch.minStm && girl.stats.stm < Number(filterValuesWithDebouncedSearch.minStm)) return false;
      if (filterValuesWithDebouncedSearch.minApl && girl.stats.apl < Number(filterValuesWithDebouncedSearch.minApl)) return false;
      if (filterValuesWithDebouncedSearch.hasSwimsuit && !girl.swimsuit) return false;
      if (filterValuesWithDebouncedSearch.hasAccessories && girl.accessories.length === 0) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (sortState.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'type':
          aValue = a.type.toLowerCase();
          bValue = b.type.toLowerCase();
          break;
        case 'level':
          aValue = a.level;
          bValue = b.level;
          break;
        case 'total':
          aValue = a.stats.pow + a.stats.tec + a.stats.stm + a.stats.apl;
          bValue = b.stats.pow + b.stats.tec + b.stats.stm + b.stats.apl;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortState.sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      const numA = Number(aValue);
      const numB = Number(bValue);
      return sortState.sortDirection === 'asc' ? numA - numB : numB - numA;
    });
  }, [multiLanguageGirls, filterValues, debouncedSearchTerm, sortState]);

  // Optimized pagination calculations
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredAndSortedGirls.length / itemsPerPage);
    const paginatedGirls = filteredAndSortedGirls.slice(
      (uiState.currentPage - 1) * itemsPerPage,
      uiState.currentPage * itemsPerPage
    );
    return { totalPages, paginatedGirls };
  }, [filteredAndSortedGirls, uiState.currentPage, itemsPerPage]);

  // Optimized event handlers with useCallback
  const handleFilterChange = useCallback((key: string, value: string | number | boolean) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    setUiState(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleSortChange = useCallback((newSortBy: string, newDirection: SortDirection) => {
    setSortState({ sortBy: newSortBy, sortDirection: newDirection });
  }, []);

  const clearFilters = useCallback(() => {
    setFilterValues({
      search: '',
      type: '',
      minLevel: '',
      maxLevel: '',
      minPow: '',
      minTec: '',
      minStm: '',
      minApl: '',
      hasSwimsuit: false,
      hasAccessories: false
    });
    setUiState(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const handleShowFilters = useCallback((show: boolean) => {
    setUiState(prev => ({ ...prev, showFilters: show }));
  }, []);

  const handleFilterExpanded = useCallback((expanded: boolean) => {
    setUiState(prev => ({ ...prev, isFilterExpanded: expanded }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setUiState(prev => ({ ...prev, currentPage: page }));
  }, []);

  const handlePrevPage = useCallback(() => {
    setUiState(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }));
  }, []);

  const handleNextPage = useCallback(() => {
    setUiState(prev => ({ 
      ...prev, 
      currentPage: Math.min(paginationData.totalPages, prev.currentPage + 1) 
    }));
  }, [paginationData.totalPages]);

  // Memoized navigation handler
  const handleGirlClick = useCallback((girlId: string) => {
    navigate(`/girls/${girlId}`);
  }, [navigate]);

  return (
    <PageLoadingState isLoading={girlsData.loading} message="Loading girl list...">
    
    <div className="modern-page">
      <div className="modern-container-lg">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="modern-page-header"
        >
          <h1 className="modern-page-title">
            Girl Collection
          </h1>
          <p className="modern-page-subtitle">
            Explore and discover all characters with detailed stats and equipment • {filteredAndSortedGirls.length} of {girlsData.girls.length} girls
          </p>
        </motion.div>

        {/* Search and Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <UnifiedFilter
            showFilters={uiState.showFilters}
            setShowFilters={handleShowFilters}
            filterFields={filterFields}
            sortOptions={sortOptions}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            sortBy={sortState.sortBy}
            sortDirection={sortState.sortDirection}
            onSortChange={handleSortChange}
            resultCount={filteredAndSortedGirls.length}
            totalCount={girlsData.girls.length}
            itemLabel="girls"
            accentColor="accent-pink"
            secondaryColor="accent-purple"
            expandableStats={true}
            isFilterExpanded={uiState.isFilterExpanded}
            setIsFilterExpanded={handleFilterExpanded}
            headerIcon={<User className="w-4 h-4" />}
            searchAriaLabel="Search girls by name, type, or attributes"
            filterAriaLabel="Show or hide advanced filters"
          />
        </motion.div>

        {/* Girl Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginationData.paginatedGirls.map((girl, index) => (
            <motion.div
              key={girl.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <GirlCard
                girl={girl}
                onClick={() => handleGirlClick(girl.id)}
              />
            </motion.div>
          ))}
          </div>
        </motion.div>

        {/* Enhanced Pagination */}
        {paginationData.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-3 mb-8"
          >
            <Button
              variant="modern"
              size="icon"
              onClick={handlePrevPage}
              disabled={uiState.currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex space-x-2">
              {Array.from({ length: Math.min(5, paginationData.totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(paginationData.totalPages - 4, uiState.currentPage - 2)) + i;
                return (
                  <Button
                    key={page}
                    variant={uiState.currentPage === page ? "modern-primary" : "modern"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className="min-w-[40px]"
                    aria-label={`Go to page ${page}`}
                    aria-current={uiState.currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="modern"
              size="icon"
              onClick={handleNextPage}
              disabled={uiState.currentPage === paginationData.totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>
        )}

        {/* Enhanced Empty State */}
        {filteredAndSortedGirls.length === 0 && !girlsData.loading && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="modern-card p-8">
            <motion.div
              className="w-24 h-24 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-accent-cyan/20"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <User className="w-12 h-12 text-accent-cyan/60" />
            </motion.div>
            <h3 className="text-2xl font-bold text-foreground mb-3">No girls found</h3>
              <Button
                variant="neon"
                onClick={clearFilters}
                className="px-8 py-3"
              >
                Clear All Filters
              </Button>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {girlsData.error && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="modern-card p-8 border-red-500/20">
              <h3 className="text-2xl font-bold text-red-400 mb-3">Error Loading Girls</h3>
              <p className="text-gray-400 mb-6">{girlsData.error}</p>
              <Button
                variant="neon"
                onClick={fetchGirls}
                className="px-8 py-3"
              >
                Try Again
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
    </PageLoadingState>
  );
}