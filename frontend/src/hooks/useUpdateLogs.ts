import { useContext } from 'react';
import { UpdateLogsContext } from '@/contexts/UpdateLogsContext';

export const useUpdateLogs = () => {
  const context = useContext(UpdateLogsContext);
  if (context === undefined) {
    throw new Error('useUpdateLogs must be used within an UpdateLogsProvider');
  }
  return context;
}; 