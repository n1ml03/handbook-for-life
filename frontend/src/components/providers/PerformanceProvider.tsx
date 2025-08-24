import React, { useEffect, useState, type PropsWithChildren } from 'react';

interface PerformanceProviderProps extends PropsWithChildren {
  className?: string;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ 
  children, 
  className 
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if fonts are loaded
    const checkFontsLoaded = async () => {
      try {
        // Check for Inter font
        await document.fonts.load('400 16px Inter');
        await document.fonts.load('500 16px Inter');
        await document.fonts.load('600 16px Inter');
        
        // Check for JetBrains Mono font (if needed)
        await document.fonts.load('400 14px "JetBrains Mono"');
        
        // Small delay to ensure everything is ready
        setTimeout(() => setIsReady(true), 100);
      } catch (error) {
        console.warn('Font loading check failed:', error);
        // Fallback: assume fonts are loaded after timeout
        setTimeout(() => {
          setIsReady(true);
        }, 500);
      }
    };

    // Start font loading check
    if (document.fonts && typeof document.fonts.load === 'function') {
      checkFontsLoaded();
    } else {
      // Fallback for older browsers
      setTimeout(() => {
        setIsReady(true);
      }, 300);
    }

    // Performance optimization: remove will-change properties after animations
    const handleAnimationEnd = () => {
      const elements = document.querySelectorAll('[style*="will-change"]');
      elements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.willChange = 'auto';
        }
      });
    };

    // Clean up will-change properties periodically
    const cleanupInterval = setInterval(() => {
      const elements = document.querySelectorAll('.will-change-transform, .will-change-opacity');
      elements.forEach(el => {
        if (el instanceof HTMLElement && !el.matches(':hover, :focus, :active')) {
          el.style.willChange = 'auto';
        }
      });
    }, 5000);

    document.addEventListener('animationend', handleAnimationEnd);
    document.addEventListener('transitionend', handleAnimationEnd);

    return () => {
      clearInterval(cleanupInterval);
      document.removeEventListener('animationend', handleAnimationEnd);
      document.removeEventListener('transitionend', handleAnimationEnd);
    };
  }, []);

  // Add performance classes to body
  useEffect(() => {
    if (isReady) {
      document.body.classList.add('fonts-loaded', 'app-ready');
      document.body.classList.remove('fonts-loading');
    } else {
      document.body.classList.add('fonts-loading');
      document.body.classList.remove('fonts-loaded', 'app-ready');
    }

    return () => {
      document.body.classList.remove('fonts-loaded', 'fonts-loading', 'app-ready');
    };
  }, [isReady]);

  return (
    <div 
      className={`performance-optimized ${isReady ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300 ${className || ''}`}
      style={{
        willChange: isReady ? 'auto' : 'opacity'
      }}
    >
      {children}
    </div>
  );
};
