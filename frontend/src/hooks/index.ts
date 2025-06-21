// Re-export all hooks from services that are now hooks
export { useTheme } from '@/services/useTheme'
export { useScrollDirection } from '@/services/useScrollDirection'
export { useMultiLanguageSearch } from '@/services/useMultiLanguageSearch'

// Custom hooks can be added here as the application grows
export * from './useLocalStorage'
export * from './useDebounce' 