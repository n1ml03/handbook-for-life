import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Search} from 'lucide-react';
import { itemsApi } from '@/services/api';
import { type AccessoryCardProps, type SortDirection, type Item } from '@/types';
import UnifiedFilter from '@/components/features/UnifiedFilter';
import { createAccessoryFilterConfig, accessorySortOptions } from '@/components/features/FilterConfigs';
import { addTranslationsToItems, searchInAllLanguages } from '@/services/multiLanguageSearch';
import React from 'react';

const accessoryTypes = ['Necklace', 'Earrings', 'Bracelet', 'Ring', 'Hair', 'Other'] as const;
const rarities = ['SSR', 'SR', 'R'] as const;
const versions = ['1.0', '1.5', '2.0', '2.5', '3.0'] as const;

const AccessoryCard = React.memo(function AccessoryCard({ accessory }: AccessoryCardProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'SSR': return 'from-yellow-400 to-orange-500 text-black';
      case 'SR': return 'from-purple-400 to-pink-500 text-white';
      case 'R': return 'from-blue-400 to-cyan-500 text-white';
      default: return 'from-gray-500 to-gray-700 text-white';
    }
  };

  const getStatColor = (stat: string) => {
    switch (stat.toLowerCase()) {
      case 'pow': return 'text-red-400';
      case 'tec': return 'text-cyan-400';
      case 'stm': return 'text-yellow-400';
      case 'apl': return 'text-purple-400';
      default: return 'text-gray-400';
    }
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
              <h3 className="font-bold text-white text-lg truncate">{accessory.name || accessory.name_en}</h3>
              <motion.div
                className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getRarityColor(accessory.rarity)} shadow-lg`}
                whileHover={{ scale: 1.1 }}
              >
                {accessory.rarity}
              </motion.div>
            </div>
            <p className="text-sm text-gray-400 mb-2">{accessory.type || accessory.category}</p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-xl flex items-center justify-center border border-accent-cyan/20">
            <span className="text-2xl">💎</span>
          </div>
        </div>

        {/* Stats */}
        {accessory.stats && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {Object.entries(accessory.stats).map(([stat, value]) => (
              value > 0 && (
                <motion.div 
                  key={stat} 
                  className="flex justify-between items-center p-2 bg-dark-primary/30 rounded-lg border border-dark-border/30"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className={`uppercase font-bold text-xs ${getStatColor(stat)}`}>
                    {stat}
                  </span>
                  <span className="font-bold text-white">+{value}</span>
                </motion.div>
              )
            ))}
          </div>
        )}

        {/* Total Stats */}
        {accessory.stats && (
          <div className="mb-4 p-3 bg-gradient-to-r from-accent-cyan/10 to-accent-purple/10 rounded-xl border border-accent-cyan/20">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-300">Total Power</span>
              <span className="text-lg font-bold bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">
                {(accessory.stats.pow || 0) + (accessory.stats.tec || 0) + (accessory.stats.stm || 0) + (accessory.stats.apl || 0)}
              </span>
            </div>
          </div>
        )}

        {/* Skill */}
        {(accessory.skill || accessory.description) && (
          <div className="bg-dark-primary/50 rounded-xl p-3 border border-dark-border/30">
            <p className="text-xs font-bold text-accent-cyan mb-2 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              {accessory.skill ? 'Skill Effect' : 'Description'}
            </p>
            <p className="text-xs text-gray-300 leading-relaxed">{accessory.skill || accessory.description}</p>
          </div>
        )}

        {/* ID */}
        <div className="mt-4 pt-3 border-t border-dark-border/30">
          <span className="text-xs text-gray-500 font-mono bg-dark-primary/30 px-2 py-1 rounded-sm">
            {accessory.id}
          </span>
        </div>
      </div>
    </motion.div>
  );
});

export default function AccessoryPage() {
  const [accessories, setAccessories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchAccessories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Use itemsApi with category filter for accessories
        const response = await itemsApi.getItems({ 
          limit: 1000, 
          category: 'accessory'
        });
        
        // Transform the data to match expected accessory format
        const transformedData = response.data.data.map((item: any) => ({
          id: item.id || item.unique_key,
          name: item.name_en || item.name,
          type: item.category || item.type || 'Other',
          rarity: item.rarity || 'R',
          stats: {
            pow: item.stat_pow || item.stats?.pow || 0,
            tec: item.stat_tec || item.stats?.tec || 0,
            stm: item.stat_stm || item.stats?.stm || 0,
            apl: item.stat_apl || item.stats?.apl || 0
          },
          skill: item.skill_description || item.skill || item.description,
          description: item.description_en || item.description
        }));
        
        setAccessories(transformedData);
        setTotalItems(transformedData.length);
      } catch (err) {
        console.error('Failed to fetch accessories:', err);
        setError('Failed to load accessories. The accessories endpoint may not be available.');
      } finally {
        setLoading(false);
      }
    };

    fetchAccessories();
  }, []);

  const itemsPerPage = 8;

  // Create filter configuration
  const filterFields = createAccessoryFilterConfig(
    Array.from(rarities),
    Array.from(accessoryTypes),
    Array.from(versions)
  );

  // Add multi-language support to accessories data
  const multiLanguageAccessories = useMemo(() => {
    return addTranslationsToItems(accessories);
  }, [accessories]);

  const filteredAndSortedAccessories = useMemo(() => {
    const filtered = multiLanguageAccessories.filter(accessory => {
      if (filterValues.rarity && accessory.rarity !== filterValues.rarity) return false;
      if (filterValues.type && accessory.type !== filterValues.type) return false;
      if (filterValues.version && !accessory.id.toString().includes(filterValues.version)) return false;
      if (filterValues.search && !searchInAllLanguages(accessory, filterValues.search)) return false;
      if (filterValues.minPow && (accessory.stats?.pow || 0) < parseInt(filterValues.minPow)) return false;
      if (filterValues.minTec && (accessory.stats?.tec || 0) < parseInt(filterValues.minTec)) return false;
      if (filterValues.minStm && (accessory.stats?.stm || 0) < parseInt(filterValues.minStm)) return false;
      if (filterValues.minApl && (accessory.stats?.apl || 0) < parseInt(filterValues.minApl)) return false;
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
          aValue = a.type.toLowerCase();
          bValue = b.type.toLowerCase();
          break;
        case 'rarity':
          const rarityOrder = { 'SSR': 4, 'SR': 3, 'R': 2 };
          aValue = rarityOrder[a.rarity as keyof typeof rarityOrder] || 0;
          bValue = rarityOrder[b.rarity as keyof typeof rarityOrder] || 0;
          break;
        case 'pow':
          aValue = a.stats?.pow || 0;
          bValue = b.stats?.pow || 0;
          break;
        case 'tec':
          aValue = a.stats?.tec || 0;
          bValue = b.stats?.tec || 0;
          break;
        case 'stm':
          aValue = a.stats?.stm || 0;
          bValue = b.stats?.stm || 0;
          break;
        case 'apl':
          aValue = a.stats?.apl || 0;
          bValue = b.stats?.apl || 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [multiLanguageAccessories, filterValues, sortBy, sortDirection]);

  const totalPages = useMemo(() => Math.ceil(filteredAndSortedAccessories.length / itemsPerPage), [filteredAndSortedAccessories.length, itemsPerPage]);
  const paginatedAccessories = useMemo(() => filteredAndSortedAccessories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ), [filteredAndSortedAccessories, currentPage, itemsPerPage]);

  const handleFilterChange = (key: string, value: any) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-primary flex items-center justify-center">
        <div className="text-white text-lg">Loading accessories...</div>
      </div>
    );
  }

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
            Accessory Gallery
          </h1>
          <p className="text-gray-400 mt-1">
            Showing {filteredAndSortedAccessories.length} of {accessories.length} accessories
          </p>
        </motion.div>

        {/* Unified Filter Component */}
        <UnifiedFilter
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          filterFields={filterFields}
          sortOptions={accessorySortOptions}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          resultCount={filteredAndSortedAccessories.length}
          itemLabel="accessories"
          blackTheme={true}
          expandableStats={true}
          isFilterExpanded={isFilterExpanded}
          setIsFilterExpanded={setIsFilterExpanded}
          accentColor="accent-cyan"
          secondaryColor="accent-purple"
        />

        {/* Accessory Gallery */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {paginatedAccessories.map((accessory, index) => (
              <motion.div
                key={accessory.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <AccessoryCard accessory={accessory} />
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
        {filteredAndSortedAccessories.length === 0 && (
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
            <h3 className="text-2xl font-bold text-gray-300 mb-3">No accessories found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              We couldn't find any accessories matching your current filters. Try adjusting your search criteria.
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