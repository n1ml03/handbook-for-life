import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Card } from './card';
import { cn } from '@/services/utils';
import { type ImageData } from '@/utils/imageUtils';

// Language configuration with white backgrounds for light mode
const LANGUAGES = {
  jp: {
    flag: '🇯🇵',
    name: 'JP',
    color: 'text-rose-400 light:text-rose-700',
    bg: 'bg-gradient-to-r from-rose-500/10 to-pink-500/10 light:bg-white',
    border: 'border-rose-500/20 light:border-rose-300'
  },
  en: {
    flag: '🇺🇸',
    name: 'EN',
    color: 'text-blue-400 light:text-blue-700',
    bg: 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 light:bg-white',
    border: 'border-blue-500/20 light:border-blue-300'
  },
  cn: {
    flag: '🇨🇳',
    name: 'CN',
    color: 'text-amber-400 light:text-amber-700',
    bg: 'bg-gradient-to-r from-amber-500/10 to-yellow-500/10 light:bg-white',
    border: 'border-amber-500/20 light:border-amber-300'
  },
  tw: {
    flag: '🇹🇼',
    name: 'TW',
    color: 'text-emerald-400 light:text-emerald-700',
    bg: 'bg-gradient-to-r from-emerald-500/10 to-green-500/10 light:bg-white',
    border: 'border-emerald-500/20 light:border-emerald-300'
  },
  kr: {
    flag: '🇰🇷',
    name: 'KR',
    color: 'text-purple-400 light:text-purple-700',
    bg: 'bg-gradient-to-r from-purple-500/10 to-violet-500/10 light:bg-white',
    border: 'border-purple-500/20 light:border-purple-300'
  }
} as const;

type LanguageCode = keyof typeof LANGUAGES;

