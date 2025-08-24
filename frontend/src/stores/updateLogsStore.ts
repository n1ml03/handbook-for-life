import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { UpdateLog } from '@/types';
import { updateLogsApi, ApiError } from '@/services/api';
import { safeExtractArrayData, compareEntityIds } from '@/services/utils';

export interface UpdateLogsStore {
  // State
  updateLogs: UpdateLog[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadUpdateLogs: () => Promise<void>;
  addUpdateLog: (log: Omit<UpdateLog, 'id' | 'created_at' | 'updated_at'>) => Promise<UpdateLog>;
  updateUpdateLog: (id: string, updates: Partial<UpdateLog>) => Promise<UpdateLog>;
  deleteUpdateLog: (id: string) => Promise<void>;
  refreshUpdateLogs: () => Promise<void>;
  
  // Internal state setters
  setUpdateLogs: (updateLogs: UpdateLog[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUpdateLogsStore = create<UpdateLogsStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      updateLogs: [],
      isLoading: true,
      error: null,

      // Actions
      loadUpdateLogs: async () => {
        try {
          set({ isLoading: true, error: null }, false, 'updateLogs/loadUpdateLogs/start');
          
          const response = await updateLogsApi.getUpdateLogs({
            sortBy: 'date',
            sortOrder: 'desc',
            limit: 100
          });
          
          const responseData = safeExtractArrayData<UpdateLog>(response, 'update logs API');
          
          set({ 
            updateLogs: responseData, 
            isLoading: false 
          }, false, 'updateLogs/loadUpdateLogs/success');
          
        } catch (error) {
          console.error('Error loading update logs:', error);
          const errorMessage = error instanceof ApiError ? error.message : 'Failed to load update logs';
          
          set({ 
            error: errorMessage, 
            updateLogs: [], 
            isLoading: false 
          }, false, 'updateLogs/loadUpdateLogs/error');
        }
      },

      addUpdateLog: async (log: Omit<UpdateLog, 'id' | 'created_at' | 'updated_at'>) => {
        try {
          const newLog = await updateLogsApi.createUpdateLog(log);
          
          set((state) => ({
            updateLogs: [newLog, ...state.updateLogs]
          }), false, 'updateLogs/addUpdateLog');
          
          return newLog;
        } catch (error) {
          console.error('Error adding update log:', error);
          throw error;
        }
      },

      updateUpdateLog: async (id: string, updates: Partial<UpdateLog>) => {
        try {
          const updatedLog = await updateLogsApi.updateUpdateLog(id, updates);
          
          set((state) => ({
            updateLogs: state.updateLogs.map(log =>
              compareEntityIds(log.id, id) ? updatedLog : log
            )
          }), false, 'updateLogs/updateUpdateLog');
          
          return updatedLog;
        } catch (error) {
          console.error('Error updating update log:', error);
          throw error;
        }
      },

      deleteUpdateLog: async (id: string) => {
        try {
          await updateLogsApi.deleteUpdateLog(id);
          
          set((state) => ({
            updateLogs: state.updateLogs.filter(log => !compareEntityIds(log.id, id))
          }), false, 'updateLogs/deleteUpdateLog');
          
        } catch (error) {
          console.error('Error deleting update log:', error);
          throw error;
        }
      },

      refreshUpdateLogs: async () => {
        await get().loadUpdateLogs();
      },

      // Internal state setters
      setUpdateLogs: (updateLogs: UpdateLog[]) => {
        set({ updateLogs }, false, 'updateLogs/setUpdateLogs');
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading }, false, 'updateLogs/setLoading');
      },

      setError: (error: string | null) => {
        set({ error }, false, 'updateLogs/setError');
      },
    }),
    {
      name: 'update-logs-store',
    }
  )
);

// Initialize the store by loading update logs
useUpdateLogsStore.getState().loadUpdateLogs();
