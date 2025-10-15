// Core hooks from this directory
export * from "./utilities"; // Consolidated utility hooks (useDebounce, useLocalStorage)
export * from "./useLoadingState";
export * from "./usePerformanceMonitor";
export * from "./useNotifications";
export * from "./useDocumentPage";

// Store hooks (re-exported from stores for convenience)
export { useAccessibility, useDocuments, useUpdateLogs } from "@/stores";

// Complex search hooks remain in services
export {
  useMultiLanguageSearch,
  useMultiLanguageSearchWithPagination,
} from "@/services/multiLanguageSearch";

// Custom hooks can be added here as the application grows

// React Query hooks
export * from "./useApiQueries";
