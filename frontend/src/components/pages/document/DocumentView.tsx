import React from 'react';
import { ArrowLeft, Edit3, X, Eye, User, Calendar, Tags, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/services/utils';
import { Stack, Inline, StatusBadge } from '@/components/ui/spacing';
import { SaveButton } from '@/components/ui/loading';
import { ScreenshotGallery } from '@/components/ui/ScreenshotGallery';
import { documentCategoriesData, type Document, type DocumentSectionInfo } from '@/types';
import TiptapEditor from '@/components/features/TiptapEditor';

interface DocumentViewProps {
  selectedDocument: Document;
  isEditMode: boolean;
  editedContent: string;
  isSaving: boolean;
  documentSections: DocumentSectionInfo[];
  activeSection: string;
  onBackToList: () => void;
  onEditToggle: () => void;
  onSaveDocument: () => void;
  onContentChange: (content: string) => void;
  onJsonContentChange?: (jsonContent: any) => void;
}

export const DocumentView: React.FC<DocumentViewProps> = ({
  selectedDocument,
  isEditMode,
  editedContent,
  isSaving,
  documentSections,
  activeSection,
  onBackToList,
  onEditToggle,
  onSaveDocument,
  onContentChange,
  onJsonContentChange
}) => {
  return (
    <Stack spacing="md">
      {/* Header Card with Navigation and Actions */}
      <Card className="rounded-2xl">
        <CardContent className="p-6">
          <Inline align="between" className="mb-4">
            <Button
              onClick={onBackToList}
              variant="outline"
              className="px-6 py-3 hover:bg-accent-cyan/10 hover:text-accent-cyan hover:border-accent-cyan/30"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {documentSections.find(s => s.id === activeSection)?.title}
            </Button>

            <Inline spacing="sm">
              {isEditMode ? (
                <>
                  <SaveButton
                    isSaving={isSaving}
                    onClick={onSaveDocument}
                    className="px-6 py-3"
                  >
                    Save Changes
                  </SaveButton>
                  <Button
                    onClick={onEditToggle}
                    variant="outline"
                    disabled={isSaving}
                    className="px-6 py-3"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={onEditToggle}
                  variant="outline"
                  className="px-6 py-3 hover:bg-accent-pink/10 hover:text-accent-pink hover:border-accent-pink/30"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Document
                </Button>
              )}
            </Inline>
          </Inline>

          {/* Document Header Information */}
          <Stack spacing="lg">
            <div>
              <Inline spacing="md" className="mb-6" wrap>
                <h1 className="text-4xl font-bold text-foreground bg-gradient-to-r from-accent-pink to-accent-purple bg-clip-text text-transparent">
                  {selectedDocument.title}
                </h1>
                {isEditMode && (
                  <StatusBadge status="info" className="px-3 py-1">
                    <Edit3 className="w-4 h-4 mr-1" />
                    Editing Mode
                  </StatusBadge>
                )}
                <Badge
                  variant="outline"
                  className={cn(
                    "text-sm px-4 py-2 font-medium",
                    documentCategoriesData.find(cat => cat.id === selectedDocument.category)?.color || 'text-muted-foreground border-border/30 bg-muted/10'
                  )}
                >
                  {documentCategoriesData.find(cat => cat.id === selectedDocument.category)?.name || selectedDocument.category}
                </Badge>
              </Inline>

              {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-6">
                  {selectedDocument.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-sm px-3 py-1 bg-accent-cyan/5 border-accent-cyan/20 text-accent-cyan">
                      <Tags className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <Inline spacing="lg" className="text-sm text-muted-foreground" wrap>
                <Inline spacing="sm">
                  <User className="w-5 h-5 text-accent-purple" />
                  <span className="font-medium">By {selectedDocument.author}</span>
                </Inline>
                <Inline spacing="sm">
                  <Calendar className="w-5 h-5 text-accent-cyan" />
                  <span>Created {selectedDocument.created_at}</span>
                </Inline>
                <Inline spacing="sm">
                  <Calendar className="w-5 h-5 text-accent-pink" />
                  <span>Updated {selectedDocument.updated_at}</span>
                </Inline>
              </Inline>
            </div>
          </Stack>
        </CardContent>
      </Card>

      {/* Content Card */}
      <Card className="overflow-hidden rounded-2xl">
        <CardContent className={cn(
          "transition-all duration-300",
          isEditMode ? "p-6" : "p-8"
        )}>
          {isEditMode ? (
            <Stack spacing="lg">
              <Inline align="between" className="mb-6">
                <h3 className="text-2xl font-semibold text-foreground">
                  Edit Document Content
                </h3>
                <Inline spacing="sm" className="text-sm text-muted-foreground">
                  <Eye className="w-4 h-4 text-accent-cyan" />
                  <span>Live preview available in editor</span>
                </Inline>
              </Inline>

              <TiptapEditor
                content={editedContent}
                onChange={onContentChange}
                onJsonChange={onJsonContentChange}
                editable={true}
                placeholder="Start writing your document content..."
                showToolbar={true}
                showCharacterCount={true}
                showWordCount={true}
                mode="full"
                className="min-h-[500px] border border-border/30 rounded-lg"
              />
            </Stack>
          ) : (
            <div className="prose prose-xl max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-accent-pink hover:prose-a:text-accent-purple">
              <TiptapEditor
                content={selectedDocument.content || ''}
                onChange={() => {}}
                editable={false}
                showToolbar={false}
                className="border-0 p-0 bg-transparent min-h-[300px]"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Screenshots Section */}
      {selectedDocument.screenshots_data && selectedDocument.screenshots_data.length > 0 && (
        <Card className="overflow-hidden rounded-2xl">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2 text-accent-pink" />
              Screenshots ({selectedDocument.screenshots_data.length})
            </h3>
            <ScreenshotGallery
              screenshots={selectedDocument.screenshots_data}
              columns={{ mobile: 1, tablet: 2, desktop: 3 }}
              showFilenames={true}
              enableLightbox={true}
              enableDownload={false}
              documentId={selectedDocument.id}
              useOptimizedUrls={true}
            />
          </CardContent>
        </Card>
      )}
    </Stack>
  );
};
