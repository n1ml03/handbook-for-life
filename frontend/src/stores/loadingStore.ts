import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface LoadingStore {
  // State
  isGlobalLoading: boolean;
  loadingMessage: string;
  loadingProgress?: number;
  
  // Actions
  setGlobalLoading: (loading: boolean, message?: string, progress?: number) => void;
  clearGlobalLoading: () => void;
  showGlobalLoading: (message?: string, progress?: number) => void;
  hideGlobalLoading: () => void;
  updateLoadingProgress: (progress: number, message?: string) => void;
}

export const useLoadingStore = create<LoadingStore>()(
  devtools(
    (set) => ({
      // Initial state
      isGlobalLoading: false,
      loadingMessage: 'Loading...',
      loadingProgress: undefined,

      // Actions
      setGlobalLoading: (loading: boolean, message: string = 'Loading...', progress?: number) => {
        set({
          isGlobalLoading: loading,
          loadingMessage: message,
          loadingProgress: progress,
        }, false, 'loading/setGlobalLoading');
      },

      clearGlobalLoading: () => {
        set({
          isGlobalLoading: false,
          loadingMessage: 'Loading...',
          loadingProgress: undefined,
        }, false, 'loading/clearGlobalLoading');
      },

      showGlobalLoading: (message: string = 'Đang tải dữ liệu...', progress?: number) => {
        set({
          isGlobalLoading: true,
          loadingMessage: message,
          loadingProgress: progress,
        }, false, 'loading/showGlobalLoading');
      },

      hideGlobalLoading: () => {
        set({
          isGlobalLoading: false,
          loadingMessage: 'Loading...',
          loadingProgress: undefined,
        }, false, 'loading/hideGlobalLoading');
      },

      updateLoadingProgress: (progress: number, message?: string) => {
        set((state) => ({
          isGlobalLoading: true,
          loadingMessage: message || state.loadingMessage,
          loadingProgress: progress,
        }), false, 'loading/updateLoadingProgress');
      },
    }),
    {
      name: 'loading-store',
    }
  )
);
