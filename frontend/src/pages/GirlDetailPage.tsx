import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Star,
  Zap,
  Trophy,
  Calendar,
  Target,
  Gem,
  Shield,
  Sparkles,
  User,
  Award,
  Mic,
  Coffee,
  Palette,
  Book,
  Activity,
  Users,
  Info} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/services/utils';
import { girlsApi } from '@/services/api';
import { type Girl, type Skill, type Swimsuit } from '@/types';
import { PageLoadingState, InlinePageLoader } from '@/components/ui';

export default function GirlDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [girl, setGirl] = useState<Girl | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [swimsuits, setSwimsuits] = useState<Swimsuit[]>([]);
  const [loading, setLoading] = useState(true);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [swimsuitsLoading, setSwimsuitLoading] = useState(false);

  useEffect(() => {
    const fetchGirl = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Fetch girl details directly by ID
        const girlData = await girlsApi.getGirl(id);
        setGirl(girlData);

        // Fetch character skills and swimsuits in parallel
        const [skillsPromise, swimsuitsPromise] = await Promise.allSettled([
          fetchGirlSkills(id),
          fetchGirlSwimsuits(id)
        ]);

        if (skillsPromise.status === 'rejected') {
          console.warn('Failed to fetch skills:', skillsPromise.reason);
        }
        if (swimsuitsPromise.status === 'rejected') {
          console.warn('Failed to fetch swimsuits:', swimsuitsPromise.reason);
        }

      } catch (err) {
        console.error('Failed to fetch girl:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchGirlSkills = async (girlId: string) => {
      try {
        setSkillsLoading(true);
        const skillsData = await girlsApi.getGirlSkills(girlId);
        setSkills(skillsData || []);
      } catch (err) {
        console.error('Failed to fetch girl skills:', err);
      } finally {
        setSkillsLoading(false);
      }
    };

    const fetchGirlSwimsuits = async (girlId: string) => {
      try {
        setSwimsuitLoading(true);
        const swimsuitsData = await girlsApi.getGirlSwimsuits(girlId);
        setSwimsuits(swimsuitsData || []);
      } catch (err) {
        console.error('Failed to fetch girl swimsuits:', err);
      } finally {
        setSwimsuitLoading(false);
      }
    };

    fetchGirl();
  }, [id]);

  if (!girl) {
    return (
      <PageLoadingState isLoading={loading} message="Loading girl details...">
        <div className="modern-page flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-accent-cyan/20">
              <User className="w-12 h-12 text-accent-cyan/60" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">Girl Not Found</h2>
            <p className="text-muted-foreground mb-6">The girl you're looking for doesn't exist.</p>
            <Button 
              onClick={() => navigate('/girls')}
              className="bg-gradient-to-r from-accent-pink to-accent-purple hover:from-accent-pink/90 hover:to-accent-purple/90 text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Girls
            </Button>
          </motion.div>
        </div>
      </PageLoadingState>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pow': return 'from-red-400 to-pink-500';
      case 'tec': return 'from-cyan-400 to-blue-500';
      case 'stm': return 'from-yellow-400 to-orange-500';
      case 'apl': return 'from-purple-400 to-pink-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getStatColor = (stat: string) => {
    switch (stat.toLowerCase()) {
      case 'pow': return 'text-red-400';
      case 'tec': return 'text-cyan-400';
      case 'stm': return 'text-yellow-400';
      case 'apl': return 'text-purple-400';
      default: return 'text-muted-foreground';
    }
  };

  const getStatIcon = (stat: string) => {
    switch (stat.toLowerCase()) {
      case 'pow': return Trophy;
      case 'tec': return Target;
      case 'stm': return Shield;
      case 'apl': return Sparkles;
      default: return Star;
    }
  };

  const totalStats = girl.stats.pow + girl.stats.tec + girl.stats.stm + girl.stats.apl;
  const maxTotalStats = girl.maxStats ? 
    (girl.maxStats.pow + girl.maxStats.tec + girl.maxStats.stm + girl.maxStats.apl) : 
    totalStats;

  const formatBirthday = (birthday: string) => {
    const [month, day] = birthday.split('-');
    const date = new Date(2000, parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  return (
    <PageLoadingState isLoading={loading} message="Đang tải thông tin cô gái...">
      <div className="modern-page">
        <div className="modern-container-lg">
        {/* Header with back button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => navigate('/girls')}
              variant="outline"
              className="border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Girls
            </Button>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Profile Card */}
            <div className="relative modern-card p-8 overflow-hidden">
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/5 via-accent-cyan/5 to-accent-purple/5" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-accent-cyan/10 to-transparent" />
              
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h1 className="text-4xl font-bold text-white">{girl.name}</h1>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r ${getTypeColor(girl.type)} text-white shadow-lg`}
                      >
                        {girl.type.toUpperCase()}
                      </motion.div>
                    </div>
                    <div className="flex items-center flex-wrap gap-4 text-muted-foreground">
                      <span className="flex items-center">
                        <Zap className="w-4 h-4 mr-2 text-accent-gold" />
                        Level {girl.level}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-accent-pink" />
                        Birthday: {formatBirthday(girl.birthday)}
                      </span>
                    </div>
                  </div>
                  <div className="w-20 h-20 bg-gradient-to-br from-accent-pink/30 to-accent-purple/30 rounded-2xl flex items-center justify-center border border-accent-cyan/30 relative overflow-hidden">
                    {girl.profile?.images?.portrait ? (
                      <img 
                        src={girl.profile.images.portrait} 
                        alt={girl.name}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <User className="w-10 h-10 text-accent-cyan" />
                    )}
                  </div>
                </div>

                {/* Stats Overview */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Trophy className="w-5 h-5 mr-2 text-accent-gold" />
                    Stats Overview
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-r from-accent-cyan/10 to-accent-purple/10 rounded-xl p-4 border border-accent-cyan/20">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Current Power</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">
                          {totalStats.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-accent-pink/10 to-accent-purple/10 rounded-xl p-4 border border-accent-pink/20">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Max Potential</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-accent-pink to-accent-purple bg-clip-text text-transparent">
                          {maxTotalStats.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Stats */}
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(girl.stats).map(([stat, value]) => {
                    const maxValue = girl.maxStats?.[stat as keyof typeof girl.maxStats] || value;
                    const progress = (value / maxValue) * 100;
                    const StatIcon = getStatIcon(stat);
                    
                    return (
                      <motion.div
                        key={stat}
                        whileHover={{ scale: 1.02 }}
                        className="modern-glass rounded-xl p-4 border border-border/30"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <StatIcon className={`w-4 h-4 ${getStatColor(stat)}`} />
                            <span className={`font-bold text-sm ${getStatColor(stat)} uppercase`}>
                              {stat}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-white">{String(value)}</div>
                            <div className="text-xs text-muted-foreground">/ {maxValue}</div>
                          </div>
                        </div>
                        <div className="w-full bg-border/30 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className={`h-2 rounded-full bg-gradient-to-r ${getTypeColor(stat)}`}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{Math.round(progress)}% of max</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Character Profile Section */}
            {girl.profile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="modern-card p-6"
              >
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                  <Info className="w-5 h-5 mr-2 text-accent-pink" />
                  Character Profile
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-accent-cyan mb-3">Basic Information</h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 modern-glass rounded-lg">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-accent-pink" />
                          <span className="text-muted-foreground">Age</span>
                        </div>
                        <span className="text-white font-bold">{girl.profile.age} years old</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 modern-glass rounded-lg">
                        <div className="flex items-center">
                          <Activity className="w-4 h-4 mr-2 text-accent-cyan" />
                          <span className="text-muted-foreground">Height</span>
                        </div>
                        <span className="text-white font-bold">{girl.profile.height}</span>
                      </div>
                      
                      {girl.profile.measurements && (
                        <div className="flex items-center justify-between p-3 modern-glass rounded-lg">
                          <div className="flex items-center">
                            <Target className="w-4 h-4 mr-2 text-accent-purple" />
                            <span className="text-muted-foreground">Measurements</span>
                          </div>
                          <span className="text-white font-bold">
                            B{girl.profile.measurements.bust}/W{girl.profile.measurements.waist}/H{girl.profile.measurements.hips}
                          </span>
                        </div>
                      )}
                      
                      {girl.profile.bloodType && (
                        <div className="flex items-center justify-between p-3 modern-glass rounded-lg">
                          <div className="flex items-center">
                            <Heart className="w-4 h-4 mr-2 text-accent-pink" />
                            <span className="text-muted-foreground">Blood Type</span>
                          </div>
                          <span className="text-white font-bold">{girl.profile.bloodType}</span>
                        </div>
                      )}
                      
                      {girl.profile.cv && (
                        <div className="flex items-center justify-between p-3 modern-glass rounded-lg">
                          <div className="flex items-center">
                            <Mic className="w-4 h-4 mr-2 text-accent-gold" />
                            <span className="text-muted-foreground">CV</span>
                          </div>
                          <span className="text-white font-bold">{girl.profile.cv}</span>
                        </div>
                      )}
                      
                      {girl.profile.occupation && (
                        <div className="flex items-center justify-between p-3 modern-glass rounded-lg">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 text-accent-cyan" />
                            <span className="text-muted-foreground">Occupation</span>
                          </div>
                          <span className="text-white font-bold">{girl.profile.occupation}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Preferences & Personality */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-accent-purple mb-3">Preferences & Personality</h4>
                    
                    {girl.profile.hobbies && girl.profile.hobbies.length > 0 && (
                      <div className="p-3 modern-glass rounded-lg">
                        <div className="flex items-center mb-2">
                          <Book className="w-4 h-4 mr-2 text-accent-cyan" />
                          <span className="text-muted-foreground font-medium">Hobbies</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {girl.profile.hobbies.map((hobby: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-accent-cyan border-accent-cyan/30">
                              {hobby}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {girl.profile.favoriteFood && girl.profile.favoriteFood.length > 0 && (
                      <div className="p-3 modern-glass rounded-lg">
                        <div className="flex items-center mb-2">
                          <Coffee className="w-4 h-4 mr-2 text-accent-gold" />
                          <span className="text-muted-foreground font-medium">Favorite Food</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {girl.profile.favoriteFood.map((food: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-accent-gold border-accent-gold/30">
                              {food}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {girl.profile.favoriteColor && (
                      <div className="p-3 modern-glass rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Palette className="w-4 h-4 mr-2 text-accent-purple" />
                            <span className="text-muted-foreground font-medium">Favorite Color</span>
                          </div>
                          <span className="text-white font-bold">{girl.profile.favoriteColor}</span>
                        </div>
                      </div>
                    )}
                    
                    {girl.profile.personality && girl.profile.personality.length > 0 && (
                      <div className="p-3 modern-glass rounded-lg">
                        <div className="flex items-center mb-2">
                          <Sparkles className="w-4 h-4 mr-2 text-accent-pink" />
                          <span className="text-muted-foreground font-medium">Personality</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {girl.profile.personality.map((trait: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-accent-pink border-accent-pink/30">
                              {trait}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Character Story Section */}
            {girl.profile?.story && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="modern-card p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Book className="w-5 h-5 mr-2 text-accent-gold" />
                  {girl.profile.story.title}
                </h3>
                
                <div className="bg-gradient-to-r from-accent-gold/10 to-accent-orange/10 rounded-xl p-6 border border-accent-gold/20">
                  {girl.profile.story.image && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img 
                        src={girl.profile.story.image} 
                        alt={`${girl.name} story`}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    {girl.profile.story.content}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Character Gallery */}
            {girl.profile?.images?.gallery && girl.profile.images.gallery.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="modern-card p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-accent-purple" />
                  Character Gallery
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {girl.profile.images.gallery.map((image: string, index: number) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      className="rounded-xl overflow-hidden border border-accent-purple/30 hover:border-accent-purple/60 transition-all duration-300"
                    >
                      <img 
                        src={image} 
                        alt={`${girl.name} gallery ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Equipment Section */}
            {girl.swimsuit && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="modern-card p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Gem className="w-5 h-5 mr-2 text-accent-cyan" />
                  Equipped Swimsuit
                </h3>
                
                <div className="bg-gradient-to-r from-accent-ocean/10 to-accent-cyan/10 rounded-xl p-6 border border-accent-ocean/20">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">{girl.swimsuit.name_en}</h4>
                      <div className="flex items-center gap-3">
                        <Badge
                          className={cn(
                            "font-bold",
                            girl.swimsuit.rarity === 'SSR' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
                            girl.swimsuit.rarity === 'SR' ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white' :
                            girl.swimsuit.rarity === 'R' ? 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white' :
                            'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
                          )}
                        >
                          {girl.swimsuit.rarity}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Released: {girl.swimsuit.release_date_gl ? new Date(girl.swimsuit.release_date_gl).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Swimsuit Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="modern-glass rounded-lg p-3 text-center">
                      <div className="text-xs font-bold text-accent-cyan uppercase mb-1">
                        Total Stats
                      </div>
                      <div className="text-white font-bold">+{girl.swimsuit.total_stats_awakened}</div>
                    </div>
                  </div>

                  {/* Skills */}
                  {girl.swimsuit.skills && girl.swimsuit.skills.length > 0 && (
                    <div>
                      <h5 className="text-sm font-bold text-muted-foreground mb-2 flex items-center">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Skills
                      </h5>
                      <div className="space-y-2">
                        {girl.swimsuit.skills.map((swimsuitSkill) => (
                          <div
                            key={`${swimsuitSkill.swimsuit_id}-${swimsuitSkill.skill_id}`}
                            className="modern-glass rounded-lg p-3 border border-border/30"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-white">{swimsuitSkill.skill?.name_en || 'Unknown Skill'}</span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  swimsuitSkill.skill?.skill_category === 'ACTIVE' ? 'border-red-400 text-red-400' :
                                  swimsuitSkill.skill?.skill_category === 'PASSIVE' ? 'border-cyan-400 text-cyan-400' :
                                  swimsuitSkill.skill?.skill_category === 'POTENTIAL' ? 'border-yellow-400 text-yellow-400' :
                                  'border-purple-400 text-purple-400'
                                )}
                              >
                                {swimsuitSkill.skill?.skill_category || 'UNKNOWN'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{swimsuitSkill.skill?.description_en || 'No description available'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Character Skills Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="modern-card p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-accent-gold" />
                Character Skills
                {skillsLoading && <InlinePageLoader message="" size="sm" className="ml-2" />}
              </h3>

              {skillsLoading ? (
                <InlinePageLoader message="Đang tải kỹ năng..." className="py-8" />
              ) : skills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="bg-gradient-to-r from-accent-gold/10 to-accent-orange/10 rounded-xl p-4 border border-accent-gold/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-white">{skill.name_en}</h4>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            skill.skill_category === 'ACTIVE' ? 'border-red-400 text-red-400' :
                            skill.skill_category === 'PASSIVE' ? 'border-cyan-400 text-cyan-400' :
                            skill.skill_category === 'POTENTIAL' ? 'border-yellow-400 text-yellow-400' :
                            'border-purple-400 text-purple-400'
                          )}
                        >
                          {skill.skill_category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{skill.description_en}</p>
                      {skill.effect_type && (
                        <div className="text-xs text-accent-gold">
                          Effect: {skill.effect_type}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No skills found for this character</p>
                </div>
              )}
            </motion.div>

            {/* Character Swimsuits Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="modern-card p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <Gem className="w-5 h-5 mr-2 text-accent-cyan" />
                Character Swimsuits
                {swimsuitsLoading && <InlinePageLoader message="" size="sm" className="ml-2" />}
              </h3>

              {swimsuitsLoading ? (
                <InlinePageLoader message="Đang tải đồ bơi..." className="py-8" />
              ) : swimsuits.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {swimsuits.map((swimsuit) => (
                    <div
                      key={swimsuit.id}
                      className="bg-gradient-to-r from-accent-ocean/10 to-accent-cyan/10 rounded-xl p-4 border border-accent-ocean/20"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-white">{swimsuit.name_en}</h4>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            swimsuit.rarity === 'SSR' ? 'border-yellow-400 text-yellow-400' :
                            swimsuit.rarity === 'SR' ? 'border-purple-400 text-purple-400' :
                            swimsuit.rarity === 'R' ? 'border-blue-400 text-blue-400' :
                            'border-border text-muted-foreground'
                          )}
                        >
                          {swimsuit.rarity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{swimsuit.description_en}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-accent-cyan">Type: {swimsuit.suit_type}</span>
                        {swimsuit.total_stats_awakened && (
                          <span className="text-accent-gold">
                            Power: {swimsuit.total_stats_awakened.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {swimsuit.is_limited && (
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs border-accent-pink text-accent-pink">
                            Limited
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gem className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No swimsuits found for this character</p>
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Right Column - Quick Stats & Actions */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <div className="modern-card p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-accent-gold" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link to="/swimsuit" className="block">
                  <Button className="w-full bg-gradient-to-r from-accent-ocean to-accent-cyan hover:from-accent-ocean/90 hover:to-accent-cyan/90 text-white">
                    <Gem className="w-4 h-4 mr-2" />
                    View Swimsuits
                  </Button>
                </Link>
                <Link to="/accessory" className="block">
                  <Button 
                    variant="outline" 
                    className="w-full border-accent-purple/30 text-accent-purple hover:bg-accent-purple/10"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    View Accessories
                  </Button>
                </Link>
                <Link to="/skills" className="block">
                  <Button 
                    variant="outline" 
                    className="w-full border-accent-gold/30 text-accent-gold hover:bg-accent-gold/10"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    View Skills
                  </Button>
                </Link>
              </div>
            </div>

            {/* Character Info */}
            <div className="modern-card p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-accent-pink" />
                Character Info
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 modern-glass rounded-lg">
                  <span className="text-muted-foreground">Character ID</span>
                  <code className="text-accent-cyan font-mono text-sm modern-glass px-2 py-1 rounded-sm">
                    {girl.id}
                  </code>
                </div>
                <div className="flex justify-between items-center p-3 modern-glass rounded-lg">
                  <span className="text-muted-foreground">Primary Type</span>
                  <span className={`font-bold ${getStatColor(girl.type)} uppercase`}>
                    {girl.type}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 modern-glass rounded-lg">
                  <span className="text-muted-foreground">Level</span>
                  <span className="text-white font-bold">{girl.level}</span>
                </div>
                {girl.profile?.age && (
                  <div className="flex justify-between items-center p-3 modern-glass rounded-lg">
                    <span className="text-muted-foreground">Age</span>
                    <span className="text-white font-bold">{girl.profile.age} years</span>
                  </div>
                )}
                {girl.profile?.height && (
                  <div className="flex justify-between items-center p-3 modern-glass rounded-lg">
                    <span className="text-muted-foreground">Height</span>
                    <span className="text-white font-bold">{girl.profile.height}</span>
                  </div>
                )}
                <div className="flex justify-between items-center p-3 modern-glass rounded-lg">
                  <span className="text-muted-foreground">Accessories</span>
                  <span className="text-accent-purple font-bold">
                    {girl.accessories.length}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
    </PageLoadingState>
  );
} 