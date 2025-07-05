import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Document } from '@/types';
import { documentsApi, ApiError } from '@/services/api';
import { safeExtractArrayData, compareEntityIds, generateDocumentCategory } from '@/services/utils';

interface DocumentsContextType {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  addDocument: (document: Omit<Document, 'id' | 'created_at' | 'updated_at'>, jsonContent?: any) => Promise<Document>;
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
      
      setDocuments(responseData);
    } catch (error) {
      console.error('Error loading documents:', error);
      setError(error instanceof ApiError ? error.message : 'Failed to load documents');
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addDocument = useCallback(async (document: Omit<Document, 'id' | 'created_at' | 'updated_at'>): Promise<Document> => {
    try {
      const newDocument = await documentsApi.createDocument(document);
      setDocuments(prev => [newDocument, ...prev]);
      return newDocument;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }, []);

  const updateDocument = useCallback(async (id: string, updates: Partial<Document>): Promise<Document> => {
    try {
      const updatedDocument = await documentsApi.updateDocument(id, updates);
      setDocuments(prev => prev.map(doc =>
        compareEntityIds(doc.id, id) ? updatedDocument : doc
      ));
      return updatedDocument;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }, []);

  const deleteDocument = useCallback(async (id: string): Promise<void> => {
    try {
      await documentsApi.deleteDocument(id);
      setDocuments(prev => prev.filter(doc => !compareEntityIds(doc.id, id)));
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }, []);

  const refreshDocuments = useCallback(async (): Promise<void> => {
    await loadDocuments();
  }, []);

  const getDocumentsByCategory = useCallback((category: string): Document[] => {
    return documents.filter(doc => generateDocumentCategory(doc) === category);
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