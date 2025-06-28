import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Document } from '@/types';
import { documentsApi, ApiError } from '@/services/api';
import { safeExtractArrayData, safeIdCompare, safeNormalizeTags } from '@/services/utils';

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
      // Load all documents for admin functionality
      const response = await documentsApi.getDocuments({
        sortBy: 'updated_at',
        sortOrder: 'desc',
        limit: 100
      });
      
      // Safely handle the response data
      const responseData = safeExtractArrayData<Document>(response, 'documents API');
      
      // Ensure consistent data structure
      const documentsWithDefaults = responseData.map(doc => ({
        ...doc,
        screenshots: doc.screenshots || [], // Ensure screenshots array exists
        tags: safeNormalizeTags(doc.tags) // Ensure tags is always a safe array
      }));
      setDocuments(documentsWithDefaults);
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
      // Ensure consistent data structure
      const documentWithDefaults = {
        ...newDocument,
        screenshots: newDocument.screenshots || [], // Ensure screenshots array exists
        tags: safeNormalizeTags(newDocument.tags) // Ensure tags is always a safe array
      };
      setDocuments(prev => [documentWithDefaults, ...prev]);
      return documentWithDefaults;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }, []);

  const updateDocument = useCallback(async (id: string, updates: Partial<Document>): Promise<Document> => {
    try {
      const updatedDocument = await documentsApi.updateDocument(id, updates);
      // Ensure consistent data structure
      const documentWithDefaults = {
        ...updatedDocument,
        screenshots: updatedDocument.screenshots || [], // Ensure screenshots array exists
        tags: safeNormalizeTags(updatedDocument.tags) // Ensure tags is always a safe array
      };
      setDocuments(prev => prev.map(doc =>
        safeIdCompare(doc.id, id) ? documentWithDefaults : doc
      ));
      return documentWithDefaults;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }, []);

  const deleteDocument = useCallback(async (id: string): Promise<void> => {
    try {
      await documentsApi.deleteDocument(id);
      setDocuments(prev => prev.filter(doc => !safeIdCompare(doc.id, id)));
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