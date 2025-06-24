import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface LoadingContextType {
  isGlobalLoading: boolean;
  loadingMessage: string;
  loadingProgress?: number;
  setGlobalLoading: (loading: boolean, message?: string, progress?: number) => void;
  clearGlobalLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [loadingProgress, setLoadingProgress] = useState<number | undefined>(undefined);

  const setGlobalLoading = useCallback((
    loading: boolean, 
    message: string = 'Loading...', 
    progress?: number
  ) => {
    setIsGlobalLoading(loading);
    setLoadingMessage(message);
    setLoadingProgress(progress);
  }, []);

  const clearGlobalLoading = useCallback(() => {
    setIsGlobalLoading(false);
    setLoadingMessage('Loading...');
    setLoadingProgress(undefined);
  }, []);

  const value: LoadingContextType = {
    isGlobalLoading,
    loadingMessage,
    loadingProgress,
    setGlobalLoading,
    clearGlobalLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
} 