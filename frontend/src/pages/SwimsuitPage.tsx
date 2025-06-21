import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight,
  Search,
  SortAsc,
  Zap,
  Filter,
  RefreshCw,
  Calendar, 
  RotateCcw,
  Star, 
  Crown, 
  Award, 
  Sparkles, 
  User
} from 'lucide-react';
import { type Swimsuit, type SwimsuitRarity } from '@/types';
import { addTranslationsToItems, searchInAllLanguages, type MultiLanguageItem } from '@/services/multiLanguageSearch';
import { swimsuitsApi } from '@/services/api';
import React from 'react';

// SwimsuitCard Component
interface SwimsuitCardProps {
  swimsuit: Swimsuit & { stats?: { pow: number; tec: number; stm: number; apl: number }; skills?: any[]; character?: string; name?: string; release?: string; reappear?: string };
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
  const characterName = swimsuit.character || (swimsuit.character as any)?.name_en || 'Unknown';
  const releaseDate = swimsuit.release || swimsuit.release_date_gl || 'Unknown';
  
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
          <span className="text-xs font-bold text-white">{characterName[0]}</span>
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
        className="group relative bg-dark-card/90 backdrop-blur-sm rounded-xl border border-dark-border/50 overflow-hidden cursor-pointer"
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
                    {value}
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
        className="group relative bg-gradient-to-br from-dark-card/95 to-dark-primary/80 rounded-2xl border border-dark-border/50 overflow-hidden backdrop-blur-sm cursor-pointer"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {/* Header */}
        <div className="p-4 border-b border-dark-border/30">
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
            <span>{swimsuit.release}</span>
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
      className="group relative bg-gradient-to-br from-dark-card/95 to-dark-primary/80 rounded-xl border border-dark-border/50 overflow-hidden backdrop-blur-sm cursor-pointer"
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
                  {value}
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
          {swimsuit.reappear && (
            <div className="flex items-center space-x-1 text-accent-cyan">
              <RotateCcw className="w-3 h-3" />
              <span>{swimsuit.reappear}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Simple hover border */}
      <div className="absolute inset-0 rounded-xl border border-accent-cyan/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
});

type SortDirection = 'asc' | 'desc';
type SortOption = 'name' | 'character' | 'rarity' | 'pow' | 'tec' | 'stm' | 'apl' | 'total' | 'release';

