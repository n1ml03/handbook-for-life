import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
import { cn } from '@/services/utils';
import { Character } from '@/types';
import { OptimizedCard } from './optimized-card-grid';

interface OptimizedCharacterCardProps {
  character: Character;
  onClick?: () => void;
  index?: number;
}

// Lightweight character card optimized for performance
export const OptimizedCharacterCard = React.memo<OptimizedCharacterCardProps>(({ 
  character, 
  onClick,
  index = 0 
}) => {
  // Memoize formatted data
  const characterData = useMemo(() => {
    const formatBirthday = (birthday?: string) => {
      if (!birthday) return 'Unknown';
      try {
        const date = new Date(birthday);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } catch {
        return birthday;
      }
    };

    // Calculate age from birthday if available
    const calculateAge = (birthday?: string) => {
      if (!birthday) return 'Unknown';
      try {
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age.toString();
      } catch {
        return 'Unknown';
      }
    };

    return {
      name: character.name_en || character.name_jp || 'Unknown',
      birthday: formatBirthday(character.birthday),
      age: calculateAge(character.birthday)
    };
  }, [character]);

  // Memoize character info display - Characters don't have stats, so we'll show basic info instead
  const infoDisplay = useMemo(() => {
    const info = [];
    
    if (character.height) {
      info.push({ label: 'HEIGHT', value: `${character.height}cm`, color: 'text-cyan-400' });
    }
    
    if (character.blood_type) {
      info.push({ label: 'BLOOD', value: character.blood_type, color: 'text-red-400' });
    }
    
    if (character.measurements) {
      info.push({ label: 'SIZE', value: character.measurements, color: 'text-purple-400' });
    }

    if (info.length === 0) return null;

    return info.slice(0, 3).map(stat => (
      <div key={stat.label} className="text-center">
        <div className={cn('text-xs font-bold', stat.color)}>{stat.label}</div>
        <div className="text-xs text-gray-300">{stat.value}</div>
      </div>
    ));
  }, [character.height, character.blood_type, character.measurements]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(index * 0.02, 0.3),
        duration: 0.2,
        ease: "easeOut"
      }}
    >
      <OptimizedCard
        onClick={onClick}
        className="p-4 h-full"
        hover={!!onClick}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-base leading-tight truncate">
                {characterData.name}
              </h3>
              <div className="flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-400">{characterData.birthday}</span>
              </div>
            </div>
            <div className="text-lg shrink-0">
              {/* Default character icon since nationality is not available */}
              🎭
            </div>
          </div>

          {/* Info */}
          <div className="flex items-center gap-1 mb-3">
            <MapPin className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-400">DOAXVV Character</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-400">Age {characterData.age}</span>
          </div>

          {/* Character Info */}
          {infoDisplay && (
            <div className="mt-auto pt-3 border-t border-gray-700/50">
              <div className="grid grid-cols-3 gap-2">
                {infoDisplay}
              </div>
            </div>
          )}
        </div>
      </OptimizedCard>
    </motion.div>
  );
});

OptimizedCharacterCard.displayName = 'OptimizedCharacterCard';

// Lightweight swimsuit card
interface OptimizedSwimsuitCardProps {
  swimsuit: any;
  index?: number;
}

export const OptimizedSwimsuitCard = React.memo<OptimizedSwimsuitCardProps>(({ 
  swimsuit, 
  index = 0 
}) => {
  const getRarityColor = useMemo(() => {
    switch (swimsuit.rarity) {
      case 'SSR+': return 'from-red-400 to-pink-600';
      case 'SSR': return 'from-yellow-400 to-orange-500';
      case 'SR': return 'from-purple-400 to-pink-500';
      case 'R': return 'from-blue-400 to-cyan-500';
      case 'N': return 'from-gray-400 to-gray-600';
      default: return 'from-gray-400 to-gray-600';
    }
  }, [swimsuit.rarity]);

  const characterName = useMemo(() => 
    (swimsuit.character as any)?.name_en || 'Unknown'
  , [swimsuit.character]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(index * 0.02, 0.3),
        duration: 0.2,
        ease: "easeOut"
      }}
      whileHover={{ y: -2 }}
    >
      <OptimizedCard className="p-4 h-full">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-sm leading-tight truncate">
                {swimsuit.name_en || swimsuit.name_jp || 'Unknown'}
              </h3>
              <p className="text-xs text-gray-400 mt-1">{characterName}</p>
            </div>
            <div className={cn(
              'px-2 py-1 rounded-md text-xs font-bold bg-gradient-to-r text-white',
              getRarityColor
            )}>
              {swimsuit.rarity}
            </div>
          </div>

          {/* Type */}
          <div className="text-xs text-gray-400 mb-2">
            {swimsuit.type || 'Swimsuit'}
          </div>

          {/* Stats if available */}
          {swimsuit.stats && (
            <div className="mt-auto pt-3 border-t border-gray-700/50">
              <div className="grid grid-cols-4 gap-1 text-center">
                <div>
                  <div className="text-xs font-bold text-red-400">POW</div>
                  <div className="text-xs text-gray-300">{swimsuit.stats.pow}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-cyan-400">TEC</div>
                  <div className="text-xs text-gray-300">{swimsuit.stats.tec}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-yellow-400">STM</div>
                  <div className="text-xs text-gray-300">{swimsuit.stats.stm}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-purple-400">APL</div>
                  <div className="text-xs text-gray-300">{swimsuit.stats.apl}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </OptimizedCard>
    </motion.div>
  );
});

OptimizedSwimsuitCard.displayName = 'OptimizedSwimsuitCard';

export default OptimizedCharacterCard;
