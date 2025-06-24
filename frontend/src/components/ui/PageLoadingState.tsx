import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/services/utils';

interface PageLoadingStateProps {
  isLoading: boolean;
  children: ReactNode;
  message?: string;
  className?: string;
  minHeight?: string;
}

function PageLoadingSpinner() {
  return (
    <div className="relative">
      {/* Main spinner */}
      <motion.div
        className="w-12 h-12 rounded-full border-3 border-muted/30 border-t-accent-pink border-r-accent-cyan"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Inner accent */}
      <motion.div
        className="absolute inset-2 rounded-full border-2 border-transparent border-b-accent-purple"
        animate={{ rotate: -360 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
}

export function PageLoadingState({ 
  isLoading, 
  children, 
  message = 'Đang tải nội dung...', 
  className,
  minHeight = 'min-h-[40vh]'
}: PageLoadingStateProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          'flex flex-col items-center justify-center space-y-6',
          minHeight,
          className
        )}
      >
        {/* Loading card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="doax-card p-8 text-center max-w-md"
        >
          <div className="flex flex-col items-center space-y-4">
            <PageLoadingSpinner />
            
            <div className="space-y-2">
              <motion.p
                className="text-lg font-medium text-foreground"
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {message}
              </motion.p>
              
              <div className="flex justify-center space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-accent-cyan"
                    animate={{ 
                      opacity: [0.3, 1, 0.3],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// Quick loading states for different content types
export const QuickPageLoader = ({ 
  message = 'Đang tải...',
  className 
}: { 
  message?: string; 
  className?: string; 
}) => (
  <div className={cn('flex items-center justify-center py-12', className)}>
    <div className="flex items-center space-x-3">
      <PageLoadingSpinner />
      <span className="text-muted-foreground">{message}</span>
    </div>
  </div>
);

// Inline loading for sections
export const InlinePageLoader = ({ 
  message = 'Đang tải...',
  size = 'sm',
  className 
}: { 
  message?: string; 
  size?: 'sm' | 'md';
  className?: string; 
}) => {
  const spinnerSize = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  
  return (
    <div className={cn('flex items-center space-x-2 text-muted-foreground', className)}>
      <motion.div
        className={cn('rounded-full border-2 border-muted/30 border-t-accent-cyan', spinnerSize)}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <span className="text-sm">{message}</span>
    </div>
  );
}; 