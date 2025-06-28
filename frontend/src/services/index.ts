// Main API service
export * from './api';

// Multi-language search utilities (consolidated)
export * from './multiLanguageSearch';

// Utility functions (consolidated from apiHelpers.ts)
export * from './utils';

// Re-export commonly used types for convenience
export type { Language, Translation, MultiLanguageItem } from './multiLanguageSearch'; 