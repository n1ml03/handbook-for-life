/**
 * Consolidated Application Store Exports
 *
 * All stores have been consolidated into a single appStore using Zustand's slice pattern.
 * This provides better organization and reduces file fragmentation.
 */

export {
  useAppStore,
  useAccessibility,
  useLoading,
  useUpdateLogs,
  useDocuments,
  // Legacy exports for backward compatibility
  useAccessibilityStore,
  useLoadingStore,
  useUpdateLogsStore,
  useDocumentsStore,
} from "./appStore";

// Re-export types for convenience
export type {
  AppStore,
  AccessibilitySlice,
  LoadingSlice,
  UpdateLogsSlice,
  DocumentsSlice,
} from "./appStore";
