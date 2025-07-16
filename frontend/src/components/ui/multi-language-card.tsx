import React, { useMemo } from 'react';
import { Card } from './card';
import { cn } from '@/services/utils';

// Language configuration with modern colors and styling
const LANGUAGES = {
  jp: { 
    flag: '🇯🇵', 
    name: 'JP', 
    color: 'text-rose-400', 
    bg: 'bg-gradient-to-r from-rose-500/10 to-pink-500/10',
    border: 'border-rose-500/20'
  },
  en: { 
    flag: '🇺🇸', 
    name: 'EN', 
    color: 'text-blue-400', 
    bg: 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10',
    border: 'border-blue-500/20'
  },
  cn: { 
    flag: '🇨🇳', 
    name: 'CN', 
    color: 'text-amber-400', 
    bg: 'bg-gradient-to-r from-amber-500/10 to-yellow-500/10',
    border: 'border-amber-500/20'
  },
  tw: { 
    flag: '🇹🇼', 
    name: 'TW', 
    color: 'text-emerald-400', 
    bg: 'bg-gradient-to-r from-emerald-500/10 to-green-500/10',
    border: 'border-emerald-500/20'
  },
  kr: { 
    flag: '🇰🇷', 
    name: 'KR', 
    color: 'text-purple-400', 
    bg: 'bg-gradient-to-r from-purple-500/10 to-violet-500/10',
    border: 'border-purple-500/20'
  }
} as const;

type LanguageCode = keyof typeof LANGUAGES;

interface MultiLanguageNames {
  name_jp?: string;
  name_en?: string; 
  name_cn?: string;
  name_tw?: string;
  name_kr?: string;
}

interface LanguageDisplayProps {
  names: MultiLanguageNames;
  primaryLanguage?: LanguageCode;
  variant?: 'compact' | 'expanded' | 'minimal';
}

// Memoized language badge component for better performance
const LanguageBadge = React.memo<{
  lang: LanguageCode;
  name: string;
  variant: 'compact' | 'expanded' | 'minimal';
  isPrimary?: boolean;
}>(({ lang, name, variant, isPrimary = false }) => {
  const langConfig = LANGUAGES[lang];
  
  if (variant === 'minimal') {
    return (
      <div 
        className={cn(
          'inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg font-medium',
          langConfig.bg,
          langConfig.color,
          langConfig.border,
          'border backdrop-blur-sm'
        )}
      >
        <span className="text-base">{langConfig.flag}</span>
        <span>{name}</span>
      </div>
    );
  }

  if (variant === 'expanded') {
    return (
      <div 
        className={cn(
          'p-4 rounded-xl border backdrop-blur-sm',
          langConfig.bg,
          langConfig.border
        )}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{langConfig.flag}</span>
          <div className="flex-1 min-w-0">
            <div className={cn('text-sm font-semibold', langConfig.color)}>
              {langConfig.name}
            </div>
            <div className="text-white/90 truncate font-medium">{name}</div>
          </div>
        </div>
      </div>
    );
  }

  // Compact variant
  if (isPrimary) {
    return (
      <div className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold shrink-0',
        langConfig.bg,
        langConfig.color,
        langConfig.border,
        'border backdrop-blur-sm'
      )}>
        <span className="text-base">{langConfig.flag}</span>
        <span>{langConfig.name}</span>
      </div>
    );
  }

  return (
<<<<<<< Updated upstream
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors duration-200">
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center text-sm',
=======
    <div className={cn(
      'flex items-center gap-2 sm:gap-2.5 p-1.5 sm:p-2 rounded-lg transition-colors duration-200',
      'hover:bg-white/5 light:hover:bg-black/5'
    )}>
      <div className={cn(
        'w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center',
        'text-sm sm:text-base',
>>>>>>> Stashed changes
        langConfig.bg,
        langConfig.border,
        'border'
      )}>
        {langConfig.flag}
      </div>
      <div className="flex-1 min-w-0">
        <div className={cn('text-xs font-semibold uppercase tracking-wider', langConfig.color)}>
          {langConfig.name}
<<<<<<< Updated upstream
=======
        </div> */}
        <div className="text-white/90 light:text-foreground font-medium leading-tight text-xs sm:text-sm">
          <span className="line-clamp-2">{name}</span>
