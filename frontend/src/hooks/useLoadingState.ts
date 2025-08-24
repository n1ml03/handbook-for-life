import { useCallback } from 'react';
import { useLoadingStore } from '@/stores';

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
  const {
    isGlobalLoading,
    showGlobalLoading: storeShowGlobalLoading,
    hideGlobalLoading: storeHideGlobalLoading,
    updateLoadingProgress: storeUpdateLoadingProgress
  } = useLoadingStore();

  const showGlobalLoading = useCallback((
    message: string = 'Đang tải dữ liệu...',
    progress?: number
  ) => {
    storeShowGlobalLoading(message, progress);
  }, [storeShowGlobalLoading]);

  const hideGlobalLoading = useCallback(() => {
    storeHideGlobalLoading();
  }, [storeHideGlobalLoading]);

  const updateLoadingProgress = useCallback((
    progress: number,
    message?: string
  ) => {
    storeUpdateLoadingProgress(progress, message);
  }, [storeUpdateLoadingProgress]);

  return {
    showGlobalLoading,
    hideGlobalLoading,
    updateLoadingProgress,
    isGlobalLoading,
  };
}

/**
 * Backward compatibility hook for components using useLoading directly
 */
export function useLoading() {
  const {
    isGlobalLoading,
    loadingMessage,
    loadingProgress,
    setGlobalLoading,
    clearGlobalLoading
  } = useLoadingStore();

  return {
    isGlobalLoading,
    loadingMessage,
    loadingProgress,
    setGlobalLoading,
    clearGlobalLoading,
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