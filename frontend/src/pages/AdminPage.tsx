import React from 'react';
import { useState, useCallback, useEffect } from 'react';
import { Settings, FileText, FileDown, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/services/utils';
import { documentCategoriesData, type Document, type DocumentCategory } from '@/types';
import { useUpdateLogs } from '@/hooks';
import { UpdateLog } from '@/types';
import { Container } from '@/components/ui/spacing';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDocuments } from '@/hooks';
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
  color: string;
  stats?: {
    count: number;
    label: string;
  };
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
      title: 'Document Management',
      icon: FileText,
      description: 'Create, edit, and organize documentation and guides',
      lastUpdated: '2 hours ago',
      status: 'active',
      color: 'text-accent-cyan',
      stats: {
        count: documents.length,
        label: 'Documents'
      }
    },
    {
      id: 'update-logs',
      title: 'Update Logs',
      icon: BookOpen,
      description: 'Manage version history and changelog entries',
      lastUpdated: '1 day ago',
      status: 'active',
      color: 'text-accent-purple',
      stats: {
        count: updateLogs.length,
        label: 'Updates'
      }
    },
    {
      id: 'csv-management',
      title: 'Data Management',
      icon: FileDown,
      description: 'Import and export data using CSV files',
      lastUpdated: '3 days ago',
      status: 'active',
      color: 'text-accent-pink',
      stats: {
        count: documents.length + updateLogs.length,
        label: 'Total Records'
      }
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
  const handleCreateNewDocument = useCallback(() => {
    // Create a new document object with proper structure for UI compatibility
    // Use 0 for id to indicate this is a new document (not yet saved)
    const newDocument: Document = {
      id: 0, // Will be assigned by backend on creation
      unique_key: '',
      title_en: '',
      summary_en: '',
      content_json_en: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Extended properties required for UI compatibility
      title: '', // Maps to title_en
      content: '', // Maps to content_json_en converted to HTML
      category: 'game-mechanics', // Default category
      tags: [], // Empty tags array
      author: 'Admin', // Default author
      screenshots: [] // Empty screenshots array
    };
    setEditingDocument(newDocument);
    setIsEditMode(true);
  }, []);

  const handleSaveDocument = useCallback(async (document: Document) => {
    try {
      // Check if this is an existing document (has a valid ID) or a new one
      const isExistingDocument = editingDocument?.id && editingDocument.id > 0;

      // Prepare document for saving
      const documentToSave = {
        ...document
      };

      if (isExistingDocument) {
        // Update existing document
        await updateDocument(editingDocument.id.toString(), documentToSave);
        addNotification({
          type: 'success',
          title: 'Document Updated',
          message: `"${document.title_en}" has been successfully updated.`,
          duration: 3000
        });
      } else {
        // Create new document - pass the full document object as addDocument handles API conversion
        await addDocument(documentToSave);
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

  const handleDeleteDocument = useCallback((documentId: number) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        deleteDocument(documentId.toString());
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
      tags: [],
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
          <Card className="p-12 text-center rounded-2xl">
            <CardContent>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md mx-auto"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-accent-cyan/20">
                  <Settings className="w-12 h-12 text-accent-cyan/60" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">Section Under Development</h3>
              </motion.div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <Container>
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
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

      {/* Compact Header */}
      {!isEditMode && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-pink to-accent-purple bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Comprehensive content management system for DOAXVV Handbook
          </p>
        </div>
      )}

      {/* Compact Tab Navigation */}
      {!isEditMode && (
        <Card className="p-4 mb-5 rounded-2xl">
          <CardContent className="p-0">
            <div className="flex gap-3">
              {adminSections.map(section => {
                const IconComponent = section.icon;
                const isActive = activeTab === section.id;
                return (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className={cn(
                      'flex-1 px-5 py-4 rounded-xl transition-all duration-200 group border min-h-[64px]',
                      'focus:ring-2 focus:ring-accent-cyan/20 focus:outline-hidden',
                      isActive
                        ? 'bg-gradient-to-r from-accent-pink to-accent-purple text-white shadow-lg border-accent-pink/50'
                        : 'bg-card/50 text-muted-foreground hover:text-foreground border-border/30 hover:border-accent-cyan/30 hover:bg-card/80 hover:shadow-md'
                    )}
                  >
                    <div className="flex items-center gap-3 h-full">
                      <div className={cn(
                        'p-2.5 rounded-xl transition-all flex-shrink-0',
                        isActive
                          ? 'bg-white/20'
                          : 'bg-accent-cyan/10 group-hover:bg-accent-cyan/20'
                      )}>
                        <IconComponent className={cn(
                          'w-5 h-5 transition-colors',
                          isActive ? 'text-white' : section.color
                        )} />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-semibold truncate">{section.title}</h3>
                          {section.stats && (
                            <div className={cn(
                              'text-right ml-2 flex-shrink-0',
                              isActive ? 'text-white/90' : 'text-muted-foreground'
                            )}>
                              <div className="text-lg font-bold leading-none">{section.stats.count}</div>
                              <div className="text-xs leading-none">{section.stats.label}</div>
                            </div>
                          )}
                        </div>
                        <p className={cn(
                          'text-xs leading-relaxed line-clamp-1',
                          isActive ? 'text-white/80' : 'text-muted-foreground'
                        )}>
                          {section.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>
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
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>
    </Container>
  );
};

export default AdminPage; 