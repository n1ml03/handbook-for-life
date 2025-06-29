import React, { useState, useCallback, useMemo } from 'react';
import { 
  Download, Upload, FileDown, FileUp, Settings2, X, 
  CheckCircle2, BookOpen, FileText, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { LoadingOverlay, DownloadButton } from '@/components/ui/loading';
import { Card } from '@/components/ui/card';
import { FormGroup } from '@/components/ui/spacing';
import { cn } from '@/services/utils';
import { Document, UpdateLog } from '@/types';
import { CSVPreviewModal, type CSVPreviewData, type CSVValidationError, type ColumnMapping } from './CSVPreviewModal';
import { NotificationToast, type NotificationState } from './NotificationToast';

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
  const [csvImportType, setCsvImportType] = useState<'documents' | 'update-logs'>('documents');
  const [importPage, setImportPage] = useState<string>('all');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [csvPreview, setCsvPreview] = useState<CSVPreviewData | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

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
  const documentFields: ColumnMapping[] = useMemo(() => [
    { csvColumn: '', dbField: 'title', isRequired: true, dataType: 'string' },
    { csvColumn: '', dbField: 'content', isRequired: true, dataType: 'string' },
    { csvColumn: '', dbField: 'category', isRequired: true, dataType: 'string' },
    { csvColumn: '', dbField: 'tags', isRequired: false, dataType: 'array' },
    { csvColumn: '', dbField: 'author', isRequired: false, dataType: 'string' },
    { csvColumn: '', dbField: 'createdAt', isRequired: false, dataType: 'date' },
    { csvColumn: '', dbField: 'updatedAt', isRequired: false, dataType: 'date' }
  ], []);

  const updateLogFields: ColumnMapping[] = useMemo(() => [
    { csvColumn: '', dbField: 'version', isRequired: true, dataType: 'string' },
    { csvColumn: '', dbField: 'title', isRequired: true, dataType: 'string' },
    { csvColumn: '', dbField: 'description', isRequired: false, dataType: 'string' },
    { csvColumn: '', dbField: 'content', isRequired: true, dataType: 'string' },
    { csvColumn: '', dbField: 'date', isRequired: true, dataType: 'date' },
    { csvColumn: '', dbField: 'tags', isRequired: false, dataType: 'array' }
  ], []);

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

  // Export functionality with better type safety
  const exportToCSV = useCallback((data: Document[] | UpdateLog[], filename: string, selectedColumns?: string[]) => {
    if (data.length === 0) {
      addNotification({
        type: 'warning',
        title: 'No Data to Export',
        message: 'There is no data available to export'
      });
      return;
    }

    // Convert data to Record<string, unknown>[] for CSV processing
    const recordData = data.map(item => ({ ...item } as Record<string, unknown>));
    const allHeaders = Object.keys(recordData[0]);
    const headers = selectedColumns && selectedColumns.length > 0 ? selectedColumns : allHeaders;

    const csvContent = [
      headers.join(','),
      ...recordData.map(row =>
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
    const rows: string[][] = [];
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

  // Import functionality with better type safety
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
        const obj: Record<string, unknown> = {};
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
            // Create properly typed Document
            const document: Document = {
              id: Number(doc.id) || Date.now(),
              unique_key: doc.unique_key as string || `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
              title_en: doc.title as string || doc.title_en as string || '',
              content_json_en: doc.content_json_en as Record<string, unknown> || undefined,
              created_at: doc.createdAt as string || new Date().toISOString(),
              updated_at: doc.updatedAt as string || new Date().toISOString(),
              // Extended properties for UI compatibility
              title: doc.title as string || doc.title_en as string || '',
              content: doc.content as string || '',
              category: doc.category as string || (importPage !== 'all' ? importPage : ''),
              tags: doc.tags as string[] || [],
              author: doc.author as string || 'Admin',
              screenshots: doc.screenshots as string[] || []
            };

            onAddDocument(document);
            successCount++;
          } catch {
            errorCount++;
          }
        }
      } else {
        for (let i = 0; i < mappedData.length; i++) {
          const log = mappedData[i];
          try {
            // Create properly typed UpdateLog
            const updateLog: UpdateLog = {
              id: log.id as string || `update_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
              version: log.version as string || 'v1.0.0',
              title: log.title as string || 'Untitled Update',
              description: log.description as string || '',
              content: log.content as string || '',
              date: log.date as string || new Date().toISOString().split('T')[0],
              tags: log.tags as string[] || [],
              screenshots: log.screenshots as string[] || [],
              metrics: log.metrics as {
                performanceImprovement: string;
                userSatisfaction: string;
                bugReports: number;
              } || {
                performanceImprovement: '0%',
                userSatisfaction: '0%',
                bugReports: 0
              },
              createdAt: log.createdAt as string || new Date().toISOString(),
              updatedAt: log.updatedAt as string || new Date().toISOString()
            };

            await onAddUpdateLog(updateLog);
            successCount++;
          } catch {
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
      clearImportData();

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

  // Clear import data
  const clearImportData = useCallback(() => {
    setUploadedFile(null);
    setCsvPreview(null);
    setShowPreviewModal(false);
    setColumnMappings([]);
    const fileInput = document.getElementById('csvFileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }, []);

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
    <>
      {/* Notification Portal */}
      {notifications.length > 0 && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <div className="absolute top-6 right-6 space-y-3 max-w-sm">
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={cn(
                  "transform transition-all duration-500 ease-out pointer-events-auto",
                  "animate-in slide-in-from-right-full fade-in",
                  index > 0 ? "delay-100" : ""
                )}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
              >
                <NotificationToast 
                  notification={notification} 
                  onRemove={removeNotification}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-8">

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
      <Card className="p-6 bg-muted/20 border border-border/30 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Download className="w-5 h-5 text-muted-foreground" />
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
            className="flex items-center gap-2 border-border/40 text-muted-foreground hover:bg-muted/30"
          >
            <Settings2 className="w-4 h-4" />
            {showExportOptions ? 'Hide' : 'Show'} Options
          </Button>
        </div>

        {/* Quick Export Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-responsive">
          <DownloadButton
            isDownloading={false}
            onClick={() => exportToCSV(documents, 'documents.csv')}
            className="w-full justify-start bg-muted/30 border-border/40 text-foreground hover:bg-muted/40 backdrop-blur-sm"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export Documents ({documents.length} items)
          </DownloadButton>

          <DownloadButton
            isDownloading={false}
            onClick={() => exportToCSV(updateLogs, 'update-logs.csv')}
            className="w-full justify-start bg-muted/30 border-border/40 text-foreground hover:bg-muted/40 backdrop-blur-sm"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export Update Logs ({updateLogs.length} items)
          </DownloadButton>
        </div>
      </Card>

      {/* Import Section */}
      <Card className="p-6 bg-muted/20 border border-border/30 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Upload className="w-5 h-5 text-muted-foreground" />
              Import Data
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              Import data from CSV with intelligent validation and preview
            </p>
          </div>
          {csvPreview && (
            <Badge variant="outline" className="flex items-center gap-2 border-border/40 text-muted-foreground bg-muted/30 backdrop-blur-sm">
              <CheckCircle2 className="w-4 h-4" />
              Data Ready for Import
            </Badge>
          )}
        </div>

        <div className="space-y-6">
          {/* Import Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-responsive">
            <FormGroup label="Import Type" required>
              <Select
                value={csvImportType}
                onValueChange={(value: 'documents' | 'update-logs') => {
                  setCsvImportType(value);
                  clearImportData();
                }}
              >
                <SelectTrigger className="border-border/40 focus:border-border/60 bg-muted/20 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-sm border-border/40">
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
                  <SelectTrigger className="border-border/40 focus:border-border/60 bg-muted/20 backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background/95 backdrop-blur-sm border-border/40">
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

          {/* Enhanced File Upload Section */}
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer backdrop-blur-sm",
              isDragging
                ? 'border-border/60 bg-muted/40 scale-[1.02] shadow-lg'
                : uploadedFile
                ? 'border-border/50 bg-muted/30'
                : 'border-border/40 bg-muted/20 hover:border-border/50 hover:bg-muted/25'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('csvFileInput')?.click()}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className={cn(
                  "p-4 rounded-full transition-all duration-300 backdrop-blur-sm",
                  isDragging 
                    ? 'bg-muted/60 scale-110' 
                    : uploadedFile
                    ? 'bg-muted/50'
                    : 'bg-muted/40'
                )}>
                  {uploadedFile ? (
                    <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
                  ) : (
                    <Upload className={cn(
                      "w-8 h-8 transition-colors",
                      isDragging ? 'text-muted-foreground' : 'text-muted-foreground'
                    )} />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-lg font-medium">
                  {uploadedFile ? (
                    <span className="text-foreground">File Ready to Process</span>
                  ) : (
                    <>
                      <span className="text-foreground">Choose CSV file</span>
                      <span className="text-muted-foreground"> or drag and drop here</span>
                    </>
                  )}
                </div>
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
                <div className="inline-flex items-center gap-3 text-sm text-foreground bg-muted/40 rounded-lg p-4 border border-border/40 backdrop-blur-sm">
                  <FileUp className="w-5 h-5" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{uploadedFile.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {(uploadedFile.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearImportData();
                    }}
                    className="text-muted-foreground hover:text-foreground p-2 rounded-lg bg-muted/30 hover:bg-muted/40 transition-colors duration-200 backdrop-blur-sm"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {isProcessingFile && (
                <div className="inline-flex items-center gap-3 text-sm text-foreground bg-muted/40 rounded-lg p-4 border border-border/40 backdrop-blur-sm">
                  <div className="animate-spin w-5 h-5 border-2 border-muted-foreground border-t-transparent rounded-full"></div>
                  <span className="font-medium">Processing file...</span>
                </div>
              )}

              {csvPreview && !isProcessingFile && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2 text-foreground">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{csvPreview.validRows} valid rows</span>
                    </div>
                    {csvPreview.errors.length > 0 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <AlertCircle className="w-4 h-4" />
                        <span>{csvPreview.errors.length} warnings</span>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPreviewModal(true);
                    }}
                    className="bg-muted/50 hover:bg-muted/60 text-foreground border border-border/40 backdrop-blur-sm"
                  >
                    Review & Import Data
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
      </div>
    </>
  );
}; 