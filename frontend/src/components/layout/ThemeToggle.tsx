import React, { memo, useCallback } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/services/utils';

export interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle = memo<ThemeToggleProps>(({ className }) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const toggleTheme = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark');
  }, [isDark, setTheme]);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        // Base styles
        "relative overflow-hidden transition-all duration-200",
        // Size - consistent touch targets
        "w-10 h-10 min-w-[40px] min-h-[40px]",
        // Hover and focus styles
        "hover:bg-accent/80 hover:scale-105",
        "focus-visible:ring-2 focus-visible:ring-accent-cyan/50 focus-visible:ring-offset-2",
        // Glass effect
        "bg-background/80 backdrop-blur-sm border-border/50",
        // Theme-specific styling
        isDark ? "hover:border-accent-cyan/30" : "hover:border-accent-pink/30",
        className
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Icon with smooth transitions */}
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Moon 
            className="w-4 h-4 transition-all duration-300 rotate-0 scale-100 text-foreground" 
            strokeWidth={2}
          />
        ) : (
          <Sun 
            className="w-4 h-4 transition-all duration-300 rotate-0 scale-100 text-foreground" 
            strokeWidth={2}
          />
        )}
      </div>

      {/* Subtle hover glow effect */}
      <div 
        className={cn(
          "absolute inset-0 rounded-md opacity-0 transition-opacity duration-200",
          "hover:opacity-100 pointer-events-none",
          isDark 
            ? "bg-gradient-to-r from-accent-cyan/5 via-accent-cyan/10 to-accent-cyan/5" 
            : "bg-gradient-to-r from-accent-pink/5 via-accent-pink/10 to-accent-pink/5"
        )}
      />
    </Button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;