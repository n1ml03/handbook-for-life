import { useState, useEffect } from 'react';
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
  GitBranch
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { charactersApi } from '@/services/api';
import { type Character, type Skill, type Swimsuit } from '@/types';
import { PageLoadingState } from '@/components/ui';

export default function CharacterDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [character, setCharacter] = useState<Character | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [swimsuits, setSwimsuits] = useState<Swimsuit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'swimsuits' | 'details'>('overview');

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
          setSkills(skillsData);
          setSwimsuits(swimsuitsData);
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

  const formatBirthday = (birthday?: string) => {
    if (!birthday) return 'Unknown';
    try {
      const date = new Date(birthday);
      return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    } catch {
      return birthday;
    }
  };

  const formatReleaseDate = (dateStr?: string) => {
    if (!dateStr) return 'Unknown';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

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

  if (loading) {
    return (
      <PageLoadingState isLoading={true} message="Loading character details...">
        <div></div>
      </PageLoadingState>
    );
  }

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
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => navigate('/characters')}
              variant="outline"
              className="border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Characters
            </Button>
          </div>
        </div>

        {/* Character Header Section */}
        <div className="modern-card p-8 mb-8 overflow-hidden relative">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/5 via-accent-cyan/5 to-accent-purple/5" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-radial from-accent-cyan/20 via-accent-purple/10 to-transparent opacity-50" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {/* Character Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-3xl flex items-center justify-center border-2 border-accent-cyan/30 overflow-hidden">
                  {character.profile_image_url ? (
                    <img
                      src={character.profile_image_url}
                      alt={character.name_en}
                      className="w-full h-full object-cover rounded-3xl"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <User className="w-16 h-16 text-accent-cyan hidden" />
                </div>
              </div>
              
              {/* Character Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge className="bg-gradient-to-r from-accent-cyan to-accent-purple text-white font-semibold">
                    ID: {character.id}
                  </Badge>
                  {character.game_version && (
                    <Badge className="bg-gradient-to-r from-indigo-400 to-blue-500 text-white font-semibold">
                      <GitBranch className="w-3 h-3 mr-1" />
                      v{character.game_version}
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
                  {character.name_en || character.name_jp}
                </h1>
                
                {character.name_jp && character.name_en && character.name_jp !== character.name_en && (
                  <p className="text-xl text-gray-300 mb-4">{character.name_jp}</p>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-dark-primary/30 rounded-xl border border-dark-border/30">
                    <div className="text-2xl font-bold text-accent-cyan">{skills.length}</div>
                    <div className="text-sm text-gray-400">Skills</div>
                  </div>
                  <div className="text-center p-3 bg-dark-primary/30 rounded-xl border border-dark-border/30">
                    <div className="text-2xl font-bold text-accent-pink">{swimsuits.length}</div>
                    <div className="text-sm text-gray-400">Swimsuits</div>
                  </div>
                  <div className="text-center p-3 bg-dark-primary/30 rounded-xl border border-dark-border/30">
                    <div className="text-2xl font-bold text-accent-purple">{character.unique_key}</div>
                    <div className="text-sm text-gray-400">Unique Key</div>
                  </div>
                  <div className="text-center p-3 bg-dark-primary/30 rounded-xl border border-dark-border/30">
                    <div className="text-2xl font-bold text-accent-gold">
                      {swimsuits.filter(s => s.rarity === 'SSR' || s.rarity === 'SSR+').length}
                    </div>
                    <div className="text-sm text-gray-400">SSR+ Suits</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="modern-card p-2 mb-8">
          <div className="flex flex-wrap gap-2 w-full justify-between">
            {[
              { id: 'overview', label: 'Overview', icon: <Eye className="w-4 h-4" /> },
              { id: 'skills', label: `Skills (${skills.length})`, icon: <Zap className="w-4 h-4" /> },
              { id: 'swimsuits', label: `Swimsuits (${swimsuits.length})`, icon: <Shirt className="w-4 h-4" /> },
              { id: 'details', label: 'Details', icon: <Info className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 min-w-0 flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all justify-center ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-accent-cyan to-accent-purple text-white'
                    : 'text-gray-400 hover:text-white hover:bg-dark-primary/30'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Character Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {character.birthday && (
                  <div className="modern-card p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent-pink/20 to-accent-pink/10 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-accent-pink" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Birthday</h3>
                        <p className="text-2xl font-bold text-accent-pink">{formatBirthday(character.birthday)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {character.height && (
                  <div className="modern-card p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent-cyan/20 to-accent-cyan/10 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-accent-cyan" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Height</h3>
                        <p className="text-2xl font-bold text-accent-cyan">{character.height} cm</p>
                      </div>
                    </div>
                  </div>
                )}

                {character.blood_type && (
                  <div className="modern-card p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-xl flex items-center justify-center">
                        <Heart className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Blood Type</h3>
                        <p className="text-2xl font-bold text-red-400">{character.blood_type}</p>
                      </div>
                    </div>
                  </div>
                )}

                {character.voice_actor_jp && (
                  <div className="modern-card p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent-purple/20 to-accent-purple/10 rounded-xl flex items-center justify-center">
                        <Mic className="w-6 h-6 text-accent-purple" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Voice Actor</h3>
                        <p className="text-lg font-bold text-accent-purple">{character.voice_actor_jp}</p>
                      </div>
                    </div>
                  </div>
                )}

                {character.measurements && (
                  <div className="modern-card p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-accent-gold/20 to-accent-gold/10 rounded-xl flex items-center justify-center">
                        <Star className="w-6 h-6 text-accent-gold" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Measurements</h3>
                        <p className="text-lg font-bold text-accent-gold">{character.measurements}</p>
                      </div>
                    </div>
                  </div>
                )}

                {character.game_version && (
                  <div className="modern-card p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-indigo-500/10 rounded-xl flex items-center justify-center">
                        <GitBranch className="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Game Version</h3>
                        <p className="text-lg font-bold text-indigo-400">v{character.game_version}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Multi-language Names */}
              <div className="modern-card p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-accent-cyan" />
                  Multi-language Names
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'Japanese', value: character.name_jp, flag: '🇯🇵', color: 'from-red-400 to-pink-500' },
                    { label: 'English', value: character.name_en, flag: '🇺🇸', color: 'from-blue-400 to-cyan-500' },
                    { label: 'Chinese', value: character.name_cn, flag: '🇨🇳', color: 'from-red-500 to-yellow-500' },
                    { label: 'Traditional Chinese', value: character.name_tw, flag: '🇹🇼', color: 'from-green-400 to-blue-500' },
                    { label: 'Korean', value: character.name_kr, flag: '🇰🇷', color: 'from-purple-400 to-pink-500' }
                  ].map(({ label, value, flag, color }) => (
                    value && (
                      <div key={label} className="modern-card p-4 bg-dark-primary/30">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{flag}</span>
                          <span className="text-sm text-gray-400 font-medium">{label}</span>
                        </div>
                        <p className="text-white font-semibold text-lg">{value}</p>
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
            <div className="modern-card p-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Zap className="w-6 h-6 text-accent-cyan" />
                Character Skills ({skills.length})
              </h3>
              {skills.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No skills available for this character</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {skills.map((skill) => (
                    <div key={skill.id} className="modern-card p-6 bg-dark-primary/30">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 rounded-xl flex items-center justify-center">
                          {getSkillCategoryIcon(skill.skill_category)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-white mb-1">
                            {skill.name_en || skill.name_jp}
                          </h4>
                          <div className="flex flex-wrap gap-2 mb-2">
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
                        <p className="text-gray-300 mb-4 leading-relaxed">{skill.description_en}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        <div className="text-xs px-3 py-1 bg-dark-primary/50 rounded-full text-gray-400">
                          ID: {skill.id}
                        </div>
                        {skill.name_jp && skill.name_jp !== skill.name_en && (
                          <div className="text-xs px-3 py-1 bg-dark-primary/50 rounded-full text-gray-400">
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
            <div className="modern-card p-8">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Shirt className="w-6 h-6 text-accent-pink" />
                Character Swimsuits ({swimsuits.length})
              </h3>
              {swimsuits.length === 0 ? (
                <div className="text-center py-12">
                  <Shirt className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No swimsuits available for this character</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {swimsuits.map((swimsuit) => (
                    <div key={swimsuit.id} className="modern-card p-6 bg-dark-primary/30">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Badge className={`text-sm font-bold bg-gradient-to-r ${getRarityColor(swimsuit.rarity)} text-white px-3 py-1`}>
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
                      
                      <h4 className="text-lg font-bold text-white mb-2">
                        {swimsuit.name_en || swimsuit.name_jp}
                      </h4>
                      
                      {swimsuit.description_en && (
                        <p className="text-gray-300 text-sm mb-3 leading-relaxed">{swimsuit.description_en}</p>
                      )}
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Type</span>
                          <span className={`text-sm font-medium ${getSuitTypeColor(swimsuit.suit_type)}`}>
                            {swimsuit.suit_type}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Total Stats</span>
                          <span className="text-sm text-accent-cyan font-bold">{swimsuit.total_stats_awakened}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Malfunction
                          </span>
                          <Badge className={swimsuit.has_malfunction ? 'bg-orange-500' : 'bg-gray-500'}>
                            {swimsuit.has_malfunction ? 'Yes' : 'No'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400 flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Limited
                          </span>
                          <Badge className={swimsuit.is_limited ? 'bg-purple-500' : 'bg-gray-500'}>
                            {swimsuit.is_limited ? 'Yes' : 'No'}
                          </Badge>
                        </div>

                        {swimsuit.release_date_gl && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Release Date
                            </span>
                            <span className="text-sm text-white font-medium">
                              {formatReleaseDate(swimsuit.release_date_gl)}
                            </span>
                          </div>
                        )}

                        {swimsuit.name_jp && swimsuit.name_jp !== swimsuit.name_en && (
                          <div className="pt-2 border-t border-dark-border/30">
                            <span className="text-xs text-gray-500">JP: {swimsuit.name_jp}</span>
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
            <div className="space-y-8">
              {/* Technical Information */}
              <div className="modern-card p-8">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Info className="w-6 h-6 text-accent-purple" />
                  Technical Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-dark-primary/30 rounded-lg border border-dark-border/30">
                      <span className="text-gray-400 font-medium">Character ID</span>
                      <span className="text-white font-mono font-bold">{character.id}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-dark-primary/30 rounded-lg border border-dark-border/30">
                      <span className="text-gray-400 font-medium">Unique Key</span>
                      <span className="text-white font-mono font-bold">{character.unique_key}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-dark-primary/30 rounded-lg border border-dark-border/30">
                      <span className="text-gray-400 font-medium">Status</span>
                      <Badge className={character.is_active ? 'bg-green-500' : 'bg-gray-500'}>
                        {character.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {character.game_version && (
                      <div className="flex justify-between items-center p-4 bg-dark-primary/30 rounded-lg border border-dark-border/30">
                        <span className="text-gray-400 font-medium">Game Version</span>
                        <span className="text-indigo-400 font-bold">v{character.game_version}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-dark-primary/30 rounded-lg border border-dark-border/30">
                      <span className="text-gray-400 font-medium">Total Skills</span>
                      <span className="text-accent-cyan font-bold text-xl">{skills.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-dark-primary/30 rounded-lg border border-dark-border/30">
                      <span className="text-gray-400 font-medium">Total Swimsuits</span>
                      <span className="text-accent-pink font-bold text-xl">{swimsuits.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-dark-primary/30 rounded-lg border border-dark-border/30">
                      <span className="text-gray-400 font-medium">SSR+ Swimsuits</span>
                      <span className="text-accent-gold font-bold text-xl">
                        {swimsuits.filter(s => s.rarity === 'SSR' || s.rarity === 'SSR+').length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-dark-primary/30 rounded-lg border border-dark-border/30">
                      <span className="text-gray-400 font-medium">Limited Swimsuits</span>
                      <span className="text-purple-400 font-bold text-xl">
                        {swimsuits.filter(s => s.is_limited).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rarity Distribution */}
              {swimsuits.length > 0 && (
                <div className="modern-card p-8">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Trophy className="w-6 h-6 text-accent-gold" />
                    Swimsuit Rarity Distribution
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {['SSR+', 'SSR', 'SR', 'R', 'N'].map(rarity => {
                      const count = swimsuits.filter(s => s.rarity === rarity).length;
                      const percentage = swimsuits.length > 0 ? (count / swimsuits.length * 100).toFixed(1) : '0';
                      return (
                        <div key={rarity} className="text-center p-6 bg-dark-primary/30 rounded-xl border border-dark-border/30">
                          <div className={`text-3xl font-bold bg-gradient-to-r ${getRarityColor(rarity)} bg-clip-text text-transparent mb-2`}>
                            {count}
                          </div>
                          <div className="text-lg font-semibold text-white mb-1">{rarity} Swimsuits</div>
                          <div className="text-sm text-gray-400">{percentage}% of total</div>
                          <div className={`h-2 bg-gradient-to-r ${getRarityColor(rarity)} rounded-full mt-3 opacity-60`}></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Swimsuit Type Distribution */}
              {swimsuits.length > 0 && (
                <div className="modern-card p-8">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Shirt className="w-6 h-6 text-accent-pink" />
                    Swimsuit Type Distribution
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {['POW', 'TEC', 'STM', 'APL'].map(suitType => {
                      const count = swimsuits.filter(s => s.suit_type === suitType).length;
                      const percentage = swimsuits.length > 0 ? (count / swimsuits.length * 100).toFixed(1) : '0';
                      return (
                        <div key={suitType} className="text-center p-6 bg-dark-primary/30 rounded-xl border border-dark-border/30">
                          <div className={`text-3xl font-bold ${getSuitTypeColor(suitType)} mb-2`}>
                            {count}
                          </div>
                          <div className="text-lg font-semibold text-white mb-1">{suitType} Type</div>
                          <div className="text-sm text-gray-400">{percentage}% of total</div>
                          <div className="flex justify-center mt-3">
                            <div className={`${getSuitTypeColor(suitType)} text-2xl`}>
                              {getSuitTypeIcon(suitType)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Skill Categories */}
              {skills.length > 0 && (
                <div className="modern-card p-8">
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Zap className="w-6 h-6 text-accent-cyan" />
                    Skill Categories
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from(new Set(skills.map(s => s.skill_category))).map(category => {
                      const count = skills.filter(s => s.skill_category === category).length;
                      return (
                        <div key={category} className="flex items-center gap-3 p-4 bg-dark-primary/30 rounded-lg border border-dark-border/30">
                          {getSkillCategoryIcon(category)}
                          <div className="flex-1">
                            <div className="text-white font-medium">{category}</div>
                            <div className="text-sm text-gray-400">{count} skill{count !== 1 ? 's' : ''}</div>
                          </div>
                          <div className="text-lg font-bold text-accent-cyan">{count}</div>
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