>>>>>>> Stashed changes
        </div>
        <div className="text-white/90 truncate font-medium text-sm">{name}</div>
      </div>
    </div>
  );
});

LanguageBadge.displayName = 'LanguageBadge';

const LanguageDisplay = React.memo<LanguageDisplayProps>(({ 
  names, 
  primaryLanguage = 'en',
  variant = 'compact' 
}) => {
  // Memoize expensive calculations
  const { primaryName, otherLanguagesData } = useMemo(() => {
    const getNameForLanguage = (lang: LanguageCode): string => {
      const nameMap = {
        jp: names.name_jp,
        en: names.name_en,
        cn: names.name_cn,
        tw: names.name_tw,
        kr: names.name_kr
      };
      return nameMap[lang] || names.name_en || names.name_jp || 'Unknown';
    };

    const primary = getNameForLanguage(primaryLanguage);
    const allLanguages = Object.keys(LANGUAGES) as LanguageCode[];
    const otherLangs = allLanguages
      .filter(lang => lang !== primaryLanguage)
      .map(lang => ({
        lang,
        name: getNameForLanguage(lang)
      }))
      .filter(({ name }) => name && name !== primary);

    return {
      primaryName: primary,
      otherLanguagesData: otherLangs
    };
  }, [names, primaryLanguage]);

  if (variant === 'minimal') {
    return (
<<<<<<< Updated upstream
      <div className="space-y-4">
        <div className="relative">
          <h3 className="text-xl font-bold text-white leading-tight tracking-tight">{primaryName}</h3>
          <div className="absolute -top-1 -right-1 text-lg opacity-80">
            {LANGUAGES[primaryLanguage].flag}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
=======
      <div className="space-y-2 sm:space-y-3">
        <div className="relative">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white light:text-foreground leading-tight tracking-tight pr-6">
            {primaryName}
          </h3>
          <div className="absolute top-0 right-0 text-base sm:text-lg opacity-80">
            {LANGUAGES[primaryLanguage].flag}
          </div>
        </div>
        <div className="flex flex-wrap gap-1 sm:gap-1.5">
>>>>>>> Stashed changes
          {otherLanguagesData.map(({ lang, name }) => (
            <LanguageBadge
              key={lang}
              lang={lang}
              name={name}
              variant={variant}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'expanded') {
    return (
      <div className="space-y-6">
        <div className="relative p-4 rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-white/2">
          <h3 className="text-2xl font-bold text-white leading-tight tracking-tight">{primaryName}</h3>
          <div className={cn(
            'absolute top-3 right-3 text-xl',
            LANGUAGES[primaryLanguage].color
          )}>
            {LANGUAGES[primaryLanguage].flag}
          </div>
          <div className="mt-2 text-sm text-white/60 font-medium">
            Primary ({LANGUAGES[primaryLanguage].name})
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {otherLanguagesData.map(({ lang, name }) => (
            <LanguageBadge
              key={lang}
              lang={lang}
              name={name}
              variant={variant}
            />
          ))}
        </div>
      </div>
    );
  }

  // Compact variant (default) - Ultra compact
  return (
<<<<<<< Updated upstream
    <div className="space-y-5">
      {/* Primary name with elegant styling */}
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-xl font-bold text-white leading-tight tracking-tight flex-1">{primaryName}</h3>
=======
    <div className="space-y-2 sm:space-y-3">
      {/* Primary name with elegant styling */}
      <div className="relative">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <h3 className="text-sm sm:text-lg md:text-lg font-bold text-white light:text-foreground leading-tight tracking-tight flex-1">
            {primaryName}
          </h3>
>>>>>>> Stashed changes
          <LanguageBadge
            lang={primaryLanguage}
            name={primaryName}
            variant={variant}
            isPrimary
          />
        </div>
      </div>

      {/* Other languages with compact flat layout */}
      {otherLanguagesData.length > 0 && (
<<<<<<< Updated upstream
        <div className="bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
=======
        <div className={cn(
          'rounded-lg p-2 sm:p-3 border',
          // Dark mode styling - flat design
          'bg-card border-border/30',
          // Light mode styling - pure flat design
          'light:bg-card light:border-border/50'
        )}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
>>>>>>> Stashed changes
            {otherLanguagesData.map(({ lang, name }) => (
              <LanguageBadge
                key={lang}
                lang={lang}
                name={name}
                variant={variant}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

LanguageDisplay.displayName = 'LanguageDisplay';

interface MultiLanguageCardProps {
  names: MultiLanguageNames;
  primaryLanguage?: LanguageCode;
  languageVariant?: 'compact' | 'expanded' | 'minimal';
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  sideContent?: React.ReactNode;
  hover?: boolean;
}

export const MultiLanguageCard = React.memo<MultiLanguageCardProps>(({
  names,
  primaryLanguage = 'en',
  languageVariant = 'compact',
  children,
  className,
  onClick,
  header,
  footer,
  sideContent,
  hover = true
}) => {
<<<<<<< Updated upstream
=======
  // Memoize density-based padding and spacing - Optimized for compact design
  const densityConfig = useMemo(() => {
    const configs = {
      compact: { padding: 'p-2 sm:p-3', spacing: 'space-y-1 sm:space-y-2', textSpacing: 'space-y-0.5 sm:space-y-1' },
      comfortable: { padding: 'p-3 sm:p-4', spacing: 'space-y-2 sm:space-y-3', textSpacing: 'space-y-1 sm:space-y-2' },
      spacious: { padding: 'p-4 sm:p-5', spacing: 'space-y-3 sm:space-y-4', textSpacing: 'space-y-2 sm:space-y-3' }
    };
    return configs[density];
  }, [density]);

>>>>>>> Stashed changes
  // Memoize card classes to prevent recalculation
  const cardClasses = useMemo(() => ({
    base: cn(
      'modern-card p-8',
      'border-2 border-white/10',
      'bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60',
      'backdrop-blur-md shadow-xl',
      className
    ),
    clickable: cn(
      'modern-card p-8 overflow-hidden transition-all duration-300',
      'border-2 border-white/10 hover:border-white/20',
      'bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60',
      'backdrop-blur-md shadow-2xl',
      hover ? 'hover:shadow-3xl hover:bg-gradient-to-br hover:from-slate-900/80 hover:via-slate-800/60 hover:to-slate-900/80' : ''
    )
  }), [className, hover]);

  const cardContent = useMemo(() => (
    <div className="relative">
      {/* Header section with modern styling */}
      {header && (
        <div className="mb-6 pb-4 border-b border-white/20">
          {header}
        </div>
      )}

      {/* Main content area with improved layout */}
      <div className={cn(
        'grid gap-6',
        sideContent ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'
      )}>
        {/* Language display */}
        <div className={cn(sideContent ? 'lg:col-span-2' : 'col-span-1')}>
          <LanguageDisplay 
            names={names}
            primaryLanguage={primaryLanguage}
            variant={languageVariant}
          />
        </div>

        {/* Side content with modern styling */}
        {sideContent && (
          <div className="lg:col-span-1">
            <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/2 border border-white/10">
              {sideContent}
            </div>
          </div>
        )}
      </div>

      {/* Additional content with improved spacing */}
      {children && (
        <div className="mt-6 pt-4 border-t border-white/20">
          {children}
        </div>
      )}

      {/* Footer section with modern styling */}
      {footer && (
        <div className="mt-6 pt-4 border-t border-white/20">
          {footer}
        </div>
      )}
    </div>
  ), [header, sideContent, names, primaryLanguage, languageVariant, children, footer]);

  if (onClick) {
    return (
      <div
        onClick={onClick}
        className={cn('cursor-pointer group', className)}
      >
        <Card className={cardClasses.clickable}>
          <div className="relative z-10">
            {cardContent}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Card className={cardClasses.base}>
      {cardContent}
    </Card>
  );
});

MultiLanguageCard.displayName = 'MultiLanguageCard';

// Export language utilities for other components
export { LANGUAGES, type LanguageCode, type MultiLanguageNames };
export default MultiLanguageCard; 