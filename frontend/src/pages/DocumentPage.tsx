import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, FileText, Tags, Calendar, User, ArrowLeft,
<<<<<<< Updated upstream
  Edit3, X, Eye, CheckSquare, ListChecks, BookOpen,
  CheckCircle2, AlertCircle, AlertTriangle, Info
=======
  Edit3, X, Eye, CheckSquare, BookOpen,
  CheckCircle2, AlertCircle, AlertTriangle, Info, Image as ImageIcon
>>>>>>> Stashed changes
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { Container, Stack, Inline, StatusBadge, Grid } from '@/components/ui/spacing';
import { SaveButton } from '@/components/ui/loading';
import { useDocuments } from '@/hooks';
import { safeNormalizeTags, safeToString } from '@/services/utils';
import UnifiedFilter, { FilterField, SortOption as UnifiedSortOption } from '@/components/features/UnifiedFilter';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useDebounce } from '@/hooks';

type ViewMode = DocumentViewMode;
type ActiveSection = DocumentSectionType;

interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
}

export default function DocumentPage() {
  const { documents, updateDocument } = useDocuments();
  useAccessibility();
  const [activeSection, setActiveSection] = useState<ActiveSection>('checklist-creation');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterValues, setFilterValues] = useState<Record<string, string | number | boolean>>({
    search: '',
    category: '',
    author: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  // Debounce search to improve performance
  const debouncedSearch = useDebounce(filterValues.search, 500);

  // Notification management
  const addNotification = useCallback((notification: Omit<NotificationState, 'id' | 'timestamp'>) => {
    const newNotification: NotificationState = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration (except for loading notifications)
    if (notification.duration !== undefined && notification.duration > 0 && notification.type !== 'loading') {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, notification.duration);
    }

    // Return the ID so it can be used to remove the notification later
    return newNotification.id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);



  // Simple notification toast component
  const NotificationToast = ({ notification }: { notification: NotificationState }) => (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-xl border shadow-xl transition-all duration-300",
      "bg-background/90 backdrop-blur-md border-border/40",
      "hover:shadow-2xl hover:scale-[1.02] transform",
      "animate-in slide-in-from-right-5 fade-in duration-300"
    )}>
      <div className={cn(
        "shrink-0 mt-0.5 p-1.5 rounded-lg",
        notification.type === 'success' ? "bg-emerald-100/50 text-emerald-600" : "",
        notification.type === 'error' ? "bg-red-100/50 text-red-600" : "",
        notification.type === 'warning' ? "bg-amber-100/50 text-amber-600" : "",
        notification.type === 'info' ? "bg-blue-100/50 text-blue-600" : "",
        notification.type === 'loading' ? "bg-blue-100/50 text-blue-600" : ""
      )}>
        {notification.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
        {notification.type === 'error' && <AlertCircle className="w-4 h-4" />}
        {notification.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
        {notification.type === 'info' && <Info className="w-4 h-4" />}
        {notification.type === 'loading' && (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground leading-tight">{notification.title}</h4>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{notification.message}</p>
      </div>
      {notification.type !== 'loading' && (
        <button
          onClick={() => removeNotification(notification.id)}
          className={cn(
            "shrink-0 p-1.5 rounded-lg transition-all duration-200",
            "bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground",
            "focus:ring-2 focus:ring-border/50 focus:outline-none",
            "hover:scale-110 active:scale-95"
          )}
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  // Memoized filter values that include debounced search
  const filterValuesWithDebouncedSearch = useMemo(() => ({
    ...filterValues,
    search: debouncedSearch
  } as Record<string, string | number | boolean>), [filterValues, debouncedSearch]);

  const documentSections: DocumentSectionInfo[] = [
    {
      id: 'checklist-creation',
      title: 'Checklist Creation',
      icon: CheckSquare,
      description: 'Comprehensive guides for creating effective checklists and task management',
      status: 'active'
    },
    {
      id: 'checking-guide',
      title: 'Verification Guide',
      icon: ListChecks,
      description: 'Step-by-step procedures for verification and validation processes',
      status: 'active'
    }
  ];

  // Filter documents based on active section
  const getSectionDocuments = useCallback(() => {
    return documents.filter(doc => {
      const tags = safeNormalizeTags(doc.tags);
      
      if (activeSection === 'checklist-creation') {
        return tags.some(tag => {
          const tagStr = safeToString(tag).toLowerCase();
          return tagStr.includes('checklist') || 
                 tagStr.includes('creation') ||
                 tagStr.includes('guide');
        }) || doc.category === 'checklist-creation';
      } else if (activeSection === 'checking-guide') {
        return tags.some(tag => {
          const tagStr = safeToString(tag).toLowerCase();
          return tagStr.includes('checking') || 
                 tagStr.includes('verification') ||
                 tagStr.includes('validation');
        }) || doc.category === 'checking-guide';
      }
      return false;
    });
  }, [documents, activeSection]);

  const filteredDocuments = useMemo(() => {
    const sectionDocuments = getSectionDocuments();
    const filtered = sectionDocuments.filter(doc => {
      const tags = safeNormalizeTags(doc.tags);
      
      const searchTerm = String(filterValuesWithDebouncedSearch.search || '').toLowerCase();
      const matchesSearch = !searchTerm ||
        doc.title.toLowerCase().includes(searchTerm) ||
        doc.content.toLowerCase().includes(searchTerm) ||
        tags.some(tag => safeToString(tag).toLowerCase().includes(searchTerm));
      
      const matchesCategory = !filterValuesWithDebouncedSearch.category || filterValuesWithDebouncedSearch.category === 'all' || doc.category === filterValuesWithDebouncedSearch.category;
      const authorValue = String(filterValuesWithDebouncedSearch.author || '');
      const matchesAuthor = !authorValue || doc.author.toLowerCase().includes(authorValue.toLowerCase());

      return matchesSearch && matchesCategory && matchesAuthor;
    });

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
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
  }, [filterValuesWithDebouncedSearch, sortBy, sortDirection, getSectionDocuments]);

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

    // Show loading notification
    const loadingNotificationId = addNotification({
      type: 'loading',
      title: 'Saving Document',
      message: 'Please wait while we save your changes...'
    });

    setIsSaving(true);
    try {
      // Validate content before saving
      if (!editedContent || editedContent.trim() === '') {
        throw new Error('Document content cannot be empty');
      }

      // Additional content validation
      const trimmedContent = editedContent.trim();
      if (trimmedContent.length > 50000) {
        throw new Error('Document content is too long (maximum 50,000 characters)');
      }

      // Try to validate TipTap JSON format if it looks like JSON
      if (trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) {
        try {
          const parsed = JSON.parse(trimmedContent);
          if (!parsed.type || parsed.type !== 'doc') {
            throw new Error('Invalid document format: TipTap document must have type "doc"');
          }
          if (!Array.isArray(parsed.content)) {
            throw new Error('Invalid document format: TipTap document content must be an array');
          }
        } catch (parseError) {
          if (parseError instanceof SyntaxError) {
            throw new Error('Invalid JSON format in document content');
          }
          throw parseError;
        }
      }

      // Update the document using the context - AWAIT the promise
      await updateDocument(selectedDocument.id.toString(), { content: editedContent });

      // Update selected document
      setSelectedDocument(prev => prev ? { ...prev, content: editedContent } : null);
      setIsEditMode(false);

      // Remove loading notification and show success
      removeNotification(loadingNotificationId);
      addNotification({
        type: 'success',
        title: 'Document Saved',
        message: `"${selectedDocument.title || 'Document'}" has been successfully saved.`,
        duration: 4000
      });
    } catch (error: any) {
      console.error('Error saving document:', error);

      // Remove loading notification
      removeNotification(loadingNotificationId);

      // Determine error type and show appropriate message
      let errorTitle = 'Save Failed';
      let errorMessage = 'Failed to save document. Please try again.';

      if (error?.message?.includes('empty')) {
        errorTitle = 'Validation Error';
        errorMessage = error.message;
      } else if (error?.message?.includes('Network Error') || error?.message?.includes('fetch')) {
        errorTitle = 'Network Error';
        errorMessage = 'Unable to connect to server. Please check your connection and try again.';
      } else if (error?.message?.includes('validation') || error?.status === 400) {
        errorTitle = 'Validation Error';
        errorMessage = 'Invalid document data. Please check your content and try again.';
      } else if (error?.status === 401) {
        errorTitle = 'Authorization Error';
        errorMessage = 'You are not authorized to save this document.';
      } else if (error?.status === 404) {
        errorTitle = 'Not Found';
        errorMessage = 'Document not found. It may have been deleted. Please refresh the page.';
      } else if (error?.status === 409) {
        errorTitle = 'Conflict Error';
        errorMessage = 'Document conflict detected. Please refresh and try again.';
      } else if (error?.status >= 500) {
        errorTitle = 'Server Error';
        errorMessage = 'Server error occurred. Please try again later or contact support.';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      addNotification({
        type: 'error',
        title: errorTitle,
        message: errorMessage,
        duration: 8000
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Optimized event handlers with useCallback
  const handleFilterChange = useCallback((key: string, value: string | number | boolean) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSortChange = useCallback((newSortBy: string, newDirection: SortDirection) => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
  }, []);

  const clearFilters = useCallback(() => {
    setFilterValues({
      search: '',
      category: '',
      author: ''
    });
  }, []);

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
      key: 'author',
      label: 'Author',
      type: 'text',
      placeholder: 'Filter by author...',
      icon: <User className="w-3 h-3 mr-1" />,
    }
  ], []);

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

  // Enhanced List View Component with better performance and visual hierarchy
  const ListView = () => (
    <Stack spacing="md">
      {/* Unified Filter */}
      <UnifiedFilter
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filterFields={filterFields}
        sortOptions={sortOptions}
        filterValues={filterValuesWithDebouncedSearch}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        resultCount={filteredDocuments.length}
        accentColor="accent-cyan"
        secondaryColor="accent-purple"
        headerIcon={<FileText className="w-4 h-4" />}
      />

      {/* Document Grid */}
      {filteredDocuments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <motion.div
            className="w-32 h-32 bg-gradient-to-br from-accent-pink/10 to-accent-purple/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-accent-cyan/20"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <FileText className="w-16 h-16 text-accent-cyan/50" />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-300 mb-3">No documents found</h3>
          <p className="text-muted-foreground mb-6">
            {debouncedSearch ?
              'Try adjusting your search terms or clear the search to see all documents.' :
              'Try adjusting your filters or clear them to see all documents.'
            }
          </p>
          <Button
            onClick={clearFilters}
            className="bg-gradient-to-r from-accent-pink to-accent-purple hover:from-accent-pink/90 hover:to-accent-purple/90 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg"
          >
            Clear All Filters
          </Button>
        </motion.div>
      ) : (
        <Grid cols={1} gap="lg" className="max-w-none">
          {filteredDocuments.map((document, index) => (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.15,
                delay: Math.min(index * 0.02, 0.1) // Limit max delay to 0.1s
              }}
            >
              <Card
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:border-accent-pink/30 overflow-hidden rounded-2xl"
                onClick={() => handleDocumentClick(document)}
              >
                <CardContent className="p-6">
                  <Inline align="between" className="mb-4">
                    <div className="flex-1">
                      <Inline spacing="md" className="mb-3">
                        <h3 className="text-xl font-bold text-foreground group-hover:text-accent-pink transition-colors">
                          {document.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs px-2 py-1",
                            documentCategoriesData.find(cat => cat.id === document.category)?.color || 'text-muted-foreground border-border/30 bg-muted/10'
                          )}
                        >
                          {documentCategoriesData.find(cat => cat.id === document.category)?.name || document.category}
                        </Badge>
                      </Inline>

                      <p className="text-muted-foreground leading-relaxed text-base mb-4 line-clamp-2">
                        {extractPlainText(document.content).slice(0, 200)}
                        {extractPlainText(document.content).length > 200 && '...'}
                      </p>

                      {document.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {document.tags.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs bg-accent-cyan/5 border-accent-cyan/20 text-accent-cyan">
                              <Tags className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {document.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs bg-muted/10">
                              +{document.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <Inline spacing="lg" className="text-sm text-muted-foreground">
                        <Inline spacing="sm">
                          <User className="w-4 h-4 text-accent-purple" />
                          <span className="font-medium">{document.author}</span>
                        </Inline>
                        <Inline spacing="sm">
                          <Calendar className="w-4 h-4 text-accent-cyan" />
                          <span>Updated {document.updated_at}</span>
                        </Inline>
                      </Inline>
                    </div>

                    <div className="ml-6 text-accent-cyan group-hover:text-accent-pink transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                  </Inline>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Grid>
      )}
    </Stack>
  );

  // Enhanced Document View Component with improved visual hierarchy
  const DocumentView = () => (
    <Stack spacing="md">
      {/* Header Card with Navigation and Actions */}
      <Card className="rounded-2xl">
        <CardContent className="p-6">
          <Inline align="between" className="mb-4">
            <Button
              onClick={handleBackToList}
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
                    onClick={handleSaveDocument}
                    className="px-6 py-3"
                  >
                    Save Changes
                  </SaveButton>
                  <Button
                    onClick={handleEditToggle}
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
                  onClick={handleEditToggle}
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
                  {selectedDocument?.title}
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
                    documentCategoriesData.find(cat => cat.id === selectedDocument?.category)?.color || 'text-muted-foreground border-border/30 bg-muted/10'
                  )}
                >
                  {documentCategoriesData.find(cat => cat.id === selectedDocument?.category)?.name || selectedDocument?.category}
                </Badge>
              </Inline>

              {selectedDocument?.tags && selectedDocument.tags.length > 0 && (
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
                  <span className="font-medium">By {selectedDocument?.author}</span>
                </Inline>
                <Inline spacing="sm">
                  <Calendar className="w-5 h-5 text-accent-cyan" />
                  <span>Created {selectedDocument?.created_at}</span>
                </Inline>
                <Inline spacing="sm">
                  <Calendar className="w-5 h-5 text-accent-pink" />
                  <span>Updated {selectedDocument?.updated_at}</span>
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
                onChange={setEditedContent}
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
                content={selectedDocument?.content || ''}
                onChange={() => {}}
                editable={false}
                showToolbar={false}
                className="border-0 p-0 bg-transparent min-h-[300px]"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </Stack>
  );

  const renderSectionContent = () => {
    if (viewMode === 'document' && selectedDocument) {
      return <DocumentView />;
    }
    return <ListView />;
  };

  return (
    <Container>
      {/* Compact Header */}
      <div className="mb-6 mt-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-pink to-accent-purple bg-clip-text text-transparent">
            Documentation Center
          </h1>
          <StatusBadge status="success" className="px-3 py-1 text-sm">
            <BookOpen className="w-4 h-4 mr-1" />
            {filteredDocuments.length} Docs
          </StatusBadge>
        </div>
        <p className="text-muted-foreground text-sm">
          Comprehensive guides and tutorials for DOAX Venus Vacation handbook management
        </p>
      </div>

      {/* Compact Section Navigation */}
      <Card className="p-4 mb-5 rounded-2xl">
        <CardContent className="p-0">
          <div className="flex gap-3">
            {documentSections.map(section => {
              const IconComponent = section.icon;
              const isActive = activeSection === section.id;
              return (
                <motion.button
                  key={section.id}
                  onClick={() => {
                    setActiveSection(section.id);
                    setViewMode('list');
                    setSelectedDocument(null);
                    setIsEditMode(false);
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={cn(
                    'flex-1 px-5 py-4 rounded-xl transition-all duration-200 flex items-center gap-3 font-medium group',
                    'focus:ring-2 focus:ring-accent-cyan/20 focus:outline-hidden',
                    'border transition-all min-h-[64px]',
                    isActive
                      ? 'bg-gradient-to-r from-accent-pink to-accent-purple text-white shadow-lg border-accent-pink/50'
                      : 'bg-card/50 text-muted-foreground hover:text-foreground border-border/30 hover:border-accent-cyan/30 hover:bg-card/80 hover:shadow-md'
                  )}
                >
                  <div className={cn(
                    'p-2.5 rounded-xl transition-all flex-shrink-0',
                    isActive
                      ? 'bg-white/20'
                      : 'bg-accent-cyan/10 group-hover:bg-accent-cyan/20'
                  )}>
                    <IconComponent className={cn(
                      'w-5 h-5 transition-colors',
                      isActive ? 'text-white' : 'text-accent-cyan'
                    )} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <h3 className="text-sm font-semibold mb-1 truncate">{section.title}</h3>
                    <p className={cn(
                      'text-xs leading-relaxed line-clamp-2',
                      isActive ? 'text-white/80' : 'text-muted-foreground'
                    )}>
                      {section.description}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Content with Enhanced Animations */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeSection}-${viewMode}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {renderSectionContent()}
        </motion.div>
      </AnimatePresence>

      {/* Notifications - Always visible on scroll */}
      <div className="fixed top-20 right-4 z-[9999] space-y-3 max-w-md pointer-events-none">
        <div className="pointer-events-auto">
          <AnimatePresence>
            {notifications.map(notification => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: 100, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <NotificationToast notification={notification} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </Container>
  );
} 