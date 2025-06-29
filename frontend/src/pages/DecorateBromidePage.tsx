import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Image,
  Search,
  Camera} from 'lucide-react';
import { bromidesApi } from '@/services/api';
import { type SortDirection } from '@/types';
import UnifiedFilter from '@/components/features/UnifiedFilter';
import { createDecorBromideFilterConfig, bromideSortOptions } from '@/components/features/FilterConfigs';
import { PageLoadingState, MultiLanguageCard, type MultiLanguageNames } from '@/components/ui';
import { useDebounce } from '@/hooks';

const bromideTypes = ['Character', 'Scene', 'Event', 'Special'] as const;
const decorationTypes = ['Frame', 'Background', 'Sticker', 'Effect'] as const;
const versions = ['1.0', '1.5', '2.0', '2.5', '3.0'] as const;

function BromideCard({ bromide }: { bromide: any }) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'UR': return 'from-red-400 to-pink-600';
      case 'SSR': return 'from-yellow-400 to-orange-500';
      case 'SR': return 'from-purple-400 to-pink-500';
      case 'R': return 'from-blue-400 to-cyan-500';
      case 'N': return 'from-gray-400 to-gray-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const _getTypeColor = (type: string) => {
    switch (type) {
      case 'Character': return 'text-accent-pink';
      case 'Scene': return 'text-accent-cyan';
      case 'Event': return 'text-accent-purple';
      case 'Special': return 'text-accent-gold';
      case 'Frame': return 'text-green-400';
      case 'Background': return 'text-blue-400';
      case 'Sticker': return 'text-orange-400';
      case 'Effect': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const names: MultiLanguageNames = {
    name_jp: bromide.name_jp || '',
    name_en: bromide.name_en || bromide.name || '',
    name_cn: bromide.name_cn || '',
    name_tw: bromide.name_tw || '',
    name_kr: bromide.name_kr || ''
  };

  const header = (
    <div className="relative">
      {/* Image Preview */}
      <div className="aspect-video bg-gradient-to-br from-dark-primary/50 to-dark-secondary/50 relative rounded-lg overflow-hidden mb-3">
        <div className="absolute inset-0 flex items-center justify-center">
          <Image className="w-12 h-12 text-gray-400" />
        </div>
        {/* Rarity Badge */}
        <div className="absolute top-2 left-2">
          <motion.div
            className={`px-2 py-1 rounded text-xs font-bold bg-gradient-to-r ${getRarityColor(bromide.rarity)} text-white shadow-lg`}
            whileHover={{ scale: 1.1 }}
          >
            {bromide.rarity}
          </motion.div>
        </div>
      </div>

      {/* Category and ID */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-3 h-3 text-accent-cyan" />
          <span className="text-xs text-accent-cyan font-medium">Bromide</span>
        </div>
        <span className="text-xs text-gray-500 font-mono bg-dark-primary/30 px-2 py-1 rounded-sm">
          #{bromide.id}
        </span>
      </div>
    </div>
  );

  return (
    <MultiLanguageCard
      names={names}
      primaryLanguage="en"
      languageVariant="expanded"
      header={header}
    />
  );
}

export default function DecorateBromidePage() {
  const [bromides, setBromides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filter, setFilter] = useState({
    search: '',
    type: '',
    rarity: '',
    character: '',
    source: '',
    hasEffects: false,
    hasCharacter: false,
    version: ''
  });

  const itemsPerPage = 12;
  
  // Debounce search to improve performance
  const debouncedSearch = useDebounce(filter.search, 500);

  // Memoized filter values that include debounced search
  const filterValuesWithDebouncedSearch = useMemo(() => ({
    ...filter,
    search: debouncedSearch
  }), [filter, debouncedSearch]);

  useEffect(() => {
    const fetchBromides = async () => {
      try {
        setLoading(true);
        const response = await bromidesApi.getBromides({
          limit: 500, // Get a reasonable batch size
          sortBy: 'name',
          sortOrder: 'asc'
        });
        
        const bromideData = response?.data || [];
        if (!Array.isArray(bromideData)) {
          console.warn('Expected array from bromides API, received:', bromideData);
          setBromides([]);
          return;
        }
        
        setBromides(bromideData);
      } catch (err) {
        console.error('Failed to fetch bromides:', err);
        setBromides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBromides();
  }, []);

  // Extract unique values for filter options
  const allTypes = useMemo(() => [...new Set([...bromideTypes, ...decorationTypes])], []);
  const allRarities = useMemo(() => [...new Set(bromides.map(b => b.rarity))].sort(), [bromides]);
  const allCharacters = useMemo(() => [...new Set(bromides.map(b => b.character).filter(Boolean) as string[])].sort(), [bromides]);
  const allSources = useMemo(() => [...new Set(bromides.map(b => b.source ?? b.category))].sort(), [bromides]);

  // Create filter configuration
  const filterFields = useMemo(() =>
    createDecorBromideFilterConfig(allTypes, allRarities, allCharacters, allSources, [...versions]),
    [allTypes, allRarities, allCharacters, allSources]
  );

  // Optimized filtering and sorting with memoization
  const filteredAndSortedBromides = useMemo(() => {
    const filtered = bromides.filter(bromide => {
      // Search filter - search across name, description, character, and source
      const searchValue = String(filterValuesWithDebouncedSearch.search || '');
      if (searchValue) {
        const searchTerm = searchValue.toLowerCase();
        const searchableText = [
          bromide.name,
          bromide.description,
          bromide.character,
          bromide.source ?? bromide.category
        ].filter(Boolean).join(' ').toLowerCase();

        if (!searchableText.includes(searchTerm)) return false;
      }

      // Type filter
      const typeValue = String(filterValuesWithDebouncedSearch.type || '');
      if (typeValue && (bromide.category !== typeValue)) return false;

      // Rarity filter
      const rarityValue = String(filterValuesWithDebouncedSearch.rarity || '');
      if (rarityValue && bromide.rarity !== rarityValue) return false;

      // Character filter
      const characterValue = String(filterValuesWithDebouncedSearch.character || '');
      if (characterValue && bromide.character !== characterValue) return false;

      // Source filter
      const sourceValue = String(filterValuesWithDebouncedSearch.source || '');
      if (sourceValue && (bromide.source ?? bromide.category) !== sourceValue) return false;

      // Effects filter
      if (filterValuesWithDebouncedSearch.hasEffects && (!bromide.effects || bromide.effects.length === 0)) return false;

      // Character presence filter
      if (filterValuesWithDebouncedSearch.hasCharacter && !bromide.character) return false;

      // Version filter (check if ID contains version)
      const versionValue = String(filterValuesWithDebouncedSearch.version || '');
      if (versionValue && !bromide.id.includes(versionValue)) return false;

      return true;
    });

    // Sort filtered results
    return filtered.sort((a, b) => {
      let aValue: string | number, bValue: string | number;
      
      switch (sortBy) {
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'rarity':
          const rarityOrder = { 'SSR': 4, 'SR': 3, 'R': 2, 'N': 1 };
          aValue = rarityOrder[a.rarity as keyof typeof rarityOrder] || 0;
          bValue = rarityOrder[b.rarity as keyof typeof rarityOrder] || 0;
          break;
        case 'character':
          aValue = (a.character || '').toLowerCase();
          bValue = (b.character || '').toLowerCase();
          break;
        case 'source':
          aValue = (a.source || a.category || '').toLowerCase();
          bValue = (b.source || b.category || '').toLowerCase();
          break;
        default:
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortDirection === 'asc' ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
    });
  }, [bromides, filterValuesWithDebouncedSearch, sortBy, sortDirection]);

  // Memoized pagination
  const totalPages = useMemo(() => Math.ceil(filteredAndSortedBromides.length / itemsPerPage), [filteredAndSortedBromides.length, itemsPerPage]);
  const paginatedBromides = useMemo(() => filteredAndSortedBromides.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ), [filteredAndSortedBromides, currentPage, itemsPerPage]);

  // Memoized filter options
  const _filterOptions = useMemo(() => {
    const types = [...new Set(bromides.map(b => b.category))].filter(Boolean).sort();
    const rarities = [...new Set(bromides.map(b => b.rarity))].filter(Boolean).sort();
    const characters = [...new Set(bromides.map(b => b.character))].filter(Boolean).sort();
    const sources = [...new Set(bromides.map(b => b.source ?? b.category))].filter(Boolean).sort();
    const versions = ['1.0', '1.5', '2.0', '2.5', '3.0'];
    
    return { types, rarities, characters, sources, versions };
  }, [bromides]);

  // Optimized event handlers with useCallback
  const handleFilterChange = useCallback((key: string, value: string | number | boolean) => {
    setFilter(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  const handleSortChange = useCallback((newSortBy: string, newDirection: SortDirection) => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
    setCurrentPage(1); // Reset to first page when sort changes
  }, []);

  const clearFilters = useCallback(() => {
    setFilter({
      search: '',
      type: '',
      rarity: '',
      character: '',
      source: '',
      hasEffects: false,
      hasCharacter: false,
      version: ''
    });
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return (
    <PageLoadingState 
      isLoading={loading} 
      message="Loading bromide & decoration list..."
    >
    <div className="modern-page">
      <div className="modern-container-lg">
        {/* Modern Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="modern-page-header"
        >
          <h1 className="text-responsive-3xl font-bold gradient-text leading-tight text-center">
            Bromide & Decoration Collection
          </h1>
          <p className="text-responsive-base text-muted-foreground max-w-2xl mx-auto leading-relaxed text-center mt-4">
            Browse and customize your collection of {bromides.length} bromides and decorations
          </p>
        </motion.div>

      {/* Unified Filter Component */}
      <UnifiedFilter
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filterFields={filterFields}
        sortOptions={bromideSortOptions}
        filterValues={filterValuesWithDebouncedSearch}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        resultCount={filteredAndSortedBromides.length}
        itemLabel="bromides & decorations"
        accentColor="accent-cyan"
        secondaryColor="accent-purple"
        headerIcon={<Search className="w-4 h-4" />}
      />

        {/* Bromides Display */}
        <div className="grid-responsive-cards mt-8 mb-8">
          {paginatedBromides.map((bromide, index) => (
            <motion.div
              key={bromide.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <BromideCard bromide={bromide} />
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-2 mt-8"
          >
            <motion.button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-dark-card/70 border border-dark-border/50 text-gray-400 hover:text-white hover:bg-accent-cyan/20 disabled:opacity-50 disabled:hover:bg-dark-card/70 disabled:hover:text-gray-400 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            
            <div className="flex space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <motion.button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-accent-cyan to-accent-purple text-white shadow-lg'
                        : 'bg-dark-card/70 border border-dark-border/50 text-gray-400 hover:text-white hover:bg-accent-cyan/20'
                    }`}
                  >
                    {page}
                  </motion.button>
                );
              })}
            </div>
            
            <motion.button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-dark-card/70 border border-dark-border/50 text-gray-400 hover:text-white hover:bg-accent-cyan/20 disabled:opacity-50 disabled:hover:bg-dark-card/70 disabled:hover:text-gray-400 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {/* Empty State */}
        {filteredAndSortedBromides.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <motion.div
              className="w-24 h-24 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-accent-cyan/20"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Search className="w-12 h-12 text-accent-cyan/60" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-300 mb-3">No items found</h3>
            <motion.button
              onClick={clearFilters}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-accent-pink to-accent-purple hover:from-accent-pink/90 hover:to-accent-purple/90 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg"
            >
              Clear All Filters
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
    </PageLoadingState>
  );
}