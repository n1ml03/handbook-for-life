import React from 'react';
import { Edit3, Trash2, Tags, Plus, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UpdateLog } from '@/types';

interface UpdateLogManagementProps {
  updateLogs: UpdateLog[];
  onEditUpdateLog: (log: UpdateLog) => void;
  onDeleteUpdateLog: (logId: string) => Promise<void>;
  onCreateNew: () => void;
  isEditMode: boolean;
}

export const UpdateLogManagement: React.FC<UpdateLogManagementProps> = ({
  updateLogs,
  onEditUpdateLog,
  onDeleteUpdateLog,
  onCreateNew,
  isEditMode
}) => {
  const handleDelete = async (logId: string) => {
    if (confirm('Are you sure you want to delete this update log?')) {
      try {
        await onDeleteUpdateLog(logId);
      } catch (error) {
        console.error('Error deleting update log:', error);
        alert('Failed to delete update log. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Update Logs Management</h2>
        <Button 
          onClick={onCreateNew}
          className="bg-gradient-to-r from-accent-pink to-accent-purple"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Update Log
        </Button>
      </div>

      {!isEditMode && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {updateLogs.map(log => (
              <div key={log.id} className="doax-card p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="text-xs font-mono">
                        {log.version}
                      </Badge>
                      <h3 className="text-lg font-semibold">{log.title}</h3>
                      {!log.isPublished && (
                        <Badge variant="secondary" className="text-xs">Draft</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {log.description || log.content.split('\n').find(line => line.trim() && !line.startsWith('#'))?.slice(0, 150)}
                      {(log.description || log.content).length > 150 && '...'}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {log.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tags className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {log.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{log.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Released: {log.date}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditUpdateLog(log)}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(log.id)}
                      className="text-red-600 border-red-200 focus:ring-2 focus:ring-red-100 focus:outline-hidden transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {updateLogs.length === 0 && (
            <div className="doax-card p-8 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No update logs yet</h3>
              <p className="text-muted-foreground mb-4">Create your first update log to get started</p>
              <Button onClick={onCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Create Update Log
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 