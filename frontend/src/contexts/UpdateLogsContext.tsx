import { createContext, useState, useEffect, ReactNode } from 'react';
import { UpdateLog } from '@/types';
import { updateLogsApi, ApiError } from '@/services/api';
import { safeExtractArrayData, compareEntityIds } from '@/services/utils';

interface UpdateLogsContextType {
  updateLogs: UpdateLog[];
  isLoading: boolean;
  error: string | null;
  addUpdateLog: (log: Omit<UpdateLog, 'id' | 'created_at' | 'updated_at'>) => Promise<UpdateLog>;
  updateUpdateLog: (id: string, updates: Partial<UpdateLog>) => Promise<UpdateLog>;
  deleteUpdateLog: (id: string) => Promise<void>;
  refreshUpdateLogs: () => Promise<void>;
}

export const UpdateLogsContext = createContext<UpdateLogsContextType | undefined>(undefined);

interface UpdateLogsProviderProps {
  children: ReactNode;
}

export function UpdateLogsProvider({ children }: UpdateLogsProviderProps) {
  const [updateLogs, setUpdateLogs] = useState<UpdateLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  // Load update logs on mount
  useEffect(() => {
    loadUpdateLogs();
  }, []);

  const loadUpdateLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Load all update logs for full admin functionality
      const response = await updateLogsApi.getUpdateLogs({
        sortBy: 'date',
        sortOrder: 'desc',
        limit: 100
      });
      
      // Safely handle the response data
      const responseData = safeExtractArrayData<UpdateLog>(response, 'update logs API');
      
      setUpdateLogs(responseData);
    } catch (error) {
      console.error('Error loading update logs:', error);
      setError(error instanceof ApiError ? error.message : 'Failed to load update logs');
      setUpdateLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addUpdateLog = async (log: Omit<UpdateLog, 'id' | 'created_at' | 'updated_at'>): Promise<UpdateLog> => {
    try {
      const newLog = await updateLogsApi.createUpdateLog(log);
      setUpdateLogs(prev => [newLog, ...prev]);
      return newLog;
    } catch (error) {
      console.error('Error adding update log:', error);
      throw error;
    }
  };

  const updateUpdateLog = async (id: string, updates: Partial<UpdateLog>): Promise<UpdateLog> => {
    try {
      const updatedLog = await updateLogsApi.updateUpdateLog(id, updates);
      setUpdateLogs(prev => prev.map(log => 
        compareEntityIds(log.id, id) ? updatedLog : log
      ));
      return updatedLog;
    } catch (error) {
      console.error('Error updating update log:', error);
      throw error;
    }
  };

  const deleteUpdateLog = async (id: string): Promise<void> => {
    try {
      await updateLogsApi.deleteUpdateLog(id);
      setUpdateLogs(prev => prev.filter(log => !compareEntityIds(log.id, id)));
    } catch (error) {
      console.error('Error deleting update log:', error);
      throw error;
    }
  };

  const refreshUpdateLogs = async (): Promise<void> => {
    await loadUpdateLogs();
  };

  const value: UpdateLogsContextType = {
    updateLogs,
    isLoading,
    error,
    addUpdateLog,
    updateUpdateLog,
    deleteUpdateLog,
    refreshUpdateLogs
  };

  return (
    <UpdateLogsContext.Provider value={value}>
      {children}
    </UpdateLogsContext.Provider>
  );
}

// Set displayName for better debugging and React DevTools
UpdateLogsProvider.displayName = 'UpdateLogsProvider';

export default UpdateLogsContext; 