export default function SwimsuitPage() {
  const [swimsuits, setSwimsuits] = useState<Swimsuit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filter, setFilter] = useState({
    rarity: '',
    character: '',
    search: '',
    minPow: '',
    minTec: '',
    minStm: '',
    minApl: '',
    hasSkills: false,
    releaseYear: '',
    version: ''
  });

  const itemsPerPage = 8;

  // Fetch swimsuits data
  useEffect(() => {
    const fetchSwimsuits = async () => {
      try {
        setLoading(true);
        const response = await swimsuitsApi.getSwimsuits({ limit: 1000 });
        setSwimsuits(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching swimsuits:', err);
        setError('Failed to load swimsuits');
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
      description: swimsuit.description_en
    }));
    return addTranslationsToItems(transformedSwimsuits);
  }, [swimsuits]);

  const filteredAndSortedSwimsuits = useMemo(() => {
    let filtered = multiLanguageSwimsuits.filter((swimsuit: any) => {
      if (filter.rarity && swimsuit.rarity !== filter.rarity) return false;
      const characterName = swimsuit.character?.name_en || 'Unknown';
      if (filter.character && characterName !== filter.character) return false;
      // Use multi-language search instead of simple string matching
      if (filter.search && !searchInAllLanguages(swimsuit, filter.search)) return false;
      const stats = swimsuit.stats || { pow: 0, tec: 0, stm: 0, apl: 0 };
      if (filter.minPow && stats.pow < parseInt(filter.minPow)) return false;
      if (filter.minTec && stats.tec < parseInt(filter.minTec)) return false;
      if (filter.minStm && stats.stm < parseInt(filter.minStm)) return false;
      if (filter.minApl && stats.apl < parseInt(filter.minApl)) return false;
      if (filter.hasSkills && (!swimsuit.skills || swimsuit.skills.length === 0)) return false;
      const releaseDate = swimsuit.release_date_gl || swimsuit.release || '';
      if (filter.releaseYear && !releaseDate.includes(filter.releaseYear)) return false;
      if (filter.version && !String(swimsuit.id).includes(filter.version)) return false; // Simple version check
      return true;
    });

    return filtered.sort((a: any, b: any) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = (a.name || a.name_en || '').toLowerCase();
          bValue = (b.name || b.name_en || '').toLowerCase();
          break;
        case 'character':
          aValue = (a.character?.name_en || '').toLowerCase();
          bValue = (b.character?.name_en || '').toLowerCase();
          break;
        case 'rarity':
          const rarityOrder = { 'SSR+': 4, 'SSR': 3, 'SR': 2, 'R': 1, 'N': 0 };
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
        case 'total':
          const aStats = a.stats || { pow: 0, tec: 0, stm: 0, apl: 0 };
          const bStats = b.stats || { pow: 0, tec: 0, stm: 0, apl: 0 };
          aValue = aStats.pow + aStats.tec + aStats.stm + aStats.apl;
          bValue = bStats.pow + bStats.tec + bStats.stm + bStats.apl;
          break;
        case 'release':
          aValue = new Date(a.release_date_gl || a.release || '2023-01-01');
          bValue = new Date(b.release_date_gl || b.release || '2023-01-01');
          break;
        default:
          aValue = (a.name || a.name_en || '').toLowerCase();
          bValue = (b.name || b.name_en || '').toLowerCase();
      }
      
      if (typeof aValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [multiLanguageSwimsuits, filter, sortBy, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedSwimsuits.length / itemsPerPage);
  const paginatedSwimsuits = filteredAndSortedSwimsuits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const characters = useMemo(() => [...new Set(swimsuits.map((s: any) => s.character?.name_en || 'Unknown'))].sort(), [swimsuits]);
  const rarities = useMemo(() => ['SSR+', 'SSR', 'SR', 'R', 'N'], []);
  const releaseYears = useMemo(() => [...new Set(swimsuits.map((s: any) => (s.release_date_gl || s.release || '2023-01-01').split('-')[0]))].sort().reverse(), [swimsuits]);
  const versions = useMemo(() => ['1.0', '1.5', '2.0', '2.5', '3.0'], []);

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
      rarity: '',
      character: '',
      search: '',
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

  const getStatColor = (statType: string) => {
    switch (statType) {
      case 'pow': return 'text-red-400';
      case 'tec': return 'text-cyan-400';
      case 'stm': return 'text-yellow-400';
      case 'apl': return 'text-purple-400';
      default: return 'text-gray-400';
    }
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-primary">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-accent-cyan/30 border-t-accent-cyan rounded-full mx-auto mb-4"
              />
              <p className="text-gray-400">Loading swimsuits...</p>
            </motion.div>
          </div>
        </div>
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
            Swimsuit Gallery
          </h1>
          <p className="text-gray-400 mt-1">
            Showing {filteredAndSortedSwimsuits.length} of {swimsuits.length} swimsuits
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
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={filter.search}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                className="w-full bg-muted/70 backdrop-blur-sm border border-border/50 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-accent-cyan focus:ring-2 focus:ring-accent-cyan/20 transition-all placeholder-muted-foreground"
                placeholder="Search swimsuits, characters in all languages..."
              />
              {filter.search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setFilter(prev => ({ ...prev, search: '' }))}
                  className="absolute right-3 top-3 w-4 h-4 text-muted-foreground hover:text-accent-cyan transition-colors"
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
                <span className="text-gray-300 font-medium">{filteredAndSortedSwimsuits.length}</span> found
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
                {/* Filter Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Filter className="w-5 h-5 mr-2 text-gray-400" />
                    Advanced Filters
                  </h3>
                  <button
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                    className="text-sm text-accent-cyan hover:text-accent-pink transition-colors flex items-center"
                  >
                    {isFilterExpanded ? 'Show Less Stats' : 'Show Stat Filters'}
                    <motion.div
                      animate={{ rotate: isFilterExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-1"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  </button>
                </div>

                {/* Quick Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
                    <input
                      type="text"
                      value={filter.search}
                      onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-500 transition-all text-white"
                      placeholder="Search swimsuits..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Character</label>
                    <select
                      value={filter.character}
                      onChange={(e) => setFilter(prev => ({ ...prev, character: e.target.value }))}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-500 transition-all text-white"
                    >
                      <option value="">All Characters</option>
                      {characters.map((character: string) => (
                        <option key={character} value={character}>{character}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rarity</label>
                    <select
                      value={filter.rarity}
                      onChange={(e) => setFilter(prev => ({ ...prev, rarity: e.target.value }))}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-500 transition-all text-white"
                    >
                      <option value="">All Rarities</option>
                      {rarities.map(rarity => (
                        <option key={rarity} value={rarity}>{rarity}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Release Year</label>
                    <select
                      value={filter.releaseYear}
                      onChange={(e) => setFilter(prev => ({ ...prev, releaseYear: e.target.value }))}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-500 transition-all text-white"
                    >
                      <option value="">All Years</option>
                      {releaseYears.map((year: string) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Version</label>
                    <select
                      value={filter.version}
                      onChange={(e) => setFilter(prev => ({ ...prev, version: e.target.value }))}
                      className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-500 transition-all text-white"
                    >
                      <option value="">All Versions</option>
                      {versions.map(version => (
                        <option key={version} value={version}>{version}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Additional Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Special Features</label>
                    <label className="flex items-center space-x-3 p-3 bg-gray-900/30 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filter.hasSkills}
                        onChange={(e) => setFilter(prev => ({ ...prev, hasSkills: e.target.checked }))}
                        className="rounded border-gray-700 text-gray-900 focus:ring-gray-500/20"
                      />
                      <span className="text-sm text-gray-300">Has Skills</span>
                    </label>
                  </div>
                </div>

                {/* Extended Filters */}
                <AnimatePresence>
                  {isFilterExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {(['pow', 'tec', 'stm', 'apl'] as const).map((stat) => (
                          <div key={stat}>
                            <label className={`block text-sm font-medium mb-2 flex items-center ${getStatColor(stat)}`}>
                              <Zap className="w-3 h-3 mr-1" />
                              Min {stat.toUpperCase()}
                            </label>
                            <input
                              type="number"
                              value={filter[`min${stat.charAt(0).toUpperCase() + stat.slice(1)}` as keyof typeof filter] as string}
                              onChange={(e) => setFilter(prev => ({ 
                                ...prev, 
                                [`min${stat.charAt(0).toUpperCase() + stat.slice(1)}`]: e.target.value 
                              }))}
                              className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-500 transition-all text-white"
                              placeholder="0"
                              min="0"
                            />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Sort Options */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <span className="text-sm text-gray-400 flex items-center mr-2">
                    <SortAsc className="w-4 h-4 mr-1" />
                    Sort by:
                  </span>
                  <SortButton sortKey="name">Name</SortButton>
                  <SortButton sortKey="character">Character</SortButton>
                  <SortButton sortKey="rarity">Rarity</SortButton>
                  <SortButton sortKey="total">Total Power</SortButton>
                  <SortButton sortKey="release">Release Date</SortButton>
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
                    <span className="text-accent-cyan font-medium">{filteredAndSortedSwimsuits.length}</span> of {swimsuits.length} swimsuits
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swimsuit Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {paginatedSwimsuits.map((swimsuit: any, index: number) => (
              <motion.div
                key={swimsuit.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
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
        {filteredAndSortedSwimsuits.length === 0 && (
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
            <h3 className="text-2xl font-bold text-gray-300 mb-3">No swimsuits found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              We couldn't find any swimsuits matching your current filters. Try adjusting your search criteria.
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