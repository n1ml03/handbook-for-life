import React, { useState, memo } from 'react';
import { X, ZoomIn, Move, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/services/utils';
import { Button } from '../button';
import { FilePreviewProps } from './types';

const getFileDisplayName = (fileUrl: string): string => {
  if (!fileUrl || typeof fileUrl !== 'string') {
    return 'Unknown file';
  }

  try {
    const trimmedUrl = fileUrl.trim();
    if (trimmedUrl.length === 0) {
      return 'Unknown file';
    }

    const filename = trimmedUrl.includes('/')
      ? trimmedUrl.split('/').pop() || trimmedUrl
      : trimmedUrl;

    // Extract original name if it follows our naming pattern
    const match = filename.match(/^(.+)-\d+-\d+(\.[^.]+)$/);
    return match ? `${match[1]}${match[2]}` : filename;
  } catch (error) {
    console.error('Error parsing file display name:', error);
    return 'Unknown file';
  }
};

export const FilePreview: React.FC<FilePreviewProps> = memo(({
  fileUrl,
  onRemove,
  screenshotData,
  disabled = false,
  enableReorder = false
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  // Use screenshotData if available, otherwise use fileUrl
  const imageUrl = screenshotData
    ? `data:${screenshotData.mimeType};base64,${screenshotData.data}`
    : fileUrl;

  const displayName = screenshotData?.filename || getFileDisplayName(fileUrl);

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => setImageError(true);
  const handleShowLightbox = () => setShowLightbox(true);
  const handleHideLightbox = () => setShowLightbox(false);

  if (!imageUrl || imageError) {
    return (
      <div className="relative group">
        <div className="aspect-video bg-muted rounded-lg border border-border/40 flex items-center justify-center">
          <div className="text-center space-y-2">
            <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto" />
            <span className="text-xs text-muted-foreground">
              {imageError ? 'Failed to load' : 'Loading...'}
            </span>
          </div>
        </div>
        {!disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="absolute -top-2 -right-2 p-1 h-auto bg-red-500 text-white hover:bg-red-600 rounded-full"
            aria-label="Remove file"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
        <p className="text-xs text-muted-foreground mt-2 truncate">{displayName}</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative group">
        <div
          className="aspect-video bg-muted rounded-lg overflow-hidden border border-border/40 cursor-pointer group-hover:border-accent-pink/60 transition-all duration-300"
          onClick={handleShowLightbox}
        >
          <img
            src={imageUrl}
            alt={displayName}
            className={cn(
              'w-full h-full object-cover transition-all duration-300',
              imageLoaded ? 'opacity-100' : 'opacity-0',
              'group-hover:scale-105'
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            decoding="async"
          />

          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

        {/* Remove button */}
        {!disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="absolute -top-2 -right-2 p-1 h-auto bg-red-500 text-white hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove file"
          >
            <X className="w-3 h-3" />
          </Button>
        )}

        {/* Drag handle for reordering */}
        {enableReorder && !disabled && (
          <div className="absolute top-2 left-2 p-1 bg-black/50 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
            <Move className="w-3 h-3" />
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-2 truncate">{displayName}</p>
      </div>

      {/* Lightbox */}
      {showLightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={handleHideLightbox}
        >
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
            onClick={handleHideLightbox}
          >
            <X className="w-5 h-5" />
          </Button>
          <img
            src={imageUrl}
            alt={displayName}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
});

FilePreview.displayName = 'FilePreview';
