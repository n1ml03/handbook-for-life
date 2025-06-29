import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '@/contexts/LoadingContext';
import { cn } from '@/services/utils';

interface PulseWaveProps {
  delay?: number;
  className?: string;
}

function PulseWave({ delay = 0, className }: PulseWaveProps) {
  return (
    <motion.div
      className={cn(
        "absolute inset-0 rounded-full border-2 border-accent-cyan/30",
        className
      )}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ 
        scale: [0, 1.5, 2],
        opacity: [1, 0.5, 0]
      }}
      transition={{
        duration: 2,
        delay,
        repeat: Infinity,
        ease: "easeOut"
      }}
    />
  );
}

function LoadingSpinnerEnhanced() {
  return (
    <div className="relative w-16 h-16">
      {/* Outer spinning ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-4 border-transparent border-t-accent-cyan border-r-accent-pink"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Inner spinning ring */}
      <motion.div
        className="absolute inset-2 rounded-full border-3 border-transparent border-b-accent-purple border-l-accent-pink"
        animate={{ rotate: -360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Center pulsing dot */}
      <motion.div
        className="absolute inset-6 rounded-full bg-gradient-to-r from-accent-cyan to-accent-pink"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Pulse waves */}
      <PulseWave delay={0} />
      <PulseWave delay={0.5} />
      <PulseWave delay={1} />
    </div>
  );
}

export function GlobalLoadingOverlay() {
  const { isGlobalLoading, loadingMessage, loadingProgress } = useLoading();

  return (
    <AnimatePresence>
      {isGlobalLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          {/* Background with gradient */}
          <div className="absolute inset-0 bg-background/90" />
          <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/5 via-accent-cyan/5 to-accent-purple/5" />
          
          {/* Loading content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative z-10 bg-background/95 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4"
          >
            <div className="flex flex-col items-center gap-6">
              {/* Enhanced loading spinner */}
              <LoadingSpinnerEnhanced />
              
              {/* Loading text with animation */}
              <div className="text-center space-y-3">
                <motion.h3
                  className="text-lg font-semibold bg-gradient-to-r from-accent-cyan to-accent-pink bg-clip-text text-transparent"
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {loadingMessage}
                </motion.h3>
                
                {/* Progress bar */}
                {loadingProgress !== undefined && (
                  <div className="w-full space-y-2">
                    <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-accent-cyan via-accent-pink to-accent-purple rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(0, Math.min(100, loadingProgress))}%` }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      {Math.round(loadingProgress)}% hoàn thành
                    </p>
                  </div>
                )}
                
                {/* Animated dots */}
                <div className="flex justify-center gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-accent-cyan/60"
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.2,
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
      )}
    </AnimatePresence>
  );
} 