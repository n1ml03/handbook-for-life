import { useState, useCallback, useEffect } from 'react';
import { Settings, FileText, FileDown, BookOpen } from 'lucide-react';
import { cn } from '@/services/utils';
import { documentCategoriesData, type Document, type DocumentCategory } from '@/types';
import { useUpdateLogs } from '@/contexts/UpdateLogsContext';
import { UpdateLog } from '@/types';
import { Container, Section, Inline } from '@/components/ui/spacing';
import { Card } from '@/components/ui/card';
import { useDocuments } from '@/contexts/DocumentsContext';
import {
  CSVManagement,
  DocumentManagement,
  UpdateLogManagement,
  DocumentEditor,
  UpdateLogEditor,
  NotificationToast,
  type NotificationState
} from '@/components/admin';

interface AdminSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  lastUpdated: string;
  status: 'active' | 'inactive' | 'draft';
}

const AdminPage = () => {
  const { documents, addDocument, updateDocument, deleteDocument } = useDocuments();
  const [documentCategories] = useState<DocumentCategory[]>(documentCategoriesData);
  const { updateLogs, addUpdateLog, updateUpdateLog, deleteUpdateLog } = useUpdateLogs();
  
  const [activeTab, setActiveTab] = useState<string>('documents');
  const [activeDocumentSection, setActiveDocumentSection] = useState<'checklist-creation' | 'checking-guide' | 'all'>('all');
  const [editingLog, setEditingLog] = useState<UpdateLog | null>(null);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

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
      title: 'Documents',
      icon: FileText,
      description: 'Manage documentation and guides',
      lastUpdated: '2 hours ago',
      status: 'active'
    },
    {
      id: 'update-logs',
      title: 'Update Logs',
      icon: BookOpen,
      description: 'Version history and changelogs',
      lastUpdated: '1 day ago',
      status: 'active'
    },
    {
      id: 'csv-management',
      title: 'CSV Import/Export',
      icon: FileDown,
      description: 'Bulk data operations',
      lastUpdated: '3 days ago',
      status: 'active'
    }
  ];

  // Common tag suggestions
  const commonTags = [
    'tutorial', 'guide', 'beginner', 'advanced', 'tips', 'tricks',
    'documentation', 'reference', 'api', 'examples', 'best-practices',
    'troubleshooting', 'faq', 'getting-started', 'configuration',
    'installation', 'deployment', 'security', 'performance', 'optimization'
  ];

  // Notification management
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
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Document handlers
  const handleCreateNewDocument = useCallback(() => {
    setEditingDocument({
      id: 0,
      unique_key: '',
      title_en: '',
      summary_en: '',
      content_json_en: null,
      is_published: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    setIsEditMode(true);
  }, []);

  const handleSaveDocument = useCallback((document: Document) => {
    try {
      if (editingDocument?.id) {
        updateDocument(editingDocument.id.toString(), document);
        addNotification({
          type: 'success',
          title: 'Document Updated',
          message: `"${document.title_en}" has been successfully updated.`,
          duration: 3000
        });
      } else {
        const newDocument = { ...document, id: Date.now().toString() };
        addDocument(newDocument);
        addNotification({
          type: 'success',
          title: 'Document Created',
          message: `"${document.title_en}" has been successfully created.`,
          duration: 3000
        });
      }
      setEditingDocument(null);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error saving document:', error);
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save document. Please try again.',
        duration: 5000
      });
    }
  }, [editingDocument, addDocument, updateDocument, addNotification]);

  const handleDeleteDocument = useCallback((documentId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        deleteDocument(documentId);
        addNotification({
          type: 'success',
          title: 'Document Deleted',
          message: 'Document has been successfully deleted.',
          duration: 3000
        });
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
  }, [deleteDocument, addNotification]);

  // Update log handlers
  const handleCreateNewUpdateLog = useCallback(() => {
    setEditingLog({
      id: '',
      version: '',
      title: '',
      description: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      isPublished: false,
      tags: [],
      technicalDetails: [],
      bugFixes: [],
      screenshots: [],
      metrics: {
        performanceImprovement: '0%',
        userSatisfaction: '0%',
        bugReports: 0
      },
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    });
    setIsEditMode(true);
  }, []);

  const handleSaveUpdateLog = useCallback(async (log: UpdateLog) => {
    try {
      if (editingLog?.id) {
        await updateUpdateLog(editingLog.id, log);
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
      setEditingLog(null);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error saving update log:', error);
      addNotification({
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save update log. Please try again.',
        duration: 5000
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
  }, [deleteUpdateLog, addNotification]);

  const handleCancelEdit = useCallback(() => {
    setEditingDocument(null);
    setEditingLog(null);
    setIsEditMode(false);
    setIsPreviewMode(false);
    setIsFocusMode(false);
  }, []);

  // Filter documents by section
  const getFilteredDocuments = useCallback(() => {
    switch (activeDocumentSection) {
      case 'checklist-creation':
        return documents.filter(doc => 
          doc.unique_key.includes('checklist') || 
          doc.title_en.toLowerCase().includes('checklist')
        );
      case 'checking-guide':
        return documents.filter(doc => 
          doc.unique_key.includes('guide') || 
          doc.title_en.toLowerCase().includes('guide')
        );
      default:
        return documents;
    }
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
      
      case 'csv-management':
        return (
          <CSVManagement
            documents={documents}
            updateLogs={updateLogs}
            onAddDocument={addDocument}
            onAddUpdateLog={async (log: UpdateLog) => {
              await addUpdateLog(log);
            }}
          />
        );
      
      default:
        return (
          <div className="doax-card p-8 text-center">
            <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">This section is under development</p>
          </div>
        );
    }
  };

  return (
    <Container>
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-40 space-y-2 max-w-md">
        {notifications.map(notification => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>

      {/* Header */}
      {(!isEditMode || !isFocusMode) && (
        <Section
          title="Admin Panel"
          description="Manage website content, updates, and system settings with enhanced CSV import/export capabilities"
        />
      )}

      {/* Tab Navigation */}
      {(!isEditMode || !isFocusMode) && (
        <Card className="p-2">
          <Inline spacing="sm" wrap>
            {adminSections.map(section => {
              const IconComponent = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveTab(section.id)}
                  className={cn(
                    'flex-1 px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 font-medium min-w-0',
                    'focus:ring-2 focus:ring-accent-cyan/20 focus:outline-hidden',
                    activeTab === section.id
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
      )}

      {/* Tab Content */}
      <div className="min-h-96">
        {renderTabContent()}
      </div>
    </Container>
  );
};

export default AdminPage; 