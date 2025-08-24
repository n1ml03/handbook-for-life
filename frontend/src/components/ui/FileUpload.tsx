import React, { useState, useRef, useCallback, type ChangeEvent, type DragEvent as ReactDragEvent } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, ZoomIn, Move, File } from 'lucide-react';
import { cn } from '@/services/utils';
import { Button } from './button';
import { uploadApi } from '@/services/api';

// Enhanced file metadata interface
interface FileMetadata {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadDate?: Date;
}

// Support both string URLs and file metadata for backwards compatibility
type FileItem = string | FileMetadata;

interface FileUploadProps {
  files: FileItem[];
  onFilesChange: (files: FileItem[]) => void;
  maxFiles?: number;
  accept?: string;
  maxSize?: number; // in bytes
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean; // New prop to enable image preview
  enableReorder?: boolean; // New prop to enable drag reorder
  screenshotsData?: Array<{data: string; mimeType: string; filename: string}>; // For preview mode
  // New prop to enable enhanced metadata storage
  useMetadata?: boolean;
}

interface UploadedFile {
  filename: string;
  originalName: string;
  size: number;
  url?: string; // Optional because some APIs don't provide it
  mimeType: string;
  data?: string; // Base64 data for APIs that provide it
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
  disabled = false,
  showPreview = true,
  enableReorder = false,
  screenshotsData = [],
  useMetadata = true // Default to using metadata for better functionality
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Utility functions for handling FileItem type
  const isFileMetadata = (file: FileItem): file is FileMetadata => {
    return typeof file === 'object' && file !== null && 'url' in file && 'size' in file;
  };

  const getFileUrl = (file: FileItem): string => {
    return isFileMetadata(file) ? file.url : file;
  };

  const getFileMetadata = (file: FileItem): FileMetadata | null => {
    if (isFileMetadata(file)) {
      return file;
    }
    // For string URLs, we don't have metadata
    return null;
  };

  const getFileSize = (file: FileItem): number => {
    const metadata = getFileMetadata(file);
    return metadata?.size || 0;
  };

  const getFileName = (file: FileItem): string => {
    if (isFileMetadata(file)) {
      return file.originalName || file.filename;
    }
    // For string URLs, extract filename
    return getFileDisplayName(file);
  };

  const createFileMetadata = (uploadedFile: UploadedFile, originalFile: File): FileMetadata => {
    return {
      url: uploadedFile.url || `data:${uploadedFile.mimeType};base64,${uploadedFile.data}`,
      filename: uploadedFile.filename,
      originalName: uploadedFile.originalName || originalFile.name,
      size: uploadedFile.size || originalFile.size,
      mimeType: uploadedFile.mimeType || originalFile.type,
      uploadDate: new Date()
    };
  };

  // Ensure files is always a valid array
  const validFiles = React.useMemo(() => {
    if (!Array.isArray(files)) {
      return [];
    }
    return files.filter((file): file is FileItem => {
      if (typeof file === 'string') {
        return file.trim().length > 0;
      }
      if (isFileMetadata(file)) {
        return !!(file.url && file.url.trim().length > 0);
      }
      return false;
    });
  }, [files]);

  // Helper function to create blob URLs from base64 data
  const createBlobUrl = useCallback((base64Data: string, mimeType: string): string => {
    try {
      // Decode base64 data
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      
      // Create blob and object URL
      const blob = new Blob([byteArray], { type: mimeType });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error creating blob URL:', error);
      // Fallback to data URL
      return `data:${mimeType};base64,${base64Data}`;
    }
  }, []);

