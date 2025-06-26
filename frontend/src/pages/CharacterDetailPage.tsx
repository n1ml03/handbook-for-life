import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Calendar,
  Mic,
  Heart,
  Star
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

  useEffect(() => {
    const fetchCharacterData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        
        // Fetch character details
        const characterData = await charactersApi.getCharacter(id);
        setCharacter(characterData);

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
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
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
        </motion.div>
      </div>
    );
  }

  return (
    <div className="modern-page">
      <div className="modern-container-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
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
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Character Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Character Profile Card */}
            <div className="relative modern-card p-8 overflow-hidden">
              {/* Background Effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/5 via-accent-cyan/5 to-accent-purple/5" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-accent-cyan/20 via-accent-purple/10 to-transparent" />
              
              <div className="relative z-10">
                {/* Character Header */}
                <div className="flex items-start gap-6 mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-3xl flex items-center justify-center border border-accent-cyan/20">
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
                    <User className="w-12 h-12 text-accent-cyan hidden" />
                  </div>
                  
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold text-white mb-2">
                      {character.name_en || character.name_jp}
                    </h1>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge className="bg-gradient-to-r from-accent-cyan to-accent-purple text-white">
                        ID: {character.id}
                      </Badge>
                      {character.is_active && (
                        <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white">
                          Active
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Character Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {character.birthday && (
                    <div className="flex items-center gap-3 p-4 bg-dark-primary/30 rounded-xl border border-dark-border/30">
                      <Calendar className="w-5 h-5 text-accent-pink" />
                      <div>
                        <p className="text-sm text-gray-400">Birthday</p>
                        <p className="text-white font-medium">{formatBirthday(character.birthday)}</p>
                      </div>
                    </div>
                  )}

                  {character.height && (
                    <div className="flex items-center gap-3 p-4 bg-dark-primary/30 rounded-xl border border-dark-border/30">
                      <User className="w-5 h-5 text-accent-cyan" />
                      <div>
                        <p className="text-sm text-gray-400">Height</p>
                        <p className="text-white font-medium">{character.height} cm</p>
                      </div>
                    </div>
                  )}

                  {character.blood_type && (
                    <div className="flex items-center gap-3 p-4 bg-dark-primary/30 rounded-xl border border-dark-border/30">
                      <Heart className="w-5 h-5 text-accent-pink" />
                      <div>
                        <p className="text-sm text-gray-400">Blood Type</p>
                        <p className="text-white font-medium">{character.blood_type}</p>
                      </div>
                    </div>
                  )}

                  {character.voice_actor_jp && (
                    <div className="flex items-center gap-3 p-4 bg-dark-primary/30 rounded-xl border border-dark-border/30">
                      <Mic className="w-5 h-5 text-accent-purple" />
                      <div>
                        <p className="text-sm text-gray-400">Voice Actor (JP)</p>
                        <p className="text-white font-medium">{character.voice_actor_jp}</p>
                      </div>
                    </div>
                  )}

                  {character.measurements && (
                    <div className="flex items-center gap-3 p-4 bg-dark-primary/30 rounded-xl border border-dark-border/30">
                      <Star className="w-5 h-5 text-accent-gold" />
                      <div>
                        <p className="text-sm text-gray-400">Measurements</p>
                        <p className="text-white font-medium">{character.measurements}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Multi-language Names */}
            <div className="modern-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Multi-language Names</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Japanese', value: character.name_jp, flag: '🇯🇵' },
                  { label: 'English', value: character.name_en, flag: '🇺🇸' },
                  { label: 'Chinese', value: character.name_cn, flag: '🇨🇳' },
                  { label: 'Traditional Chinese', value: character.name_tw, flag: '🇹🇼' },
                  { label: 'Korean', value: character.name_kr, flag: '🇰🇷' }
                ].map(({ label, value, flag }) => (
                  value && (
                    <div key={label} className="flex items-center gap-3 p-3 bg-dark-primary/30 rounded-lg border border-dark-border/30">
                      <span className="text-xl">{flag}</span>
                      <div>
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className="text-white">{value}</p>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Related Data */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Skills */}
            {skills.length > 0 && (
              <div className="modern-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Skills ({skills.length})</h3>
                <div className="space-y-3">
                  {skills.slice(0, 5).map((skill) => (
                    <div key={skill.id} className="p-3 bg-dark-primary/30 rounded-lg border border-dark-border/30">
                      <p className="text-white font-medium">{skill.name_en || skill.name_jp}</p>
                      <p className="text-xs text-gray-400 mt-1">{skill.skill_category}</p>
                      {skill.description_en && (
                        <p className="text-sm text-gray-300 mt-2">{skill.description_en}</p>
                      )}
                    </div>
                  ))}
                  {skills.length > 5 && (
                    <p className="text-sm text-gray-400 text-center">
                      +{skills.length - 5} more skills
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Swimsuits */}
            {swimsuits.length > 0 && (
              <div className="modern-card p-6">
                <h3 className="text-xl font-bold text-white mb-4">Swimsuits ({swimsuits.length})</h3>
                <div className="space-y-3">
                  {swimsuits.slice(0, 5).map((swimsuit) => (
                    <div key={swimsuit.id} className="p-3 bg-dark-primary/30 rounded-lg border border-dark-border/30">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-medium">{swimsuit.name_en || swimsuit.name_jp}</p>
                        <Badge className={`text-xs ${
                          swimsuit.rarity === 'SSR' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                          swimsuit.rarity === 'SR' ? 'bg-gradient-to-r from-purple-400 to-pink-500' :
                          'bg-gradient-to-r from-blue-400 to-cyan-500'
                        } text-white`}>
                          {swimsuit.rarity}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">{swimsuit.suit_type}</p>
                      {swimsuit.total_stats_awakened && (
                        <p className="text-sm text-accent-cyan mt-1">
                          Total Stats: {swimsuit.total_stats_awakened}
                        </p>
                      )}
                    </div>
                  ))}
                  {swimsuits.length > 5 && (
                    <p className="text-sm text-gray-400 text-center">
                      +{swimsuits.length - 5} more swimsuits
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Character ID Card */}
            <div className="modern-card p-6">
              <h3 className="text-xl font-bold text-white mb-4">Character Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-dark-primary/30 rounded-lg border border-dark-border/30">
                  <span className="text-gray-400">Character ID</span>
                  <span className="text-white font-mono">{character.id}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-primary/30 rounded-lg border border-dark-border/30">
                  <span className="text-gray-400">Unique Key</span>
                  <span className="text-white font-mono">{character.unique_key}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-dark-primary/30 rounded-lg border border-dark-border/30">
                  <span className="text-gray-400">Status</span>
                  <Badge className={character.is_active ? 'bg-green-500' : 'bg-gray-500'}>
                    {character.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 