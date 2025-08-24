import { uploadApi } from './api';

export interface UploadOptions {
  compress?: boolean;
  quality?: 'low' | 'medium' | 'high';
}

export interface UploadResult {
  filename: string;
  originalName: string;
  size: number;
  url: string;
  mimeType: string;
}

export class UploadService {
  private static instance: UploadService;
  private uploadQueue: Map<string, Promise<any>> = new Map();
  private maxConcurrentUploads = 3;
  private currentUploads = 0;

  static getInstance(): UploadService {
    if (!UploadService.instance) {
      UploadService.instance = new UploadService();
    }
    return UploadService.instance;
  }

  private async enqueueUpload<T>(key: string, uploadFn: () => Promise<T>): Promise<T> {
    // Check if the same upload is already in progress
    if (this.uploadQueue.has(key)) {
      return this.uploadQueue.get(key);
    }

    const uploadPromise = this.executeUpload(uploadFn);
    this.uploadQueue.set(key, uploadPromise);

    try {
      const result = await uploadPromise;
      return result;
    } finally {
      this.uploadQueue.delete(key);
    }
  }

  private async executeUpload<T>(uploadFn: () => Promise<T>): Promise<T> {
    // Wait if we've reached max concurrent uploads
    while (this.currentUploads >= this.maxConcurrentUploads) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.currentUploads++;
    try {
      return await uploadFn();
    } finally {
      this.currentUploads--;
    }
  }

  async uploadScreenshots(files: File[]): Promise<UploadResult[]> {
    if (!files.length) return [];

    // Create a unique key for this batch upload
    const batchKey = `screenshots_${files.map(f => `${f.name}_${f.size}`).join('_')}`;

    return this.enqueueUpload(batchKey, async () => {
      const uploadPromises = files.map(file => this.uploadSingleScreenshot(file));
      const results = await Promise.allSettled(uploadPromises);

      const successfulUploads: UploadResult[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulUploads.push(result.value);
        } else {
          errors.push(`${files[index].name}: ${result.reason.message}`);
        }
      });

      if (errors.length > 0 && successfulUploads.length === 0) {
        throw new Error(`All uploads failed: ${errors.join(', ')}`);
      }

      return successfulUploads;
    });
  }

  async uploadSingleScreenshot(file: File): Promise<UploadResult> {
    const fileKey = `screenshot_${file.name}_${file.size}_${file.lastModified}`;
    
    return this.enqueueUpload(fileKey, async () => {
      const result = await uploadApi.uploadScreenshot(file);
      return Array.isArray(result.data) ? result.data[0] : result.data;
    });
  }

  async uploadPdf(file: File, options?: UploadOptions): Promise<UploadResult> {
    const fileKey = `pdf_${file.name}_${file.size}_${file.lastModified}`;
    
    return this.enqueueUpload(fileKey, async () => {
      const result = await uploadApi.uploadPdf(file, options);
      return result.data;
    });
  }

  async analyzePdf(file: File): Promise<any> {
    const fileKey = `analyze_${file.name}_${file.size}_${file.lastModified}`;
    
    return this.enqueueUpload(fileKey, async () => {
      const result = await uploadApi.analyzePdf(file);
      return result.data;
    });
  }

  async uploadMultipleFiles(files: File[], category?: string): Promise<UploadResult[]> {
    if (!files.length) return [];

    const batchKey = `multiple_${category || 'default'}_${files.map(f => `${f.name}_${f.size}`).join('_')}`;

    return this.enqueueUpload(batchKey, async () => {
      const result = await uploadApi.uploadMultipleFiles(files, category);
      return Array.isArray(result.data) ? result.data : [result.data];
    });
  }

  async deleteFile(filename: string): Promise<void> {
    return uploadApi.deleteFile(filename);
  }

  // Utility methods
  validateFile(file: File, options: {
    maxSize?: number;
    allowedTypes?: string[];
  } = {}): { isValid: boolean; error?: string } {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    } = options;

    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }

    if (file.size > maxSize) {
      const sizeMB = (maxSize / 1024 / 1024).toFixed(1);
      return { isValid: false, error: `File size must be less than ${sizeMB}MB` };
    }

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return { isValid: false, error: `File type ${file.type} is not allowed` };
    }

    return { isValid: true };
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get upload queue status
  getQueueStatus() {
    return {
      queueSize: this.uploadQueue.size,
      currentUploads: this.currentUploads,
      maxConcurrent: this.maxConcurrentUploads
    };
  }

  // Clear completed uploads from queue (cleanup method)
  clearQueue() {
    this.uploadQueue.clear();
  }
}

// Export singleton instance
export const uploadService = UploadService.getInstance();
