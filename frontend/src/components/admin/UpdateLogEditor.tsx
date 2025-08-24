import React, { useRef, useEffect, useState } from 'react';
import {
  Eye, Save, X, FileText, Edit3, Settings,
  Focus, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormGroup, StatusBadge } from '@/components/ui/spacing';
import { FileUpload } from '@/components/ui/FileUpload';
import { cn, extractScreenshotUrls, formatDisplayDateTime } from '@/services/utils';
import { UpdateLog } from '@/types';
import { validateData, updateLogValidationSchema } from '@/utils/validation';
import { TagInput } from './TagInput';
import TiptapEditor from '@/components/features/TiptapEditor';

interface UpdateLogEditorProps {
  updateLog: UpdateLog;
  onUpdateLogChange: (log: UpdateLog) => void;
  onSave: (log: UpdateLog) => void;
  onCancel: () => void;
  isPreviewMode: boolean;
  onPreviewModeChange: (mode: boolean) => void;
  isFocusMode?: boolean;
  onFocusModeChange?: (mode: boolean) => void;
  commonTags: string[];
}

export const UpdateLogEditor: React.FC<UpdateLogEditorProps> = ({
  updateLog,
  onUpdateLogChange,
  onSave,
  onCancel,
  isPreviewMode,
  onPreviewModeChange,
  isFocusMode = false,
  onFocusModeChange,
  commonTags
}) => {
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
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

  // Enhanced validation function using Zod schema
  const validateUpdateLog = (log: UpdateLog): string[] => {
    // Prepare update log data for validation
    const updateLogData = {
      version: log.version,
      title: log.title,
      content: log.content,
      date: log.date,
      description: log.description,
      tags: log.tags
    };

    // Use Zod validation
    const validation = validateData(updateLogValidationSchema, updateLogData);

    if (validation.success) {
      return [];
    }

    // Return formatted error messages
    return validation.fieldErrors || [];
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    setValidationErrors([]);

    try {
      // Create a properly formatted update log for saving
      const logToSave: UpdateLog = {
        ...updateLog,
        // Ensure required fields are present
        version: updateLog.version || '',
        title: updateLog.title || '',
        content: updateLog.content || '',
        description: updateLog.description || '',
        // Ensure arrays exist
        tags: updateLog.tags || [],
        screenshots_data: updateLog.screenshots_data || [],
        // Set timestamps
        updated_at: new Date().toISOString(),
        created_at: updateLog.created_at || new Date().toISOString(),
        // Set date if not provided
        date: updateLog.date || new Date().toISOString().split('T')[0],
        // Ensure metrics exist
        metrics: updateLog.metrics || {
          performanceImprovement: '0%',
          userSatisfaction: '0%',
          bugReports: 0
        }
      };

      // Validate the update log
      const errors = validateUpdateLog(logToSave);
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      // Update local state first
      onUpdateLogChange(logToSave);
      
      // Then save to backend
      await onSave(logToSave);
      
    } catch (error) {
      console.error('Error in handleSaveDraft:', error);
      setValidationErrors(['Failed to save update log. Please try again.']);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContentChange = (content: string) => {
    onUpdateLogChange({ ...updateLog, content });
  };



  // Enhanced focus mode rendering
  if (isFocusMode) {
    return (
      <div className="h-full flex flex-col">
        {/* Minimal Header for Focus Mode */}
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-accent-pink rounded-full animate-pulse"></div>
            <span className="text-sm text-muted-foreground">Focus Mode</span>
            <span className="font-medium">{updateLog.title || `Version ${updateLog.version}` || 'Untitled Update'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPreviewModeChange(!isPreviewMode)}
              className={cn(
                "transition-colors",
                isPreviewMode ? "bg-accent-cyan/20 text-accent-cyan" : ""
              )}
            >
              <Eye className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFocusModeChange?.(false)}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Full Editor Area */}
        <div className="flex-1 p-6 overflow-auto">
          <div className={cn(
            "max-w-6xl mx-auto",
            "border-0 rounded-2xl overflow-hidden",
            "bg-background",
            "transition-all duration-300 ease-out"
          )}>
            <TiptapEditor
              content={updateLog.content}
              onChange={handleContentChange}

              editable={!isPreviewMode}
              placeholder="Describe the update in detail... What's new? What's fixed? What's improved?"
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
          <div className="bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-xl p-3">
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
            {updateLog.id ? 'Edit Update Log' : 'Create New Update Log'}
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
              onClick={() => onFocusModeChange?.(true)}
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
          {/* Update Log Metadata Section - Top */}
          <div className="border border-border rounded-xl bg-background">
            <div
              className="flex items-center justify-between p-4 cursor-pointer"
              onClick={() => setIsMetadataExpanded(!isMetadataExpanded)}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-accent-pink" />
                <div>
                  <h4 className="text-lg font-semibold text-foreground">
                    Update Log Settings
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Configure your update log's version information and publication settings
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

                <div className="space-y-4">
                  {/* Version and Date in responsive grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-responsive">
                    <FormGroup
                      label="Version"
                      description="Semantic version number (e.g., v2.1.0)"
                      required
                    >
                      <Input
                        value={updateLog.version}
                        onChange={(e) => onUpdateLogChange({ ...updateLog, version: e.target.value })}
                        placeholder="v2.1.0"
                        className="font-medium h-10 px-3 border border-border rounded-xl focus:ring-2 focus:ring-accent-pink/20 focus:border-accent-pink focus:outline-none"
                      />
                    </FormGroup>

                    <FormGroup
                      label="Release Date"
                      description="When this update was released"
                      required
                    >
                      <Input
                        type="date"
                        value={updateLog.date ? updateLog.date.split('T')[0] : ''}
                        onChange={(e) => onUpdateLogChange({ ...updateLog, date: e.target.value })}
                        className="font-medium h-10 px-3 border border-border rounded-xl focus:ring-2 focus:ring-accent-pink/20 focus:border-accent-pink focus:outline-none"
                      />
                    </FormGroup>
                  </div>

                  {/* Title - Full width for better visibility */}
                  <FormGroup
                    label="Update Title"
                    description="A clear, descriptive title for this update"
                    required
                  >
                    <Input
                      value={updateLog.title}
                      onChange={(e) => onUpdateLogChange({ ...updateLog, title: e.target.value })}
                      placeholder="Enter a clear, descriptive title for this update..."
                      className="font-medium h-10 px-3 border border-border rounded-xl focus:ring-2 focus:ring-accent-pink/20 focus:border-accent-pink focus:outline-none"
                    />
                  </FormGroup>

                  {/* Description */}
                  <FormGroup
                    label="Brief Description"
                    description="A short summary of what this update includes"
                  >
                    <Input
                      value={updateLog.description}
                      onChange={(e) => onUpdateLogChange({ ...updateLog, description: e.target.value })}
                      placeholder="Brief description of the update..."
                      className="h-10 px-3 border border-border rounded-xl focus:ring-2 focus:ring-accent-pink/20 focus:border-accent-pink focus:outline-none"
                    />
                  </FormGroup>

                  {/* Tags */}
                  <TagInput
                    tags={updateLog.tags || []}
                    onTagsChange={(tags) => onUpdateLogChange({ ...updateLog, tags })}
                    suggestions={commonTags}
                    label="Tags"
                    description="Add tags to categorize this update (e.g., ui, bugfix, performance)"
                    placeholder="Type tags and press Enter or comma to add... (e.g., ui, bugfix, performance)"
                    quickAddTags={['bugfix', 'feature', 'ui', 'ux', 'performance', 'security']}
                  />

                  {/* Screenshots */}
                  <FileUpload
                    files={extractScreenshotUrls(updateLog.screenshots_data, updateLog.id)}
                    onFilesChange={(files) => {
                      // Convert files to screenshots_data format
                      const screenshotsData = files.map((file, index) => ({
                        data: file.split(',')[1] || file, // Remove data URL prefix
                        mimeType: file.startsWith('data:') ? file.split(';')[0].split(':')[1] : 'image/jpeg',
                        filename: `screenshot-${index + 1}.jpg`
                      }));
                      onUpdateLogChange({ ...updateLog, screenshots_data: screenshotsData });
                    }}
                    maxFiles={10}
                    accept="image/*"
                    maxSize={5 * 1024 * 1024} // 5MB
                    label="Screenshots"
                    description="Upload screenshot images for this update (PNG, JPG, GIF, WebP)"
                    disabled={isPreviewMode}
                    showPreview={true}
                    enableReorder={false}
                    screenshotsData={updateLog.screenshots_data}
                  />
                </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Editor Section - Bottom (Full Width) */}
        <div className="border border-border rounded-xl bg-background mt-6" ref={editorRef}>
          <div
            className="flex items-center justify-between p-4 cursor-pointer"
            onClick={() => setIsContentExpanded(!isContentExpanded)}
          >
            <div className="flex items-center gap-3">
              <Edit3 className="w-5 h-5 text-accent-purple" />
              <div>
                <h4 className="text-lg font-semibold text-foreground">
                  Update Content
                </h4>
                <p className="text-sm text-muted-foreground">
                  Describe the update in detail. Include new features, bug fixes, improvements
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
                  content={updateLog.content}
                  onChange={handleContentChange}

                  editable={!isPreviewMode}
                  placeholder="Describe the update in detail... What's new? What's fixed? What's improved?"
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
                  <div className="w-2 h-2 bg-accent-pink rounded-full animate-pulse"></div>
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
                    className="h-8 px-2 text-xs bg-accent-pink text-white"
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
                    <div className="w-2 h-2 bg-accent-pink rounded-full"></div>
                    <span className="font-medium">
                      {updateLog.content.length} characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 bg-accent-purple rounded-full"></div>
                    <span className="font-medium">
                      ~{Math.max(1, Math.ceil(updateLog.content.split(' ').length / 200))} min read
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
              <div className="w-2 h-2 bg-accent-pink rounded-full"></div>
              <span className="text-muted-foreground">
                {updateLog.id ? (
                  <>Last saved: <span className="font-medium text-foreground">{formatDisplayDateTime(updateLog.updated_at)}</span></>
                ) : (
                  <span className="text-yellow-600 font-medium">New update log - not saved yet</span>
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

            {updateLog.id && (
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
              className="bg-accent-pink text-white font-semibold focus:ring-2 focus:ring-accent-pink/20 focus:outline-none order-1 sm:order-3"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : (updateLog.id ? 'Save Changes' : 'Create Update Log')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};