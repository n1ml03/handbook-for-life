import { useCallback } from 'react';
import { useLoading } from '@/contexts/LoadingContext';

export interface UseLoadingStateReturn {
  showGlobalLoading: (message?: string, progress?: number) => void;
  hideGlobalLoading: () => void;
  updateLoadingProgress: (progress: number, message?: string) => void;
  isGlobalLoading: boolean;
}

/**
 * Custom hook for easy loading state management
 * Provides methods to show/hide global loading overlay
 */
export function useLoadingState(): UseLoadingStateReturn {
  const { isGlobalLoading, setGlobalLoading, clearGlobalLoading } = useLoading();

  const showGlobalLoading = useCallback((
    message: string = 'Đang tải dữ liệu...', 
    progress?: number
  ) => {
    setGlobalLoading(true, message, progress);
  }, [setGlobalLoading]);

  const hideGlobalLoading = useCallback(() => {
    clearGlobalLoading();
  }, [clearGlobalLoading]);

  const updateLoadingProgress = useCallback((
    progress: number, 
    message?: string
  ) => {
    setGlobalLoading(true, message, progress);
  }, [setGlobalLoading]);

  return {
    showGlobalLoading,
    hideGlobalLoading,
    updateLoadingProgress,
    isGlobalLoading,
  };
}

/**
 * Higher-order function to wrap async operations with loading states
 */
export function withLoading<T extends any[], R>(
  asyncFn: (...args: T) => Promise<R>,
  loadingMessage: string = 'Đang xử lý...'
) {
  return function useWithLoading() {
    const { showGlobalLoading, hideGlobalLoading } = useLoadingState();

    return useCallback(async (...args: T): Promise<R> => {
      try {
        showGlobalLoading(loadingMessage);
        const result = await asyncFn(...args);
        return result;
      } finally {
        hideGlobalLoading();
      }
    }, [showGlobalLoading, hideGlobalLoading]);
  };
} 