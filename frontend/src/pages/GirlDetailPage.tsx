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
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/services/utils';
import { girlsApi } from '@/services/api';
import { type Girl } from '@/types';

export default function GirlDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [girl, setGirl] = useState<Girl | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGirl = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await girlsApi.getGirls({ limit: 1000 });
        const foundGirl = response.data.find((g: Girl) => g.id === id);
        setGirl(foundGirl || null);
      } catch (err) {
        console.error('Failed to fetch girl:', err);
        setError('Failed to load girl data');
      } finally {
        setLoading(false);
      }
    };

    fetchGirl();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-cyan"></div>
      </div>
    );
  }


  if (!girl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-primary flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-accent-cyan/20">
            <User className="w-12 h-12 text-accent-cyan/60" />
          </div>
          <h2 className="text-2xl font-bold text-gray-300 mb-3">Girl Not Found</h2>
          <p className="text-gray-500 mb-6">The girl you're looking for doesn't exist.</p>
          <Button 
            onClick={() => navigate('/girls')}
            className="bg-gradient-to-r from-accent-pink to-accent-purple hover:from-accent-pink/90 hover:to-accent-purple/90 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Girls
          </Button>
        </motion.div>
      </div>
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
      default: return 'text-gray-400';
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
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-primary">
      <div className="max-w-6xl mx-auto px-4 py-6">
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
            <div className="relative bg-dark-card/80 backdrop-blur-sm border border-dark-border/50 rounded-2xl p-8 overflow-hidden">
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
                    <div className="flex items-center flex-wrap gap-4 text-gray-400">
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
                        <span className="text-sm font-medium text-gray-300">Current Power</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">
                          {totalStats.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-accent-pink/10 to-accent-purple/10 rounded-xl p-4 border border-accent-pink/20">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-300">Max Potential</span>
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
                        className="bg-dark-primary/50 rounded-xl p-4 border border-dark-border/30"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <StatIcon className={`w-4 h-4 ${getStatColor(stat)}`} />
                            <span className={`font-bold text-sm ${getStatColor(stat)} uppercase`}>
                              {stat}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-white">{value}</div>
                            <div className="text-xs text-gray-400">/ {maxValue}</div>
                          </div>
                        </div>
                        <div className="w-full bg-dark-border/30 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className={`h-2 rounded-full bg-gradient-to-r ${getTypeColor(stat)}`}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{Math.round(progress)}% of max</div>
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
                className="bg-dark-card/80 backdrop-blur-sm border border-dark-border/50 rounded-2xl p-6"
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
                      <div className="flex items-center justify-between p-3 bg-dark-primary/30 rounded-lg">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-accent-pink" />
                          <span className="text-gray-300">Age</span>
                        </div>
                        <span className="text-white font-bold">{girl.profile.age} years old</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-dark-primary/30 rounded-lg">
                        <div className="flex items-center">
                          <Activity className="w-4 h-4 mr-2 text-accent-cyan" />
                          <span className="text-gray-300">Height</span>
                        </div>
                        <span className="text-white font-bold">{girl.profile.height}</span>
                      </div>
                      
                      {girl.profile.measurements && (
                        <div className="flex items-center justify-between p-3 bg-dark-primary/30 rounded-lg">
                          <div className="flex items-center">
                            <Target className="w-4 h-4 mr-2 text-accent-purple" />
                            <span className="text-gray-300">Measurements</span>
                          </div>
                          <span className="text-white font-bold">
                            B{girl.profile.measurements.bust}/W{girl.profile.measurements.waist}/H{girl.profile.measurements.hips}
                          </span>
                        </div>
                      )}
                      
                      {girl.profile.bloodType && (
                        <div className="flex items-center justify-between p-3 bg-dark-primary/30 rounded-lg">
                          <div className="flex items-center">
                            <Heart className="w-4 h-4 mr-2 text-accent-pink" />
                            <span className="text-gray-300">Blood Type</span>
                          </div>
                          <span className="text-white font-bold">{girl.profile.bloodType}</span>
                        </div>
                      )}
                      
                      {girl.profile.cv && (
                        <div className="flex items-center justify-between p-3 bg-dark-primary/30 rounded-lg">
                          <div className="flex items-center">
                            <Mic className="w-4 h-4 mr-2 text-accent-gold" />
                            <span className="text-gray-300">CV</span>
                          </div>
                          <span className="text-white font-bold">{girl.profile.cv}</span>
                        </div>
                      )}
                      
                      {girl.profile.occupation && (
                        <div className="flex items-center justify-between p-3 bg-dark-primary/30 rounded-lg">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 text-accent-cyan" />
                            <span className="text-gray-300">Occupation</span>
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
                      <div className="p-3 bg-dark-primary/30 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Book className="w-4 h-4 mr-2 text-accent-cyan" />
                          <span className="text-gray-300 font-medium">Hobbies</span>
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
                      <div className="p-3 bg-dark-primary/30 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Coffee className="w-4 h-4 mr-2 text-accent-gold" />
                          <span className="text-gray-300 font-medium">Favorite Food</span>
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
                      <div className="p-3 bg-dark-primary/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Palette className="w-4 h-4 mr-2 text-accent-purple" />
                            <span className="text-gray-300 font-medium">Favorite Color</span>
                          </div>
                          <span className="text-white font-bold">{girl.profile.favoriteColor}</span>
                        </div>
                      </div>
                    )}
                    
                    {girl.profile.personality && girl.profile.personality.length > 0 && (
                      <div className="p-3 bg-dark-primary/30 rounded-lg">
                        <div className="flex items-center mb-2">
                          <Sparkles className="w-4 h-4 mr-2 text-accent-pink" />
                          <span className="text-gray-300 font-medium">Personality</span>
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
                className="bg-dark-card/80 backdrop-blur-sm border border-dark-border/50 rounded-2xl p-6"
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
                  <p className="text-gray-300 leading-relaxed text-lg">
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
                className="bg-dark-card/80 backdrop-blur-sm border border-dark-border/50 rounded-2xl p-6"
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
                className="bg-dark-card/80 backdrop-blur-sm border border-dark-border/50 rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Gem className="w-5 h-5 mr-2 text-accent-cyan" />
                  Equipped Swimsuit
                </h3>
                
                <div className="bg-gradient-to-r from-accent-ocean/10 to-accent-cyan/10 rounded-xl p-6 border border-accent-ocean/20">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">{girl.swimsuit.name}</h4>
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
                        <span className="text-sm text-gray-400">
                          Released: {girl.swimsuit.release ? new Date(girl.swimsuit.release).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Swimsuit Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {Object.entries(girl.swimsuit.stats).map(([stat, value]) => (
                      <div key={stat} className="bg-dark-primary/30 rounded-lg p-3 text-center">
                        <div className={`text-xs font-bold ${getStatColor(stat)} uppercase mb-1`}>
                          {stat}
                        </div>
                        <div className="text-white font-bold">+{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  {girl.swimsuit.skills && girl.swimsuit.skills.length > 0 && (
                    <div>
                      <h5 className="text-sm font-bold text-gray-300 mb-2 flex items-center">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Skills
                      </h5>
                      <div className="space-y-2">
                        {girl.swimsuit.skills.map((skill) => (
                          <div
                            key={skill.id}
                            className="bg-dark-primary/50 rounded-lg p-3 border border-dark-border/30"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-white">{skill.name}</span>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  skill.type === 'offensive' ? 'border-red-400 text-red-400' :
                                  skill.type === 'technical' ? 'border-cyan-400 text-cyan-400' :
                                  skill.type === 'defensive' ? 'border-yellow-400 text-yellow-400' :
                                  'border-purple-400 text-purple-400'
                                )}
                              >
                                {skill.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-400">{skill.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Right Column - Quick Stats & Actions */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <div className="bg-dark-card/80 backdrop-blur-sm border border-dark-border/50 rounded-2xl p-6">
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
            <div className="bg-dark-card/80 backdrop-blur-sm border border-dark-border/50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-accent-pink" />
                Character Info
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-dark-primary/30 rounded-lg">
                  <span className="text-gray-300">Character ID</span>
                  <code className="text-accent-cyan font-mono text-sm bg-dark-primary/50 px-2 py-1 rounded-sm">
                    {girl.id}
                  </code>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-primary/30 rounded-lg">
                  <span className="text-gray-300">Primary Type</span>
                  <span className={`font-bold ${getStatColor(girl.type)} uppercase`}>
                    {girl.type}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-primary/30 rounded-lg">
                  <span className="text-gray-300">Level</span>
                  <span className="text-white font-bold">{girl.level}</span>
                </div>
                {girl.profile?.age && (
                  <div className="flex justify-between items-center p-3 bg-dark-primary/30 rounded-lg">
                    <span className="text-gray-300">Age</span>
                    <span className="text-white font-bold">{girl.profile.age} years</span>
                  </div>
                )}
                {girl.profile?.height && (
                  <div className="flex justify-between items-center p-3 bg-dark-primary/30 rounded-lg">
                    <span className="text-gray-300">Height</span>
                    <span className="text-white font-bold">{girl.profile.height}</span>
                  </div>
                )}
                <div className="flex justify-between items-center p-3 bg-dark-primary/30 rounded-lg">
                  <span className="text-gray-300">Accessories</span>
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
  );
} 