import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/services/utils';

interface FileUploadProps {
  files: string[];
  onFilesChange: (files: string[]) => void;
  maxFiles?: number;
  accept?: string;
  maxSize?: number; // in bytes
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
}

interface UploadedFile {
  filename: string;
  originalName: string;
  size: number;
  url: string;
  mimeType: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  files = [], // Provide default empty array
  onFilesChange,
  maxFiles = 10,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024, // 10MB
  label,
  description,
  className,
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure files is always a valid array of strings
  const validFiles = React.useMemo(() => {
    if (!Array.isArray(files)) {
      return [];
    }
    return files.filter((file): file is string => 
      typeof file === 'string' && file.trim().length > 0
    );
  }, [files]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (!file) {
      return 'Invalid file object';
    }

    if (file.size > maxSize) {
      return `File "${file.name}" is too large. Maximum size is ${formatFileSize(maxSize)}.`;
    }

    if (accept && accept !== '*/*') {
      const acceptedTypes = accept.split(',').map(type => type.trim());
      const isValidType = acceptedTypes.some(type => {
        if (type.includes('*')) {
          const baseType = type.split('/')[0];
          return file.type.startsWith(baseType);
        }
        return file.type === type;
      });

      if (!isValidType) {
        return `File "${file.name}" is not an accepted file type.`;
      }
    }

    return null;
  };

  const uploadFiles = async (filesToUpload: File[]): Promise<UploadedFile[]> => {
    if (!Array.isArray(filesToUpload) || filesToUpload.length === 0) {
      throw new Error('No valid files to upload');
    }

    const formData = new FormData();
    
    try {
      if (filesToUpload.length === 1) {
        formData.append('screenshot', filesToUpload[0]);
        const response = await fetch('/api/upload/screenshot', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Upload failed' }));
          throw new Error(error.message || 'Upload failed');
        }

        const result = await response.json();
        return Array.isArray(result.data) ? result.data : [result.data];
      } else {
        filesToUpload.forEach(file => {
          formData.append('screenshots', file);
        });

        const response = await fetch('/api/upload/screenshots', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ message: 'Upload failed' }));
          throw new Error(error.message || 'Upload failed');
        }

        const result = await response.json();
        return Array.isArray(result.data) ? result.data : [];
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error instanceof Error ? error : new Error('Upload failed');
    }
  };

  const handleFiles = useCallback(async (fileList: File[]) => {
    if (disabled) return;

    setUploadError(null);

    // Filter out invalid files
    const validFileList = fileList.filter(file => file instanceof File);
    
    if (validFileList.length === 0) {
      setUploadError('No valid files selected');
      return;
    }

    // Validate file count
    if (validFiles.length + validFileList.length > maxFiles) {
      setUploadError(`Cannot upload more than ${maxFiles} files. Remove some files first.`);
      return;
    }

    // Validate each file
    const validationErrors: string[] = [];
    validFileList.forEach(file => {
      const error = validateFile(file);
      if (error) validationErrors.push(error);
    });

    if (validationErrors.length > 0) {
      setUploadError(validationErrors.join(' '));
      return;
    }

    setIsUploading(true);

    try {
      const uploadedFiles = await uploadFiles(validFileList);
      const newFileUrls = uploadedFiles
        .map(file => file?.url)
        .filter((url): url is string => typeof url === 'string' && url.trim().length > 0);
      
      if (newFileUrls.length > 0) {
        onFilesChange([...validFiles, ...newFileUrls]);
      } else {
        setUploadError('No valid file URLs returned from upload');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [validFiles, maxFiles, maxSize, accept, disabled, onFilesChange]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  }, [handleFiles, disabled]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      handleFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const removeFile = async (fileUrl: string) => {
    if (disabled || !fileUrl || typeof fileUrl !== 'string') return;

    try {
      // Check if it's a data URL (base64 encoded image)
      if (fileUrl.startsWith('data:')) {
        // For data URLs, we don't need to call the backend API
        // Just remove from local state since it's in-memory data
        console.log('Removing data URL file from state');
      } else if (fileUrl.includes('/')) {
        // For regular file URLs, attempt to delete from server
        const filename = fileUrl.split('/').pop();
        if (filename && filename.trim().length > 0) {
          await fetch(`/api/upload/files/${encodeURIComponent(filename)}?type=screenshots`, {
            method: 'DELETE',
          });
        }
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue with removal from state even if API deletion fails
    }

    const newFiles = validFiles.filter(file => file !== fileUrl);
    onFilesChange(newFiles);
  };

  const getFileDisplayName = (fileUrl: string): string => {
    // Add comprehensive validation
    if (!fileUrl || typeof fileUrl !== 'string') {
      return 'Unknown file';
    }

    try {
      const trimmedUrl = fileUrl.trim();
      if (trimmedUrl.length === 0) {
        return 'Unknown file';
      }

      // Extract filename from URL
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

  return (
    <div className={cn("space-y-4", className)}>
      {/* Label and Description */}
      {(label || description) && (
        <div>
          {label && (
            <label className="text-sm font-medium text-foreground mb-1 block">
              {label}
            </label>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Drop Zone */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 transition-all duration-200",
          "hover:border-accent-pink/50 focus-within:border-accent-pink",
          isDragOver && !disabled 
            ? "border-accent-pink bg-accent-pink/5 scale-[1.02]" 
            : "border-border/30",
          disabled ? "opacity-50 cursor-not-allowed bg-muted/30" : undefined,
          !disabled ? "cursor-pointer bg-background/50 hover:bg-muted/10" : undefined
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
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

      {/* Error Display */}
      {uploadError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">
            {uploadError}
          </div>
        </div>
      )}

      {/* Uploaded Files List */}
      {validFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            Uploaded Files ({validFiles.length}/{maxFiles})
          </p>
          <div className="space-y-2">
            {validFiles.map((fileUrl, index) => {
              // Additional safety check for each file URL
              if (!fileUrl || typeof fileUrl !== 'string') {
                return null;
              }

              return (
                <div
                  key={`${fileUrl}-${index}`} // More unique key
                  className="flex items-center gap-3 p-3 bg-background/50 border border-border rounded-lg"
                >
                  <ImageIcon className="w-4 h-4 text-accent-pink shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {getFileDisplayName(fileUrl)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {fileUrl}
                    </p>
                  </div>
                  {!disabled && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(fileUrl);
                      }}
                      className="p-1 h-auto text-muted-foreground hover:text-red-500"
                      aria-label="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-blue-700">Uploading files...</span>
        </div>
      )}
    </div>
  );
}; 