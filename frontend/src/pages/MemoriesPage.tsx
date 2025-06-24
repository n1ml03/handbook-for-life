import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Camera,
  Loader2} from 'lucide-react';
import { type Memory, type MemoryCardProps, type SortDirection, type Episode, episodeToMemory } from '@/types';
import { episodesApi } from '@/services/api';
import { PageLoadingState } from '@/components/ui';
import UnifiedFilter from '@/components/features/UnifiedFilter';
import { createMemoriesFilterConfig, memoriesSortOptions } from '@/components/features/FilterConfigs';
import React from 'react';

const MemoryCard = React.memo(function MemoryCard({ memory }: MemoryCardProps) {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="relative modern-card p-6 overflow-hidden group"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/5 via-accent-cyan/5 to-accent-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-accent-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-white text-lg truncate">{memory.name}</h3>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-xl flex items-center justify-center border border-accent-cyan/20">
              <span className="text-2xl">{memory.thumbnail}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">
            {memory.description}
          </p>
        </div>

        {/* Date */}
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-accent-cyan" />
          <span className="text-xs text-gray-400">{formatDate(memory.date)}</span>
        </div>

        {/* Characters */}
        {memory.characters.length > 0 && (
          <div className="mb-4">
            <div className="bg-gradient-to-r from-accent-cyan/10 to-accent-purple/10 rounded-xl p-3 border border-accent-cyan/20">
              <p className="text-xs font-bold text-accent-cyan mb-2">Characters</p>
              <div className="flex flex-wrap gap-1">
                {memory.characters.map((character, index) => (
                  <span 
                    key={index}
                    className="text-xs bg-dark-primary/50 px-2 py-1 rounded-sm border border-dark-border/30 text-gray-300"
                  >
                    {character}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        {memory.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {memory.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="text-xs bg-accent-pink/20 px-2 py-1 rounded-sm border border-accent-pink/30 text-accent-pink"
                >
                  #{tag}
                </span>
              ))}
              {memory.tags.length > 3 && (
                <span className="text-xs text-gray-400 px-2 py-1">
                  +{memory.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<string>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterValues, setFilterValues] = useState<Record<string, string | boolean | number>>({});

  const itemsPerPage = 8;

  // Fetch episodes from API and convert to memories
  const fetchEpisodes = useCallback(async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortBy,
        sortOrder: sortDirection,
        ...(filterValues.type && typeof filterValues.type === 'string' && { type: filterValues.type }),
        ...(filterValues.entityType && typeof filterValues.entityType === 'string' && { entityType: filterValues.entityType }),
        ...(filterValues.entityId && { entityId: Number(filterValues.entityId) }),
        ...(filterValues.search && typeof filterValues.search === 'string' && { search: filterValues.search }),
      };

      const response = await episodesApi.getEpisodes(params);
      const episodeData = response.data || [];
      
      // Convert episodes to memories
      const memoryData = episodeData.map((episode: Episode) => episodeToMemory(episode));
      setMemories(memoryData);
      
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Error fetching episodes:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, sortDirection, filterValues.type, filterValues.entityType, filterValues.entityId, filterValues.search]);

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
  const characters = useMemo(() => [...new Set(memories.map(m => m.characters).flat())].sort(), [memories]);
  const versions = useMemo(() => ['1.0', '1.5', '2.0', '2.5', '3.0'], []);

  // Create filter configuration
  const filterFields = useMemo(() => createMemoriesFilterConfig(episodeTypes, characters, versions), [characters, versions]);

  const handleFilterChange = (key: string, value: string | boolean | number) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy: string, newDirection: SortDirection) => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
  };

  const clearFilters = () => {
    setFilterValues({});
    setCurrentPage(1);
  };

  const handleToggleFavorite = async (id: string) => {
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
  };



  return (
    <PageLoadingState 
      isLoading={loading && memories.length === 0} 
      message="Đang tải danh sách kỷ niệm..."
    >
    <div className="modern-page">
      <div className="modern-container-lg">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="modern-page-header"
        >
          <h1 className="modern-page-title">
            Episodes Gallery
          </h1>
          <p className="modern-page-subtitle">
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
        >
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-accent-cyan animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading episodes...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
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