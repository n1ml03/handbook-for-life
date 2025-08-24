import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Document } from '@/types';
import { documentsApi, ApiError } from '@/services/api';
import { safeExtractArrayData, compareEntityIds, generateDocumentCategory } from '@/services/utils';

export interface DocumentsStore {
  // State
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadDocuments: () => Promise<void>;
  addDocument: (document: Omit<Document, 'id' | 'created_at' | 'updated_at'>) => Promise<Document>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
  refreshDocuments: () => Promise<void>;
  getDocumentsByCategory: (category: string) => Document[];
  
  // Internal state setters
  setDocuments: (documents: Document[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDocumentsStore = create<DocumentsStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      documents: [],
      isLoading: true,
      error: null,

      // Actions
      loadDocuments: async () => {
        try {
          set({ isLoading: true, error: null }, false, 'documents/loadDocuments/start');
          
          const response = await documentsApi.getDocuments({
            sortBy: 'updated_at',
            sortOrder: 'desc',
            limit: 1000 // Increased limit to show all documents without pagination
          });
          
          const responseData = safeExtractArrayData<Document>(response, 'documents API');
          
          set({ 
            documents: responseData, 
            isLoading: false 
          }, false, 'documents/loadDocuments/success');
          
        } catch (error) {
          console.error('Error loading documents:', error);
          const errorMessage = error instanceof ApiError ? error.message : 'Failed to load documents';
          
          set({ 
            error: errorMessage, 
            documents: [], 
            isLoading: false 
          }, false, 'documents/loadDocuments/error');
        }
      },

      addDocument: async (document: Omit<Document, 'id' | 'created_at' | 'updated_at'>) => {
        try {
          const newDocument = await documentsApi.createDocument(document);
          
          set((state) => ({
            documents: [newDocument, ...state.documents]
          }), false, 'documents/addDocument');
          
          return newDocument;
        } catch (error) {
          console.error('Error adding document:', error);
          throw error;
        }
      },

      updateDocument: async (id: string, updates: Partial<Document>) => {
        try {
          const updatedDocument = await documentsApi.updateDocument(id, updates);
          
          set((state) => ({
            documents: state.documents.map(doc =>
              compareEntityIds(doc.id, id) ? updatedDocument : doc
            )
          }), false, 'documents/updateDocument');
          
          return updatedDocument;
        } catch (error) {
          console.error('Error updating document:', error);
          throw error;
        }
      },

      deleteDocument: async (id: string) => {
        try {
          await documentsApi.deleteDocument(id);
          
          set((state) => ({
            documents: state.documents.filter(doc => !compareEntityIds(doc.id, id))
          }), false, 'documents/deleteDocument');
          
        } catch (error) {
          console.error('Error deleting document:', error);
          throw error;
        }
      },

      refreshDocuments: async () => {
        await get().loadDocuments();
      },

      getDocumentsByCategory: (category: string) => {
        return get().documents.filter(doc => generateDocumentCategory(doc) === category);
      },

      // Internal state setters
      setDocuments: (documents: Document[]) => {
        set({ documents }, false, 'documents/setDocuments');
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading }, false, 'documents/setLoading');
      },

      setError: (error: string | null) => {
        set({ error }, false, 'documents/setError');
      },
    }),
    {
      name: 'documents-store',
    }
  )
);

// Initialize the store by loading documents
useDocumentsStore.getState().loadDocuments();
