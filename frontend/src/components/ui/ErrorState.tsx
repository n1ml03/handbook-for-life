import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/services/utils';

interface ErrorStateProps {
  title?: string;
  description?: string;
  error?: string;
  onRetry?: () => void;
  className?: string;
  icon?: React.ReactNode;
  retryLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  error,
  onRetry,
  className,
  icon,
  retryLabel = 'Retry',
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-red-500/10">
        {icon || <AlertCircle className="w-10 h-10 text-red-500" />}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-foreground">
        {title}
      </h3>
      <p className="text-muted-foreground mb-2">
        {description}
      </p>
      {error && (
        <pre className="text-xs text-red-400 bg-red-900/10 rounded p-2 mb-4 max-w-md mx-auto overflow-x-auto">
          {error}
        </pre>
      )}
      {onRetry && (
        <Button
          onClick={onRetry}
          className="bg-accent-cyan/10 text-accent-cyan px-4 py-2 rounded-lg font-medium hover:bg-accent-cyan/20 transition-colors"
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

export default ErrorState; 