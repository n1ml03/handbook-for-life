// Core hooks from this directory
export { useAccessibility } from './useAccessibility'
export { useDocuments } from './useDocuments'
export { useUpdateLogs } from './useUpdateLogs'
export { useTheme } from './useTheme'
export * from './useLocalStorage'
export * from './useDebounce'
export * from './useLoadingState'
export * from './usePerformanceMonitor'
export * from './useNotifications'
export * from './useDocumentPage'

// Complex search hooks remain in services
export { useMultiLanguageSearch, useMultiLanguageSearchWithPagination } from '@/services/multiLanguageSearch'

// Custom hooks can be added here as the application grows

// React Query hooks
export * from './useApiQueries'