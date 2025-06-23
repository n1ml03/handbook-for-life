import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Document } from '@/types';
import { documentsApi, ApiError } from '@/services/api';

interface DocumentsContextType {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  addDocument: (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Document>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
  refreshDocuments: () => Promise<void>;
  getDocumentsByCategory: (category: string) => Document[];
}

export const DocumentsContext = createContext<DocumentsContextType | undefined>(undefined);

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await documentsApi.getDocuments({
        published: true,
        sortBy: 'updated_at',
        sortOrder: 'desc',
        limit: 100
      });
      // Ensure isPublished property is synchronized with is_published for UI compatibility
      const documentsWithSyncedProps = response.data.map(doc => ({
        ...doc,
        isPublished: doc.is_published
      }));
      setDocuments(documentsWithSyncedProps);
    } catch (error) {
      console.error('Error loading documents:', error);
      setError(error instanceof ApiError ? error.message : 'Failed to load documents');
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addDocument = useCallback(async (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> => {
    try {
      const newDocument = await documentsApi.createDocument(document);
      // Ensure isPublished property is synchronized with is_published for UI compatibility
      const documentWithSyncedProps = {
        ...newDocument,
        isPublished: newDocument.is_published
      };
      setDocuments(prev => [documentWithSyncedProps, ...prev]);
      return documentWithSyncedProps;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }, []);

  const updateDocument = useCallback(async (id: string, updates: Partial<Document>): Promise<Document> => {
    try {
      const updatedDocument = await documentsApi.updateDocument(id, updates);
      // Ensure isPublished property is synchronized with is_published for UI compatibility
      const documentWithSyncedProps = {
        ...updatedDocument,
        isPublished: updatedDocument.is_published
      };
      setDocuments(prev => prev.map(doc =>
        doc.id === id ? documentWithSyncedProps : doc
      ));
      return documentWithSyncedProps;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }, []);

  const deleteDocument = useCallback(async (id: string): Promise<void> => {
    try {
      await documentsApi.deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }, []);

  const refreshDocuments = useCallback(async (): Promise<void> => {
    await loadDocuments();
  }, []);

  const getDocumentsByCategory = useCallback((category: string): Document[] => {
    return documents.filter(doc => doc.category === category);
  }, [documents]);

  return (
    <DocumentsContext.Provider value={{ 
      documents, 
      isLoading, 
      error, 
      addDocument, 
      updateDocument, 
      deleteDocument, 
      refreshDocuments,
      getDocumentsByCategory
    }}>
      {children}
    </DocumentsContext.Provider>
  );
}

// Set displayName for better debugging and React DevTools
DocumentsProvider.displayName = 'DocumentsProvider';