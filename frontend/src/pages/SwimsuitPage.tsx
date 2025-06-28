import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight,
  Search,
  Zap,
  Calendar, 
  RotateCcw,
  Star, 
  Crown, 
  Award, 
  Sparkles, 
  User
} from 'lucide-react';
import { type Swimsuit } from '@/types';
import { addTranslationsToItems, searchInAllLanguages } from '@/services/multiLanguageSearch';
import { swimsuitsApi } from '@/services/api';
import { safeExtractArrayData } from '@/services/utils';
import { PageLoadingState } from '@/components/ui';
import UnifiedFilter, { SortDirection } from '@/components/features/UnifiedFilter';
import { createSwimsuitFilterConfig, swimsuitSortOptions } from '@/components/features/FilterConfigs';
import React from 'react';

// SwimsuitCard Component
interface SwimsuitCardProps {
  swimsuit: Swimsuit & { stats?: { pow: number; tec: number; stm: number; apl: number }; skills?: any[]; character?: string; name?: string };
  viewMode?: 'gallery' | 'showcase' | 'minimal';
}

const StatBar = ({ stat, max, color, icon, label }: { 
  stat: number; 
  max: number; 
  color: string; 
  icon: React.ReactNode;
  label: string;
}) => {
  const percentage = Math.min((stat / max) * 100, 100);
  
  return (
    <div className="relative group/stat">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-1 text-xs">
          {icon}
          <span className={`${color.replace('bg-', 'text-')} font-medium`}>{label}</span>
        </div>
        <span className={`text-xs font-bold ${color.replace('bg-', 'text-')}`}>{stat}</span>
      </div>
      <div className="h-1.5 bg-dark-border/30 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.2 }}
          className={`h-full ${color} rounded-full`}
        />
      </div>
    </div>
  );
};

const RarityBadge = ({ rarity }: { rarity: string }) => {
  const config = {
    SSR: {
      gradient: 'bg-gradient-to-r from-pink-500 to-purple-600',
      icon: <Crown className="w-3 h-3" />
    },
    SR: {
      gradient: 'bg-gradient-to-r from-cyan-500 to-blue-600',
      icon: <Award className="w-3 h-3" />
    },
    R: {
      gradient: 'bg-gradient-to-r from-yellow-500 to-orange-600',
      icon: <Star className="w-3 h-3" />
    }
  }[rarity] || {
    gradient: 'bg-gradient-to-r from-gray-500 to-gray-600',
    icon: <Star className="w-3 h-3" />
  };
  
  return (
    <div className={`${config.gradient} text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 shadow-lg`}>
      {config.icon}
      <span>{rarity}</span>
    </div>
  );
};

