import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Camera,
  Loader2,
  Book,
  Users} from 'lucide-react';
import { type Memory, type MemoryCardProps, type SortDirection, type Episode } from '@/types';
import { episodesApi } from '@/services/api';
import { safeExtractArrayData, safeExtractPaginationData } from '@/services/utils';
import { PageLoadingState, MultiLanguageCard, type MultiLanguageNames } from '@/components/ui';
import UnifiedFilter from '@/components/features/UnifiedFilter';
import { createMemoriesFilterConfig, memoriesSortOptions } from '@/components/features/FilterConfigs';
import React from 'react';
import { useDebounce } from '@/hooks/useDebounce';

// Helper function to convert Episode to Memory
const episodeToMemory = (episode: Episode): Memory => ({
  id: episode.id.toString(),
  name: episode.title_en || episode.title_jp || 'Untitled Memory',
  // Store multi-language titles for MultiLanguageCard
  name_jp: episode.title_jp || '',
  name_en: episode.title_en || '',
  name_cn: episode.title_cn || '',
  name_tw: episode.title_tw || '',
  name_kr: episode.title_kr || '',
  description: episode.unlock_condition_en || '',
  date: new Date().toISOString(),
  thumbnail: '📖',
  characters: [],
  tags: [episode.episode_type],
  favorite: false
});

