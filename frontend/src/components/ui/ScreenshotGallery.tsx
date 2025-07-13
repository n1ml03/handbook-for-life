import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, Download, ImageIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/services/utils';

export interface ScreenshotData {
  data: string;
  mimeType: string;
  filename: string;
}

interface ScreenshotGalleryProps {
  screenshots: ScreenshotData[];
  className?: string;
  columns?: { mobile: number; tablet: number; desktop: number };
  showFilenames?: boolean;
  enableLightbox?: boolean;
  enableDownload?: boolean;
  // Optimized mode: use direct API URLs instead of base64
  documentId?: number | string;
  useOptimizedUrls?: boolean;
}

interface LightboxProps {
  screenshots: string[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  enableDownload?: boolean;
}

// Optimized thumbnail component with lazy loading
const ScreenshotThumbnail = React.memo(({
  screenshot,
  index,
  onClick,
  showFilename = false,
  documentId,
  useOptimizedUrls = true
}: {
  screenshot: ScreenshotData;
  index: number;
  onClick: () => void;
  showFilename?: boolean;
  documentId?: number | string;
  useOptimizedUrls?: boolean;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = useMemo(() => {
    if (useOptimizedUrls && documentId) {
      // Only return API URL if we have actual screenshot data
      if (!screenshot?.data || screenshot.data.trim().length === 0) return null;
      return `/api/images/document/${documentId}/screenshot/${index}`;
    }

    // Fallback to base64 data URL only if we have valid data
    if (!screenshot?.data || !screenshot?.mimeType || screenshot.data.trim().length === 0) return null;
    return `data:${screenshot.mimeType};base64,${screenshot.data}`;
  }, [screenshot.data, screenshot.mimeType, useOptimizedUrls, documentId, index]);

  if (!imageUrl || imageError) {
    return (
      <motion.div
        className="aspect-video bg-muted rounded-lg border border-border/40 flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.05 }}
      >
        <div className="text-center space-y-2">
          <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto" />
          <span className="text-xs text-muted-foreground">
            {imageError ? 'Failed to load' : 'Loading...'}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="group relative cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="aspect-video bg-muted rounded-lg overflow-hidden border border-border/40 group-hover:border-accent-pink/60 transition-all duration-300">
        <img
          src={imageUrl}
          alt={screenshot.filename || `Screenshot ${index + 1}`}
          className={cn(
            'w-full h-full object-cover transition-all duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0',
            'group-hover:scale-105'
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          loading="lazy"
          decoding="async"
        />
        
        {/* Loading overlay */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>

      {/* Filename */}
      {showFilename && screenshot.filename && (
        <p className="text-xs text-muted-foreground mt-2 truncate">
          {screenshot.filename}
        </p>
      )}
    </motion.div>
  );
});

ScreenshotThumbnail.displayName = 'ScreenshotThumbnail';

// Lightbox component for full-size viewing
const Lightbox = React.memo(({ 
  screenshots, 
  currentIndex, 
  onClose, 
  onNext, 
  onPrevious,
  enableDownload = false
}: LightboxProps) => {
  const handleDownload = useCallback(() => {
    if (!enableDownload || !screenshots[currentIndex]) return;
    
    const link = document.createElement('a');
    link.href = screenshots[currentIndex];
    link.download = `screenshot-${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [screenshots, currentIndex, enableDownload]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        onPrevious();
        break;
      case 'ArrowRight':
        onNext();
        break;
    }
  }, [onClose, onNext, onPrevious]);

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="w-5 h-5" />
      </Button>

      {/* Navigation buttons */}
      {screenshots.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}

      {/* Download button */}
      {enableDownload && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-16 z-10 text-white hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
        >
          <Download className="w-5 h-5" />
        </Button>
      )}

      {/* Image */}
      <motion.img
        key={currentIndex}
        src={screenshots[currentIndex]}
        alt={`Screenshot ${currentIndex + 1}`}
        className="max-w-full max-h-full object-contain"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Image counter */}
      {screenshots.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
          {currentIndex + 1} / {screenshots.length}
        </div>
      )}
    </motion.div>
  );
});

Lightbox.displayName = 'Lightbox';

// Main ScreenshotGallery component
export const ScreenshotGallery = React.memo(({
  screenshots,
  className,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  showFilenames = false,
  enableLightbox = true,
  enableDownload = false,
  documentId,
  useOptimizedUrls = true
}: ScreenshotGalleryProps) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Convert screenshots to URLs for lightbox - optimized version
  const screenshotUrls = useMemo(() => {
    if (useOptimizedUrls && documentId) {
      // Use direct API URLs for better performance
      return screenshots.map((_, index) => `/api/images/document/${documentId}/screenshot/${index}`);
    }

    // Fallback to base64 data URLs
    return screenshots.map(screenshot => {
      if (!screenshot.data || !screenshot.mimeType) return '';
      return `data:${screenshot.mimeType};base64,${screenshot.data}`;
    }).filter(Boolean);
  }, [screenshots, useOptimizedUrls, documentId]);

  const openLightbox = useCallback((index: number) => {
    if (enableLightbox) {
      setLightboxIndex(index);
    }
  }, [enableLightbox]);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const nextImage = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % screenshotUrls.length);
    }
  }, [lightboxIndex, screenshotUrls.length]);

  const previousImage = useCallback(() => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === 0 ? screenshotUrls.length - 1 : lightboxIndex - 1);
    }
  }, [lightboxIndex, screenshotUrls.length]);

  // Don't render if no screenshots
  if (!screenshots || screenshots.length === 0) {
    return null;
  }

  const gridClasses = cn(
    'grid gap-4',
    `grid-cols-${columns.mobile}`,
    `md:grid-cols-${columns.tablet}`,
    `lg:grid-cols-${columns.desktop}`,
    className
  );

  return (
    <>
      <div className={gridClasses}>
        {screenshots.map((screenshot, index) => (
          <ScreenshotThumbnail
            key={`${screenshot.filename}-${index}`}
            screenshot={screenshot}
            index={index}
            onClick={() => openLightbox(index)}
            showFilename={showFilenames}
            documentId={documentId}
            useOptimizedUrls={useOptimizedUrls}
          />
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            screenshots={screenshotUrls}
            currentIndex={lightboxIndex}
            onClose={closeLightbox}
            onNext={nextImage}
            onPrevious={previousImage}
            enableDownload={enableDownload}
          />
        )}
      </AnimatePresence>
    </>
  );
});

ScreenshotGallery.displayName = 'ScreenshotGallery';

// Utility component for simple screenshot display (no lightbox)
export const ScreenshotPreview = React.memo(({
  screenshot,
  className,
  showFilename = false,
  size = 'md'
}: {
  screenshot: ScreenshotData;
  className?: string;
  showFilename?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = useMemo(() => {
    if (!screenshot.data || !screenshot.mimeType) return null;
    return `data:${screenshot.mimeType};base64,${screenshot.data}`;
  }, [screenshot.data, screenshot.mimeType]);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  if (!imageUrl || imageError) {
    return (
      <div className={cn(
        'bg-muted rounded-lg border border-border/40 flex items-center justify-center',
        sizeClasses[size],
        className
      )}>
        <ImageIcon className="w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className={cn(
        'bg-muted rounded-lg overflow-hidden border border-border/40 relative',
        sizeClasses[size]
      )}>
        <img
          src={imageUrl}
          alt={screenshot.filename || 'Screenshot'}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          loading="lazy"
          decoding="async"
        />

        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
      </div>

      {showFilename && screenshot.filename && (
        <p className="text-xs text-muted-foreground truncate">
          {screenshot.filename}
        </p>
      )}
    </div>
  );
});

ScreenshotPreview.displayName = 'ScreenshotPreview';
