import React, { useMemo } from 'react';
import { Trash2, Plus, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Document, DocumentCategory, DocumentType } from '@/types';
import { DocumentSectionCards } from './DocumentSectionCards';
import { OptimizedCardGrid } from '@/components/ui/optimized-card-grid';
import { generateDocumentCategory, generateDocumentTags, extractContentText, formatDisplayDateTime } from '@/services/utils';

export interface DocumentManagementProps {
  documents: Document[];
  documentCategories: DocumentCategory[];
  activeDocumentSection: 'checklist' | 'guide' | 'tutorial' | 'all';
  onSectionChange: (section: 'checklist' | 'guide' | 'tutorial' | 'all') => void;
  onEditDocument: (document: Document) => void;
  onDeleteDocument: (documentId: number) => void;
  onCreateNew: (documentType?: DocumentType) => void;
  isEditMode: boolean;
}

export const DocumentManagement: React.FC<DocumentManagementProps> = ({
  documents,

  activeDocumentSection,
  onSectionChange,
  onEditDocument,
  onDeleteDocument,
  onCreateNew,
  isEditMode
}) => {
  // Filter documents based on active section
  const getSectionDocuments = () => {
    if (activeDocumentSection === 'all') {
      return documents;
    }
    return documents.filter(doc => doc.document_type === activeDocumentSection);
  };

  const sectionDocuments = getSectionDocuments();

  // Memoized document card renderer for virtual scrolling
  const renderDocumentCard = useMemo(() => (document: Document, index: number) => (
    <motion.div
      className="doax-card p-4 cursor-pointer transition-all duration-200 focus-within:ring-2 focus-within:ring-accent-cyan/20 focus-within:outline-none"
      onClick={() => onEditDocument(document)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEditDocument(document);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Edit document: ${document.title_en || document.title || 'Untitled Document'}`}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold truncate">{document.title_en || document.title || 'Untitled Document'}</h3>
            <Badge variant="outline" className="text-xs shrink-0">
              {generateDocumentCategory(document)}
            </Badge>
          </div>
          <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
            {document.summary_en || extractContentText(document.content_json_en).slice(0, 150)}
            {(document.summary_en && document.summary_en.length > 150) ||
             (extractContentText(document.content_json_en).length > 150) ? '...' : ''}
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            {(() => {
              const tags = generateDocumentTags(document);
              return (
                <>
                  {tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{tags.length - 3}
                    </Badge>
                  )}
                </>
              );
            })()}
          </div>
          <div className="text-sm text-muted-foreground">
            <BookOpen className="w-4 h-4 inline mr-1" />
            Last updated: {formatDisplayDateTime(document.updated_at)}
          </div>
        </div>
        <div className="flex gap-2 ml-4 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteDocument(document.id);
            }}
            className="text-red-600 border-red-200 focus:ring-2 focus:ring-red-100 focus:outline-none transition-colors duration-200"
            aria-label={`Delete document: ${document.title_en || document.title || 'Untitled Document'}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  ), [onEditDocument, onDeleteDocument]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Document Management</h2>
        <div className="text-sm text-muted-foreground">
          {sectionDocuments.length} {activeDocumentSection === 'all' ? 'total' : activeDocumentSection} document{sectionDocuments.length !== 1 ? 's' : ''}
        </div>
      </div>

      {!isEditMode && (
        <>
          {/* Document Sections */}
          <DocumentSectionCards
            documents={documents}
            activeSection={activeDocumentSection}
            onSectionChange={onSectionChange}
          />

          {/* Virtual Scrolling Document Grid */}
          <OptimizedCardGrid
            items={sectionDocuments}
            renderCard={renderDocumentCard}
            className="admin-card-grid"
            itemsPerPage={20}
            enableLazyLoading={true}
            gridCols={{ mobile: 1, tablet: 1, desktop: 1 }}
            gap="sm"
            enableAnimations={true}
          />

          {/* Empty State */}
          {sectionDocuments.length === 0 && (
            <div className="doax-card p-8 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
              <p className="text-muted-foreground mb-4">Create your first document to get started</p>
              <Button onClick={() => onCreateNew()}>
                <Plus className="w-4 h-4 mr-2" />
                Create Document
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}; 