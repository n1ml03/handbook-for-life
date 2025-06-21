import { cn } from '@/services/utils';
import type { ReactNode } from 'react';

interface SpacingProps {
  children?: ReactNode;
  className?: string;
}

interface SectionProps extends SpacingProps {
  title?: string;
  description?: string;
  action?: ReactNode;
}

// Enhanced container with optimal spacing
export const Container = ({ children, className }: SpacingProps) => (
  <div className={cn('viewport-optimized space-y-8', className)}>{children}</div>
);

// Card with enhanced spacing and visual hierarchy
export const SpacingCard = ({ children, className }: SpacingProps) => (
  <div className={cn('doax-card p-8 space-y-6', className)}>{children}</div>
);

// Compact card for dense layouts
export const CompactCard = ({ children, className }: SpacingProps) => (
  <div className={cn('doax-card p-6 space-y-4', className)}>{children}</div>
);

// Section with header and content
export const Section = ({ children, title, description, action, className }: SectionProps) => (
  <div className={cn('space-y-6', className)}>
    {(title || description || action) && (
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          {title && (
            <h2 className="text-2xl font-bold bg-gradient-to-r from-accent-pink to-accent-purple bg-clip-text text-transparent">{title}</h2>
          )}
          {description && (
            <p className="text-muted-foreground leading-relaxed">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    )}
    {children && children}
  </div>
);

// Grid with responsive spacing
export const Grid = ({ children, className, cols = 1, gap = 'md' }: { children: ReactNode; className?: string; cols?: 1 | 2 | 3 | 4; gap?: 'sm' | 'md' | 'lg' }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };
  const gridGap = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };
  return (
    <div className={cn('grid performance-grid', gridCols[cols], gridGap[gap], className)}>{children}</div>
  );
};

// Stack with consistent vertical spacing
export const Stack = ({ children, className, spacing = 'md' }: { children: ReactNode; className?: string; spacing?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const spacingClasses = {
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6',
    xl: 'space-y-8',
  };
  return <div className={cn(spacingClasses[spacing], className)}>{children}</div>;
};

// Inline elements with horizontal spacing
export const Inline = ({ children, className, spacing = 'md', align = 'start', wrap = true }: { children: ReactNode; className?: string; spacing?: 'sm' | 'md' | 'lg'; align?: 'start' | 'center' | 'end' | 'between'; wrap?: boolean }) => {
  const spacingClasses = {
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
  };
  const alignClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  };
  return (
    <div className={cn('flex items-center', spacingClasses[spacing], alignClasses[align], wrap ? 'flex-wrap' : undefined, className)}>{children}</div>
  );
};

// Divider with proper spacing
export const Divider = ({ className }: { className?: string }) => <div className={cn('border-t border-border/50', className)} />;

// Enhanced form group with proper spacing
export const FormGroup = ({ label, description, error, required, children, className }: { label: string; description?: string; error?: string; required?: boolean; children: ReactNode; className?: string }) => (
  <div className={cn('space-y-2', className)}>
    {label && (
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
    )}
    {description && <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>}
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
  </div>
);

// Toolbar with consistent spacing
export const Toolbar = ({ children, className, align = 'between' }: { children: ReactNode; className?: string; align?: 'start' | 'center' | 'end' | 'between' }) => {
  const alignClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  };
  return (
    <div className={cn('flex items-center gap-3 p-4 bg-muted/30 border border-border rounded-xl', alignClasses[align], className)}>{children}</div>
  );
};

// Status indicator with proper spacing
export const StatusBadge = ({ status, children, className }: { status: 'success' | 'warning' | 'error' | 'info'; children: ReactNode; className?: string }) => {
  const statusClasses = {
    success: 'bg-green-500/10 text-green-600 border-green-500/20',
    warning: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-600 border-red-500/20',
    info: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  };
  return (
    <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium', statusClasses[status], className)}>{children}</div>
  );
};
