export interface UploadedFile {
  filename: string;
  originalName: string;
  size: number;
  url: string;
  mimeType: string;
}

export interface FileUploadProps {
  files: string[];
  onFilesChange: (files: string[]) => void;
  maxFiles?: number;
  accept?: string;
  maxSize?: number;
  label?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  enableReorder?: boolean;
  screenshotsData?: Array<{
    data: string;
    mimeType: string;
    filename: string;
  }>;
}

export interface FilePreviewProps {
  fileUrl: string;
  index: number;
  onRemove: () => void;
  screenshotData?: {
    data: string;
    mimeType: string;
    filename: string;
  };
  disabled?: boolean;
  enableReorder?: boolean;
}

export interface DropZoneProps {
  onDrop: (files: File[]) => void;
  disabled?: boolean;
  accept?: string;
  maxFiles: number;
  maxSize: number;
  isUploading: boolean;
  children?: React.ReactNode;
  className?: string;
}
