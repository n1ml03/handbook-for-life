import { useMemo } from 'react';
import { CheckSquare, FileText, BookOpen, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container, StatusBadge } from '@/components/ui/spacing';
import { DocumentSectionInfo } from '@/types';
import { useAccessibility } from '@/hooks/useAccessibility';
import { useNotifications } from '@/hooks/useNotifications';
import { useDocumentPage } from '@/hooks/useDocumentPage';
import { NotificationToast } from '@/components/ui/NotificationToast';
import { ListView } from '@/components/pages/document/ListView';
import { DocumentView } from '@/components/pages/document/DocumentView';
import { DocumentSectionNavigation } from '@/components/pages/document/DocumentSectionNavigation';

export default function DocumentPage() {
  useAccessibility();
  const { notifications, addNotification, removeNotification } = useNotifications();
  
  const {
    // State
    activeSection,
    selectedDocument,
    viewMode,
    showFilters,
    sortBy,
    sortDirection,
    filterValues,
    isEditMode,
    editedContent,
    editedJsonContent,
    isSaving,
    debouncedSearch,
    sectionDocuments,
    
    // Actions
    setShowFilters,
    handleDocumentClick,
    handleBackToList,
    handleEditToggle,
    handleSaveDocument,
    handleOnContentChange,
    handleOnJsonContentChange,
    handleFilterChange,
    handleSortChange,
    clearFilters,
    handleSectionChange
  } = useDocumentPage();

  // Document sections configuration
  const documentSections: DocumentSectionInfo[] = useMemo(() => [
    {
      id: 'checklist-creation',
      title: 'Checklists',
      icon: CheckSquare,
      status: 'active'
    },
    {
      id: 'checking-guide',
      title: 'Guides',
      icon: FileText,
      status: 'active'
    },
    {
      id: 'tutorial',
      title: 'Tutorial',
      icon: GraduationCap,
      status: 'active'
    }
  ], []);

  // Enhanced save handler with notifications
  const handleSaveWithNotifications = async () => {
    const loadingNotificationId = addNotification({
      type: 'loading',
      title: 'Saving Document',
      message: 'Please wait while we save your changes...'
    });

    const result = await handleSaveDocument();

    // Remove loading notification
      removeNotification(loadingNotificationId);

    if (result.success) {
      addNotification({
        type: 'success',
        title: 'Document Saved',
        message: `"${selectedDocument?.title || 'Document'}" has been successfully saved.`,
        duration: 4000
      });
    } else {
      // Determine error title based on error type
      let errorTitle = 'Save Failed';
      switch (result.errorType) {
        case 'validation':
        errorTitle = 'Validation Error';
          break;
        case 'network':
        errorTitle = 'Network Error';
          break;
        case 'auth':
        errorTitle = 'Authorization Error';
          break;
        case 'notfound':
        errorTitle = 'Not Found';
          break;
        case 'conflict':
        errorTitle = 'Conflict Error';
          break;
        case 'server':
        errorTitle = 'Server Error';
          break;
      }

      addNotification({
        type: 'error',
        title: errorTitle,
        message: result.error || 'An unknown error occurred',
        duration: 8000
      });
    }
  };

  // Render section content based on view mode
  const renderSectionContent = () => {
    if (viewMode === 'document' && selectedDocument) {
      return (
        <DocumentView
          selectedDocument={selectedDocument}
          isEditMode={isEditMode}
          editedContent={editedContent}
          isSaving={isSaving}
          documentSections={documentSections}
          activeSection={activeSection}
          onBackToList={handleBackToList}
          onEditToggle={handleEditToggle}
          onSaveDocument={handleSaveWithNotifications}
          onContentChange={handleOnContentChange}
          onJsonContentChange={handleOnJsonContentChange}
        />
      );
    }
    
    return (
      <ListView
        documents={sectionDocuments}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
        filterValues={filterValues}
          onFilterChange={handleFilterChange}
          onClearFilters={clearFilters}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
        onDocumentClick={handleDocumentClick}
        debouncedSearch={String(debouncedSearch)}
      />
    );
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
            {sectionDocuments.length} Docs
          </StatusBadge>
        </div>
        <p className="text-muted-foreground text-sm">
          Comprehensive guides and tutorials for DOAX Venus Vacation handbook management
        </p>
      </div>

      {/* Section Navigation */}
      <DocumentSectionNavigation
        documentSections={documentSections}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

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

      {/* Notifications - Fixed positioned */}
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
                <NotificationToast 
                  notification={notification} 
                  onRemove={removeNotification}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </Container>
  );
} 
