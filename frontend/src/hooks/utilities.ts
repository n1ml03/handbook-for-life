/**
 * Consolidated Utility Hooks
 * 
 * This file contains commonly used utility hooks that were previously
 * in separate files. Consolidating them reduces file fragmentation
 * and improves maintainability.
 */

import { useState, useEffect } from "react";

/**
 * useDebounce Hook
 * 
 * Debounces a value by delaying its update until after the specified delay.
 * Useful for search inputs, API calls, and other scenarios where you want
 * to wait for user input to stabilize before taking action.
 * 
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useLocalStorage Hook
 * 
 * Syncs state with localStorage, providing persistent state across sessions.
 * Automatically handles JSON serialization/deserialization and storage events.
 * 
 * @param key - The localStorage key
 * @param defaultValue - The default value if no stored value exists
 * @returns A tuple of [value, setValue] similar to useState
 * 
 * @example
 * const [theme, setTheme] = useLocalStorage('theme', 'dark');
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((val: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = (val: T | ((val: T) => T)) => {
    try {
      const valueToStore = val instanceof Function ? val(value) : val;
      setValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setValue(JSON.parse(e.newValue));
        } catch (error) {
          console.warn(`Error parsing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [value, setStoredValue];
}

