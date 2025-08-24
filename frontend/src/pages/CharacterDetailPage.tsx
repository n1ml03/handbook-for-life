import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Calendar,
  Mic,
  Heart,
  Star,
  Trophy,
  Shirt,
  Zap,
  Info,
  Eye,
  Sparkles,
  Award,
  Shield,
  Swords,
  Clock,
  AlertTriangle,
  Crown,
  GitBranch,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { charactersApi } from '@/services/api';
import { type Character, type Skill, type Swimsuit } from '@/types';
import { PageLoadingState } from '@/components/ui';
import { getCharacterProfileImageUrl } from '@/services/utils';
import { format } from 'date-fns/format';
import { parseISO } from 'date-fns/parseISO';
import { isValid } from 'date-fns/isValid';

export default function CharacterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [swimsuits, setSwimsuits] = useState<Swimsuit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'swimsuits' | 'details'>('overview');
  const [isTabDropdownOpen, setIsTabDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchCharacterData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        
        // Fetch character details
        const response = await charactersApi.getCharacter(id);
        setCharacter(response.data);

        // Fetch related data
        try {
          const [skillsData, swimsuitsData] = await Promise.all([
            charactersApi.getCharacterSkills(id).catch(() => []),
            charactersApi.getCharacterSwimsuits(id).catch(() => [])
          ]);
          setSkills(Array.isArray(skillsData) ? skillsData : []);
          setSwimsuits(Array.isArray(swimsuitsData) ? swimsuitsData : []);
        } catch (err) {
          console.warn('Failed to fetch related data:', err);
        }

      } catch (err) {
        console.error('Failed to fetch character:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacterData();
  }, [id]);

  // Memoized calculations for better performance
  const characterStats = useMemo(() => {
    if (!character) return null;

    const ssrSwimsuits = swimsuits.filter(s => s.rarity === 'SSR' || s.rarity === 'SSR+').length;
    const limitedSwimsuits = swimsuits.filter(s => s.is_limited).length;
    const skillCategories = Array.from(new Set(skills.map(s => s.skill_category)));

    return {
      totalSkills: skills.length,
      totalSwimsuits: swimsuits.length,
      ssrSwimsuits,
      limitedSwimsuits,
      skillCategories
    };
  }, [character, skills, swimsuits]);

  const formatBirthday = useCallback((birthday?: string) => {
    if (!birthday) return 'Unknown';
    try {
      const date = parseISO(birthday);
      return isValid(date) ? format(date, 'MMMM d') : birthday;
    } catch {
      return birthday;
    }
  }, []);

  const formatReleaseDate = useCallback((dateStr?: string) => {
    if (!dateStr) return 'Unknown';
    try {
      const date = parseISO(dateStr);
      return isValid(date) ? format(date, 'MMM d, yyyy') : dateStr;
    } catch {
      return dateStr;
    }
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'SSR+': return 'from-pink-400 to-purple-600';
      case 'SSR': return 'from-yellow-400 to-orange-500';
      case 'SR': return 'from-purple-400 to-pink-500';
      case 'R': return 'from-blue-400 to-cyan-500';
      case 'N': return 'from-gray-400 to-gray-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getSuitTypeColor = (suitType: string) => {
    switch (suitType) {
      case 'POW': return 'text-red-400';
      case 'TEC': return 'text-blue-400';
      case 'STM': return 'text-green-400';
      case 'APL': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getSuitTypeIcon = (suitType: string) => {
    switch (suitType) {
      case 'POW': return <Swords className="w-3 h-3" />;
      case 'TEC': return <Zap className="w-3 h-3" />;
      case 'STM': return <Shield className="w-3 h-3" />;
      case 'APL': return <Heart className="w-3 h-3" />;
      default: return <Star className="w-3 h-3" />;
    }
  };

  const getSkillCategoryIcon = (category: string) => {
    const categoryLower = category?.toLowerCase() || '';
    if (categoryLower.includes('active')) return <Swords className="w-4 h-4" />;
    if (categoryLower.includes('passive')) return <Shield className="w-4 h-4" />;
    if (categoryLower.includes('potential')) return <Sparkles className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };


  if (!character) {
    return (
      <div className="modern-page flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-accent-cyan/20">
            <User className="w-12 h-12 text-accent-cyan/60" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Character Not Found</h2>
          <p className="text-muted-foreground mb-6">The character you're looking for doesn't exist.</p>
          <Button 
            onClick={() => navigate('/characters')}
            className="bg-gradient-to-r from-accent-pink to-accent-purple hover:from-accent-pink/90 hover:to-accent-purple/90 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Characters
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-page">
      <div className="modern-container-lg">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <Button
              onClick={() => navigate('/characters')}
              variant="outline"
              size="sm"
              className="border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10 min-h-[44px] px-3 sm:px-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Back to Characters</span>
              <span className="xs:hidden">Back</span>
            </Button>
          </div>
        </div>

        {/* Character Header Section */}
        <div className="modern-card p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 overflow-hidden relative">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/5 via-accent-cyan/5 to-accent-purple/5" />
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-radial from-accent-cyan/20 via-accent-purple/10 to-transparent opacity-50" />

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row lg:flex-row items-center sm:items-start gap-4 sm:gap-6 lg:gap-8">
              {/* Character Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-2xl sm:rounded-3xl flex items-center justify-center border-2 border-accent-cyan/30 overflow-hidden">
                  {getCharacterProfileImageUrl(character) ? (
                    <img
                      src={getCharacterProfileImageUrl(character)}
                      alt={character.name_en}
                      className="w-full h-full object-cover rounded-2xl sm:rounded-3xl"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    // Empty state - just show the background gradient without any icon
                    <div className="w-full h-full" />
                  )}
                </div>
              </div>

              {/* Character Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <Badge className="bg-gradient-to-r from-accent-cyan to-accent-purple text-white font-semibold text-xs sm:text-sm">
                    ID: {character.id}
                  </Badge>
                  {character.game_version && (
                    <Badge className="bg-gradient-to-r from-indigo-400 to-blue-500 text-white font-semibold text-xs sm:text-sm">
                      <GitBranch className="w-3 h-3 mr-1" />
                      v{character.game_version}
                    </Badge>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-4 leading-tight">
                  {character.name_en || character.name_jp}
                </h1>

                {character.name_jp && character.name_en && character.name_jp !== character.name_en && (
                  <p className="text-lg sm:text-xl text-gray-300 mb-3 sm:mb-4">{character.name_jp}</p>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                  <div className="text-center p-2 sm:p-3 bg-dark-primary/30 rounded-lg sm:rounded-xl border border-dark-border/30">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-accent-cyan">{characterStats?.totalSkills || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-400">Skills</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-dark-primary/30 rounded-lg sm:rounded-xl border border-dark-border/30">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-accent-pink">{characterStats?.totalSwimsuits || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-400">Swimsuits</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-dark-primary/30 rounded-lg sm:rounded-xl border border-dark-border/30">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-accent-purple">{character.unique_key}</div>
                    <div className="text-xs sm:text-sm text-gray-400">Unique Key</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-dark-primary/30 rounded-lg sm:rounded-xl border border-dark-border/30">
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold text-accent-gold">
                      {characterStats?.ssrSwimsuits || 0}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400">SSR+ Suits</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="modern-card p-1 sm:p-2 mb-6 sm:mb-8">
          {/* Mobile Dropdown */}
          <div className="sm:hidden relative">
            <button
              onClick={() => setIsTabDropdownOpen(!isTabDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-accent-cyan to-accent-purple text-white rounded-lg font-medium min-h-[44px]"
            >
              <div className="flex items-center gap-2">
                {activeTab === 'overview' && <Eye className="w-4 h-4" />}
                {activeTab === 'skills' && <Zap className="w-4 h-4" />}
                {activeTab === 'swimsuits' && <Shirt className="w-4 h-4" />}
                {activeTab === 'details' && <Info className="w-4 h-4" />}
                <span>
                  {activeTab === 'overview' && 'Overview'}
                  {activeTab === 'skills' && `Skills (${characterStats?.totalSkills || 0})`}
                  {activeTab === 'swimsuits' && `Swimsuits (${characterStats?.totalSwimsuits || 0})`}
                  {activeTab === 'details' && 'Details'}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isTabDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isTabDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10">
                {[
                  { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
                  { id: 'skills', label: `Skills (${characterStats?.totalSkills || 0})`, icon: <Zap className="w-4 h-4" /> },
                  { id: 'swimsuits', label: `Swimsuits (${characterStats?.totalSwimsuits || 0})`, icon: <Shirt className="w-4 h-4" /> },
                  { id: 'details', label: 'Details', icon: <Info className="w-4 h-4" /> }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setIsTabDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left font-medium transition-all min-h-[44px] ${
                      activeTab === tab.id
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/10'
                    } ${tab.id === 'overview' ? 'rounded-t-lg' : ''} ${tab.id === 'details' ? 'rounded-b-lg' : ''}`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Tabs */}
          <div className="hidden sm:flex gap-1 lg:gap-2">
            {[
              { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
              { id: 'skills', label: `Skills (${characterStats?.totalSkills || 0})`, icon: <Zap className="w-4 h-4" /> },
              { id: 'swimsuits', label: `Swimsuits (${characterStats?.totalSwimsuits || 0})`, icon: <Shirt className="w-4 h-4" /> },
              { id: 'details', label: 'Details', icon: <Info className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-0 flex items-center gap-2 px-3 lg:px-4 py-2 lg:py-3 rounded-lg font-medium transition-all justify-center min-h-[44px] ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-accent-cyan to-accent-purple text-white'
                    : 'text-gray-400 hover:text-white hover:bg-dark-primary/30'
                }`}
              >
                {tab.icon}
                <span className="hidden md:inline">{tab.label}</span>
                <span className="md:hidden">
                  {tab.id === 'overview' && 'Overview'}
                  {tab.id === 'skills' && 'Skills'}
                  {tab.id === 'swimsuits' && 'Suits'}
                  {tab.id === 'details' && 'Details'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6 sm:space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Character Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {character.birthday && (
                  <div className="modern-card p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent-pink/20 to-accent-pink/10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-accent-pink" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-white">Birthday</h3>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-accent-pink">{formatBirthday(character.birthday)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {character.height && (
                  <div className="modern-card p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent-cyan/20 to-accent-cyan/10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-accent-cyan" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-white">Height</h3>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-accent-cyan">{character.height} cm</p>
                      </div>
                    </div>
                  </div>
                )}

                {character.blood_type && (
                  <div className="modern-card p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-white">Blood Type</h3>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-400">{character.blood_type}</p>
                      </div>
                    </div>
                  </div>
                )}

                {character.voice_actor_jp && (
                  <div className="modern-card p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent-purple/20 to-accent-purple/10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-accent-purple" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-white">Voice Actor</h3>
                        <p className="text-sm sm:text-base lg:text-lg font-bold text-accent-purple break-words">{character.voice_actor_jp}</p>
                      </div>
                    </div>
                  </div>
                )}

                {character.measurements && (
                  <div className="modern-card p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent-gold/20 to-accent-gold/10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <Star className="w-5 h-5 sm:w-6 sm:h-6 text-accent-gold" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-white">Measurements</h3>
                        <p className="text-sm sm:text-base lg:text-lg font-bold text-accent-gold">{character.measurements}</p>
                      </div>
                    </div>
                  </div>
                )}

                {character.game_version && (
                  <div className="modern-card p-4 sm:p-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500/20 to-indigo-500/10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                        <GitBranch className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-white">Game Version</h3>
                        <p className="text-sm sm:text-base lg:text-lg font-bold text-indigo-400">v{character.game_version}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Multi-language Names */}
              <div className="modern-card p-4 sm:p-6 lg:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-accent-cyan" />
                  Multi-language Names
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {[
                    { label: 'Japanese', value: character.name_jp, flag: '🇯🇵', color: 'from-red-400 to-pink-500' },
                    { label: 'English', value: character.name_en, flag: '🇺🇸', color: 'from-blue-400 to-cyan-500' },
                    { label: 'Chinese', value: character.name_cn, flag: '🇨🇳', color: 'from-red-500 to-yellow-500' },
                    { label: 'Traditional Chinese', value: character.name_tw, flag: '🇹🇼', color: 'from-green-400 to-blue-500' },
                    { label: 'Korean', value: character.name_kr, flag: '🇰🇷', color: 'from-purple-400 to-pink-500' }
                  ].map(({ label, value, flag, color }) => (
                    value && (
                      <div key={label} className="modern-card p-3 sm:p-4 bg-dark-primary/30">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                          <span className="text-xl sm:text-2xl">{flag}</span>
                          <span className="text-xs sm:text-sm text-gray-400 font-medium">{label}</span>
                        </div>
                        <p className="text-white font-semibold text-base sm:text-lg break-words">{value}</p>
                        <div className={`h-1 bg-gradient-to-r ${color} rounded-full mt-2`}></div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="modern-card p-4 sm:p-6 lg:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-accent-cyan" />
                Character Skills ({characterStats?.totalSkills || 0})
              </h3>
              {(characterStats?.totalSkills || 0) === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Zap className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-3 sm:mb-4" />
                  <p className="text-gray-400 text-base sm:text-lg">No skills available for this character</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {skills.map((skill) => (
                    <div key={skill.id} className="modern-card p-4 sm:p-6 bg-dark-primary/30">
                      <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                          {getSkillCategoryIcon(skill.skill_category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base sm:text-lg font-bold text-white mb-1 break-words">
                            {skill.name_en || skill.name_jp}
                          </h4>
                          <div className="flex flex-wrap gap-1 sm:gap-2 mb-2">
                            <Badge className="text-xs bg-gradient-to-r from-accent-cyan/30 to-accent-purple/30 text-accent-cyan border-accent-cyan/30">
                              {skill.skill_category}
                            </Badge>
                            {skill.effect_type && (
                              <Badge className="text-xs bg-gradient-to-r from-green-400/30 to-emerald-500/30 text-green-400 border-green-400/30">
                                {skill.effect_type}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {skill.description_en && (
                        <p className="text-gray-300 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">{skill.description_en}</p>
                      )}

                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <div className="text-xs px-2 sm:px-3 py-1 bg-dark-primary/50 rounded-full text-gray-400">
                          ID: {skill.id}
                        </div>
                        {skill.name_jp && skill.name_jp !== skill.name_en && (
                          <div className="text-xs px-2 sm:px-3 py-1 bg-dark-primary/50 rounded-full text-gray-400 break-all">
                            JP: {skill.name_jp}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Swimsuits Tab */}
          {activeTab === 'swimsuits' && (
            <div className="modern-card p-4 sm:p-6 lg:p-8">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <Shirt className="w-5 h-5 sm:w-6 sm:h-6 text-accent-pink" />
                Character Swimsuits ({characterStats?.totalSwimsuits || 0})
              </h3>
              {(characterStats?.totalSwimsuits || 0) === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Shirt className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-3 sm:mb-4" />
                  <p className="text-gray-400 text-base sm:text-lg">No swimsuits available for this character</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {swimsuits.map((swimsuit) => (
                    <div key={swimsuit.id} className="modern-card p-4 sm:p-6 bg-dark-primary/30">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          <Badge className={`text-xs sm:text-sm font-bold bg-gradient-to-r ${getRarityColor(swimsuit.rarity)} text-white px-2 sm:px-3 py-1`}>
                            <Award className="w-3 h-3 mr-1" />
                            {swimsuit.rarity}
                          </Badge>
                          <Badge className={`text-xs font-bold ${getSuitTypeColor(swimsuit.suit_type)} border-current bg-transparent`}>
                            {getSuitTypeIcon(swimsuit.suit_type)}
                            {swimsuit.suit_type}
                          </Badge>
                        </div>
                        <div className="text-xs text-gray-400">#{swimsuit.id}</div>
                      </div>

                      <h4 className="text-base sm:text-lg font-bold text-white mb-2 break-words">
                        {swimsuit.name_en || swimsuit.name_jp}
                      </h4>

                      {swimsuit.description_en && (
                        <p className="text-gray-300 text-xs sm:text-sm mb-3 leading-relaxed">{swimsuit.description_en}</p>
                      )}

                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-gray-400">Type</span>
                          <span className={`text-xs sm:text-sm font-medium ${getSuitTypeColor(swimsuit.suit_type)}`}>
                            {swimsuit.suit_type}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-gray-400">Total Stats</span>
                          <span className="text-xs sm:text-sm text-accent-cyan font-bold">{swimsuit.total_stats_awakened}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-gray-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span className="hidden xs:inline">Malfunction</span>
                            <span className="xs:hidden">Malf.</span>
                          </span>
                          <Badge className={`text-xs ${swimsuit.has_malfunction ? 'bg-orange-500' : 'bg-gray-500'}`}>
                            {swimsuit.has_malfunction ? 'Yes' : 'No'}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm text-gray-400 flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Limited
                          </span>
                          <Badge className={`text-xs ${swimsuit.is_limited ? 'bg-purple-500' : 'bg-gray-500'}`}>
                            {swimsuit.is_limited ? 'Yes' : 'No'}
                          </Badge>
                        </div>

                        {swimsuit.release_date_gl && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span className="hidden xs:inline">Release Date</span>
                              <span className="xs:hidden">Release</span>
                            </span>
                            <span className="text-xs sm:text-sm text-white font-medium">
                              {formatReleaseDate(swimsuit.release_date_gl)}
                            </span>
                          </div>
                        )}

                        {swimsuit.name_jp && swimsuit.name_jp !== swimsuit.name_en && (
                          <div className="pt-2 border-t border-dark-border/30">
                            <span className="text-xs text-gray-500 break-all">JP: {swimsuit.name_jp}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-6 sm:space-y-8">
              {/* Technical Information */}
              <div className="modern-card p-4 sm:p-6 lg:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <Info className="w-5 h-5 sm:w-6 sm:h-6 text-accent-purple" />
                  Technical Information
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-dark-primary/30 rounded-lg border border-dark-border/30 gap-1 sm:gap-0">
                      <span className="text-gray-400 font-medium text-sm sm:text-base">Character ID</span>
                      <span className="text-white font-mono font-bold text-sm sm:text-base break-all">{character.id}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-dark-primary/30 rounded-lg border border-dark-border/30 gap-1 sm:gap-0">
                      <span className="text-gray-400 font-medium text-sm sm:text-base">Unique Key</span>
                      <span className="text-white font-mono font-bold text-sm sm:text-base break-all">{character.unique_key}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-dark-primary/30 rounded-lg border border-dark-border/30 gap-1 sm:gap-0">
                      <span className="text-gray-400 font-medium text-sm sm:text-base">Status</span>
                      <Badge className={`text-xs sm:text-sm ${character.is_active ? 'bg-green-500' : 'bg-gray-500'}`}>
                        {character.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {character.game_version && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-dark-primary/30 rounded-lg border border-dark-border/30 gap-1 sm:gap-0">
                        <span className="text-gray-400 font-medium text-sm sm:text-base">Game Version</span>
                        <span className="text-indigo-400 font-bold text-sm sm:text-base">v{character.game_version}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-dark-primary/30 rounded-lg border border-dark-border/30 gap-1 sm:gap-0">
                      <span className="text-gray-400 font-medium text-sm sm:text-base">Total Skills</span>
                      <span className="text-accent-cyan font-bold text-lg sm:text-xl">{characterStats?.totalSkills || 0}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-dark-primary/30 rounded-lg border border-dark-border/30 gap-1 sm:gap-0">
                      <span className="text-gray-400 font-medium text-sm sm:text-base">Total Swimsuits</span>
                      <span className="text-accent-pink font-bold text-lg sm:text-xl">{characterStats?.totalSwimsuits || 0}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-dark-primary/30 rounded-lg border border-dark-border/30 gap-1 sm:gap-0">
                      <span className="text-gray-400 font-medium text-sm sm:text-base">SSR+ Swimsuits</span>
                      <span className="text-accent-gold font-bold text-lg sm:text-xl">
                        {characterStats?.ssrSwimsuits || 0}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 sm:p-4 bg-dark-primary/30 rounded-lg border border-dark-border/30 gap-1 sm:gap-0">
                      <span className="text-gray-400 font-medium text-sm sm:text-base">Limited Swimsuits</span>
                      <span className="text-purple-400 font-bold text-lg sm:text-xl">
                        {characterStats?.limitedSwimsuits || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rarity Distribution */}
              {(characterStats?.totalSwimsuits || 0) > 0 && (
                <div className="modern-card p-4 sm:p-6 lg:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-accent-gold" />
                    Swimsuit Rarity Distribution
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
                    {['SSR+', 'SSR', 'SR', 'R', 'N'].map(rarity => {
                      const count = swimsuits.filter(s => s.rarity === rarity).length;
                      const percentage = swimsuits.length > 0 ? (count / swimsuits.length * 100).toFixed(1) : '0';
                      return (
                        <div key={rarity} className="text-center p-3 sm:p-4 lg:p-6 bg-dark-primary/30 rounded-lg sm:rounded-xl border border-dark-border/30">
                          <div className={`text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r ${getRarityColor(rarity)} bg-clip-text text-transparent mb-1 sm:mb-2`}>
                            {count}
                          </div>
                          <div className="text-sm sm:text-base lg:text-lg font-semibold text-white mb-1">{rarity} Swimsuits</div>
                          <div className="text-xs sm:text-sm text-gray-400">{percentage}% of total</div>
                          <div className={`h-1 sm:h-2 bg-gradient-to-r ${getRarityColor(rarity)} rounded-full mt-2 sm:mt-3 opacity-60`}></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Skill Categories */}
              {(characterStats?.totalSkills || 0) > 0 && (
                <div className="modern-card p-4 sm:p-6 lg:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-accent-cyan" />
                    Skill Categories
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {characterStats?.skillCategories?.map(category => {
                      const count = skills.filter(s => s.skill_category === category).length;
                      return (
                        <div key={category} className="flex items-center gap-3 p-3 sm:p-4 bg-dark-primary/30 rounded-lg border border-dark-border/30">
                          <div className="flex-shrink-0">
                            {getSkillCategoryIcon(category)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium text-sm sm:text-base break-words">{category}</div>
                            <div className="text-xs sm:text-sm text-gray-400">{count} skill{count !== 1 ? 's' : ''}</div>
                          </div>
                          <div className="text-base sm:text-lg font-bold text-accent-cyan">{count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 