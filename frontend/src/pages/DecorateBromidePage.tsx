import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Image,
  Palette,
  Search
} from 'lucide-react';
import { bromidesApi } from '@/services/api';
import { type Bromide, type SortDirection } from '@/types';
import UnifiedFilter from '@/components/features/UnifiedFilter';
import { createDecorBromideFilterConfig, bromideSortOptions } from '@/components/features/FilterConfigs';

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

  const getTypeColor = (type: string) => {
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

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="relative bg-dark-card/80 backdrop-blur-sm border border-dark-border/50 rounded-2xl overflow-hidden group"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/5 via-accent-cyan/5 to-accent-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-accent-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        {/* Image Preview */}
        <div className="aspect-video bg-gradient-to-br from-dark-primary/50 to-dark-secondary/50 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <Image className="w-16 h-16 text-gray-400" />
          </div>
          {/* Rarity Badge */}
          <div className="absolute top-3 left-3">
            <motion.div
              className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getRarityColor(bromide.rarity)} text-white shadow-lg`}
              whileHover={{ scale: 1.1 }}
            >
              {bromide.rarity}
            </motion.div>
          </div>
          {/* Type Badge */}
          <div className="absolute top-3 right-3">
            <motion.div
              className={`px-3 py-1 rounded-full text-xs font-bold bg-dark-card/80 backdrop-blur-sm ${getTypeColor(bromide.category)} border border-dark-border/50`}
              whileHover={{ scale: 1.1 }}
            >
              {bromide.category}
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="font-bold text-white text-lg mb-2">{bromide.name}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{bromide.description}</p>
          </div>

          {/* Effects */}
          {(bromide.effects && bromide.effects.length > 0) && (
            <div>
              <p className="text-xs font-bold text-accent-cyan mb-3 flex items-center">
                <Palette className="w-3 h-3 mr-1" />
                Effects
              </p>
              <div className="space-y-2">
                {bromide.effects?.map((effect: any, index: number) => (
                  <div key={index} className="p-3 bg-dark-primary/30 rounded-lg border border-dark-border/30">
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-gray-300 leading-relaxed">{effect.description}</span>
                      {effect.value && (
                        <span className="text-xs font-bold text-accent-cyan">
                          +{effect.value}{effect.type === 'percentage' ? '%' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Character Associated */}
          {bromide.character && (
            <div className="p-3 bg-gradient-to-r from-accent-cyan/10 to-accent-purple/10 rounded-xl border border-accent-cyan/20">
              <p className="text-xs font-bold text-accent-gold mb-2 flex items-center">
                <Palette className="w-3 h-3 mr-1" />
                Featured Character
              </p>
              <p className="text-sm text-white font-medium">{bromide.character}</p>
            </div>
          )}

          {/* Source & ID */}
          <div className="flex items-center justify-between text-xs pt-3 border-t border-dark-border/30">
            <span className="text-gray-400">{bromide.source ?? bromide.category}</span>
            <span className="text-gray-500 font-mono bg-dark-primary/30 px-2 py-1 rounded-sm">{bromide.id}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function DecorateBromidePage() {
  const [bromides, setBromides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filter, setFilter] = useState({
    search: '',
    type: '',
    rarity: '',
    character: '',
    source: '',
    version: '',
    hasEffects: false,
    hasCharacter: false
  });

  const itemsPerPage = 8;

  useEffect(() => {
    const fetchBromides = async () => {
      try {
        setLoading(true);
        const response = await bromidesApi.getBromides({ limit: 1000 });
        setBromides(response.data.data as any[]);
      } catch (err) {
        console.error('Failed to fetch bromides:', err);
        setError('Failed to load bromides');
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

  const filteredAndSortedBromides = useMemo(() => {
    const filtered = bromides.filter(bromide => {
      // Search filter - search across name, description, character, and source
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        const searchableText = [
          bromide.name,
          bromide.description,
          bromide.character,
          bromide.source ?? bromide.category
        ].filter(Boolean).join(' ').toLowerCase();

        if (!searchableText.includes(searchTerm)) return false;
      }

      // Type filter
      if (filter.type && (bromide.category !== filter.type)) return false;

      // Rarity filter
      if (filter.rarity && bromide.rarity !== filter.rarity) return false;

      // Character filter
      if (filter.character && bromide.character !== filter.character) return false;

      // Source filter
      if (filter.source && (bromide.source ?? bromide.category) !== filter.source) return false;

      // Effects filter
      if (filter.hasEffects && (!bromide.effects || bromide.effects.length === 0)) return false;

      // Character presence filter
      if (filter.hasCharacter && !bromide.character) return false;

      // Version filter (check if ID contains version)
      if (filter.version && !bromide.id.includes(filter.version)) return false;

      return true;
    });

    return filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'type':
          aValue = a.category.toLowerCase();
          bValue = b.category.toLowerCase();
          break;
        case 'rarity':
          const rarityOrder = { 'UR': 5, 'SSR': 4, 'SR': 3, 'R': 2, 'N': 1 };
          aValue = rarityOrder[a.rarity as keyof typeof rarityOrder] || 0;
          bValue = rarityOrder[b.rarity as keyof typeof rarityOrder] || 0;
          break;
        case 'character':
          aValue = (a.character || '').toLowerCase();
          bValue = (b.character || '').toLowerCase();
          break;
        case 'source':
          aValue = ((a.source ?? a.category) || '').toLowerCase();
          bValue = ((b.source ?? b.category) || '').toLowerCase();
          break;
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (typeof aValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [bromides, filter, sortBy, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedBromides.length / itemsPerPage);
  const paginatedBromides = filteredAndSortedBromides.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSortChange = (newSortBy: string, direction: SortDirection) => {
    setSortBy(newSortBy);
    setSortDirection(direction);
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilter({
      search: '',
      type: '',
      rarity: '',
      character: '',
      source: '',
      version: '',
      hasEffects: false,
      hasCharacter: false
    });
    setCurrentPage(1);
  };

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
            Bromide & Decoration Collection
          </h1>
          <p className="text-gray-400 mt-1">
            Showing {filteredAndSortedBromides.length} of {bromides.length} items
          </p>
        </motion.div>

        {/* Search and Filter Controls */}
        <UnifiedFilter
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          filterFields={filterFields}
          sortOptions={bromideSortOptions}
          filterValues={filter}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          resultCount={filteredAndSortedBromides.length}
          itemLabel="bromides & decorations"
          accentColor="accent-cyan"
          secondaryColor="accent-purple"
          blackTheme={true}
          headerIcon={<Search className="w-4 h-4" />}
        />
        
        {/* Bromides Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
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
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              We couldn't find any bromides or decorations matching your current filters. Try adjusting your search criteria.
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