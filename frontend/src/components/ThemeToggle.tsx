import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/services/useTheme';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // Create derived values from the theme state
  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  // Toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleQuickToggle = (e: React.MouseEvent) => {
    // Quick toggle on direct click
    e.preventDefault();
    toggleTheme();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={handleQuickToggle}
          className="relative overflow-hidden theme-sync min-w-[40px] min-h-[40px] w-9 h-9 sm:min-w-[44px] sm:min-h-[44px] sm:w-11 sm:h-11 hover:bg-accent/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 doax-glass"
          aria-label={`Current theme: ${theme}. Click to toggle or right-click for options`}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative">
              {isDark && (
                <Moon
                  className="w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 rotate-0 scale-100"
                  style={{ minWidth: 'var(--min-icon-size)', minHeight: 'var(--min-icon-size)' }}
                />
              )}
              {isLight && (
                <Sun
                  className="w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 rotate-0 scale-100"
                  style={{ minWidth: 'var(--min-icon-size)', minHeight: 'var(--min-icon-size)' }}
                />
              )}
            </div>
          </div>

          {/* Visual feedback indicator */}
          <div className="absolute inset-0 rounded-md bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200" />
        </Button>
      </DropdownMenuTrigger>

      {/* Uncomment if you want the dropdown menu options */}
      {/* <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Sun className="w-4 h-4" />
          <span>Light Mode</span>
          {isLight && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Moon className="w-4 h-4" />
          <span>Dark Mode</span>
          {isDark && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent> */}
    </DropdownMenu>
  );
}