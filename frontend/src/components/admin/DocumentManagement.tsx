import React from 'react';
import { Edit3, Trash2, Tags, Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Document, DocumentCategory } from '@/types';
import { DocumentSectionCards } from './DocumentSectionCards';

interface DocumentManagementProps {
  documents: Document[];
  documentCategories: DocumentCategory[];
  activeDocumentSection: 'checklist-creation' | 'checking-guide' | 'all';
  onSectionChange: (section: 'checklist-creation' | 'checking-guide' | 'all') => void;
  onEditDocument: (document: Document) => void;
  onDeleteDocument: (documentId: string) => void;
  onCreateNew: () => void;
  isEditMode: boolean;
}

export const DocumentManagement: React.FC<DocumentManagementProps> = ({
  documents,
  documentCategories,
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
    return documents.filter(doc => {
      if (activeDocumentSection === 'checklist-creation') {
        return doc.tags.some(tag => 
          tag.toLowerCase().includes('checklist') || 
          tag.toLowerCase().includes('creation') ||
          tag.toLowerCase().includes('guide') ||
          doc.category === 'checklist-creation'
        );
      } else if (activeDocumentSection === 'checking-guide') {
        return doc.tags.some(tag => 
          tag.toLowerCase().includes('checking') || 
          tag.toLowerCase().includes('verification') ||
          tag.toLowerCase().includes('validation') ||
          doc.category === 'checking-guide'
        );
      }
      return false;
    });
  };

  const sectionDocuments = getSectionDocuments();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Document Management</h2>
        <div className="flex gap-2">
          <Button onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            New Document
          </Button>
        </div>
      </div>

      {/* Document Sections */}
      {!isEditMode && (
        <DocumentSectionCards
          documents={documents}
          activeSection={activeDocumentSection}
          onSectionChange={onSectionChange}
        />
      )}

      {!isEditMode && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {sectionDocuments.map(document => (
              <div key={document.id} className="doax-card p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{document.title}</h3>
                      {!document.isPublished && (
                        <Badge variant="secondary" className="text-xs">Draft</Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {documentCategories.find(cat => cat.id === document.category)?.name || document.category}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {document.content.split('\n').find(line => line.trim() && !line.startsWith('#'))?.slice(0, 150)}
                      {document.content.length > 150 && '...'}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {document.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tags className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {document.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{document.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Last updated: {document.updatedAt} by {document.author}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditDocument(document)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeleteDocument(document.id)}
                      className="text-red-600 border-red-200 focus:ring-2 focus:ring-red-100 focus:outline-hidden transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {sectionDocuments.length === 0 && (
            <div className="doax-card p-8 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documents yet</h3>
              <p className="text-muted-foreground mb-4">Create your first document to get started</p>
              <Button onClick={onCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Create Document
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 