import React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { FileText, BookOpen, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/services/utils';
import { documentCategoriesData, type Document, type DocumentType, type DocumentCategory } from '@/types';
import { useUpdateLogs } from '@/hooks';
import { UpdateLog } from '@/types';
import { Container } from '@/components/ui/spacing';
import { Card, CardContent } from '@/components/ui/card';

import { useDocuments } from '@/hooks';
import { usePerformanceMonitor, useRenderPerformance } from '@/hooks/usePerformanceMonitor';
import {
  DocumentManagement,
  UpdateLogManagement,
  DocumentEditor,
  UpdateLogEditor,
  TestingToolsManagement,
  NotificationToast,
  AdminErrorBoundary,
  ContentTypeSelector,
  type NotificationState
} from '@/components/admin';

interface AdminSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  stats?: {
    count: number;
    label: string;
  };
}

const AdminPage = () => {
  // Performance monitoring
  const { measureOperation, stats } = usePerformanceMonitor();
  useRenderPerformance('AdminPage');

  const { documents, addDocument, updateDocument, deleteDocument, refreshDocuments } = useDocuments();
  const [documentCategories] = useState<DocumentCategory[]>(documentCategoriesData);
  const { updateLogs, addUpdateLog, updateUpdateLog, deleteUpdateLog, refreshUpdateLogs } = useUpdateLogs();
  
  const [activeTab, setActiveTab] = useState<string>('documents');
  const [activeDocumentSection, setActiveDocumentSection] = useState<'checklist' | 'guide' | 'tutorial' | 'all'>('all');
  const [editingLog, setEditingLog] = useState<UpdateLog | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [notifications, setNotifications] = useState<NotificationState[]>([]);
  const [isOperationLoading, setIsOperationLoading] = useState(false);

  // Enhanced editing state management
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Esc to exit focus mode
      if (event.key === 'Escape') {
        if (isFocusMode) {
          setIsFocusMode(false);
        }
      }
      // F10 for focus mode
      if (event.key === 'F10') {
        event.preventDefault();
        if (isEditMode) {
          setIsFocusMode(!isFocusMode);
        }
      }
    };

    if (isEditMode) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isEditMode, isFocusMode]);

  const adminSections: AdminSection[] = [
    {
      id: 'documents',
      title: 'Document Management',
      icon: FileText,
      color: 'text-accent-cyan',
    },
    {
      id: 'update-logs',
      title: 'Update Logs Management',
      icon: BookOpen,
      color: 'text-accent-purple',
    },
    {
      id: 'testing-tools',
      title: 'Testing Tools',
      icon: Settings,
      color: 'text-accent-gold',
    }
  ];

  // Common tag suggestions
  const commonTags = [
    'guide', 'beginner', 'advanced', 'tips', 'tricks',
    'documentation', 'reference', 'api', 'examples', 'best-practices',
    'troubleshooting', 'faq', 'getting-started', 'configuration',
    'installation', 'deployment', 'security', 'performance', 'optimization'
  ];

  // Notification management
  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<NotificationState, 'id' | 'timestamp'>) => {
    const newNotification: NotificationState = {
      ...notification,
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration
    if (notification.duration !== undefined && notification.duration > 0) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, notification.duration);
    }
  }, [removeNotification]);

  // Document handlers
  const handleCreateNewDocument = useCallback((documentType: DocumentType = 'checklist') => {
    // Create a new document object with proper structure for UI compatibility
    // Use 0 for id to indicate this is a new document (not yet saved)
    const newDocument: Document = {
      id: 0, // Will be assigned by backend on creation
      unique_key: '',
      title_en: '',
      summary_en: '',
      document_type: documentType, // Set the document type
      content_json_en: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Extended properties required for UI compatibility
      title: '', // Maps to title_en
      content: '', // Maps to content_json_en converted to HTML
      category: documentType, // Use document type as category
      tags: [], // Empty tags array
      author: 'Admin', // Default author
      screenshots_data: [] // Empty screenshots array
    };
    setEditingDocument(newDocument);
    setIsEditMode(true);
  }, []);

  const handleSaveDocument = useCallback(async (document: Document) => {
    setIsOperationLoading(true);

    // Show loading notification
    addNotification({
      type: 'info',
      title: 'Saving Document',
      message: 'Please wait while we save your document...'
    });

    try {
      // Wrap the entire save operation with performance monitoring
      await measureOperation(
        'save-document-operation',
        async () => {
      // Check if this is an existing document (has a valid ID) or a new one
      const isExistingDocument = editingDocument?.id && editingDocument.id > 0;

      // Prepare document for saving - ensure required fields are present
      const documentToSave = {
        ...document,
        // Ensure we have title_en field
        title_en: document.title_en || document.title || 'Untitled Document',
        // Ensure we have unique_key
        unique_key: document.unique_key || `doc-${Date.now()}`,
        // Handle content conversion - prioritize JSON content over HTML
        content_json_en: document.content_json_en || undefined,
        // Map frontend screenshots to backend format if needed

        screenshots_data: document.screenshots_data || [],
        // Ensure tags are present
        tags: document.tags || []
      };

      console.log('Saving document:', {
        isExistingDocument,
        documentId: editingDocument?.id,
        hasJsonContent: !!documentToSave.content_json_en,
        hasHtmlContent: !!documentToSave.content,
        documentToSave: {
          ...documentToSave,
          content: documentToSave.content?.substring(0, 100) + '...' // Truncate for logging
        }
      });

      // Validate required fields
      if (!documentToSave.title_en || !documentToSave.unique_key) {
        throw new Error('Title and unique key are required fields');
      }

      // Validate content exists in some form
      if (!documentToSave.content && !documentToSave.content_json_en) {
        throw new Error('Document content is required');
      }

      if (isExistingDocument) {
        // Update existing document
        await updateDocument(editingDocument.id.toString(), documentToSave);
        addNotification({
          type: 'success',
          title: 'Document Updated',
          message: `"${documentToSave.title_en}" has been successfully updated.`,
          duration: 3000
        });
      } else {
        // Create new document - the content_json_en is already part of the document object
        await addDocument(documentToSave);
        addNotification({
          type: 'success',
          title: 'Document Created',
          message: `"${documentToSave.title_en}" has been successfully created.`,
          duration: 3000
        });
      }

      // Refresh documents to ensure all pages have the latest data
      await refreshDocuments();

      // Notify other pages/tabs that documents have been updated
      localStorage.setItem('doaxvv-documents-updated', Date.now().toString());

      setEditingDocument(null);
      setIsEditMode(false);
      setIsPreviewMode(false);
      setIsFocusMode(false);
        },
        { documentId: document.id, documentTitle: document.title_en }
      );
    } catch (error: any) {
      console.error('Error saving document:', error);

      // Determine error type and show appropriate message
      let errorTitle = 'Save Failed';
      let errorMessage = 'Failed to save document. Please try again.';

      if (error?.message?.includes('required fields')) {
        errorTitle = 'Validation Error';
        errorMessage = error.message;
      } else if (error?.message?.includes('Network Error') || error?.message?.includes('fetch')) {
        errorTitle = 'Network Error';
        errorMessage = 'Unable to connect to server. Please check your connection and try again.';
      } else if (error?.status === 400) {
        errorTitle = 'Validation Error';
        errorMessage = 'Invalid document data. Please check all fields and try again.';
      } else if (error?.status === 401) {
        errorTitle = 'Authorization Error';
        errorMessage = 'You are not authorized to perform this action.';
      } else if (error?.status === 409) {
        errorTitle = 'Conflict Error';
        errorMessage = 'A document with this unique key already exists.';
      } else if (error?.status >= 500) {
        errorTitle = 'Server Error';
        errorMessage = 'Server error occurred. Please try again later.';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      addNotification({
        type: 'error',
        title: errorTitle,
        message: errorMessage,
        duration: 7000
      });
    } finally {
      setIsOperationLoading(false);
    }
  }, [editingDocument, addDocument, updateDocument, addNotification, measureOperation]);

  const handleDeleteDocument = useCallback(async (documentId: number) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(documentId.toString());
        addNotification({
          type: 'success',
          title: 'Document Deleted',
          message: 'Document has been successfully deleted.',
          duration: 3000
        });

        // Refresh documents to ensure all pages have the latest data
        await refreshDocuments();

        // Notify other pages/tabs that documents have been updated
        localStorage.setItem('doaxvv-documents-updated', Date.now().toString());
      } catch (error) {
        console.error('Error deleting document:', error);
        addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: 'Failed to delete document. Please try again.',
          duration: 5000
        });
      }
    }
  }, [deleteDocument, addNotification, refreshDocuments]);

  // Update log handlers
  const handleCreateNewUpdateLog = useCallback(() => {
    setEditingLog({
      id: 0,
      unique_key: '',
      version: '',
      title: '',
      description: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      tags: [],
      screenshots_data: [],
      metrics: {
        performanceImprovement: '0%',
        userSatisfaction: '0%',
        bugReports: 0
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    setIsEditMode(true);
  }, []);

  const handleSaveUpdateLog = useCallback(async (log: UpdateLog) => {
    // Show loading notification
    addNotification({
      type: 'info',
      title: 'Saving Update Log',
      message: 'Please wait while we save your update log...'
    });

    try {
      // Validate required fields
      if (!log.version || !log.title || !log.content) {
        throw new Error('Version, title, and content are required fields');
      }

      if (editingLog?.id) {
        await updateUpdateLog(editingLog.id.toString(), log);
        addNotification({
          type: 'success',
          title: 'Update Log Updated',
          message: `Version ${log.version} has been successfully updated.`,
          duration: 3000
        });
      } else {
        await addUpdateLog(log);
        addNotification({
          type: 'success',
          title: 'Update Log Created',
          message: `Version ${log.version} has been successfully created.`,
          duration: 3000
        });
      }

      // Refresh update logs to ensure all pages have the latest data
      await refreshUpdateLogs();

      // Notify other pages/tabs that update logs have been updated
      localStorage.setItem('doaxvv-update-logs-updated', Date.now().toString());

      setEditingLog(null);
      setIsEditMode(false);
    } catch (error: any) {
      console.error('Error saving update log:', error);

      // Determine error type and show appropriate message
      let errorTitle = 'Save Failed';
      let errorMessage = 'Failed to save update log. Please try again.';

      if (error?.message?.includes('required fields')) {
        errorTitle = 'Validation Error';
        errorMessage = error.message;
      } else if (error?.message?.includes('Network Error') || error?.message?.includes('fetch')) {
        errorTitle = 'Network Error';
        errorMessage = 'Unable to connect to server. Please check your connection and try again.';
      } else if (error?.status === 400) {
        errorTitle = 'Validation Error';
        errorMessage = 'Invalid update log data. Please check all fields and try again.';
      } else if (error?.status === 401) {
        errorTitle = 'Authorization Error';
        errorMessage = 'You are not authorized to perform this action.';
      } else if (error?.status === 409) {
        errorTitle = 'Conflict Error';
        errorMessage = 'An update log with this version already exists.';
      } else if (error?.status >= 500) {
        errorTitle = 'Server Error';
        errorMessage = 'Server error occurred. Please try again later.';
      } else if (error?.message) {
        errorMessage = error.message;
      }

      addNotification({
        type: 'error',
        title: errorTitle,
        message: errorMessage,
        duration: 7000
      });
    }
  }, [editingLog, addUpdateLog, updateUpdateLog, addNotification]);

  const handleDeleteUpdateLog = useCallback(async (logId: string) => {
    if (confirm('Are you sure you want to delete this update log?')) {
      try {
        await deleteUpdateLog(logId);
        addNotification({
          type: 'success',
          title: 'Update Log Deleted',
          message: 'Update log has been successfully deleted.',
          duration: 3000
        });

        // Refresh update logs to ensure all pages have the latest data
        await refreshUpdateLogs();

        // Notify other pages/tabs that update logs have been updated
        localStorage.setItem('doaxvv-update-logs-updated', Date.now().toString());
      } catch (error) {
        console.error('Error deleting update log:', error);
        addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: 'Failed to delete update log. Please try again.',
          duration: 5000
        });
      }
    }
  }, [deleteUpdateLog, addNotification, refreshUpdateLogs]);

  const handleCancelEdit = useCallback(() => {
    setEditingDocument(null);
    setEditingLog(null);
    setIsEditMode(false);
    setIsPreviewMode(false);
    setIsFocusMode(false);
  }, []);

  // Filter documents by section
  const getFilteredDocuments = useCallback(() => {
    if (activeDocumentSection === 'all') {
      return documents;
    }
    return documents.filter(doc => doc.document_type === activeDocumentSection);
  }, [documents, activeDocumentSection]);

  const renderTabContent = () => {
    // If editing a document
    if (isEditMode && editingDocument) {
      return (
        <DocumentEditor
          document={editingDocument}
          onDocumentChange={setEditingDocument}
          documentCategories={documentCategories}
          commonTags={commonTags}
          isPreviewMode={isPreviewMode}
          onPreviewModeChange={setIsPreviewMode}
          isFocusMode={isFocusMode}
          onFocusModeChange={setIsFocusMode}
          onSave={handleSaveDocument}
          onCancel={handleCancelEdit}
        />
      );
    }

    // If editing an update log
    if (isEditMode && editingLog) {
      return (
        <UpdateLogEditor
          updateLog={editingLog}
          onUpdateLogChange={setEditingLog}
          commonTags={commonTags}
          isPreviewMode={isPreviewMode}
          onPreviewModeChange={setIsPreviewMode}
          isFocusMode={isFocusMode}
          onFocusModeChange={setIsFocusMode}
          onSave={handleSaveUpdateLog}
          onCancel={handleCancelEdit}
        />
      );
    }

    // Main tab content
    switch (activeTab) {
      case 'documents':
        return (
          <DocumentManagement
            documents={getFilteredDocuments()}
            documentCategories={documentCategories}
            activeDocumentSection={activeDocumentSection}
            onSectionChange={setActiveDocumentSection}
            onCreateNew={handleCreateNewDocument}
            onEditDocument={(doc: Document) => {
              setEditingDocument(doc);
              setIsEditMode(true);
            }}
            onDeleteDocument={handleDeleteDocument}
            isEditMode={isEditMode}
          />
        );
      
      case 'update-logs':
        return (
          <UpdateLogManagement
            updateLogs={updateLogs}
            onCreateNew={handleCreateNewUpdateLog}
            onEditUpdateLog={(log: UpdateLog) => {
              setEditingLog(log);
              setIsEditMode(true);
            }}
            onDeleteUpdateLog={handleDeleteUpdateLog}
            isEditMode={isEditMode}
          />
        );
      
      case 'testing-tools':
        return (
          <TestingToolsManagement />
        );
    }
  };

  return (
    <AdminErrorBoundary>
      <Container>
        {/* Enhanced Sticky Notifications */}
        <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm pointer-events-none">
          <div className="pointer-events-auto">
            <AnimatePresence mode="popLayout">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: 100, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    y: 0
                  }}
                  exit={{
                    opacity: 0,
                    x: 100,
                    scale: 0.9,
                    transition: { duration: 0.2 }
                  }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                    type: "spring",
                    stiffness: 300,
                    damping: 30
                  }}
                  layout
                  className="sticky-notification"
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

      {/* Compact Header */}
      {!isEditMode && (
        <header className="mb-6" role="banner">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h1
                className="text-2xl font-bold bg-gradient-to-r from-accent-pink to-accent-purple bg-clip-text text-transparent"
                id="admin-dashboard-title"
              >
                Admin Dashboard
              </h1>
              {isOperationLoading && (
                <div
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                  role="status"
                  aria-live="polite"
                  aria-label="Processing operation"
                >
                  <div
                    className="w-4 h-4 border-2 border-accent-cyan/30 border-t-accent-cyan rounded-full animate-spin"
                    aria-hidden="true"
                  ></div>
                  <span>Processing...</span>
                </div>
              )}

              {/* Performance Stats (Development Only) */}
              {process.env.NODE_ENV === 'development' && stats.totalOperations > 0 && (
                <div className="text-xs text-muted-foreground">
                  <span>Ops: {stats.totalOperations}</span>
                  <span className="mx-2">•</span>
                  <span>Avg: {stats.averageDuration.toFixed(0)}ms</span>
                  <span className="mx-2">•</span>
                  <span>Success: {stats.successRate.toFixed(0)}%</span>
                </div>
              )}
            </div>
            
            {/* Content Type Selector */}
            <ContentTypeSelector
              onCreateDocument={handleCreateNewDocument}
              onCreateUpdateLog={handleCreateNewUpdateLog}
            />
          </div>
          <p className="text-muted-foreground text-sm" id="admin-dashboard-description">
            Comprehensive content management system for DOAXVV Handbook
          </p>
        </header>
      )}

      {/* Compact Tab Navigation - Single Row */}
      {!isEditMode && (
        <nav
          className="mb-4"
          role="navigation"
          aria-labelledby="admin-dashboard-title"
          aria-describedby="admin-dashboard-description"
        >
          <Card className="p-3 rounded-2xl">
            <CardContent className="p-0">
              <div
                className="grid grid-cols-3 gap-2"
                role="tablist"
                aria-label="Admin dashboard sections"
              >
                {adminSections.map((section, index) => {
                  const IconComponent = section.icon;
                  const isActive = activeTab === section.id;
                  return (
                    <motion.button
                      key={section.id}
                      onClick={() => setActiveTab(section.id)}
                      onKeyDown={(e) => {
                        // Enhanced keyboard navigation
                        if (e.key === 'ArrowLeft' && index > 0) {
                          e.preventDefault();
                          const prevSection = adminSections[index - 1];
                          setActiveTab(prevSection.id);
                          // Focus the previous tab
                          const prevButton = e.currentTarget.parentElement?.children[index - 1] as HTMLButtonElement;
                          prevButton?.focus();
                        } else if (e.key === 'ArrowRight' && index < adminSections.length - 1) {
                          e.preventDefault();
                          const nextSection = adminSections[index + 1];
                          setActiveTab(nextSection.id);
                          // Focus the next tab
                          const nextButton = e.currentTarget.parentElement?.children[index + 1] as HTMLButtonElement;
                          nextButton?.focus();
                        } else if (e.key === 'Home') {
                          e.preventDefault();
                          const firstSection = adminSections[0];
                          setActiveTab(firstSection.id);
                          const firstButton = e.currentTarget.parentElement?.children[0] as HTMLButtonElement;
                          firstButton?.focus();
                        } else if (e.key === 'End') {
                          e.preventDefault();
                          const lastSection = adminSections[adminSections.length - 1];
                          setActiveTab(lastSection.id);
                          const lastButton = e.currentTarget.parentElement?.children[adminSections.length - 1] as HTMLButtonElement;
                          lastButton?.focus();
                        }
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`tabpanel-${section.id}`}
                      id={`tab-${section.id}`}
                      tabIndex={isActive ? 0 : -1}
                      className={cn(
                        'px-3 py-2 rounded-xl transition-all duration-200 group border',
                        'focus:ring-2 focus:ring-accent-cyan/30 focus:outline-none focus:ring-offset-2',
                        isActive
                          ? 'bg-gradient-to-r from-accent-pink to-accent-purple text-white shadow-lg border-accent-pink/50'
                          : 'bg-card/50 text-muted-foreground hover:text-foreground border-border/30 hover:border-accent-cyan/30 hover:bg-card/80 hover:shadow-md'
                      )}
                    >
                    <div className="flex items-center justify-center gap-2">
                      <div className={cn(
                        'p-1.5 rounded-lg transition-all',
                        isActive
                          ? 'bg-white/20'
                          : 'bg-accent-cyan/10 group-hover:bg-accent-cyan/20'
                      )}>
                        <IconComponent className={cn(
                          'w-4 h-4 transition-colors',
                          isActive ? 'text-white' : section.color
                        )} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold">{section.title}</h3>
                        {section.stats && (
                          <div className={cn(
                            'text-xs font-medium',
                            isActive ? 'text-white/90' : 'text-muted-foreground'
                          )}>
                            {section.stats.count} {section.stats.label}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>
        </nav>
      )}

      {/* Enhanced Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="min-h-96 space-y-6"
          role="tabpanel"
          id={`tabpanel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          tabIndex={0}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </Container>
    </AdminErrorBoundary>
  );
};

export default AdminPage; 