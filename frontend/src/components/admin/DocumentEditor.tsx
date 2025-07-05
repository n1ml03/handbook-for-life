import React, { useRef, useEffect, useState } from 'react';
import { Eye, Save, X, FileText, Edit3, Focus, Settings, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormGroup, StatusBadge } from '@/components/ui/spacing';
import { FileUpload } from '@/components/ui/FileUpload';
import { cn, extractScreenshotUrls, extractContentText, formatDisplayDateTime } from '@/services/utils';
import { Document, DocumentCategory } from '@/types';

import TiptapEditor from '@/components/features/TiptapEditor';

export interface DocumentEditorProps {
  document: Document;
  onDocumentChange: (document: Document) => void;
  onSave: (document: Document) => void;
  onCancel: () => void;
  documentCategories: DocumentCategory[];
  isPreviewMode: boolean;
  onPreviewModeChange: (mode: boolean) => void;
  isFocusMode?: boolean;
  onFocusModeChange?: (mode: boolean) => void;
  commonTags: string[];
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  document,
  onDocumentChange,
  onSave,
  onCancel,
  isPreviewMode,
  onPreviewModeChange,
  isFocusMode = false,
  onFocusModeChange
}) => {
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [jsonContent, setJsonContent] = useState<any>(null);
  const [isMetadataExpanded, setIsMetadataExpanded] = useState(true);
  const [isContentExpanded, setIsContentExpanded] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!editorRef.current || isPreviewMode) return;

      const editorRect = editorRef.current.getBoundingClientRect();
      const isEditorVisible = editorRect.top < window.innerHeight && editorRect.bottom > 0;

      setShowFloatingToolbar(isEditorVisible && editorRect.top < 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isPreviewMode]);

  // Validation function
  const validateDocument = (doc: Document): string[] => {
    const errors: string[] = [];
    
    // Check required fields
    if (!doc.title_en) {
      errors.push('Title is required');
    }
    
    if (!doc.unique_key) {
      errors.push('Unique key is required');
    }
    
    // Check content (JSON content should be present)
    if (!doc.content_json_en && !jsonContent) {
      errors.push('Content is required');
    }
    
    // Validate unique key format
    if (doc.unique_key && !/^[a-zA-Z0-9-_]+$/.test(doc.unique_key)) {
      errors.push('Unique key can only contain letters, numbers, hyphens, and underscores');
    }
    
    return errors;
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setValidationErrors([]);

    try {
      // Create a properly formatted document for saving
      const documentToSave: Document = {
        ...document,
        // Ensure required fields are set
        title_en: document.title_en || '',
        unique_key: document.unique_key || `doc-${Date.now()}`,
        // Handle content conversion
        content_json_en: jsonContent || document.content_json_en,
        // Set timestamps
        updated_at: new Date().toISOString(),
        created_at: document.created_at || new Date().toISOString(),
      };

      // Validate the document
      const errors = validateDocument(documentToSave);
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      // Update local state first
      onDocumentChange(documentToSave);
      
      // Then save to backend
      await onSave(documentToSave);
      
    } catch (error) {
      console.error('Error in handleSaveDraft:', error);
      setValidationErrors(['Failed to save document. Please try again.']);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (content: string) => {
    // Update the document with the HTML content
    onDocumentChange({
      ...document,
      content: content
    });
  };

  const handleJsonContentChange = (jsonContent: any) => {
    setJsonContent(jsonContent);
    // Update the document with the JSON content
    onDocumentChange({
      ...document,
      content_json_en: jsonContent
    });
  };

  // Enhanced focus mode rendering
  if (isFocusMode) {
    return (
      <div className="h-full flex flex-col">
        {/* Minimal Header for Focus Mode */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-accent-cyan rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Focus Mode</span>
            <span className="font-medium">{document.title_en || document.title || 'Untitled Document'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPreviewModeChange(!isPreviewMode)}
              className={cn(
                isPreviewMode ? "bg-accent-cyan/20 text-accent-cyan" : ""
              )}
            >
              <Eye className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFocusModeChange && onFocusModeChange(false)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mx-4 mt-2">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Validation Errors:</span>
            </div>
            <ul className="mt-1 text-sm text-red-600 list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Full Editor Area */}
        <div className="flex-1 p-6 overflow-auto">
          <div className={cn(
            "max-w-6xl mx-auto",
            "border-0 rounded-2xl overflow-hidden",
            "bg-background"
          )}>
            <TiptapEditor
              content={document.content}
              onChange={handleContentChange}
              onJsonChange={handleJsonContentChange}
              editable={!isPreviewMode}
              placeholder="Start writing your document content... Use the rich text editor to format your content with headings, lists, links, and more."
              showToolbar={!isPreviewMode}
              showCharacterCount={true}
              showWordCount={true}
              mode="full"
              stickyToolbar={true}
              className={cn(
                "border-0 bg-transparent",
                "min-h-[calc(100vh-200px)]"
              )}
            />
          </div>
        </div>

        {/* Floating Action Bar for Focus Mode */}
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-background/95 backdrop-blur-sm border border-border rounded-xl p-3">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="h-10 px-4"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onCancel}
                disabled={isSaving}
                className="h-10 px-4"
              >
                <X className="w-4 h-4 mr-2" />
                Exit
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl bg-background relative">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">
            {document.id ? 'Edit Document' : 'Create New Document'}
          </h3>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPreviewModeChange(!isPreviewMode)}
              className={cn(
                isPreviewMode ? "bg-accent-cyan/20 text-accent-cyan border-accent-cyan/30" : ""
              )}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreviewMode ? 'Edit' : 'Preview'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onFocusModeChange && onFocusModeChange(true)}
              title="Focus Mode (F10)"
            >
              <Focus className="w-4 h-4 mr-2" />
              Focus
            </Button>
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Validation Errors:</span>
            </div>
            <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Vertical Stack Layout */}
        <div className="space-y-6">
          {/* Document Metadata Section - Top */}
          <div className="border border-border rounded-xl bg-background">
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => setIsMetadataExpanded(!isMetadataExpanded)}
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-accent-cyan" />
                <div>
                  <h4 className="text-lg font-semibold text-foreground">
                    Document Settings
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Configure your document's basic information and publication settings
                  </p>
                </div>
              </div>
              {isMetadataExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>

            {isMetadataExpanded && (
              <div className="px-4 pb-4 border-t border-border/50">
                <div className="pt-4">

                <div className="space-y-6">
                  {/* Title - Full width for better visibility */}
                  <FormGroup
                    label="Document Title"
                    description="Choose a clear, descriptive title for your document"
                    required
                  >
                    <Input
                      value={document.title_en || ''}
                      onChange={(e) => onDocumentChange({ ...document, title_en: e.target.value })}
                      placeholder="Enter a clear, descriptive title for your document..."
                      className="text-lg font-medium h-12 px-4 border border-border rounded-xl focus:ring-2 focus:ring-accent-cyan/20 focus:border-accent-cyan focus:outline-none"
                    />
                  </FormGroup>

                  {/* Unique Key */}
                  <FormGroup
                    label="Unique Key"
                    description="A unique identifier for this document (auto-generated if empty)"
                    required
                  >
                    <Input
                      value={document.unique_key || ''}
                      onChange={(e) => onDocumentChange({ ...document, unique_key: e.target.value })}
                      placeholder="e.g., swimsuit-guide-2024"
                      className="font-mono text-sm"
                    />
                  </FormGroup>

                  {/* Summary */}
                  <FormGroup
                    label="Summary"
                    description="Brief description of what this document covers"
                  >
                    <Input
                      value={document.summary_en || ''}
                      onChange={(e) => onDocumentChange({ ...document, summary_en: e.target.value })}
                      placeholder="Enter a brief summary..."
                    />
                  </FormGroup>
                </div>
                </div>
              </div>
            )}
          </div>

          {/* Screenshots */}
          <FileUpload
            files={extractScreenshotUrls(document.screenshots_data)}
            onFilesChange={(files) => {
              // Convert files to screenshots_data format
              const screenshotsData = files.map((file, index) => ({
                data: file.split(',')[1] || file, // Remove data URL prefix
                mimeType: file.startsWith('data:') ? file.split(';')[0].split(':')[1] : 'image/jpeg',
                filename: `screenshot-${index + 1}.jpg`
              }));
              onDocumentChange({ ...document, screenshots_data: screenshotsData });
            }}
            maxFiles={10}
            accept="image/*"
            maxSize={5 * 1024 * 1024} // 5MB
            label="Screenshots"
            description="Upload screenshot images for this document (PNG, JPG, GIF, WebP)"
            disabled={isPreviewMode}
          />

          {/* Content Editor Section*/}
          <div className="border border-border rounded-xl bg-background" ref={editorRef}>
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => setIsContentExpanded(!isContentExpanded)}
            >
              <div className="flex items-center gap-3">
                <Edit3 className="w-5 h-5 text-accent-purple" />
                <div>
                  <h4 className="text-lg font-semibold text-foreground">
                    Document Content
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Create rich, formatted content using our advanced text editor
                  </p>
                </div>
              </div>
              {isContentExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>

            {isContentExpanded && (
              <div className="border-t border-border/50">
                <div className={cn(
                  "border-0 rounded-none overflow-hidden",
                  "bg-background"      
                  )}>
                  <TiptapEditor
                    content={document.content || ''}
                    onChange={handleContentChange}
                    onJsonChange={handleJsonContentChange}
                    editable={!isPreviewMode}
                    placeholder="Start writing your document content... Use the rich text editor to format your content with headings, lists, links, and more."
                    showToolbar={!isPreviewMode}
                    showCharacterCount={true}
                    showWordCount={true}
                    mode="full"
                    stickyToolbar={true}
                    className={cn(
                      "border-0 bg-transparent",
                      "min-h-[450px] sm:min-h-[550px] lg:min-h-[650px] xl:min-h-[750px] 2xl:min-h-[850px]"
                    )}
                  />
                </div>
              </div>
            )}

            {/* Floating Toolbar */}
            {showFloatingToolbar && !isPreviewMode && (
              <div
                ref={toolbarRef}
                className="fixed top-20 right-4 z-50 bg-background/95 backdrop-blur-sm border border-border rounded-xl p-3"
              >
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-accent-cyan rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-muted-foreground">Quick Actions</span>
                  </div>
                  <div className="w-px h-4 bg-border"></div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPreviewModeChange(true)}
                      className="h-8 px-2 text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveDraft}
                      disabled={isSaving}
                      className="h-8 px-2 text-xs bg-accent-cyan text-white"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {isContentExpanded && (
              <div className="bg-muted/10 border-t border-border/50 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-2 h-2 bg-accent-cyan rounded-full"></div>
                      <span className="font-medium">
                        {extractContentText(document.content_json_en).length} characters
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-2 h-2 bg-accent-purple rounded-full"></div>
                      <span className="font-medium">
                        ~{Math.max(1, Math.ceil(extractContentText(document.content_json_en).split(' ').length / 200))} min read
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Last edited: just now</span>
                    <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                    <span className="text-muted-foreground font-medium">Manual save required</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-muted/10 border-t border-border/30 -mx-6 px-8 py-6 mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-accent-cyan rounded-full"></div>
                <span className="text-muted-foreground">
                  {document.id ? (
                    <>Last saved: <span className="font-medium text-foreground">{formatDisplayDateTime(document.updated_at)}</span></>
                  ) : (
                    <span className="text-yellow-600 font-medium">New document - not saved yet</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-1 h-1 bg-muted-foreground rounded-full hidden sm:block"></div>
                <span className="text-sm text-muted-foreground">Status:</span>
                <StatusBadge status="success" className="text-xs font-medium">
                  Active
                </StatusBadge>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="order-2 sm:order-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>

              {document.id && (
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  className="order-3 sm:order-2"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
              )}

              <Button
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="bg-accent-cyan text-white font-semibold focus:ring-2 focus:ring-accent-cyan/20 focus:outline-none order-1 sm:order-3"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : (document.id ? 'Save Changes' : 'Create Document')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 