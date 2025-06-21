import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight,
  Search,
  SortAsc,
  Filter,
  RefreshCw,
  Calendar,
  Camera,
  Loader2} from 'lucide-react';
import { type Memory, type MemoryCardProps, type SortDirection } from '@/types';
import { memoriesApi } from '@/services/api';
import React from 'react';

type SortOption = 'name' | 'date' | 'type';

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
      className="relative bg-dark-card/80 backdrop-blur-sm border border-dark-border/50 rounded-2xl p-6 overflow-hidden group"
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
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filter, setFilter] = useState({
    search: '',
    type: '',
    character: '',
    favorite: false,
    tag: '',
    version: ''
  });

  const itemsPerPage = 8;

  // Fetch memories from API
  const fetchMemories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortBy,
        sortOrder: sortDirection,
        ...(filter.type && { type: filter.type }),
        ...(filter.favorite && { favorite: filter.favorite }),
        ...(filter.search && { search: filter.search }),
      };

      const response = await memoriesApi.getMemories(params);
      setMemories(response.data);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Error fetching memories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch memories');
    } finally {
      setLoading(false);
    }
  };

  // Fetch memories on component mount and when dependencies change
  useEffect(() => {
    fetchMemories();
  }, [currentPage, sortBy, sortDirection, filter.type, filter.favorite, filter.search]);

  // Filter memories locally for character and tag filters (since these aren't supported by API yet)
  const filteredMemories = useMemo(() => {
    return memories.filter(memory => {
      // Character filter 
      if (filter.character && !memory.characters.some((char: string) => 
          char.toLowerCase().includes(filter.character.toLowerCase()))) return false;
      
      // Tag filter
      if (filter.tag && !memory.tags.some((tag: string) => 
          tag.toLowerCase().includes(filter.tag.toLowerCase()))) return false;
      
      return true;
    });
  }, [memories, filter.character, filter.tag]);

  const characters = [...new Set(memories.flatMap(m => m.characters))].sort();
  const types = ['photo', 'video', 'story', 'scene'];

  const handleToggleFavorite = async (id: string) => {
    try {
      const memory = memories.find(m => m.id === id);
      if (!memory) return;

      const newFavoriteStatus = !memory.favorite;
      
      // Optimistically update the UI
      setMemories(prev => prev.map(m => 
        m.id === id ? { ...m, favorite: newFavoriteStatus } : m
      ));

      // Update via API
      await memoriesApi.toggleMemoryFavorite(id, newFavoriteStatus);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      // Revert the optimistic update on error
      setMemories(prev => prev.map(m => 
        m.id === id ? { ...m, favorite: !m.favorite } : m
      ));
      setError('Failed to update favorite status');
    }
  };

  const handleSortChange = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('desc');
    }
  };

  const clearFilters = () => {
    setFilter({
      search: '',
      type: '',
      character: '',
      favorite: false,
      tag: '',
      version: ''
    });
    setCurrentPage(1);
  };

  const refreshMemories = () => {
    fetchMemories();
  };

  const SortButton = ({ sortKey, children }: { sortKey: SortOption; children: React.ReactNode }) => (
    <motion.button
      onClick={() => handleSortChange(sortKey)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center space-x-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
        sortBy === sortKey 
          ? 'bg-gradient-to-r from-gray-900 to-black text-white shadow-lg border border-gray-700' 
          : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-900/50 border border-gray-700/50'
      }`}
    >
      <span>{children}</span>
      {sortBy === sortKey && (
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: sortDirection === 'asc' ? 0 : 180 }}
          transition={{ duration: 0.2 }}
        >
          <SortAsc className="w-3 h-3" />
        </motion.div>
      )}
    </motion.button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-primary">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-accent-pink via-accent-cyan to-accent-purple bg-clip-text text-transparent">
            Memory Gallery
          </h1>
          <p className="text-gray-400 mt-1">
            {loading ? 'Loading memories...' : `Showing ${filteredMemories.length} of ${memories.length} memories`}
          </p>
        </motion.div>

        {/* Search and Filter Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filter.search}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                className="w-full bg-gray-900/70 backdrop-blur-sm border border-gray-700/50 rounded-xl pl-10 pr-4 py-3 focus:outline-hidden focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 transition-all placeholder-gray-500 text-white"
                placeholder="Search memories in all languages..."
              />
              {filter.search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setFilter(prev => ({ ...prev, search: '' }))}
                  className="absolute right-3 top-3 w-4 h-4 text-gray-400 hover:text-accent-cyan transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.button>
              )}
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-3">
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-3 rounded-xl transition-all flex items-center gap-2 ${
                  showFilters 
                    ? 'bg-gradient-to-r from-gray-900 to-black text-white shadow-lg border border-gray-700' 
                    : 'bg-gray-800/70 border border-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-900/50'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
              </motion.button>

                                <div className="text-sm text-gray-500 bg-gray-900/50 px-3 py-3 rounded-xl border border-gray-700/50">
                    <span className="text-gray-300 font-medium">{filteredMemories.length}</span> found
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
              <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Filter className="w-5 h-5 mr-2 text-gray-400" />
                    Advanced Filters
                  </h3>
                </div>

                {/* Filter Options */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                    <select
                      value={filter.type}
                      onChange={(e) => setFilter(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-gray-500 transition-all text-white"
                    >
                      <option value="">All Types</option>
                      {types.map(type => (
                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Character</label>
                    <select
                      value={filter.character}
                      onChange={(e) => setFilter(prev => ({ ...prev, character: e.target.value }))}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-gray-500 transition-all text-white"
                    >
                      <option value="">All Characters</option>
                      {characters.map(character => (
                        <option key={character} value={character}>{character}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tag</label>
                    <input
                      type="text"
                      value={filter.tag}
                      onChange={(e) => setFilter(prev => ({ ...prev, tag: e.target.value }))}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-gray-500 transition-all text-white"
                      placeholder="Search tags..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Version</label>
                    <select
                      value={filter.version}
                      onChange={(e) => setFilter(prev => ({ ...prev, version: e.target.value }))}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-hidden focus:border-gray-500 transition-all text-white"
                    >
                      <option value="">All Versions</option>
                      <option value="1.0">1.0</option>
                      <option value="1.5">1.5</option>
                      <option value="2.0">2.0</option>
                      <option value="2.5">2.5</option>
                      <option value="3.0">3.0</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Favorites</label>
                    <label className="flex items-center space-x-2 mt-3">
                      <input
                        type="checkbox"
                        checked={filter.favorite}
                        onChange={(e) => setFilter(prev => ({ ...prev, favorite: e.target.checked }))}
                        className="rounded-sm border-gray-700 text-gray-900 focus:ring-gray-500/20"
                      />
                      <span className="text-sm text-gray-300">Show Only Favorites</span>
                    </label>
                  </div>
                </div>

                {/* Sort Options */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="text-sm text-gray-400 flex items-center mr-2">
                    <SortAsc className="w-4 h-4 mr-1" />
                    Sort by:
                  </span>
                  <SortButton sortKey="name">Name</SortButton>
                  <SortButton sortKey="date">Date</SortButton>
                  <SortButton sortKey="type">Type</SortButton>
                </div>

                {/* Filter Actions */}
                <div className="flex items-center justify-between">
                  <motion.button
                    onClick={clearFilters}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-accent-pink/20 to-accent-purple/20 hover:from-accent-pink/30 hover:to-accent-purple/30 text-accent-pink border border-accent-pink/30 rounded-xl px-6 py-2 text-sm font-medium transition-all"
                  >
                    Clear All Filters
                  </motion.button>
                  <div className="text-sm text-gray-500">
                    <span className="text-accent-cyan font-medium">{filteredMemories.length}</span> of {memories.length} memories
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Memory Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-accent-cyan animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading memories...</p>
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
            <h3 className="text-2xl font-bold text-gray-300 mb-3">No memories found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              We couldn't find any memories matching your current filters. Try adjusting your search criteria.
            </p>
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
  );
} 