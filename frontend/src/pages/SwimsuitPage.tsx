import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight,
  Search,
  Calendar, 
  RotateCcw,
  Sparkles, 
  User} from 'lucide-react';
import { type Swimsuit } from '@/types';
import { addTranslationsToItems, searchInAllLanguages } from '@/services/multiLanguageSearch';
import { swimsuitsApi } from '@/services/api';
import { safeExtractArrayData } from '@/services/utils';
import { PageLoadingState, MultiLanguageCard, type MultiLanguageNames } from '@/components/ui';
import UnifiedFilter, { SortDirection } from '@/components/features/UnifiedFilter';
import { createSwimsuitFilterConfig, swimsuitSortOptions } from '@/components/features/FilterConfigs';
import { useDebounce } from '@/hooks/useDebounce';
import React from 'react';

// Updated SwimsuitCard Component to match DecorateBromide design
interface SwimsuitCardProps {
  swimsuit: Swimsuit & { stats?: { pow: number; tec: number; stm: number; apl: number }; skills?: any[]; character?: string; name?: string };
}

const SwimsuitCard = React.memo(function SwimsuitCard({ swimsuit }: SwimsuitCardProps) {
  const [currentView, setCurrentView] = useState<'before' | 'after'>('before');
  const characterName = (swimsuit.character as any)?.name_en || 'Unknown';

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'SSR+': return 'from-red-400 to-pink-600';
      case 'SSR': return 'from-yellow-400 to-orange-500';
      case 'SR': return 'from-purple-400 to-pink-500';
      case 'R': return 'from-blue-400 to-cyan-500';
      case 'N': return 'from-gray-400 to-gray-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const names: MultiLanguageNames = {
    name_jp: swimsuit.name_jp,
    name_en: swimsuit.name_en,
    name_cn: swimsuit.name_cn,
    name_tw: swimsuit.name_tw,
    name_kr: swimsuit.name_kr
  };

  const header = (
    <div className="relative">
      {/* Image Preview - Clickable */}
      <motion.div 
        className="aspect-video bg-gradient-to-br from-dark-primary/50 to-dark-secondary/50 relative rounded-lg overflow-hidden mb-3 cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Show swimsuit image if available, otherwise show placeholder */}
        {((currentView === 'before' && swimsuit.image_before_url) || (currentView === 'after' && swimsuit.image_after_url)) ? (
          <img
            src={currentView === 'before' ? swimsuit.image_before_url : swimsuit.image_after_url}
            alt={`${characterName} swimsuit ${currentView}`}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ zIndex: 1 }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <User className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Rarity Badge */}
        <div className="absolute top-2 left-2">
          <motion.div
            className={`px-2 py-1 rounded text-xs font-bold bg-gradient-to-r ${getRarityColor(swimsuit.rarity)} text-white shadow-lg`}
            whileHover={{ scale: 1.1 }}
          >
            {swimsuit.rarity}
          </motion.div>
        </div>

        {/* Toggle Button - Small */}
        <div className="absolute top-2 right-2">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentView(currentView === 'before' ? 'after' : 'before');
            }}
            className={`px-2 py-1 rounded text-xs font-bold transition-all shadow-lg ${
              currentView === 'before'
                ? 'bg-accent-cyan/80 text-white hover:bg-accent-cyan'
                : 'bg-accent-purple/80 text-white hover:bg-accent-purple'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {currentView === 'before' ? 'Before' : 'After'}
          </motion.button>
        </div>

        {/* Limited Badge - moved down if exists */}
        {swimsuit.is_limited && (
          <div className="absolute bottom-2 right-2">
            <div className="px-2 py-1 rounded text-xs font-bold bg-black/60 text-white shadow-lg flex items-center gap-1">
              <RotateCcw className="w-3 h-3" />
              <span>Limited</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Category and ID */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <User className="w-3 h-3 text-accent-cyan" />
          <span className="text-xs text-accent-cyan font-medium">{characterName}</span>
        </div>
        <span className="text-xs text-gray-500 font-mono bg-dark-primary/30 px-2 py-1 rounded-sm">
          #{swimsuit.id}
        </span>
      </div>
    </div>
  );

  // Skills and release info
  const skillsInfo = (
    <div className="space-y-3">
      {/* Skills Summary */}
      {swimsuit.skills && swimsuit.skills.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              Skills
            </h4>
            <span className="text-xs text-accent-cyan font-bold">
              {(swimsuit.skills || []).length}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {(swimsuit.skills || []).slice(0, 3).map((skill: any) => (
              <div
                key={skill.id || skill.skill_id}
                className={`px-2 py-1 rounded text-xs font-medium border ${
                  skill.type === 'power' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                  skill.type === 'technique' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' :
                  skill.type === 'stamina' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                  'bg-purple-500/10 text-purple-400 border-purple-500/20'
                }`}
              >
                {(skill.name || skill.skill?.name_en || 'Skill').split(' ')[0]}
              </div>
            ))}
            {(swimsuit.skills || []).length > 3 && (
              <div className="px-2 py-1 rounded text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
                +{(swimsuit.skills || []).length - 3}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Release Info */}
      <div className="flex items-center text-xs text-gray-500">
        <Calendar className="w-3 h-3 mr-1" />
        <span>{swimsuit.release_date_gl || 'Unknown'}</span>
      </div>
    </div>
  );

  return (
    <MultiLanguageCard
      names={names}
      primaryLanguage="en"
      languageVariant="compact"
      header={header}
    >
      {skillsInfo}
    </MultiLanguageCard>
  );
});

export default function SwimsuitPage() {
  const [swimsuits, setSwimsuits] = useState<Swimsuit[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterValues, setFilterValues] = useState<{
    search: string;
    rarity: string;
    character: string;
    minPow: string;
    minTec: string;
    minStm: string;
    minApl: string;
    hasSkills: boolean;
    releaseYear: string;
    version: string;
  }>({
    search: '',
    rarity: '',
    character: '',
    minPow: '',
    minTec: '',
    minStm: '',
    minApl: '',
    hasSkills: false,
    releaseYear: '',
    version: ''
  });

  const itemsPerPage = 12;

  // Debounce search to improve performance
  const debouncedSearch = useDebounce(filterValues.search, 500);

  // Fetch swimsuits data
  useEffect(() => {
    const fetchSwimsuits = async () => {
      try {
        setLoading(true);
        const response = await swimsuitsApi.getSwimsuits({ limit: 100, page: 1 });
        const responseData = safeExtractArrayData<Swimsuit>(response, 'swimsuits API');
        setSwimsuits(responseData);
      } catch (err) {
        console.error('Error fetching swimsuits:', err);
        setSwimsuits([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSwimsuits();
  }, []);

  // Add multi-language support to swimsuits data
  const multiLanguageSwimsuits = useMemo(() => {
    const transformedSwimsuits = swimsuits.map(swimsuit => ({
      ...swimsuit,
      id: String(swimsuit.id),
      name: swimsuit.name_en || `Swimsuit ${swimsuit.id}`,
      description: swimsuit.description_en,
      // Use existing character data from API response
      character: swimsuit.character || { name_en: `Character ${swimsuit.character_id}` },
      // Add stats based on suit_type and total_stats_awakened
      stats: (() => {
        const total = swimsuit.total_stats_awakened || 0;
        const base = Math.floor(total / 4);
        switch (swimsuit.suit_type) {
          case 'POW':
            return { pow: Math.floor(total * 0.4), tec: base, stm: base, apl: base };
          case 'TEC':
            return { pow: base, tec: Math.floor(total * 0.4), stm: base, apl: base };
          case 'STM':
            return { pow: base, tec: base, stm: Math.floor(total * 0.4), apl: base };
          case 'APL':
            return { pow: base, tec: base, stm: base, apl: Math.floor(total * 0.4) };
          default:
            return { pow: base, tec: base, stm: base, apl: base };
        }
      })(),
      // Add empty skills array
      skills: []
    }));
    const result = addTranslationsToItems(transformedSwimsuits);
    return result;
  }, [swimsuits]);

  const filteredAndSortedSwimsuits = useMemo(() => {
    const filtered = multiLanguageSwimsuits.filter((swimsuit: any) => {
      if (filterValues.rarity && swimsuit.rarity !== filterValues.rarity) return false;
      const characterName = swimsuit.character?.name_en || 'Unknown';
      if (filterValues.character && characterName !== filterValues.character) return false;
      // Use debounced search for better performance
      if (debouncedSearch && !searchInAllLanguages(swimsuit, debouncedSearch)) return false;
      const stats = (swimsuit as any).stats || { pow: 0, tec: 0, stm: 0, apl: 0 };
      if (filterValues.minPow && stats.pow < Number(filterValues.minPow)) return false;
      if (filterValues.minTec && stats.tec < Number(filterValues.minTec)) return false;
      if (filterValues.minStm && stats.stm < Number(filterValues.minStm)) return false;
      if (filterValues.minApl && stats.apl < Number(filterValues.minApl)) return false;
      if (filterValues.hasSkills && (!swimsuit.skills || swimsuit.skills.length === 0)) return false;
      const releaseDate = swimsuit.release_date_gl || '';
      if (filterValues.releaseYear && !releaseDate.includes(filterValues.releaseYear as string)) return false;
      if (filterValues.version && !String(swimsuit.id).includes(filterValues.version as string)) return false; // Simple version check
      return true;
    });

    return filtered.sort((a, b) => {
      let aValue: string | number | Date;
      let bValue: string | number | Date;
      
      switch (sortBy) {
        case 'name':
          aValue = (a.name || a.name_en || '').toLowerCase();
          bValue = (b.name || b.name_en || '').toLowerCase();
          break;
        case 'character':
          aValue = (a.character?.name_en || '').toLowerCase();
          bValue = (b.character?.name_en || '').toLowerCase();
          break;
        case 'rarity': {
          const rarityOrder = { 'SSR+': 4, 'SSR': 3, 'SR': 2, 'R': 1, 'N': 0 };
          aValue = rarityOrder[a.rarity as keyof typeof rarityOrder] || 0;
          bValue = rarityOrder[b.rarity as keyof typeof rarityOrder] || 0;
          break;
        }
        case 'pow':
          aValue = (a as any).stats?.pow || 0;
          bValue = (b as any).stats?.pow || 0;
          break;
        case 'tec':
          aValue = (a as any).stats?.tec || 0;
          bValue = (b as any).stats?.tec || 0;
          break;
        case 'stm':
          aValue = (a as any).stats?.stm || 0;
          bValue = (b as any).stats?.stm || 0;
          break;
        case 'apl':
          aValue = (a as any).stats?.apl || 0;
          bValue = (b as any).stats?.apl || 0;
          break;
        case 'total': {
          const aStats = (a as any).stats || { pow: 0, tec: 0, stm: 0, apl: 0 };
          const bStats = (b as any).stats || { pow: 0, tec: 0, stm: 0, apl: 0 };
          aValue = aStats.pow + aStats.tec + aStats.stm + aStats.apl;
          bValue = bStats.pow + bStats.tec + bStats.stm + bStats.apl;
          break;
        }
        case 'release':
          aValue = new Date(a.release_date_gl || '2023-01-01');
          bValue = new Date(b.release_date_gl || '2023-01-01');
          break;
        default:
          aValue = (a.name || a.name_en || '').toLowerCase();
          bValue = (b.name || b.name_en || '').toLowerCase();
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      const numA = Number(aValue);
      const numB = Number(bValue);
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    });
  }, [multiLanguageSwimsuits, debouncedSearch, filterValues.rarity, filterValues.character, filterValues.minPow, filterValues.minTec, filterValues.minStm, filterValues.minApl, filterValues.hasSkills, filterValues.releaseYear, filterValues.version, sortBy, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedSwimsuits.length / itemsPerPage);
  const paginatedSwimsuits = filteredAndSortedSwimsuits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const characters = useMemo(() => [...new Set(swimsuits.map(s => s.character?.name_en || 'Unknown'))].sort(), [swimsuits]);
  const rarities = useMemo(() => ['SSR+', 'SSR', 'SR', 'R', 'N'], []);
  const releaseYears = useMemo(() => [...new Set(swimsuits.map(s => (s.release_date_gl || '2023-01-01').toString().split('-')[0]))].sort().reverse(), [swimsuits]);
  const versions = useMemo(() => ['1.0', '1.5', '2.0', '2.5', '3.0'], []);

  // Create filter configuration
  const filterFields = useMemo(() => createSwimsuitFilterConfig(rarities, characters, releaseYears, versions), [characters, rarities, releaseYears, versions]);

  const handleFilterChange = (key: string, value: string | boolean | number) => {
    if (key === 'hasSkills') {
      setFilterValues(prev => ({ ...prev, [key]: Boolean(value) }));
    } else {
      setFilterValues(prev => ({ ...prev, [key]: String(value) }));
    }
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy: string, newDirection: SortDirection) => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
  };

  const clearFilters = () => {
    setFilterValues({
      search: '',
      rarity: '',
      character: '',
      minPow: '',
      minTec: '',
      minStm: '',
      minApl: '',
      hasSkills: false,
      releaseYear: '',
      version: ''
    });
    setCurrentPage(1);
  };

  return (
    <PageLoadingState isLoading={loading} message="Loading swimsuits...">
    
    <div className="modern-page">
      <div className="modern-container-lg">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="modern-page-header"
        >
          <h1 className="modern-page-title">
            Swimsuit Gallery
          </h1>
        </motion.div>

        {/* Unified Filter Component */}
        <UnifiedFilter
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          filterFields={filterFields}
          sortOptions={swimsuitSortOptions}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          resultCount={filteredAndSortedSwimsuits.length}
          totalCount={swimsuits.length}
          itemLabel="swimsuits"
          expandableStats={true}
          isFilterExpanded={isFilterExpanded}
          setIsFilterExpanded={setIsFilterExpanded}
          accentColor="accent-cyan"
          secondaryColor="accent-purple"
        />

        {/* Swimsuit Gallery Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >

          {/* Gallery Grid */}
          <div className="grid-responsive-cards mb-12">
            {paginatedSwimsuits.map((swimsuit: any, index: number) => (
              <motion.div
                key={swimsuit.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: 0.05 * index,
                  duration: 0.4,
                  ease: "easeOut"
                }}
                whileHover={{ y: -4 }}
                className="relative"
              >
                <SwimsuitCard swimsuit={swimsuit} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center space-x-2 mt-16 mb-8"
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
        {filteredAndSortedSwimsuits.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-20 mt-8"
          >
            <motion.div
              className="w-24 h-24 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-accent-cyan/20"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Search className="w-12 h-12 text-accent-cyan/60" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-300 mb-3">No swimsuits found</h3>
            <p className="text-muted-foreground mb-6">
              {filterValues.search ?
                'Try adjusting your search terms or clear the search to see all swimsuits.' :
                'Try adjusting your filters or clear them to see all swimsuits.'
              }
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
    </PageLoadingState>
  );
} 