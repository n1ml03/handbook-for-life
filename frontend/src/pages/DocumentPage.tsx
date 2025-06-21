import { useState, useEffect, useMemo } from 'react';
import { Search, FileText, Tags, Calendar, User, ArrowLeft, Edit3, X, Eye, CheckSquare, ListChecks } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/services/utils';
import { 
  documentCategoriesData, 
  type Document, 
  type DocumentViewMode, 
  type DocumentSection as DocumentSectionType, 
  type DocumentSectionInfo,
  type SortDirection
} from '@/types';
import TiptapEditor from '@/components/features/TiptapEditor';
import { Container, Section, Stack, Inline, StatusBadge } from '@/components/ui/spacing';
import { SaveButton } from '@/components/ui/loading';
import { useDocuments } from '@/contexts/DocumentsContext';
import UnifiedFilter, { FilterField, SortOption as UnifiedSortOption } from '@/components/features/UnifiedFilter';

type ViewMode = DocumentViewMode;
type ActiveSection = DocumentSectionType;

export default function DocumentPage() {
  const { documents, updateDocument } = useDocuments();
  const [activeSection, setActiveSection] = useState<ActiveSection>('checklist-creation');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterValues, setFilterValues] = useState<Record<string, any>>({
    search: '',
    category: '',
    status: '',
    author: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const documentSections: DocumentSectionInfo[] = [
    {
      id: 'checklist-creation',
      title: 'Checklist Creation Guide',
      icon: CheckSquare,
      description: 'Comprehensive guides for creating effective checklists',
      status: 'active'
    },
    {
      id: 'checking-guide',
      title: 'Checking Guide',
      icon: ListChecks,
      description: 'Step-by-step procedures for verification and validation',
      status: 'active'
    }
  ];

  // Filter documents based on active section
  const getSectionDocuments = () => {
    return documents.filter(doc => {
      if (activeSection === 'checklist-creation') {
        return doc.tags.some(tag => 
          tag.toLowerCase().includes('checklist') || 
          tag.toLowerCase().includes('creation') ||
          tag.toLowerCase().includes('guide') ||
          doc.category === 'checklist-creation'
        );
      } else if (activeSection === 'checking-guide') {
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

  const filteredDocuments = useMemo(() => {
    const sectionDocuments = getSectionDocuments();
    const filtered = sectionDocuments.filter(doc => {
      const searchTerm = (filterValues.search || '').toLowerCase();
      const matchesSearch = !searchTerm ||
        doc.title.toLowerCase().includes(searchTerm) ||
        doc.content.toLowerCase().includes(searchTerm) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm));
      
      const matchesCategory = !filterValues.category || filterValues.category === 'all' || doc.category === filterValues.category;
      const matchesStatus = !filterValues.status || filterValues.status === 'all' ||
                           (filterValues.status === 'published' && doc.isPublished) ||
                           (filterValues.status === 'draft' && !doc.isPublished);
      const matchesAuthor = !filterValues.author || doc.author.toLowerCase().includes(filterValues.author.toLowerCase());
      
      return matchesSearch && matchesCategory && matchesStatus && matchesAuthor;
    });

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'author':
          comparison = a.author.localeCompare(b.author);
          break;
      }
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [documents, activeSection, filterValues, sortBy, sortDirection]);

  const handleDocumentClick = (document: Document) => {
    setSelectedDocument(document);
    setEditedContent(document.content);
    setViewMode('document');
    setIsEditMode(false);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedDocument(null);
    setIsEditMode(false);
    setEditedContent('');
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel edit mode
      setIsEditMode(false);
      setEditedContent(selectedDocument?.content || '');
    } else {
      // Enter edit mode
      setIsEditMode(true);
      setEditedContent(selectedDocument?.content || '');
    }
  };

  const handleSaveDocument = async () => {
    if (!selectedDocument) return;

    setIsSaving(true);
    try {
      // Update the document using the context
      updateDocument(selectedDocument.id, { content: editedContent });
      
      // Update selected document
      setSelectedDocument(prev => prev ? { ...prev, content: editedContent } : null);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error saving document:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (newSortBy: string, newDirection: SortDirection) => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
  };

  const clearFilters = () => {
    setFilterValues({
      search: '',
      category: '',
      status: '',
      author: ''
    });
  };

  // Filter configuration for UnifiedFilter
  const filterFields: FilterField[] = useMemo(() => [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search documents, content, or tags...',
      icon: <Search className="w-3 h-3 mr-1" />,
    },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      placeholder: 'All Categories',
      options: [
        { value: 'all', label: 'All Categories' },
        ...documentCategoriesData.map(cat => ({ value: cat.id, label: cat.name }))
      ],
      icon: <Tags className="w-3 h-3 mr-1" />,
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      placeholder: 'All Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'published', label: 'Published' },
        { value: 'draft', label: 'Draft' }
      ],
      icon: <FileText className="w-3 h-3 mr-1" />,
    },
    {
      key: 'author',
      label: 'Author',
      type: 'text',
      placeholder: 'Filter by author...',
      icon: <User className="w-3 h-3 mr-1" />,
    }
  ], [documentCategoriesData]);

  // Sort options for UnifiedFilter
  const sortOptions: UnifiedSortOption[] = [
    { key: 'date', label: 'Date' },
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'author', label: 'Author' }
  ];

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (viewMode === 'document') {
          handleBackToList();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode]);



  const extractPlainText = (content: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  // List View Component
  const ListView = () => (
    <>
      {/* Unified Filter */}
      <UnifiedFilter
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filterFields={filterFields}
        sortOptions={sortOptions}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        resultCount={filteredDocuments.length}
        accentColor="accent-cyan"
        secondaryColor="accent-purple"
        blackTheme={true}
        headerIcon={<FileText className="w-4 h-4" />}
      />

      {/* Document Grid */}
      <div className="space-y-6">
        {filteredDocuments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <motion.div
              className="w-24 h-24 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-accent-cyan/20"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <FileText className="w-12 h-12 text-accent-cyan/60" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-300 mb-3">No documents found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              We couldn't find any documents for {documentSections.find(s => s.id === activeSection)?.title}. Try adjusting your search criteria or switch to another section.
            </p>
            <motion.button
              onClick={clearFilters}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-accent-pink to-accent-purple hover:from-accent-pink/90 hover:to-accent-purple/90 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg"
            >
              Clear All Filters
            </motion.button>
          </motion.div>
        ) : (
          filteredDocuments.map((document) => (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="doax-card overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group"
              onClick={() => handleDocumentClick(document)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="text-xl font-semibold text-foreground group-hover:text-accent-pink transition-colors">
                        {document.title}
                      </h3>
                      {!document.isPublished && (
                        <Badge variant="secondary" className="text-xs">Draft</Badge>
                      )}
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs",
                          documentCategoriesData.find(cat => cat.id === document.category)?.color || 'text-gray-400 border-gray-400/30 bg-gray-400/10'
                        )}
                      >
                        {documentCategoriesData.find(cat => cat.id === document.category)?.name || document.category}
                      </Badge>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-muted-foreground leading-relaxed line-clamp-3">
                        {extractPlainText(document.content).slice(0, 300)}
                        {extractPlainText(document.content).length > 300 && '...'}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {document.tags.slice(0, 5).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tags className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {document.tags.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{document.tags.length - 5} more
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{document.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Updated {document.updatedAt}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-6 text-accent-cyan group-hover:text-accent-pink transition-colors">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </>
  );

  // Document View Component
  const DocumentView = () => (
    <Container>
      <Card>
        <Inline align="between" className="mb-6">
          <Button
            onClick={handleBackToList}
            variant="outline"
            className="px-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {documentSections.find(s => s.id === activeSection)?.title}
          </Button>

          <Inline spacing="sm">
            {isEditMode ? (
              <>
                <SaveButton
                  isSaving={isSaving}
                  onClick={handleSaveDocument}
                >
                  Save Changes
                </SaveButton>
                <Button
                  onClick={handleEditToggle}
                  variant="outline"
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={handleEditToggle}
                variant="outline"
                className="hover:bg-accent-pink/10 hover:text-accent-pink"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Document
              </Button>
            )}
          </Inline>
        </Inline>

        <Stack spacing="lg">
          <div>
            <Inline spacing="md" className="mb-4">
              <h1 className="text-3xl font-bold text-foreground">
                {selectedDocument?.title}
              </h1>
              {!selectedDocument?.isPublished && (
                <Badge variant="secondary">Draft</Badge>
              )}
              {isEditMode && (
                <StatusBadge status="info">
                  <Edit3 className="w-3 h-3" />
                  Editing
                </StatusBadge>
              )}
              <Badge
                variant="outline"
                className={cn(
                  documentCategoriesData.find(cat => cat.id === selectedDocument?.category)?.color || 'text-gray-400 border-gray-400/30 bg-gray-400/10'
                )}
              >
                {documentCategoriesData.find(cat => cat.id === selectedDocument?.category)?.name || selectedDocument?.category}
              </Badge>
            </Inline>

            <Inline spacing="sm" wrap className="mb-4">
              {selectedDocument?.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tags className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </Inline>

            <Inline spacing="lg" className="text-sm text-muted-foreground">
              <Inline spacing="sm">
                <User className="w-4 h-4" />
                <span>{selectedDocument?.author}</span>
              </Inline>
              <Inline spacing="sm">
                <Calendar className="w-4 h-4" />
                <span>Created {selectedDocument?.createdAt}</span>
              </Inline>
              <Inline spacing="sm">
                <Calendar className="w-4 h-4" />
                <span>Updated {selectedDocument?.updatedAt}</span>
              </Inline>
            </Inline>
          </div>
        </Stack>
      </Card>

      <Card className={cn(
        "overflow-hidden transition-all duration-300",
        isEditMode ? "p-4" : "p-8"
      )}>
        {isEditMode ? (
          <Stack spacing="md">
            <Inline align="between" className="mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Edit Document Content
              </h3>
              <Inline spacing="sm" className="text-sm text-muted-foreground">
                <Eye className="w-4 h-4" />
                <span>Live preview available in editor</span>
              </Inline>
            </Inline>

            <TiptapEditor
              content={editedContent}
              onChange={setEditedContent}
              editable={true}
              placeholder="Start writing your document content..."
              showToolbar={true}
              showCharacterCount={true}
              showWordCount={true}
              mode="full"
              className="min-h-[400px]"
            />
          </Stack>
        ) : (
          <div className="prose prose-lg max-w-none">
            <TiptapEditor
              content={selectedDocument?.content || ''}
              onChange={() => {}}
              editable={false}
              showToolbar={false}
              className="border-0 p-0 bg-transparent min-h-[200px]"
            />
          </div>
        )}
      </Card>
    </Container>
  );

  const renderSectionContent = () => {
    if (viewMode === 'document' && selectedDocument) {
      return <DocumentView />;
    }
    return <ListView />;
  };

  return (
    <Container>
      {/* Header */}
      <Section
        title="Documentation Center"
        description="Comprehensive guides and tutorials for DOAX Venus Vacation"
        action={
          <StatusBadge status="success">
            {filteredDocuments.length} Documents Available
          </StatusBadge>
        }
      />

      {/* Section Navigation */}
      <Card className="p-2 mb-6">
        <Inline spacing="sm" wrap>
          {documentSections.map(section => {
            const IconComponent = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  setViewMode('list');
                  setSelectedDocument(null);
                  setIsEditMode(false);
                }}
                className={cn(
                  'flex-1 px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium min-w-0',
                  'focus:ring-2 focus:ring-accent-cyan/20 focus:outline-hidden',
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-accent-pink to-accent-purple text-white shadow-lg'
                    : 'bg-muted/50 text-muted-foreground'
                )}
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{section.title}</span>
                <span className="sm:hidden">{section.title.split(' ')[0]}</span>
              </button>
            );
          })}
        </Inline>
      </Card>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeSection}-${viewMode}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderSectionContent()}
        </motion.div>
      </AnimatePresence>
    </Container>
  );
} 