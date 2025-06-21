import React, { useState, useCallback, useMemo } from 'react';
import { 
  Download, 
  Upload, 
  FileDown, 
  FileUp, 
  FileSpreadsheet, 
  Settings2, 
  X, 
  CheckCircle2,
  BookOpen,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LoadingOverlay, DownloadButton } from '@/components/ui/loading';
import { Card } from '@/components/ui/card';
import { FormGroup } from '@/components/ui/spacing';
import { cn } from '@/services/utils';
import { Document } from '@/types';
import { UpdateLog } from '@/types';
import { CSVPreviewModal, type CSVPreviewData, type CSVValidationError, type ColumnMapping } from './CSVPreviewModal';
import { NotificationToast, type NotificationState } from './NotificationToast';

interface ExportOptions {
  format: 'csv' | 'excel' | 'json';
  selectedColumns: string[];
  filters: {
    dateRange?: { start: string; end: string };
    categories?: string[];
    status?: string[];
    searchText?: string;
  };
  includeHeaders: boolean;
  customFilename?: string;
}

interface ImportProgress {
  stage: 'uploading' | 'parsing' | 'validating' | 'importing' | 'complete';
  progress: number;
  processedRows: number;
  totalRows: number;
  errors: number;
  message: string;
}

interface CSVManagementProps {
  documents: Document[];
  updateLogs: UpdateLog[];
  onAddDocument: (document: Document) => void;
  onAddUpdateLog: (log: UpdateLog) => Promise<void>;
}

