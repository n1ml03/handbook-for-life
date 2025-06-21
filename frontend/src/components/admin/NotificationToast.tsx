import React from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/services/utils';

interface NotificationState {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
}

interface NotificationToastProps {
  notification: NotificationState;
  onRemove: (id: string) => void;
}

export const NotificationToast = React.memo(function NotificationToast({ 
  notification, 
  onRemove 
}: NotificationToastProps) {
  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300",
      "bg-background/95 backdrop-blur-sm",
      {
        "border-green-500/20 bg-green-500/5": notification.type === 'success',
        "border-red-500/20 bg-red-500/5": notification.type === 'error',
        "border-yellow-500/20 bg-yellow-500/5": notification.type === 'warning',
        "border-blue-500/20 bg-blue-500/5": notification.type === 'info'
      }
    )}>
      <div className="shrink-0 mt-0.5">
        {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
        {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
        {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
        {notification.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground">{notification.title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
      </div>
      <button
        onClick={() => onRemove(notification.id)}
        className="shrink-0 p-1 rounded-md bg-muted/20 transition-colors duration-200 focus:ring-2 focus:ring-accent-cyan/20 focus:outline-hidden"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4 text-muted-foreground" />
      </button>
    </div>
  );
});

export type { NotificationState }; 