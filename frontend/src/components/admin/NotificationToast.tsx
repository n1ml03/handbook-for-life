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
      "flex items-start gap-3 p-4 rounded-xl border shadow-xl transition-all duration-300",
      "bg-background/90 backdrop-blur-md border-border/40",
      "hover:shadow-2xl hover:scale-[1.02] transform",
      "animate-in slide-in-from-right-5 fade-in duration-300"
    )}>
      <div className={cn(
        "shrink-0 mt-0.5 p-1.5 rounded-lg",
        notification.type === 'success' ? "bg-emerald-100/50 text-emerald-600" : "",
        notification.type === 'error' ? "bg-red-100/50 text-red-600" : "",
        notification.type === 'warning' ? "bg-amber-100/50 text-amber-600" : "",
        notification.type === 'info' ? "bg-blue-100/50 text-blue-600" : ""
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
          "bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground",
          "focus:ring-2 focus:ring-border/50 focus:outline-none",
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