export const CSVManagement: React.FC<CSVManagementProps> = ({
  documents,
  updateLogs,
  onAddDocument,
  onAddUpdateLog
}) => {
  // State
  const [csvData, setCsvData] = useState<string>('');
  const [csvImportType, setCsvImportType] = useState<'documents' | 'update-logs'>('documents');
  const [importPage, setImportPage] = useState<string>('all');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [csvPreview, setCsvPreview] = useState<CSVPreviewData | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    selectedColumns: [],
    filters: {},
    includeHeaders: true
  });
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [notifications, setNotifications] = useState<NotificationState[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Available pages for import
  const availablePages = useMemo(() => ([
    { id: 'accessory', name: 'Accessory' },
    { id: 'decoratebromide', name: 'Decorate Bromide' },
    { id: 'event', name: 'Event' },
    { id: 'festival', name: 'Festival' },
    { id: 'gacha', name: 'Gacha' },
    { id: 'girllist', name: 'Girl List' },
    { id: 'memories', name: 'Memories' },
    { id: 'ownerroom', name: 'Owner Room' },
    { id: 'shop', name: 'Shop' },
    { id: 'skill', name: 'Skill' }
  ]), []);

  // Field mappings for different data types
  const documentFields: ColumnMapping[] = [
    { csvColumn: '', dbField: 'title', isRequired: true, dataType: 'string' },
    { csvColumn: '', dbField: 'content', isRequired: true, dataType: 'string' },
    { csvColumn: '', dbField: 'category', isRequired: true, dataType: 'string' },
    { csvColumn: '', dbField: 'tags', isRequired: false, dataType: 'array' },
    { csvColumn: '', dbField: 'author', isRequired: false, dataType: 'string' },
    { csvColumn: '', dbField: 'isPublished', isRequired: false, dataType: 'boolean' },
    { csvColumn: '', dbField: 'createdAt', isRequired: false, dataType: 'date' },
    { csvColumn: '', dbField: 'updatedAt', isRequired: false, dataType: 'date' }
  ];

  const updateLogFields: ColumnMapping[] = [
    { csvColumn: '', dbField: 'version', isRequired: true, dataType: 'string' },
    { csvColumn: '', dbField: 'title', isRequired: true, dataType: 'string' },
    { csvColumn: '', dbField: 'description', isRequired: false, dataType: 'string' },
    { csvColumn: '', dbField: 'content', isRequired: true, dataType: 'string' },
    { csvColumn: '', dbField: 'date', isRequired: true, dataType: 'date' },
    { csvColumn: '', dbField: 'tags', isRequired: false, dataType: 'array' },
    { csvColumn: '', dbField: 'isPublished', isRequired: false, dataType: 'boolean' }
  ];

  // Notification system
  const addNotification = useCallback((notification: Omit<NotificationState, 'id' | 'timestamp'>) => {
    const newNotification: NotificationState = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      timestamp: Date.now(),
      duration: notification.duration || 5000
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);

    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, newNotification.duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Export functionality
  const exportToCSV = useCallback((data: any[], filename: string, selectedColumns?: string[]) => {
    if (data.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Data to Export',
        message: 'There is no data available to export'
      });
      return;
    }

    const allHeaders = Object.keys(data[0]);
    const headers = selectedColumns && selectedColumns.length > 0 ? selectedColumns : allHeaders;

    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          if (Array.isArray(value)) {
            return `"${value.join('; ')}"`;
          }
          if (typeof value === 'object' && value !== null) {
            return `"${JSON.stringify(value)}"`;
          }
          const stringValue = String(value || '');
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addNotification({
      type: 'success',
      title: 'Export Successful',
      message: `Exported ${data.length} records to ${filename}`
    });
  }, [addNotification]);

  // CSV parsing with validation
  const parseCSVData = useCallback((csvText: string): CSVPreviewData => {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows: any[][] = [];
    const errors: CSVValidationError[] = [];
    let validRows = 0;

    for (let lineIndex = 1; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      if (!line.trim()) continue;

      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      try {
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              current += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim());

        if (values.length !== headers.length) {
          errors.push({
            row: lineIndex,
            column: 'general',
            message: `Expected ${headers.length} columns, found ${values.length}`,
            severity: 'warning'
          });
        }

        rows.push(values);
        validRows++;
      } catch (error) {
        errors.push({
          row: lineIndex,
          column: 'general',
          message: `Failed to parse row: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'error'
        });
      }
    }

    return {
      headers,
      rows,
      totalRows: rows.length,
      validRows,
      invalidRows: rows.length - validRows,
      errors
    };
  }, []);

  // File processing
  const processFileForPreview = useCallback(async (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      addNotification({
        type: 'error',
        title: 'Invalid File Type',
        message: 'Please select a CSV file'
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addNotification({
        type: 'error',
        title: 'File Too Large',
        message: 'File size must be less than 10MB'
      });
      return;
    }

    setUploadedFile(file);
    setIsProcessingFile(true);

    try {
      const text = await file.text();
      setCsvData(text);

      const preview = parseCSVData(text);
      setCsvPreview(preview);

      const fields = csvImportType === 'documents' ? documentFields : updateLogFields;
      const mappings = fields.map(field => ({
        ...field,
        csvColumn: preview.headers.find(h =>
          h.toLowerCase().includes(field.dbField.toLowerCase()) ||
          field.dbField.toLowerCase().includes(h.toLowerCase())
        ) || ''
      }));
      setColumnMappings(mappings);

      setIsProcessingFile(false);
      setShowPreviewModal(true);

      addNotification({
        type: 'success',
        title: 'File Processed',
        message: `Found ${preview.totalRows} rows with ${preview.headers.length} columns`
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'File Processing Error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      setIsProcessingFile(false);
    }
  }, [csvImportType, documentFields, updateLogFields, parseCSVData, addNotification]);

  // Import functionality
  const handleImportCSV = useCallback(async () => {
    if (!csvPreview || !columnMappings.length) return;

    setImportProgress({
      stage: 'importing',
      progress: 0,
      processedRows: 0,
      totalRows: csvPreview.totalRows,
      errors: 0,
      message: 'Starting import...'
    });

    try {
      const mappedData = csvPreview.rows.map((row) => {
        const obj: any = {};
        columnMappings.forEach(mapping => {
          if (mapping.csvColumn) {
            const columnIndex = csvPreview.headers.indexOf(mapping.csvColumn);
            if (columnIndex >= 0) {
              const value = row[columnIndex];

              switch (mapping.dataType) {
                case 'boolean':
                  obj[mapping.dbField] = ['true', '1', 'yes'].includes(value?.toLowerCase() || '');
                  break;
                case 'number':
                  obj[mapping.dbField] = value ? Number(value) : 0;
                  break;
                case 'array':
                  obj[mapping.dbField] = value ? value.split(';').map((v: string) => v.trim()).filter(Boolean) : [];
                  break;
                case 'date':
                  obj[mapping.dbField] = value ? new Date(value).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
                  break;
                default:
                  obj[mapping.dbField] = value || '';
              }
            }
          }
        });
        return obj;
      });

      let successCount = 0;
      let errorCount = 0;

      if (csvImportType === 'documents') {
        for (let i = 0; i < mappedData.length; i++) {
          const doc = mappedData[i];
          try {
            if (!doc.id) doc.id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
            if (!doc.createdAt) doc.createdAt = new Date().toISOString().split('T')[0];
            if (!doc.updatedAt) doc.updatedAt = new Date().toISOString().split('T')[0];
            if (!doc.author) doc.author = 'Admin';
            if (doc.isPublished === undefined) doc.isPublished = false;

            if (importPage !== 'all' && !doc.category) {
              doc.category = importPage;
            }

            onAddDocument(doc as Document);
            successCount++;
          } catch (error) {
            errorCount++;
          }
        }
      } else {
        for (let i = 0; i < mappedData.length; i++) {
          const log = mappedData[i];
          try {
            if (!log.id) log.id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
            if (!log.version) log.version = 'v1.0.0';
            if (!log.title) log.title = 'Untitled Update';
            if (!log.content) log.content = '';
            if (!log.date) log.date = new Date().toISOString().split('T')[0];
            if (log.isPublished === undefined) log.isPublished = false;
            if (!log.tags) log.tags = [];
            if (!log.technicalDetails) log.technicalDetails = [];
            if (!log.bugFixes) log.bugFixes = [];
            if (!log.screenshots) log.screenshots = [];
            if (!log.metrics) log.metrics = {
              performanceImprovement: '0%',
              userSatisfaction: '0%',
              bugReports: 0
            };

            await onAddUpdateLog(log);
            successCount++;
          } catch (error) {
            errorCount++;
          }
        }
      }

      setImportProgress({
        stage: 'complete',
        progress: 100,
        processedRows: mappedData.length,
        totalRows: mappedData.length,
        errors: errorCount,
        message: 'Import completed!'
      });

      const pageText = importPage !== 'all' ? ` to ${availablePages.find(page => page.id === importPage)?.name || importPage} page` : '';
      addNotification({
        type: 'success',
        title: 'Import Successful',
        message: `Imported ${successCount} ${csvImportType}${pageText}${errorCount > 0 ? ` (${errorCount} errors)` : ''}`
      });

      // Clear data
      setCsvData('');
      setUploadedFile(null);
      setCsvPreview(null);
      setShowPreviewModal(false);
      setColumnMappings([]);

      setTimeout(() => setImportProgress(null), 3000);
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Import Failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      setImportProgress(null);
    }
  }, [csvPreview, columnMappings, csvImportType, importPage, availablePages, onAddDocument, onAddUpdateLog, addNotification]);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFileForPreview(files[0]);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await processFileForPreview(file);
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-40 space-y-2 max-w-md">
          {notifications.map(notification => (
            <NotificationToast key={notification.id} notification={notification} onRemove={removeNotification} />
          ))}
        </div>
      )}

      {/* Import Progress Overlay */}
      {importProgress && (
        <LoadingOverlay
          isVisible={true}
          message={importProgress.message}
          progress={importProgress.progress}
        />
      )}

      {/* CSV Preview Modal */}
      <CSVPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        csvPreview={csvPreview}
        columnMappings={columnMappings}
        onColumnMappingsChange={setColumnMappings}
        onImport={handleImportCSV}
      />

      {/* Export Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Download className="w-6 h-6 text-accent-pink" />
              Export Data
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              Export your data with advanced filtering and format options
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExportOptions(!showExportOptions)}
            className="flex items-center gap-2"
          >
            <Settings2 className="w-4 h-4" />
            {showExportOptions ? 'Hide' : 'Show'} Options
          </Button>
        </div>

        {/* Quick Export Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DownloadButton
            isDownloading={isExporting}
            onClick={() => exportToCSV(documents, 'documents.csv')}
            className="w-full justify-start"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export Documents ({documents.length} items)
          </DownloadButton>

          <DownloadButton
            isDownloading={isExporting}
            onClick={() => exportToCSV(updateLogs, 'update-logs.csv')}
            className="w-full justify-start"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export Update Logs ({updateLogs.length} items)
          </DownloadButton>
        </div>
      </Card>

      {/* Import Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Upload className="w-6 h-6 text-accent-cyan" />
              Import Data
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              Import data from CSV with advanced validation and preview
            </p>
          </div>
          {csvPreview && (
            <Badge variant="outline" className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Data Ready for Import
            </Badge>
          )}
        </div>

        <div className="space-y-6">
          {/* Import Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormGroup label="Import Type" required>
              <Select
                value={csvImportType}
                onValueChange={(value: 'documents' | 'update-logs') => {
                  setCsvImportType(value);
                  setCsvPreview(null);
                  setColumnMappings([]);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="documents">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Documents
                    </div>
                  </SelectItem>
                  <SelectItem value="update-logs">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Update Logs
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormGroup>

            {csvImportType === 'documents' && (
              <FormGroup label="Target Page">
                <Select value={importPage} onValueChange={setImportPage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pages (Keep Original Categories)</SelectItem>
                    {availablePages.map(page => (
                      <SelectItem key={page.id} value={page.id}>
                        {page.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormGroup>
            )}
          </div>

          {/* File Upload Section */}
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300",
              isDragging
                ? 'border-accent-cyan bg-accent-cyan/10 scale-[1.01] shadow-lg'
                : 'border-border bg-muted/10'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className={cn(
                  "p-4 rounded-full transition-all duration-300",
                  isDragging ? 'bg-accent-cyan/20 scale-110' : 'bg-muted/50'
                )}>
                  <Upload className={cn(
                    "w-8 h-8 transition-colors",
                    isDragging ? 'text-accent-cyan' : 'text-muted-foreground'
                  )} />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="csvFileInput" className="cursor-pointer">
                  <span className="text-accent-cyan font-semibold text-lg">
                    Choose CSV file
                  </span>
                  <span className="text-muted-foreground"> or drag and drop here</span>
                </label>
                <p className="text-sm text-muted-foreground">
                  Supports CSV files up to 10MB with automatic validation and preview
                </p>
                <input
                  id="csvFileInput"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {uploadedFile && (
                <div className="inline-flex items-center gap-3 text-sm text-accent-cyan bg-accent-cyan/10 rounded-lg p-3 border border-accent-cyan/20">
                  <FileUp className="w-5 h-5" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{uploadedFile.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUploadedFile(null);
                      setCsvData('');
                      setCsvPreview(null);
                      const fileInput = document.getElementById('csvFileInput') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="text-red-500 p-2 rounded-lg bg-red-50 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {isProcessingFile && (
                <div className="inline-flex items-center gap-3 text-sm text-accent-cyan bg-accent-cyan/10 rounded-lg p-3">
                  <div className="animate-spin w-5 h-5 border-2 border-accent-cyan border-t-transparent rounded-full"></div>
                  <span className="font-medium">Processing file...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}; 