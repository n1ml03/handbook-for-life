import { useEffect, useCallback, useState } from 'react';

type ThemeMode = 'dark' | 'light' | 'system';

export function useTheme() {
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');

  // Detect system theme preference
  const getSystemTheme = useCallback((): 'dark' | 'light' => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  const setTheme = useCallback((newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    localStorage.setItem('doaxvv-theme', newTheme);
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Initialize theme on first load
  useEffect(() => {
    const savedTheme = localStorage.getItem('doaxvv-theme') as ThemeMode;
    const systemTheme = getSystemTheme();

    if (!savedTheme) {
      // First time user - use system preference
      setTheme(systemTheme);
    } else if (savedTheme === 'system') {
      // User prefers system theme
      setTheme(systemTheme);
    } else {
      // Use saved preference
      setTheme(savedTheme as 'dark' | 'light');
    }
  }, [getSystemTheme, setTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const savedTheme = localStorage.getItem('doaxvv-theme');
      if (savedTheme === 'system' || !savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [setTheme]);

  // Apply theme to document on theme change
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return { theme, setTheme };
}