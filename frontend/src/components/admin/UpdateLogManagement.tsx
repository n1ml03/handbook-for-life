import React, { useMemo } from 'react';
import { Trash2, Plus, FileText, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OptimizedCardGrid } from '@/components/ui/optimized-card-grid';
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

  // Memoized update log card renderer for virtual scrolling
  const renderUpdateLogCard = useMemo(() => (log: UpdateLog, index: number) => (
    <motion.div
      className="doax-card p-4 cursor-pointer transition-all duration-200 focus-within:ring-2 focus-within:ring-accent-cyan/20 focus-within:outline-none"
      onClick={() => onEditUpdateLog(log)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEditUpdateLog(log);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Edit update log: ${log.title}`}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="text-xs font-mono shrink-0">
              {log.version}
            </Badge>
            <h3 className="text-lg font-semibold truncate">{log.title}</h3>
          </div>
          <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
            {log.description || log.content?.split('\n').find(line => line.trim() && !line.startsWith('#'))?.slice(0, 150) || 'No description available'}
            {(log.description || log.content || '').length > 150 && '...'}
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            {(log.tags || []).slice(0, 3).map((tag, index) => (
              <Badge key={`${log.id}-tag-${index}`} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {(log.tags || []).length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{(log.tags || []).length - 3}
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 inline mr-1" />
            Released: {log.date}
          </div>
        </div>
        <div className="flex gap-2 ml-4 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(log.id.toString());
            }}
            className="text-red-600 border-red-200 hover:bg-red-50 focus:ring-2 focus:ring-red-100 focus:outline-none transition-colors duration-200"
            aria-label={`Delete update log: ${log.title}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  ), [onEditUpdateLog, handleDelete]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Update Logs Management</h2>
      </div>

      {!isEditMode && (
        <>
          {/* Virtual Scrolling Update Log Grid */}
          <OptimizedCardGrid
            items={updateLogs}
            renderCard={renderUpdateLogCard}
            className="admin-card-grid"
            itemsPerPage={20}
            enableLazyLoading={true}
            gridCols={{ mobile: 1, tablet: 1, desktop: 1 }}
            gap="sm"
            enableAnimations={true}
          />

          {/* Empty State */}
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
        </>
      )}
    </div>
  );
};