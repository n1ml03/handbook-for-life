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
      "flex items-start gap-3 p-3 rounded-xl border transition-all duration-300",
      "bg-background/95 backdrop-blur-md border-border/50",
      "hover:bg-background transform hover:scale-[1.01]",
      "shadow-lg hover:shadow-xl",
      "animate-in slide-in-from-right-3 fade-in duration-300"
    )}>
      <div className={cn(
        "shrink-0 mt-0.5 p-1.5 rounded-lg",
        notification.type === 'success' ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "",
        notification.type === 'error' ? "bg-red-500/10 text-red-600 border border-red-500/20" : "",
        notification.type === 'warning' ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "",
        notification.type === 'info' ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" : ""
      )}>
        {notification.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
        {notification.type === 'error' && <AlertCircle className="w-4 h-4" />}
        {notification.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
        {notification.type === 'info' && <Info className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-foreground leading-tight">{notification.title}</h4>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{notification.message}</p>
      </div>
      <button
        onClick={() => onRemove(notification.id)}
        className={cn(
          "shrink-0 p-1.5 rounded-lg transition-all duration-200",
          "bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground",
          "focus:ring-2 focus:ring-accent-cyan/30 focus:outline-none",
          "hover:scale-110 active:scale-95"
        )}
        aria-label="Dismiss notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
});

export type { NotificationState }; 