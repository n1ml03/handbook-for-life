import React from 'react';
import { AlertCircle, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/services/utils';
import { Button } from '../button';
import { useFileUpload } from '@/hooks/useFileUpload';
import { DropZone } from './DropZone';
import { FilePreview } from './FilePreview';
import { FileUploadProps } from './types';

export const FileUpload: React.FC<FileUploadProps> = ({
  files: externalFiles = [],
  onFilesChange,
  maxFiles = 10,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024,
  label,
  description,
  className,
  disabled = false,
  showPreview = true,
  enableReorder = false,
  screenshotsData = []
}) => {
  const {
    files,
    isUploading,
    uploadError,
    uploadFiles,
    removeFile,
    clearError,
    setFiles
  } = useFileUpload({
    maxFiles,
    accept,
    maxSize,
    onFilesChange
  });

  // Sync internal files with external files
  React.useEffect(() => {
    if (JSON.stringify(files) !== JSON.stringify(externalFiles)) {
      setFiles(externalFiles);
    }
  }, [externalFiles, files, setFiles]);

  // Ensure files is always a valid array of strings
  const validFiles = React.useMemo(() => {
    if (!Array.isArray(files)) {
      return [];
    }
    return files.filter((file): file is string => 
      typeof file === 'string' && file.trim().length > 0
    );
  }, [files]);

  const renderFileList = () => {
    if (validFiles.length === 0) return null;

    return (
      <div className="space-y-4">
        <p className="text-sm font-medium text-foreground">
          Uploaded Files ({validFiles.length}/{maxFiles})
        </p>

        {showPreview && accept === 'image/*' ? (
          // Image preview grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {validFiles.map((fileUrl, index) => {
              // Additional safety check for each file URL
              if (!fileUrl || typeof fileUrl !== 'string') {
                return null;
              }

              // Find corresponding screenshot data if available
              const screenshotData = screenshotsData?.[index];

              return (
                <FilePreview
                  key={`${fileUrl}-${index}`}
                  fileUrl={fileUrl}
                  index={index}
                  onRemove={() => removeFile(fileUrl)}
                  screenshotData={screenshotData}
                  disabled={disabled}
                  enableReorder={enableReorder}
                />
              );
            })}
          </div>
        ) : (
          // Traditional file list
          <div className="space-y-2">
            {validFiles.map((fileUrl, index) => {
              // Additional safety check for each file URL
              if (!fileUrl || typeof fileUrl !== 'string') {
                return null;
              }

              const getFileDisplayName = (url: string): string => {
                if (!url || typeof url !== 'string') return 'Unknown file';
                try {
                  const trimmedUrl = url.trim();
                  if (trimmedUrl.length === 0) return 'Unknown file';
                  const filename = trimmedUrl.includes('/') ? trimmedUrl.split('/').pop() || trimmedUrl : trimmedUrl;
                  const match = filename.match(/^(.+)-\d+-\d+(\.[^.]+)$/);
                  return match ? `${match[1]}${match[2]}` : filename;
                } catch {
                  return 'Unknown file';
                }
              };

              return (
                <div
                  key={`${fileUrl}-${index}`}
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
        )}
      </div>
    );
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
      <DropZone
        onDrop={uploadFiles}
        disabled={disabled}
        accept={accept}
        maxFiles={maxFiles}
        maxSize={maxSize}
        isUploading={isUploading}
      />

      {/* Error Display */}
      {uploadError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm text-red-700">{uploadError}</div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="mt-2 h-auto p-0 text-red-600 hover:text-red-800"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Uploaded Files List */}
      {renderFileList()}

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
