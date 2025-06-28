import React, { useRef, useEffect, useState } from 'react';
import { 
  Eye, Save, X, FileText, Edit3, Settings,
  Focus 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormGroup, StatusBadge } from '@/components/ui/spacing';
import { FileUpload } from '@/components/ui/FileUpload';
import { cn } from '@/services/utils';
import { UpdateLog } from '@/types';
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

  const handleSaveDraft = () => {
    const draftLog = { ...updateLog };
    onUpdateLogChange(draftLog);
    onSave(draftLog);
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
              onChange={(content) => onUpdateLogChange({ ...updateLog, content })}
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
                onClick={() => onSave(updateLog)}
                className="h-10 px-4"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
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
    <div className="doax-card relative">
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
                "transition-colors",
                isPreviewMode ? "bg-accent-cyan/20 text-accent-cyan" : ""
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

        {/* Vertical Stack Layout */}
        <div className="space-y-6">
          {/* Update Log Metadata Section - Top */}
          <div className="bg-gradient-to-br from-muted/30 to-muted/10 border-2 border-border/30 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h4 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Settings className="w-4 h-4 text-accent-pink" />
                  Update Log Settings
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure your update log's version information and publication settings
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Version and Date in responsive grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormGroup
                  label="Version"
                  description="Semantic version number (e.g., v2.1.0)"
                  required
                >
                  <Input
                    value={updateLog.version}
                    onChange={(e) => onUpdateLogChange({ ...updateLog, version: e.target.value })}
                    placeholder="v2.1.0"
                    className="font-medium h-10 px-3 border-2 border-border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-accent-pink/20 focus:border-accent-pink focus:outline-hidden"
                  />
                </FormGroup>

                <FormGroup
                  label="Release Date"
                  description="When this update was released"
                  required
                >
                  <Input
                    type="date"
                    value={updateLog.date}
                    onChange={(e) => onUpdateLogChange({ ...updateLog, date: e.target.value })}
                    className="font-medium h-10 px-3 border-2 border-border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-accent-pink/20 focus:border-accent-pink focus:outline-hidden"
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
                  className="font-medium h-10 px-3 border-2 border-border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-accent-pink/20 focus:border-accent-pink focus:outline-hidden"
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
                  className="h-10 px-3 border-2 border-border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-accent-pink/20 focus:border-accent-pink focus:outline-hidden"
                />
              </FormGroup>



              {/* Tags */}
              <TagInput
                tags={updateLog.tags}
                onTagsChange={(tags) => onUpdateLogChange({ ...updateLog, tags })}
                suggestions={commonTags}
                label="Tags"
                description="Add tags to categorize this update (e.g., ui, bugfix, performance)"
                placeholder="Type tags and press Enter or comma to add... (e.g., ui, bugfix, performance)"
                quickAddTags={['bugfix', 'feature', 'ui', 'ux', 'performance', 'security']}
              />
            </div>
          </div>

          {/* Screenshots */}
          <FileUpload
            files={updateLog.screenshots}
            onFilesChange={(files) => onUpdateLogChange({ ...updateLog, screenshots: files })}
            maxFiles={10}
            accept="image/*"
            maxSize={5 * 1024 * 1024} // 5MB
            label="Screenshots"
            description="Upload screenshot images for this update (PNG, JPG, GIF, WebP)"
            disabled={isPreviewMode}
          />
        </div>

        {/* Content Editor Section - Bottom (Full Width) */}
        <div className="space-y-6 mt-12" ref={editorRef}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h4 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-accent-purple" />
                Update Content
              </h4>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Describe the update in detail. Include new features, bug fixes, improvements, and any other relevant information.
              </p>
            </div>
          </div>

          <div className={cn(
            "border-2 border-border rounded-2xl overflow-hidden",
            "bg-background shadow-xs",
            "focus-within:border-accent-pink/50 focus-within:shadow-md",
            "transition-all duration-300 ease-out"
          )}>
            <TiptapEditor
              content={updateLog.content}
              onChange={(content) => onUpdateLogChange({ ...updateLog, content })}
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

          {/* Floating Toolbar */}
          {showFloatingToolbar && !isPreviewMode && (
            <div
              ref={toolbarRef}
              className="fixed top-4 right-4 z-50 bg-background/95 backdrop-blur-sm border-2 border-border rounded-xl shadow-xl p-3 transition-all duration-300 ease-out"
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
                    onClick={() => onSave(updateLog)}
                    className="h-8 px-2 text-xs bg-gradient-to-r from-accent-pink to-accent-purple text-white"
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Editor Stats and Tips */}
          <div className="bg-muted/20 border border-border/50 rounded-xl p-4">
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
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-gradient-to-r from-muted/20 to-muted/10 border-t-2 border-border/30 -mx-6 px-8 py-6 mt-8 rounded-b-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-accent-pink rounded-full"></div>
              <span className="text-muted-foreground">
                {updateLog.id ? (
                  <>Last saved: <span className="font-medium text-foreground">{updateLog.date}</span></>
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
              onClick={() => onSave(updateLog)}
              className="bg-gradient-to-r from-accent-pink to-accent-purple text-white font-semibold shadow-md transition-all duration-200 focus:ring-2 focus:ring-accent-pink/20 focus:outline-hidden order-1 sm:order-3"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateLog.id ? 'Save Changes' : 'Create Update Log'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 