const MemoryCard = React.memo(function MemoryCard({ memory }: MemoryCardProps) {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const names: MultiLanguageNames = {
    name_jp: memory.name_jp || '',
    name_en: memory.name_en || '',
    name_cn: memory.name_cn || '',
    name_tw: memory.name_tw || '',
    name_kr: memory.name_kr || ''
  };

  const header = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-lg flex items-center justify-center border border-accent-cyan/20">
          <span className="text-xl">{memory.thumbnail}</span>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Book className="w-3 h-3 text-accent-cyan" />
            <span className="text-xs text-accent-cyan font-medium">Episode</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">{formatDate(memory.date)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const memoryDetails = (
    <div className="space-y-3">
      {/* Description */}
      {memory.description && (
        <div className="p-3 bg-dark-primary/30 rounded-lg border border-white/10">
          <p className="text-sm text-gray-300 leading-relaxed">
            {memory.description}
          </p>
        </div>
      )}

      {/* Characters */}
      {memory.characters.length > 0 && (
        <div className="bg-gradient-to-r from-accent-cyan/10 to-accent-purple/10 rounded-lg p-3 border border-accent-cyan/20">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-3 h-3 text-accent-cyan" />
            <span className="text-xs font-bold text-accent-cyan">
              Characters ({memory.characters.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {memory.characters.map((character: string, index: number) => (
              <span 
                key={index}
                className="text-xs bg-dark-primary/50 px-2 py-1 rounded border border-dark-border/30 text-gray-300"
              >
                {character}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <MultiLanguageCard
      names={names}
      primaryLanguage="en"
      languageVariant="expanded"
      header={header}
    >
      {memoryDetails}
    </MultiLanguageCard>
  );
});

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterValues, setFilterValues] = useState<{
    search: string;
    episode_type: string;
    related_entity_type: string;
    related_entity_id: string;
    favorite: boolean;
  }>({
    search: '',
    episode_type: '',
    related_entity_type: '',
    related_entity_id: '',
    favorite: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const itemsPerPage = 12;

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(filterValues.search, 500);

  // Fetch episodes from API and convert to memories
  const fetchEpisodes = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortBy,
        sortOrder: sortDirection,
        ...(filterValues.episode_type && { type: filterValues.episode_type }),
        ...(filterValues.related_entity_type && { entityType: filterValues.related_entity_type }),
        ...(filterValues.related_entity_id && { entityId: Number(filterValues.related_entity_id) }),
        ...(debouncedSearch && { search: debouncedSearch }),
      };

      const response = await episodesApi.getEpisodes(params);
      const episodeData = safeExtractArrayData<Episode>(response, 'episodes API');
      
      // Convert episodes to memories
      const memoryData = episodeData.map((episode: Episode) => episodeToMemory(episode));
      setMemories(memoryData);
      
      const paginationData = safeExtractPaginationData(response, episodeData.length);
      setTotalPages(paginationData.totalPages);
    } catch (err) {
      console.error('Error fetching episodes:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, sortDirection, filterValues.episode_type, filterValues.related_entity_type, filterValues.related_entity_id, debouncedSearch]);

  // Fetch episodes on component mount and when dependencies change
  useEffect(() => {
    fetchEpisodes();
  }, [fetchEpisodes]);

  // Filter memories locally for additional filters (since some aren't supported by API yet)
  const filteredMemories = useMemo(() => {
    return memories.filter(memory => {
      // Favorite filter
      if (filterValues.favorite && !memory.favorite) return false;
      
      return true;
    });
  }, [memories, filterValues.favorite]);

  const episodeTypes = ['MAIN', 'CHARACTER', 'EVENT', 'SWIMSUIT', 'ITEM'];

  // Optimized event handlers with useCallback
  const handleFilterChange = useCallback((key: string, value: string | boolean | number) => {
    if (key === 'favorite') {
      setFilterValues(prev => ({ ...prev, [key]: Boolean(value) }));
    } else {
      setFilterValues(prev => ({ ...prev, [key]: String(value) }));
    }
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((newSortBy: string, newDirection: SortDirection) => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
  }, []);

  const clearFilters = useCallback(() => {
    setFilterValues({
      search: '',
      episode_type: '',
      related_entity_type: '',
      related_entity_id: '',
      favorite: false
    });
    setCurrentPage(1);
  }, []);

  const handleToggleFavorite = useCallback(async (id: string) => {
    try {
      const memory = memories.find(m => m.id === id);
      if (!memory) return;

      const newFavoriteStatus = !memory.favorite;
      
      // Optimistically update the UI
      setMemories(prev => prev.map(m => 
        m.id === id ? { ...m, favorite: newFavoriteStatus } : m
      ));

      // Note: No backend support for favorite yet, so this is just local state
      // await episodesApi.toggleEpisodeFavorite(id, newFavoriteStatus);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      // Revert the optimistic update on error
      setMemories(prev => prev.map(m => 
        m.id === id ? { ...m, favorite: !m.favorite } : m
      ));
      console.error('Failed to update favorite status');
    }
  }, [memories]);

  // Memoized filter options
  const memoizedFilterOptions = useMemo(() => {
    const characters = [...new Set(memories.map(m => m.characters).flat())].sort();
    const versions = ['1.0', '1.5', '2.0', '2.5', '3.0'];
    return { characters, versions };
  }, [memories]);

  // Create filter configuration with memoized options
  const filterFields = useMemo(() => 
    createMemoriesFilterConfig(episodeTypes, memoizedFilterOptions.characters, memoizedFilterOptions.versions), 
    [memoizedFilterOptions.characters, memoizedFilterOptions.versions]
  );

  return (
    <PageLoadingState 
      isLoading={loading && memories.length === 0} 
      message="Loading episodes..."
    >
    <div className="modern-page">
      <div className="modern-container-lg">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="modern-page-header"
        >
          <h1 className="text-responsive-3xl font-bold gradient-text leading-tight text-center">
            Episodes Gallery
          </h1>
          <p className="text-responsive-base text-muted-foreground max-w-2xl mx-auto leading-relaxed text-center mt-4">
            {loading ? 'Loading episodes...' : `Showing ${filteredMemories.length} of ${memories.length} episodes`}
          </p>
        </motion.div>

        {/* Unified Filter Component */}
        <UnifiedFilter
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          filterFields={filterFields}
          sortOptions={memoriesSortOptions}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          resultCount={filteredMemories.length}
          totalCount={memories.length}
          itemLabel="episodes"
          expandableStats={false}
          isFilterExpanded={isFilterExpanded}
          setIsFilterExpanded={setIsFilterExpanded}
          accentColor="accent-pink"
          secondaryColor="accent-cyan"
        />

        {/* Episode Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-accent-cyan animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading episodes...</p>
              </div>
            </div>
          ) : (
            <div className="grid-responsive-cards mb-8">
              {filteredMemories.map((memory, index) => (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <MemoryCard memory={memory} onToggleFavorite={handleToggleFavorite} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-2 mt-8"
          >
            <motion.button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                    onClick={() => setCurrentPage(page)}
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
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
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
        {!loading && filteredMemories.length === 0 && (
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
              <Camera className="w-12 h-12 text-accent-cyan/60" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-300 mb-3">No episodes found</h3>
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