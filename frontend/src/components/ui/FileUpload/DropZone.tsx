import React, { useState, useCallback, useRef, type DragEvent as ReactDragEvent } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/services/utils';
import { Button } from '../button';
import { DropZoneProps } from './types';

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const DropZone: React.FC<DropZoneProps> = ({
  onDrop,
  disabled = false,
  accept = 'image/*',
  maxFiles,
  maxSize,
  isUploading,
  children,
  className
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer?.files || []);
    onDrop(droppedFiles);
  }, [onDrop, disabled]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      onDrop(selectedFiles);
    }
    // Reset input value to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onDrop]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  if (children) {
    return (
      <div
        className={cn(className)}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
        {children}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-xl p-6 transition-all duration-200",
        "hover:border-accent-pink/50 focus-within:border-accent-pink",
        isDragOver && !disabled 
          ? "border-accent-pink bg-accent-pink/5 scale-[1.02]" 
          : "border-border/30",
        disabled ? "opacity-50 cursor-not-allowed bg-muted/30" : undefined,
        !disabled ? "cursor-pointer bg-background/50 hover:bg-muted/10" : undefined,
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      <div className="text-center space-y-4">
        <div className={cn(
          "mx-auto w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200",
          isDragOver && !disabled
            ? "bg-accent-pink/20 text-accent-pink"
            : "bg-muted text-muted-foreground"
        )}>
          <Upload className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {isDragOver && !disabled
              ? "Drop files here"
              : isUploading
              ? "Uploading..."
              : "Drop files here or click to browse"
            }
          </p>
          <p className="text-xs text-muted-foreground">
            {accept === 'image/*' ? 'Images only' : 'Any file type'} • 
            Max {formatFileSize(maxSize)} per file • 
            Up to {maxFiles} files
          </p>
        </div>

        {!disabled && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="pointer-events-none"
          >
            <Upload className="w-4 h-4 mr-2" />
            Choose Files
          </Button>
        )}
      </div>
    </div>
  );
};