  // Cleanup blob URLs when component unmounts or files change
  React.useEffect(() => {
    return () => {
      // Cleanup any blob URLs to prevent memory leaks
      validFiles.forEach(file => {
        const fileUrl = getFileUrl(file);
        if (fileUrl.startsWith('blob:')) {
          URL.revokeObjectURL(fileUrl);
        }
      });
    };
  }, [validFiles]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Enhanced file validation with better error messages
    if (!file || !(file instanceof File)) {
      return 'Invalid file object - Please select a valid file.';
    }

    // Check file name
    if (!file.name || file.name.trim().length === 0) {
      return 'File must have a valid name.';
    }

    // Check file size
    if (file.size === 0) {
      return `File "${file.name}" is empty. Please select a file with content.`;
    }

    if (file.size > maxSize) {
      return `File "${file.name}" is too large. Maximum size is ${formatFileSize(maxSize)}.`;
    }

    // Enhanced file type validation
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
        const fileTypeDisplay = file.type || 'unknown type';
        const acceptedDisplay = acceptedTypes.join(', ');
        return `File "${file.name}" (${fileTypeDisplay}) is not accepted. Accepted types: ${acceptedDisplay}`;
      }
    }

    // Additional security checks
    const fileName = file.name.toLowerCase();
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.vbs', '.js'];
    if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
      return `File "${file.name}" has a potentially dangerous file type and cannot be uploaded.`;
    }

    return null;
  };

  const uploadFiles = async (filesToUpload: File[]): Promise<UploadedFile[]> => {
    if (!Array.isArray(filesToUpload) || filesToUpload.length === 0) {
      throw new Error('No valid files to upload');
    }

    try {
      if (filesToUpload.length === 1) {
        const file = filesToUpload[0];
        const result = await getUploadMethod(file, accept)(file);
        return Array.isArray(result.data) ? result.data : [result.data];
      } else {
        // For multiple files, upload them one by one
        const uploadPromises = filesToUpload.map(file => getUploadMethod(file, accept)(file));
        const results = await Promise.all(uploadPromises);
        return results.flatMap((result: any) => Array.isArray(result.data) ? result.data : [result.data]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error instanceof Error ? error : new Error('Upload failed');
    }
  };

  // Smart upload method selector based on file type and accept prop
  const getUploadMethod = (file: File, acceptType: string) => {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    
    // PDF files - use PDF API with compression options
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return (file: File) => uploadApi.uploadPdf(file, { 
        compress: true, 
        quality: 'medium' 
      });
    }
    
    // Images - use appropriate API based on accept type and context
    if (fileType.startsWith('image/')) {
      // If accept specifically targets screenshots (contain screenshot, screen, etc.)
      if (acceptType.includes('screenshot') || acceptType.includes('screen')) {
        return uploadApi.uploadScreenshot;
      }
      // Otherwise use general upload
      return (file: File) => uploadApi.uploadFile(file, 'images');
    }
    
    // CSV files
    if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
      return (file: File) => uploadApi.uploadCSV(file, 'general');
    }
    
      // Default: use general file upload
    return (file: File) => uploadApi.uploadFile(file, 'documents');
  };

  // Smart message micro-services
  const getSmartDropMessage = useCallback((variant: typeof dropZoneVariant, fileCount: number) => {
    const fileText = fileCount === 1 ? 'file' : 'files';
    
    switch (variant) {
      case 'images':
        return `Drop your ${fileCount} image ${fileText} here`;
      case 'documents':
        return `Drop your ${fileCount} document ${fileText} here`;
      case 'mixed':
        return `Drop your ${fileCount} ${fileText} here`;
      default:
        return `Drop ${fileCount} ${fileText} here`;
    }
  }, []);

  const getFileTypeMessage = useCallback((variant: typeof dropZoneVariant, fileCount: number) => {
    switch (variant) {
      case 'images':
        return `${fileCount} image${fileCount !== 1 ? 's' : ''} • Will be optimized and compressed`;
      case 'documents':
        return `${fileCount} document${fileCount !== 1 ? 's' : ''} • PDFs will be compressed for better performance`;
      case 'mixed':
        return `${fileCount} file${fileCount !== 1 ? 's' : ''} • Mixed content detected`;
      default:
        return `${fileCount} file${fileCount !== 1 ? 's' : ''} detected`;
    }
  }, []);

  const getAcceptMessage = useCallback((acceptType: string) => {
    if (acceptType === 'image/*') return 'Images only';
    if (acceptType === 'application/pdf') return 'PDF files only';
    if (acceptType.includes('image/') && acceptType.includes('application/pdf')) return 'Images & PDFs';
    if (acceptType === '*/*') return 'Any file type';
    return 'Supported file types';
  }, []);

  const handleFiles = useCallback(async (fileList: File[]) => {
    if (disabled) return;

    setUploadError(null);

    // Filter out invalid files - safe check for File objects
    const validFileList = fileList.filter(file => 
      file && 
      typeof file === 'object' && 
      'name' in file && 
      'size' in file && 
      'type' in file &&
      typeof file.name === 'string' &&
      typeof file.size === 'number' &&
      typeof file.type === 'string'
    );
    
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
      const newFileItems: FileItem[] = uploadedFiles
        .map((uploadedFile, index) => {
          const originalFile = validFileList[index];
          
          // Safety check for uploadedFile
          if (!uploadedFile) {
            console.warn('Invalid uploaded file at index', index);
            return null;
          }
          
          if (useMetadata) {
            // Create enhanced metadata object
            const url = uploadedFile.url || 
                       (uploadedFile.data && uploadedFile.mimeType 
                         ? uploadedFile.mimeType === 'application/pdf'
                           ? createBlobUrl(uploadedFile.data, uploadedFile.mimeType)
                           : uploadedFile.mimeType.startsWith('image/')
                           ? `data:${uploadedFile.mimeType};base64,${uploadedFile.data}`
                           : createBlobUrl(uploadedFile.data, uploadedFile.mimeType)
                         : null);

            if (!url) {
              console.warn('Failed to generate URL for uploaded file at index', index);
              return null;
            }

            // Ensure originalFile exists
            if (!originalFile) {
              console.warn('No matching original file for uploaded file at index', index);
              return null;
            }

            return createFileMetadata({
              ...uploadedFile,
              url,
              size: uploadedFile.size || originalFile.size || 0,
              originalName: uploadedFile.originalName || originalFile.name || 'Unknown file'
            }, originalFile);
          } else {
            // Legacy mode: just return URLs for backwards compatibility
            if (uploadedFile?.url) {
              return uploadedFile.url;
            } else if (uploadedFile?.data && uploadedFile?.mimeType) {
              if (uploadedFile.mimeType === 'application/pdf') {
                return createBlobUrl(uploadedFile.data, uploadedFile.mimeType);
              } else if (uploadedFile.mimeType.startsWith('image/')) {
                return `data:${uploadedFile.mimeType};base64,${uploadedFile.data}`;
              } else {
                return createBlobUrl(uploadedFile.data, uploadedFile.mimeType);
              }
            }
            return null;
          }
        })
        .filter((item): item is FileItem => item !== null);
      
      if (newFileItems.length > 0) {
        onFilesChange([...validFiles, ...newFileItems]);
      } else {
        setUploadError('No valid files returned from upload');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [validFiles, maxFiles, maxSize, accept, disabled, onFilesChange, useMetadata, createBlobUrl]);

  // Enhanced drag & drop state management
  const [draggedFileTypes, setDraggedFileTypes] = useState<string[]>([]);
  const [dropZoneVariant, setDropZoneVariant] = useState<'default' | 'images' | 'documents' | 'mixed'>('default');

  // Micro-service: Analyze dragged files and provide smart feedback
  const analyzeDraggedFiles = useCallback((dataTransfer: DataTransfer | null) => {
    if (!dataTransfer?.items) return [];

    const fileTypes: string[] = [];
    const items = Array.from(dataTransfer.items);

    items.forEach(item => {
      if (item.kind === 'file') {
        fileTypes.push(item.type || 'unknown');
      }
    });

    return fileTypes;
  }, []);

  // Micro-service: Determine optimal drop zone variant
  const getDropZoneVariant = useCallback((fileTypes: string[]) => {
    if (fileTypes.length === 0) return 'default';
    
    const imageTypes = fileTypes.filter(type => type.startsWith('image/'));
    const docTypes = fileTypes.filter(type => 
      type === 'application/pdf' || 
      type.includes('document') || 
      type.includes('text')
    );

    if (imageTypes.length === fileTypes.length) return 'images';
    if (docTypes.length === fileTypes.length) return 'documents';
    if (fileTypes.length > 1) return 'mixed';
    return 'default';
  }, []);

  // Enhanced drag enter with micro-services
  const handleDragEnter = useCallback((e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    // Only analyze on first enter to avoid performance issues
    if (!isDragOver) {
      const fileTypes = analyzeDraggedFiles(e.dataTransfer);
      setDraggedFileTypes(fileTypes);
      setDropZoneVariant(getDropZoneVariant(fileTypes));
      setIsDragOver(true);
    }
  }, [disabled, isDragOver, analyzeDraggedFiles, getDropZoneVariant]);

  // Enhanced drag leave with debounce to prevent flicker
  const handleDragLeave = useCallback((e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Use a small delay to prevent flicker when moving between child elements
    setTimeout(() => {
      const elementAtPoint = document.elementFromPoint(e.clientX, e.clientY);
      if (!elementAtPoint || !e.currentTarget.contains(elementAtPoint)) {
        setIsDragOver(false);
        setDraggedFileTypes([]);
        setDropZoneVariant('default');
      }
    }, 50);
  }, []);

  // Enhanced drag over with file validation preview
  const handleDragOver = useCallback((e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // Provide visual feedback based on file types
    const isValidDrop = draggedFileTypes.every(fileType => {
      if (accept === '*/*') return true;
      if (accept.includes('*')) {
        const baseAccept = accept.split('/')[0];
        return fileType.startsWith(baseAccept);
      }
      return accept.includes(fileType);
    });

    // Update cursor and drag effect
    e.dataTransfer.dropEffect = isValidDrop ? 'copy' : 'none';
  }, [draggedFileTypes, accept]);

  // Enhanced drop with progress tracking
  const handleDrop = useCallback((e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Reset drag state
    setIsDragOver(false);
    setDraggedFileTypes([]);
    setDropZoneVariant('default');

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer?.files || []);
    
    // Micro-service: Smart file processing
    if (droppedFiles.length > 0) {
      // Add visual feedback for successful drop
      const dropZone = e.currentTarget;
      dropZone.classList.add('animate-pulse');
      setTimeout(() => {
        dropZone.classList.remove('animate-pulse');
      }, 300);
      
      handleFiles(droppedFiles);
    }
  }, [handleFiles, disabled]);

  const handleFileInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files) as File[];
      handleFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFiles]);

  const removeFile = async (fileToRemove: FileItem) => {
    if (disabled) return;

    const fileUrl = getFileUrl(fileToRemove);
    if (!fileUrl) return;

    try {
      // Check if it's a data URL (base64 encoded image)
      if (fileUrl.startsWith('data:')) {
        // For data URLs, we don't need to call the backend API
        console.log('Removing data URL file from state');
      } else if (fileUrl.includes('/')) {
        // For regular file URLs, attempt to delete from server
        const filename = fileUrl.split('/').pop();
        if (filename && filename.trim().length > 0) {
          await uploadApi.deleteFile(filename);
        }
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      // Continue with removal from state even if API deletion fails
    }

    const newFiles = validFiles.filter(file => getFileUrl(file) !== fileUrl);
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

  // Enhanced Image preview component for individual files
  const EnhancedImagePreview = React.memo(({
    file,
    onRemove,
    screenshotData
  }: {
    file: FileItem;
    onRemove: () => void;
    screenshotData?: {data: string; mimeType: string; filename: string};
  }) => {
    const fileUrl = getFileUrl(file);
    const fileName = getFileName(file);
    const fileSize = getFileSize(file);
    const metadata = getFileMetadata(file);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showLightbox, setShowLightbox] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Use screenshotData if available, otherwise use fileUrl
    const imageUrl = screenshotData
      ? `data:${screenshotData.mimeType};base64,${screenshotData.data}`
      : fileUrl;

    const displayName = screenshotData?.filename || fileName;

    // Memoized handlers for better performance
    const handleImageLoad = useCallback(() => setImageLoaded(true), []);
    const handleImageError = useCallback(() => setImageError(true), []);
    const handleShowLightbox = useCallback(() => setShowLightbox(true), []);
    const handleHideLightbox = useCallback(() => setShowLightbox(false), []);
    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);

    // Handle keyboard navigation for accessibility
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleShowLightbox();
      }
    }, [handleShowLightbox]);

    const handleLightboxKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleHideLightbox();
      }
    }, [handleHideLightbox]);

    // Error state
    if (!imageUrl || imageError) {
      return (
        <div className="relative group animate-in fade-in-50 duration-300">
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
              className="absolute -top-2 -right-2 p-1 h-auto bg-red-500 text-white hover:bg-red-600 rounded-full shadow-lg"
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
      <div 
        className="relative group animate-in fade-in-50 duration-300"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={cn(
            "aspect-video bg-muted rounded-lg overflow-hidden border transition-all duration-300",
            "cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-accent-pink/50",
            isHovered 
              ? "border-accent-pink/60 shadow-lg transform scale-[1.02]" 
              : "border-border/40 hover:border-accent-pink/40"
          )}
          onClick={handleShowLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="button"
          aria-label={`Preview ${displayName}`}
        >
          <img
            src={imageUrl}
            alt={displayName}
            className={cn(
              'w-full h-full object-cover transition-all duration-500',
              imageLoaded ? 'opacity-100' : 'opacity-0',
              isHovered ? 'scale-110' : 'scale-100'
            )}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
            decoding="async"
          />

          {/* Loading state */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-muted">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
          )}

          {/* Hover overlay with enhanced effects */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-all duration-300 flex items-center justify-center",
            isHovered ? "opacity-100" : "opacity-0"
          )}>
            <div className="text-center text-white space-y-2">
              <ZoomIn className="w-8 h-8 mx-auto transform transition-transform duration-300 scale-100 hover:scale-110" />
              <p className="text-sm font-medium">Click to preview</p>
            </div>
          </div>

          {/* File info overlay */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent transition-all duration-300",
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          )}>
            <p className="text-xs text-white font-medium truncate">{displayName}</p>
          </div>
        </div>

        {/* Enhanced remove button */}
        {!disabled && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className={cn(
              "absolute -top-2 -right-2 p-1.5 h-auto bg-red-500 text-white hover:bg-red-600 rounded-full shadow-lg transition-all duration-300",
              isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75"
            )}
            aria-label="Remove file"
          >
            <X className="w-3 h-3" />
          </Button>
        )}

        {/* Drag handle for reordering */}
        {enableReorder && !disabled && (
          <div className={cn(
            "absolute top-2 left-2 p-1.5 bg-black/70 text-white rounded-lg cursor-move transition-all duration-300 backdrop-blur-sm",
            isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75"
          )}>
            <Move className="w-3 h-3" />
          </div>
        )}

        <div className="mt-2 space-y-1">
          <p className="text-xs font-medium text-foreground truncate">{displayName}</p>
          {fileSize > 0 && (
            <p className="text-xs text-accent-purple font-medium">
              {formatFileSize(fileSize)}
            </p>
          )}
          {metadata?.mimeType && (
            <p className="text-xs text-muted-foreground/70">
              {metadata.mimeType}
            </p>
          )}
        </div>

        {/* Enhanced lightbox with animations */}
        {showLightbox && (
          <div
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in-0 duration-300"
            onClick={handleHideLightbox}
            onKeyDown={handleLightboxKeyDown}
            tabIndex={0}
            role="dialog"
            aria-modal="true"
            aria-label="Image preview"
          >
            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 transition-all duration-200"
              onClick={handleHideLightbox}
              aria-label="Close preview"
            >
              <X className="w-6 h-6" />
            </Button>
            
            {/* Image container */}
            <div className="relative max-w-full max-h-full animate-in zoom-in-95 duration-300">
              <img
                src={imageUrl}
                alt={displayName}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
              
              {/* Image info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                <p className="text-white text-sm font-medium">{displayName}</p>
                <p className="text-white/70 text-xs">Click outside to close</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  });

  // Remove unused renderFileItem function since it's not being used
  // The component renders files directly in the JSX

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

      {/* Enhanced Drop Zone with Smart Feedback */}
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-6 transition-all duration-300",
          "hover:border-accent-pink/50 focus-within:border-accent-pink",
          // Smart drop zone styling based on dragged content
          isDragOver && !disabled 
            ? dropZoneVariant === 'images'
              ? "border-accent-cyan bg-accent-cyan/10 scale-[1.02] shadow-lg shadow-accent-cyan/20"
              : dropZoneVariant === 'documents' 
              ? "border-accent-purple bg-accent-purple/10 scale-[1.02] shadow-lg shadow-accent-purple/20"
              : dropZoneVariant === 'mixed'
              ? "border-accent-gold bg-accent-gold/10 scale-[1.02] shadow-lg shadow-accent-gold/20"
              : "border-accent-pink bg-accent-pink/5 scale-[1.02] shadow-lg shadow-accent-pink/20"
            : "border-border/30",
          disabled ? "opacity-50 cursor-not-allowed bg-muted/30" : undefined,
          !disabled ? "cursor-pointer bg-background/50 hover:bg-muted/10" : undefined,
          // Add breathing animation when dragging
          isDragOver && !disabled ? "animate-pulse" : undefined
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
          {/* Smart Icon Display */}
          <div className={cn(
            "mx-auto w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
            isDragOver && !disabled
              ? dropZoneVariant === 'images'
                ? "bg-accent-cyan/20 text-accent-cyan scale-110"
                : dropZoneVariant === 'documents'
                ? "bg-accent-purple/20 text-accent-purple scale-110"
                : dropZoneVariant === 'mixed'
                ? "bg-accent-gold/20 text-accent-gold scale-110"
                : "bg-accent-pink/20 text-accent-pink scale-110"
              : "bg-muted text-muted-foreground"
          )}>
            {isDragOver && !disabled ? (
              dropZoneVariant === 'images' ? (
                <ImageIcon className="w-6 h-6" />
              ) : dropZoneVariant === 'documents' ? (
                <File className="w-6 h-6" />
              ) : (
                <Upload className="w-6 h-6" />
              )
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>

          {/* Smart Messages */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              {isDragOver && !disabled
                ? getSmartDropMessage(dropZoneVariant, draggedFileTypes.length)
                : isUploading
                ? "Uploading..."
                : "Drop files here or click to browse"
              }
            </p>
            
            {/* Enhanced file type hints */}
            <p className="text-xs text-muted-foreground">
              {isDragOver && !disabled && draggedFileTypes.length > 0 
                ? getFileTypeMessage(dropZoneVariant, draggedFileTypes.length)
                : `${getAcceptMessage(accept)} • Max ${formatFileSize(maxSize)} per file • Up to ${maxFiles} files`
              }
            </p>

            {/* File count indicator when dragging */}
            {isDragOver && !disabled && draggedFileTypes.length > 0 && (
              <div className="flex items-center justify-center gap-2 mt-3">
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                  dropZoneVariant === 'images'
                    ? "bg-accent-cyan/20 text-accent-cyan"
                    : dropZoneVariant === 'documents'
                    ? "bg-accent-purple/20 text-accent-purple"
                    : dropZoneVariant === 'mixed'
                    ? "bg-accent-gold/20 text-accent-gold"
                    : "bg-accent-pink/20 text-accent-pink"
                )}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                  {draggedFileTypes.length} file{draggedFileTypes.length !== 1 ? 's' : ''} ready
                </div>
              </div>
            )}
          </div>

          {!disabled && !isDragOver && (
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

      {/* Enhanced Error Display */}
      {uploadError && (
        <div className="flex items-start gap-3 p-4 bg-red-50/80 border border-red-200 rounded-lg animate-in slide-in-from-top-2 duration-300 backdrop-blur-sm">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="text-sm font-medium text-red-800">Upload Error</div>
            <div className="text-sm text-red-700">{uploadError}</div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setUploadError(null)}
              className="h-auto p-0 text-red-600 hover:text-red-800 text-xs font-medium"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Uploaded Files List */}
      {validFiles.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-foreground">
            Uploaded Files ({validFiles.length}/{maxFiles})
          </p>

          {showPreview && accept === 'image/*' ? (
            // Image preview grid
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {validFiles.map((file, index) => {
                const fileUrl = getFileUrl(file);
                
                // Additional safety check
                if (!fileUrl) {
                  return null;
                }

                // Find corresponding screenshot data if available
                const screenshotData = screenshotsData?.[index];

                return (
                  <EnhancedImagePreview
                    key={`${fileUrl}-${index}`}
                    file={file}
                    onRemove={() => removeFile(file)}
                    screenshotData={screenshotData}
                  />
                );
              })}
            </div>
          ) : (
            // Traditional file list with enhanced info
            <div className="space-y-2">
              {validFiles.map((file, index) => {
                const fileUrl = getFileUrl(file);
                const fileName = getFileName(file);
                const fileSize = getFileSize(file);
                const metadata = getFileMetadata(file);
                
                if (!fileUrl) {
                  return null;
                }

                return (
                  <div
                    key={`${fileUrl}-${index}`}
                    className="flex items-center gap-3 p-3 bg-background/50 border border-border rounded-lg"
                  >
                    <ImageIcon className="w-4 h-4 text-accent-pink shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {fileName}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {fileSize > 0 && (
                          <span className="font-medium text-accent-purple">
                            {formatFileSize(fileSize)}
                          </span>
                        )}
                        {metadata?.mimeType && (
                          <span className="text-muted-foreground/70">
                            {metadata.mimeType}
                          </span>
                        )}
                        {metadata?.uploadDate && (
                          <span className="text-muted-foreground/50">
                            {metadata.uploadDate.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {!disabled && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file);
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
          )}
        </div>
      )}

      {/* Enhanced Upload Progress */}
      {isUploading && (
        <div className="flex items-center gap-3 p-4 bg-blue-50/80 border border-blue-200 rounded-lg animate-in slide-in-from-bottom-2 duration-300 backdrop-blur-sm">
          <div className="relative">
            <div className="w-5 h-5 border-2 border-blue-500/30 rounded-full"></div>
            <div className="absolute inset-0 w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-blue-800">Uploading files...</div>
            <div className="text-xs text-blue-600 mt-1">Please wait while we process your files</div>
          </div>
          <div className="w-16 h-2 bg-blue-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
}; 