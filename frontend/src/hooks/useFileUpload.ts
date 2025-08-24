import { useState, useCallback, useRef } from 'react';
import { uploadApi } from '@/services/api';

export interface UploadedFile {
  filename: string;
  originalName: string;
  size: number;
  url: string;
  mimeType: string;
}

export interface UseFileUploadOptions {
  maxFiles?: number;
  accept?: string;
  maxSize?: number;
  onFilesChange?: (files: string[]) => void;
}

export interface UseFileUploadReturn {
  files: string[];
  isUploading: boolean;
  uploadError: string | null;
  uploadFiles: (filesToUpload: File[]) => Promise<void>;
  removeFile: (fileUrl: string) => Promise<void>;
  clearError: () => void;
  setFiles: (files: string[]) => void;
}

export const useFileUpload = ({
  maxFiles = 10,
  accept = 'image/*',
  maxSize = 10 * 1024 * 1024,
  onFilesChange
}: UseFileUploadOptions): UseFileUploadReturn => {
  const [files, setFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const validateFile = useCallback((file: File): string | null => {
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
  }, [accept, maxSize, formatFileSize]);

  const uploadFilesToServer = useCallback(async (filesToUpload: File[]): Promise<UploadedFile[]> => {
    if (!Array.isArray(filesToUpload) || filesToUpload.length === 0) {
      throw new Error('No valid files to upload');
    }

    try {
      if (filesToUpload.length === 1) {
        const result = await uploadApi.uploadScreenshot(filesToUpload[0]);
        return Array.isArray(result.data) ? result.data : [result.data];
      } else {
        // Upload files in parallel for better performance
        const uploadPromises = filesToUpload.map(file => uploadApi.uploadScreenshot(file));
        const results = await Promise.all(uploadPromises);
        return results.flatMap((result: any) => Array.isArray(result.data) ? result.data : [result.data]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      throw error instanceof Error ? error : new Error('Upload failed');
    }
  }, []);

  const uploadFiles = useCallback(async (filesToUpload: File[]): Promise<void> => {
    setUploadError(null);

    // Filter out invalid files
    const validFileList = filesToUpload.filter(file => file instanceof File);
    
    if (validFileList.length === 0) {
      setUploadError('No valid files selected');
      return;
    }

    // Validate file count
    if (files.length + validFileList.length > maxFiles) {
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
      const uploadedFiles = await uploadFilesToServer(validFileList);
      const newFileUrls = uploadedFiles
        .map(file => file?.url)
        .filter((url): url is string => typeof url === 'string' && url.trim().length > 0);
      
      if (newFileUrls.length > 0) {
        const updatedFiles = [...files, ...newFileUrls];
        setFiles(updatedFiles);
        onFilesChange?.(updatedFiles);
      } else {
        setUploadError('No valid file URLs returned from upload');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [files, maxFiles, validateFile, uploadFilesToServer, onFilesChange]);

  const removeFile = useCallback(async (fileUrl: string): Promise<void> => {
    if (!fileUrl || typeof fileUrl !== 'string') return;

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

    const updatedFiles = files.filter(file => file !== fileUrl);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  }, [files, onFilesChange]);

  const clearError = useCallback(() => {
    setUploadError(null);
  }, []);

  const setFilesHandler = useCallback((newFiles: string[]) => {
    setFiles(newFiles);
    onFilesChange?.(newFiles);
  }, [onFilesChange]);

  return {
    files,
    isUploading,
    uploadError,
    uploadFiles,
    removeFile,
    clearError,
    setFiles: setFilesHandler
  };
};