const SwimsuitCard = React.memo(function SwimsuitCard({ swimsuit, viewMode = 'gallery' }: SwimsuitCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const stats = swimsuit.stats || { pow: 0, tec: 0, stm: 0, apl: 0 };
  const maxStat = Math.max(stats.pow, stats.tec, stats.stm, stats.apl);
  const swimsuitName = swimsuit.name || swimsuit.name_en;
  const characterName = (swimsuit.character as any)?.name_en || 'Unknown';
  const releaseDate = swimsuit.release_date_gl || 'Unknown';
  
  // Character Avatar Generator with swimsuit-themed colors
  const generateAvatar = (character: string) => {
    const swimsuitColors = [
      'from-pink-400 via-rose-300 to-pink-500',      // Beach pink
      'from-cyan-400 via-blue-300 to-cyan-500',      // Ocean blue
      'from-orange-400 via-yellow-300 to-orange-500', // Sunset orange
      'from-purple-400 via-violet-300 to-purple-500', // Lavender
      'from-teal-400 via-emerald-300 to-teal-500',   // Tropical teal
      'from-indigo-400 via-blue-300 to-indigo-500'   // Deep sea
    ];
    const colorIndex = character.charCodeAt(0) % swimsuitColors.length;
    return swimsuitColors[colorIndex];
  };

  // Simplified swimsuit image placeholder
  const SwimsuitDisplay = ({ size = 'normal' }: { size?: 'normal' | 'large' }) => {
    const sizeClass = size === 'large' ? 'w-32 h-40' : 'w-20 h-24';
    const iconSize = size === 'large' ? 'w-8 h-8' : 'w-5 h-5';
    
    return (
      <div className={`${sizeClass} bg-gradient-to-b ${generateAvatar((swimsuit.character as any)?.name_en || 'Unknown')} rounded-2xl flex flex-col items-center justify-center shadow-xl border-2 border-white/20 relative overflow-hidden`}>
        {/* Swimsuit silhouette */}
        <div className="absolute inset-2 bg-white/10 rounded-xl flex items-center justify-center">
          <User className={`${iconSize} text-white/80`} />
        </div>
        
        {/* Character initial */}
        <div className="absolute bottom-1 right-1 w-6 h-6 bg-black/30 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-white">{characterName?.[0] || '?'}</span>
        </div>
        
        {/* Subtle shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
        />
      </div>
    );
  };

  if (viewMode === 'minimal') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className="group relative modern-card overflow-hidden cursor-pointer"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <div className="relative p-3">
          <div className="flex items-center space-x-3 mb-2">
            <SwimsuitDisplay />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white truncate">{swimsuitName}</h3>
              <p className="text-xs text-gray-400 truncate">{characterName}</p>
            </div>
            <div className="text-xs text-accent-cyan font-bold">#{swimsuit.id}</div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="text-xs">
                  <span className={`font-bold ${
                    key === 'pow' ? 'text-red-400' :
                    key === 'tec' ? 'text-cyan-400' :
                    key === 'stm' ? 'text-yellow-400' :
                    'text-purple-400'
                  }`}>
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
            <RarityBadge rarity={swimsuit.rarity} />
          </div>
        </div>
        
        {/* Simple hover effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-accent-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.div>
    );
  }

  if (viewMode === 'showcase') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        className="group relative modern-card overflow-hidden cursor-pointer"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="p-4 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white group-hover:text-accent-cyan transition-colors">
                {swimsuitName}
              </h3>
              <p className="text-sm text-gray-400">{characterName}</p>
            </div>
            <RarityBadge rarity={swimsuit.rarity} />
          </div>
        </div>
        
        {/* Main Display Area */}
        <div className="p-6 flex flex-col items-center">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <SwimsuitDisplay size="large" />
          </motion.div>
          
          {/* Stats on Hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-4 w-full"
              >
                <div className="bg-dark-primary/60 backdrop-blur-sm rounded-xl p-4 border border-dark-border/30">
                  <div className="grid grid-cols-2 gap-3">
                    <StatBar 
                      stat={stats.pow} 
                      max={maxStat} 
                      color="bg-red-500" 
                      icon={<Zap className="w-3 h-3" />}
                      label="POW"
                    />
                    <StatBar 
                      stat={stats.tec} 
                      max={maxStat} 
                      color="bg-cyan-500" 
                      icon={<Star className="w-3 h-3" />}
                      label="TEC"
                    />
                    <StatBar 
                      stat={stats.stm} 
                      max={maxStat} 
                      color="bg-yellow-500" 
                      icon={<Crown className="w-3 h-3" />}
                      label="STM"
                    />
                    <StatBar 
                      stat={stats.apl} 
                      max={maxStat} 
                      color="bg-purple-500" 
                      icon={<Sparkles className="w-3 h-3" />}
                      label="APL"
                    />
                </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Skills Preview */}
        {swimsuit.skills && swimsuit.skills.length > 0 && (
          <div className="px-4 pb-4">
            <div className="bg-dark-primary/40 rounded-lg p-3">
              <h4 className="text-xs font-bold text-accent-cyan uppercase tracking-wide mb-2 flex items-center">
                <Sparkles className="w-3 h-3 mr-1" />
                Skills ({swimsuit.skills.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {(swimsuit.skills || []).slice(0, 3).map((skill: any) => (
                  <div
                    key={skill.id || skill.skill_id}
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      skill.type === 'power' ? 'bg-red-500/20 text-red-300' :
                      skill.type === 'technique' ? 'bg-cyan-500/20 text-cyan-300' :
                      skill.type === 'stamina' ? 'bg-yellow-500/20 text-yellow-300' :
                      'bg-purple-500/20 text-purple-300'
                    }`}
                  >
                    {(skill.name || skill.skill?.name_en || 'Skill').split(' ')[0]}
                  </div>
                ))}
                {(swimsuit.skills || []).length > 3 && (
                  <div className="px-2 py-1 rounded text-xs font-medium bg-gray-500/20 text-gray-300">
                    +{(swimsuit.skills || []).length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Release Info */}
        <div className="px-4 pb-4 text-xs text-gray-500 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{swimsuit.release_date_gl}</span>
          </div>
          <span className="text-accent-cyan">#{swimsuit.id}</span>
        </div>
      </motion.div>
    );
  }

  // Default Gallery Mode - Clean and focused
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="group relative modern-card overflow-hidden cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Image Section - Focused on swimsuit display */}
      <div className="relative h-44 bg-gradient-to-br from-dark-primary/80 to-dark-secondary/80 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/20 to-accent-pink/20" />
        </div>
        
        {/* Main swimsuit display */}
        <div className="relative w-full h-full flex items-center justify-center p-4">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <SwimsuitDisplay />
          </motion.div>
        </div>
        
        {/* Top badges */}
        <div className="absolute top-3 left-3">
          <RarityBadge rarity={swimsuit.rarity} />
        </div>
        
        <div className="absolute top-3 right-3">
          <div className="bg-dark-primary/70 backdrop-blur-sm px-2 py-1 rounded-lg">
            <span className="text-xs text-gray-300 font-mono">#{swimsuit.id}</span>
          </div>
        </div>
        
        {/* Hover overlay with swimsuit focus */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-dark-primary/60 via-transparent to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>
      
      {/* Content Section */}
      <div className="p-4">
        {/* Title */}
        <div className="mb-3">
          <h3 className="font-bold text-white text-base leading-tight group-hover:text-accent-cyan transition-colors duration-300 mb-1">
            {swimsuitName}
          </h3>
          <p className="text-sm text-gray-400">{characterName}</p>
        </div>
        
        {/* Stats Display - Simple and clean */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {Object.entries(stats).map(([key, value]) => {
            const colors = {
              pow: 'bg-red-500',
              tec: 'bg-cyan-500', 
              stm: 'bg-yellow-500',
              apl: 'bg-purple-500'
            };
            
            return (
              <div key={key} className="text-center">
                <div className="text-xs font-medium text-gray-400 uppercase mb-1">
                  {key}
                </div>
                <div className={`${colors[key as keyof typeof colors]} text-white font-bold text-sm py-1 rounded-lg`}>
                  {String(value)}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Skills Summary */}
        {swimsuit.skills && swimsuit.skills.length > 0 && (
          <div className="mb-3">
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
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-dark-border/30">
          <div className="flex items-center space-x-1">
            <Calendar className="w-3 h-3" />
            <span>{releaseDate}</span>
          </div>
          {swimsuit.is_limited && (
            <div className="flex items-center space-x-1 text-accent-cyan">
              <RotateCcw className="w-3 h-3" />
              <span>Limited</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Simple hover border */}
      <div className="absolute inset-0 rounded-xl border border-accent-cyan/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
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
  const [filterValues, setFilterValues] = useState<Record<string, string | boolean | number>>({});

  const itemsPerPage = 8;

  // Fetch swimsuits data
  useEffect(() => {
    const fetchSwimsuits = async () => {
      try {
        setLoading(true);
        const response = await swimsuitsApi.getSwimsuits({ limit: 100, page: 1 });
        console.log('Raw API response:', response);
        const responseData = safeExtractArrayData<Swimsuit>(response, 'swimsuits API');
        console.log('Extracted swimsuits data:', responseData);
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
    console.log('Transformed swimsuits:', transformedSwimsuits);
    const result = addTranslationsToItems(transformedSwimsuits);
    console.log('Final multiLanguageSwimsuits:', result);
    return result;
  }, [swimsuits]);

  const filteredAndSortedSwimsuits = useMemo(() => {
    const filtered = multiLanguageSwimsuits.filter((swimsuit: any) => {
      if (filterValues.rarity && swimsuit.rarity !== filterValues.rarity) return false;
      const characterName = swimsuit.character?.name_en || 'Unknown';
      if (filterValues.character && characterName !== filterValues.character) return false;
      // Use multi-language search instead of simple string matching
      if (filterValues.search && !searchInAllLanguages(swimsuit, filterValues.search as string)) return false;
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
  }, [multiLanguageSwimsuits, filterValues, sortBy, sortDirection]);

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

  return (
    <PageLoadingState isLoading={loading} message="Đang tải danh sách đồ bơi...">
    
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
          <p className="modern-page-subtitle">
            Showing {filteredAndSortedSwimsuits.length} of {swimsuits.length} swimsuits
          </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 mb-12">
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
                <SwimsuitCard swimsuit={swimsuit} viewMode="showcase" />
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