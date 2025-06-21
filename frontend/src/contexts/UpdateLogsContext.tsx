import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { UpdateLog } from '@/types';
import { updateLogsApi, ApiError } from '@/services/api';

interface UpdateLogsContextType {
  updateLogs: UpdateLog[];
  publishedUpdateLogs: UpdateLog[];
  isLoading: boolean;
  error: string | null;
  addUpdateLog: (log: Omit<UpdateLog, 'id' | 'createdAt' | 'updatedAt'>) => Promise<UpdateLog>;
  updateUpdateLog: (id: string, updates: Partial<UpdateLog>) => Promise<UpdateLog>;
  deleteUpdateLog: (id: string) => Promise<void>;
  refreshUpdateLogs: () => Promise<void>;
}

const UpdateLogsContext = createContext<UpdateLogsContextType | undefined>(undefined);

interface UpdateLogsProviderProps {
  children: ReactNode;
}

export function UpdateLogsProvider({ children }: UpdateLogsProviderProps) {
  const [updateLogs, setUpdateLogs] = useState<UpdateLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed value for published logs only
  const publishedUpdateLogs = useMemo(() => 
    updateLogs.filter(log => log.isPublished), 
    [updateLogs]
  );

  // Load update logs on mount
  useEffect(() => {
    loadUpdateLogs();
  }, []);

  const loadUpdateLogs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await updateLogsApi.getPublishedUpdateLogs({
        sortBy: 'date',
        sortOrder: 'desc',
        limit: 100
      });
      setUpdateLogs(response.data);
    } catch (error) {
      console.error('Error loading update logs:', error);
      setError(error instanceof ApiError ? error.message : 'Failed to load update logs');
      setUpdateLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const addUpdateLog = async (log: Omit<UpdateLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<UpdateLog> => {
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
      setUpdateLogs(prev => prev.map(log => log.id === id ? updatedLog : log));
      return updatedLog;
    } catch (error) {
      console.error('Error updating update log:', error);
      throw error;
    }
  };

  const deleteUpdateLog = async (id: string): Promise<void> => {
    try {
      await updateLogsApi.deleteUpdateLog(id);
      setUpdateLogs(prev => prev.filter(log => log.id !== id));
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
    publishedUpdateLogs,
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

export const useUpdateLogs = (): UpdateLogsContextType => {
  const context = useContext(UpdateLogsContext);
  if (context === undefined) {
    throw new Error('useUpdateLogs must be used within an UpdateLogsProvider');
  }
  return context;
};

export default UpdateLogsContext; 