// Optimized image component for cards with responsive behavior and advanced lazy loading
const OptimizedCardImage = React.memo<{
  config: ImageConfig;
  className?: string;
}>(({ config, className }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px' // Start loading 50px before the image comes into view
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    wide: 'aspect-[16/9]',
    auto: 'aspect-auto'
  };

  const sizeClasses = {
    sm: 'w-16 h-16 sm:w-20 sm:h-20',
    md: 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28',
    lg: 'w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40',
    xl: 'w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48'
  };

  const imageUrl = useMemo(() => {
    if (config.src) return config.src;
    if (config.imageData && config.imageData.data && config.imageData.mimeType) {
      return `data:${config.imageData.mimeType};base64,${config.imageData.data}`;
    }
    return null;
  }, [config.src, config.imageData]);

  const containerClasses = cn(
    'relative overflow-hidden rounded-xl border border-white/10 light:border-border/40',
    'bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40',
    'light:bg-white light:shadow-sm',
    'optimized-image scroll-optimized', // Add our new CSS classes
    config.size ? sizeClasses[config.size] : aspectRatioClasses[config.aspectRatio || 'video'],
    config.className,
    className
  );

  // Enhanced loading state - only shows when we have a valid image URL
  const renderLoadingState = () => (
    <div className="absolute inset-0 scroll-skeleton">
      <div className="absolute inset-0 bg-muted/20 animate-pulse" />
    </div>
  );

  // Enhanced placeholder state - now shows empty background instead of icon
  const renderPlaceholder = () => (
    <div className="absolute inset-0 bg-muted/10">
      {/* Empty state - just show the background without any content */}
    </div>
  );

  return (
    <div ref={containerRef} className={containerClasses}>
      {imageUrl && !imageError ? (
        <>
          {isInView ? (
            <img
              ref={imgRef}
              src={imageUrl}
              alt={config.alt || 'Card image'}
              className={cn(
                'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
                'optimized-image',
                imageLoaded ? 'loaded opacity-100' : 'loading opacity-0'
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
              decoding="async"
              // Add srcset for responsive images if available
              {...(config.srcSet && { srcSet: config.srcSet })}
            />
          ) : null}
          {(!isInView || !imageLoaded) && renderLoadingState()}
        </>
      ) : (
        renderPlaceholder()
      )}
    </div>
  );
});

OptimizedCardImage.displayName = 'OptimizedCardImage';

interface MultiLanguageNames {
  name_jp?: string;
  name_en?: string;
  name_cn?: string;
  name_tw?: string;
  name_kr?: string;
}

interface ImageConfig {
  src?: string;
  srcSet?: string;
  imageData?: ImageData;
  alt?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'wide' | 'auto';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  position?: 'top' | 'left' | 'right';
  placeholder?: string;
  className?: string;
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
          'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium',
          'text-sm leading-tight',
          langConfig.bg,
          langConfig.color,
          langConfig.border,
          'border backdrop-blur-sm',
          // Light mode enhancements
          'light:shadow-sm light:bg-opacity-80'
        )}
      >
        {/* <span className="text-base">{langConfig.flag}</span> */}
        <span className="light:font-semibold truncate">{name}</span>
      </div>
    );
  }

  if (variant === 'expanded') {
    return (
      <div
        className={cn(
          'p-3 sm:p-4 rounded-lg border backdrop-blur-sm',
          langConfig.bg,
          langConfig.border,
          // Light mode enhancements
          'light:shadow-md light:bg-opacity-80'
        )}
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span className="text-xl sm:text-2xl">{langConfig.flag}</span>
          <div className="flex-1 min-w-0">
            {/* <div className={cn(
              'text-xs sm:text-sm font-semibold leading-tight',
              langConfig.color
            )}>
              {langConfig.name}
            </div> */}
            <div className="text-white/90 light:text-foreground font-medium leading-tight text-sm sm:text-base mt-0.5">
              <span className="line-clamp-2">{name}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compact variant
  if (isPrimary) {
    return (
      <div className={cn(
        'flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg shrink-0',
        'text-xs sm:text-sm font-semibold leading-tight',
        langConfig.bg,
        langConfig.color,
        langConfig.border,
        'border backdrop-blur-sm',
        // Light mode enhancements
        'light:shadow-sm light:bg-opacity-80 light:font-bold'
      )}>
        <span className="text-base sm:text-lg">{langConfig.flag}</span>
        {/* <span className="truncate">{langConfig.name}</span> */}
      </div>
    );
  }

  return (
    <div className={cn(
      'flex items-center gap-2.5 sm:gap-3 p-2 sm:p-3 rounded-lg transition-colors duration-200',
      'hover:bg-white/5 light:hover:bg-black/5'
    )}>
      <div className={cn(
        'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center',
        'text-base sm:text-lg',
        langConfig.bg,
        langConfig.border,
        'border',
        // Light mode enhancements
        'light:shadow-sm'
      )}>
        {langConfig.flag}
      </div>
      <div className="flex-1 min-w-0">
        {/* <div className={cn(
          'text-xs font-semibold uppercase tracking-wider leading-tight',
          langConfig.color
        )}>
          {langConfig.name}
        </div> */}
        <div className="text-white/90 light:text-foreground font-medium leading-tight text-sm mt-0.5">
          <span className="line-clamp-2">{name}</span>
        </div>
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
      <div className="space-y-3 sm:space-y-4">
        <div className="relative">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white light:text-foreground leading-tight tracking-tight pr-6">
            {primaryName}
          </h3>
          <div className="absolute top-0 right-0 text-lg sm:text-xl opacity-80">
            {LANGUAGES[primaryLanguage].flag}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
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
      <div className="space-y-4 sm:space-y-5">
        <div className={cn(
          'relative p-3 sm:p-4 rounded-lg border',
          // Dark mode styling
          'border-white/10 bg-gradient-to-r from-white/5 to-white/2',
          // Light mode styling - pure white background
          'light:border-border/40 light:bg-white light:shadow-md'
        )}>
          <h3 className="text-md sm:text-xl md:text-xl font-bold text-white light:text-foreground leading-tight tracking-tight pr-8">
            {primaryName}
          </h3>
          <div className={cn(
            'absolute top-3 sm:top-4 right-3 sm:right-4 text-lg sm:text-xl',
            LANGUAGES[primaryLanguage].color
          )}>
            {LANGUAGES[primaryLanguage].flag}
          </div>
          {/* <div className="mt-1.5 text-xs sm:text-sm text-white/60 light:text-muted-foreground font-medium">
            Primary ({LANGUAGES[primaryLanguage].name})
          </div> */}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
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

  // Compact variant (default)
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Primary name with elegant styling */}
      <div className="relative">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <h3 className="text-md sm:text-xl md:text-xl font-bold text-white light:text-foreground leading-tight tracking-tight flex-1">
            {primaryName}
          </h3>
          <LanguageBadge
            lang={primaryLanguage}
            name={primaryName}
            variant={variant}
            isPrimary
          />
        </div>
      </div>

      {/* Other languages with modern grid layout */}
      {otherLanguagesData.length > 0 && (
        <div className={cn(
          'rounded-lg p-3 sm:p-4 border',
          // Dark mode styling
          'bg-gradient-to-br from-slate-900/40 via-slate-800/20 to-slate-900/40 border-white/10 backdrop-blur-sm',
          // Light mode styling - pure white background
          'light:bg-white light:border-border/40 light:shadow-sm light:backdrop-blur-none'
        )}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
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
  // Enhanced image support
  image?: ImageConfig;
  // Layout options for better visual hierarchy
  layout?: 'default' | 'image-left' | 'image-top' | 'image-right';
  // Content density for different use cases
  density?: 'compact' | 'comfortable' | 'spacious';
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
  hover = true,
  image,
  layout = 'default',
  density = 'compact'
}) => {
  // Memoize density-based padding and spacing
  const densityConfig = useMemo(() => {
    const configs = {
      compact: { padding: 'p-3 sm:p-4', spacing: 'space-y-2 sm:space-y-3', textSpacing: 'space-y-1 sm:space-y-2' },
      comfortable: { padding: 'p-4 sm:p-5 md:p-6', spacing: 'space-y-3 sm:space-y-4', textSpacing: 'space-y-2 sm:space-y-3' },
      spacious: { padding: 'p-6 sm:p-7 md:p-8', spacing: 'space-y-4 sm:space-y-5', textSpacing: 'space-y-3 sm:space-y-4' }
    };
    return configs[density];
  }, [density]);

  // Memoize card classes to prevent recalculation
  const cardClasses = useMemo(() => ({
    base: cn(
      'modern-card',
      densityConfig.padding,
      // Dark mode styling
      'border-2 border-white/10 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 backdrop-blur-md shadow-xl',
      // Light mode styling - pure white background
      'light:border-2 light:border-border/40 light:bg-white light:shadow-lg light:backdrop-blur-none',
      className
    ),
    clickable: cn(
      'modern-card overflow-hidden transition-all duration-300',
      densityConfig.padding,
      // Dark mode styling
      'border-2 border-white/10 hover:border-white/20 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/60 backdrop-blur-md shadow-2xl',
      // Light mode styling - pure white background
      'light:border-2 light:border-border/40 light:hover:border-border/60 light:bg-white light:shadow-lg light:backdrop-blur-none',
      hover ? 'hover:shadow-3xl hover:bg-gradient-to-br hover:from-slate-900/80 hover:via-slate-800/60 hover:to-slate-900/80 light:hover:shadow-xl light:hover:bg-white' : ''
    )
  }), [className, hover, densityConfig]);

  const cardContent = useMemo(() => {
    const renderMainContent = () => {
      // Determine layout structure based on image and layout props
      const hasImage = image && (image.src || image.imageData);
      const isImageTop = layout === 'image-top' || (!layout && hasImage);
      const isImageLeft = layout === 'image-left';
      const isImageRight = layout === 'image-right';

      if (hasImage && isImageTop) {
        return (
          <div className={densityConfig.spacing}>
            {/* Image at top */}
            <OptimizedCardImage
              config={{
                ...image,
                aspectRatio: image.aspectRatio || 'video',
                size: image.size || 'lg'
              }}
              className="w-full"
            />

            {/* Language content below */}
            <div className={cn(sideContent ? 'grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6' : '')}>
              <div className={cn(sideContent ? 'lg:col-span-2' : '')}>
                <LanguageDisplay
                  names={names}
                  primaryLanguage={primaryLanguage}
                  variant={languageVariant}
                />
              </div>
              {sideContent && (
                <div className="lg:col-span-1">
                  <div className={cn(
                    'p-4 rounded-xl border',
                    'bg-gradient-to-br from-white/5 to-white/2 border-white/10',
                    'light:bg-white light:border-border/40 light:shadow-sm'
                  )}>
                    {sideContent}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }

      if (hasImage && (isImageLeft || isImageRight)) {
        return (
          <div className={cn(
            'grid gap-4 lg:gap-6',
            'grid-cols-1 sm:grid-cols-3',
            isImageLeft ? 'sm:grid-cols-[auto_1fr]' : 'sm:grid-cols-[1fr_auto]'
          )}>
            {/* Image column */}
            <div className={cn(
              'flex justify-center',
              isImageLeft ? 'order-1' : 'order-2 sm:order-2'
            )}>
              <OptimizedCardImage
                config={{
                  ...image,
                  size: image.size || 'md'
                }}
              />
            </div>

            {/* Content column */}
            <div className={cn(
              densityConfig.spacing,
              isImageLeft ? 'order-2' : 'order-1 sm:order-1'
            )}>
              <div className={cn(sideContent ? 'grid grid-cols-1 gap-4' : '')}>
                <LanguageDisplay
                  names={names}
                  primaryLanguage={primaryLanguage}
                  variant={languageVariant}
                />
                {sideContent && (
                  <div className={cn(
                    'p-4 rounded-xl border',
                    'bg-gradient-to-br from-white/5 to-white/2 border-white/10',
                    'light:bg-white light:border-border/40 light:shadow-sm'
                  )}>
                    {sideContent}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      // Default layout without image or with image in sideContent
      return (
        <div className={cn(
          'grid gap-4 lg:gap-6',
          sideContent || hasImage ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'
        )}>
          {/* Language display */}
          <div className={cn(
            sideContent || hasImage ? 'lg:col-span-2' : 'col-span-1'
          )}>
            <LanguageDisplay
              names={names}
              primaryLanguage={primaryLanguage}
              variant={languageVariant}
            />
          </div>

          {/* Side content or image */}
          {(sideContent || hasImage) && (
            <div className="lg:col-span-1">
              <div className={cn(
                'p-4 rounded-xl border',
                'bg-gradient-to-br from-white/5 to-white/2 border-white/10',
                'light:bg-white light:border-border/40 light:shadow-sm',
                densityConfig.spacing
              )}>
                {hasImage && !sideContent && (
                  <OptimizedCardImage
                    config={{
                      ...image,
                      size: image.size || 'lg'
                    }}
                    className="w-full mb-4"
                  />
                )}
                {sideContent}
              </div>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="relative">
        {/* Header section with modern styling */}
        {header && (
          <div className={cn(
            'mb-3 pb-2 border-b border-white/20 light:border-border/40',
            densityConfig.spacing
          )}>
            {header}
          </div>
        )}

        {/* Main content area with improved layout */}
        {renderMainContent()}

        {/* Additional content with improved spacing */}
        {children && (
          <div className={cn(
            'mt-3 pt-2 border-t border-white/20 light:border-border/40',
            densityConfig.spacing
          )}>
            {children}
          </div>
        )}

        {/* Footer section with modern styling */}
        {footer && (
          <div className={cn(
            'mt-3 pt-2 border-t border-white/20 light:border-border/40',
            densityConfig.spacing
          )}>
            {footer}
          </div>
        )}
      </div>
    );
  }, [header, sideContent, names, primaryLanguage, languageVariant, children, footer, image, layout, densityConfig]);

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

// Responsive card grid wrapper for consistent 3-column layout
export const MultiLanguageCardGrid = React.memo<{
  children: React.ReactNode;
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
}>(({ children, className, gap = 'md' }) => {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-3 sm:gap-4 lg:gap-5',
    lg: 'gap-4 sm:gap-5 lg:gap-6'
  };

  return (
    <div className={cn(
      'grid w-full',
      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
});

MultiLanguageCardGrid.displayName = 'MultiLanguageCardGrid';

// Export language utilities and components for other components
export {
  LANGUAGES,
  OptimizedCardImage,
  type LanguageCode,
  type MultiLanguageNames,
  type ImageConfig
};
export default MultiLanguageCard;