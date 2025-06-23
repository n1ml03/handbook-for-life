import { useState, useMemo, useEffect } from 'react';
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
  Users,
} from 'lucide-react';
import { girlsApi } from '@/services/api';
import { type Girl, type GirlCardProps, type SortDirection, type Swimsuit, getLocalizedName } from '@/types';
import UnifiedFilter, { FilterField, SortOption } from '@/components/features/UnifiedFilter';
import { addTranslationsToItems, searchInAllLanguages } from '@/services/multiLanguageSearch';
import { StandardPageLayout, PageSection, PageCard } from '@/components/layout/StandardPageLayout';
import { Button } from '@/components/ui/button';
import React from 'react';

const GirlCard = React.memo(function GirlCard({ girl, onClick }: GirlCardProps) {
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pow': return 'from-red-400 to-pink-500';
      case 'tec': return 'from-cyan-400 to-blue-500';
      case 'stm': return 'from-yellow-400 to-orange-500';
      default: return 'from-gray-400 to-gray-600';
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
                className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getTypeColor(girl.type)} text-white shadow-lg`}
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
          {Object.entries(girl.stats).map(([stat, value]) => (
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

export default function GirlListPage() {
  const navigate = useNavigate();
  const [girls, setGirls] = useState<Girl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchGirls = async () => {
      try {
        setLoading(true);
        const response = await girlsApi.getGirls({ limit: 1000 });
        setGirls(response.data);
      } catch (err) {
        console.error('Failed to fetch girls:', err);
        setError('Failed to load girls');
      } finally {
        setLoading(false);
      }
    };

    fetchGirls();
  }, []);
  const [showFilters, setShowFilters] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
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

  const itemsPerPage = 8;

  // Add multi-language support to girls data
  const multiLanguageGirls = useMemo(() => {
    return addTranslationsToItems(girls);
  }, [girls]);

  // Filter fields configuration
  const filterFields: FilterField[] = [
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
  ];

  // Sort options
  const sortOptions: SortOption[] = [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type' },
    { key: 'level', label: 'Level' },
    { key: 'total', label: 'Total Power' }
  ];

  const filteredAndSortedGirls = useMemo(() => {
    const filtered = multiLanguageGirls.filter(girl => {
      if (filterValues.type && girl.type !== filterValues.type) return false;
      // Use multi-language search instead of simple string matching
      if (filterValues.search && !searchInAllLanguages(girl, filterValues.search)) return false;
      if (filterValues.minLevel && girl.level < parseInt(filterValues.minLevel)) return false;
      if (filterValues.maxLevel && girl.level > parseInt(filterValues.maxLevel)) return false;
      if (filterValues.minPow && girl.stats.pow < parseInt(filterValues.minPow)) return false;
      if (filterValues.minTec && girl.stats.tec < parseInt(filterValues.minTec)) return false;
      if (filterValues.minStm && girl.stats.stm < parseInt(filterValues.minStm)) return false;
      if (filterValues.minApl && girl.stats.apl < parseInt(filterValues.minApl)) return false;
      if (filterValues.hasSwimsuit && !girl.swimsuit) return false;
      if (filterValues.hasAccessories && girl.accessories.length === 0) return false;
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
      
      if (typeof aValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [multiLanguageGirls, filterValues, sortBy, sortDirection]);

  const totalPages = useMemo(() => Math.ceil(filteredAndSortedGirls.length / itemsPerPage), [filteredAndSortedGirls.length, itemsPerPage]);
  const paginatedGirls = useMemo(() => filteredAndSortedGirls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ), [filteredAndSortedGirls, currentPage, itemsPerPage]);

  const handleFilterChange = (key: string, value: any) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy: string, newDirection: SortDirection) => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
  };

  const clearFilters = () => {
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
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-primary flex items-center justify-center">
        <div className="text-white text-lg">Loading girls...</div>
      </div>
    );
  }

  return (
    <StandardPageLayout
      title="Girl Collection"
      subtitle={`Discover and explore ${girls.length} unique characters`}
      icon={<Users className="w-12 h-12 text-accent-pink" />}
      containerSize="xl"
      spacing="normal"
      animateEntrance={true}
      staggerChildren={true}
      ariaLabel="Girl collection page"
    >
      {/* Search and Filter Controls */}
      <PageSection>
        <UnifiedFilter
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          filterFields={filterFields}
          sortOptions={sortOptions}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          resultCount={filteredAndSortedGirls.length}
          totalCount={girls.length}
          itemLabel="girls"
          accentColor="accent-pink"
          secondaryColor="accent-purple"
          expandableStats={true}
          isFilterExpanded={isFilterExpanded}
          setIsFilterExpanded={setIsFilterExpanded}
          headerIcon={<User className="w-4 h-4" />}
          searchAriaLabel="Search girls by name, type, or attributes"
          filterAriaLabel="Show or hide advanced filters"
        />
      </PageSection>

      {/* Girl Display */}
      <PageSection>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginatedGirls.map((girl, index) => (
            <motion.div
              key={girl.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <GirlCard
                girl={girl}
                onClick={() => navigate(`/girls/${girl.id}`)}
              />
            </motion.div>
          ))}
        </div>
      </PageSection>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <PageSection>
          <div className="flex items-center justify-center space-x-3">
            <Button
              variant="modern"
              size="icon"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="flex space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "modern-primary" : "modern"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="min-w-[40px]"
                    aria-label={`Go to page ${page}`}
                    aria-current={currentPage === page ? "page" : undefined}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="modern"
              size="icon"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </PageSection>
      )}

      {/* Enhanced Empty State */}
      {filteredAndSortedGirls.length === 0 && (
        <PageSection>
          <PageCard className="text-center py-16" hover={false}>
            <motion.div
              className="w-24 h-24 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-accent-cyan/20"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <User className="w-12 h-12 text-accent-cyan/60" />
            </motion.div>
            <h3 className="text-2xl font-bold text-foreground mb-3">No girls found</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We couldn't find any girls matching your current filters. Try adjusting your search criteria.
            </p>
            <Button
              variant="neon"
              onClick={clearFilters}
              className="px-8 py-3"
            >
              Clear All Filters
            </Button>
          </PageCard>
        </PageSection>
      )}
    </StandardPageLayout>
  );
}