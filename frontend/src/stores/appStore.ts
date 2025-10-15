/**
 * Consolidated Application Store
 * 
 * This file consolidates all application stores using Zustand's slice pattern.
 * Each slice maintains its own state and actions, but they're all combined
 * into a single store for better organization and reduced file fragmentation.
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import { UpdateLog, Document } from "@/types";
import { updateLogsApi, documentsApi, ApiError } from "@/services/api";
import {
  safeExtractArrayData,
  compareEntityIds,
  generateDocumentCategory,
} from "@/services/utils";

// ============================================================================
// ACCESSIBILITY SLICE
// ============================================================================

export interface AccessibilitySlice {
  // State
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: "normal" | "large" | "extra-large";

  // Actions
  setReducedMotion: (reducedMotion: boolean) => void;
  setHighContrast: (highContrast: boolean) => void;
  setFontSize: (fontSize: "normal" | "large" | "extra-large") => void;
  announceMessage: (message: string) => void;
  initializeFromSystem: () => void;
}

const createAccessibilitySlice = (set: any, get: any): AccessibilitySlice => ({
  // Initial state
  reducedMotion: false,
  highContrast: false,
  fontSize: "normal",

  // Actions
  setReducedMotion: (reducedMotion: boolean) => {
    set({ reducedMotion }, false, "accessibility/setReducedMotion");
    applyAccessibilitySettings(get());
  },

  setHighContrast: (highContrast: boolean) => {
    set({ highContrast }, false, "accessibility/setHighContrast");
    applyAccessibilitySettings(get());
  },

  setFontSize: (fontSize: "normal" | "large" | "extra-large") => {
    set({ fontSize }, false, "accessibility/setFontSize");
    applyAccessibilitySettings(get());
  },

  announceMessage: (message: string) => {
    const announcer = document.createElement("div");
    announcer.setAttribute("aria-live", "polite");
    announcer.setAttribute("aria-atomic", "true");
    announcer.className = "sr-only";
    announcer.textContent = message;
    document.body.appendChild(announcer);

    setTimeout(() => {
      if (document.body.contains(announcer)) {
        document.body.removeChild(announcer);
      }
    }, 1000);
  },

  initializeFromSystem: () => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const contrastQuery = window.matchMedia("(prefers-contrast: high)");

    set(
      {
        reducedMotion: motionQuery.matches,
        highContrast: contrastQuery.matches,
      },
      false,
      "accessibility/initializeFromSystem",
    );

    const handleMotionChange = (e: MediaQueryListEvent) => {
      get().setReducedMotion(e.matches);
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      get().setHighContrast(e.matches);
    };

    motionQuery.addEventListener("change", handleMotionChange);
    contrastQuery.addEventListener("change", handleContrastChange);

    applyAccessibilitySettings(get());

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
      contrastQuery.removeEventListener("change", handleContrastChange);
    };
  },
});

// Helper function to apply accessibility settings to the DOM
function applyAccessibilitySettings(state: any) {
  const root = document.documentElement;

  if (state.reducedMotion) {
    root.classList.add("reduce-motion");
  } else {
    root.classList.remove("reduce-motion");
  }

  if (state.highContrast) {
    root.classList.add("high-contrast");
  } else {
    root.classList.remove("high-contrast");
  }

  root.classList.remove("font-large", "font-extra-large");
  if (state.fontSize === "large") {
    root.classList.add("font-large");
  } else if (state.fontSize === "extra-large") {
    root.classList.add("font-extra-large");
  }
}

// ============================================================================
// LOADING SLICE
// ============================================================================

export interface LoadingSlice {
  // State
  isGlobalLoading: boolean;
  loadingMessage: string;
  loadingProgress?: number;

  // Actions
  setGlobalLoading: (
    loading: boolean,
    message?: string,
    progress?: number,
  ) => void;
  clearGlobalLoading: () => void;
  showGlobalLoading: (message?: string, progress?: number) => void;
  hideGlobalLoading: () => void;
  updateLoadingProgress: (progress: number, message?: string) => void;
}

const createLoadingSlice = (set: any): LoadingSlice => ({
  // Initial state
  isGlobalLoading: false,
  loadingMessage: "Loading...",
  loadingProgress: undefined,

  // Actions
  setGlobalLoading: (
    loading: boolean,
    message: string = "Loading...",
    progress?: number,
  ) => {
    set(
      {
        isGlobalLoading: loading,
        loadingMessage: message,
        loadingProgress: progress,
      },
      false,
      "loading/setGlobalLoading",
    );
  },

  clearGlobalLoading: () => {
    set(
      {
        isGlobalLoading: false,
        loadingMessage: "Loading...",
        loadingProgress: undefined,
      },
      false,
      "loading/clearGlobalLoading",
    );
  },

  showGlobalLoading: (
    message: string = "Đang tải dữ liệu...",
    progress?: number,
  ) => {
    set(
      {
        isGlobalLoading: true,
        loadingMessage: message,
        loadingProgress: progress,
      },
      false,
      "loading/showGlobalLoading",
    );
  },

  hideGlobalLoading: () => {
    set(
      {
        isGlobalLoading: false,
        loadingMessage: "Loading...",
        loadingProgress: undefined,
      },
      false,
      "loading/hideGlobalLoading",
    );
  },

  updateLoadingProgress: (progress: number, message?: string) => {
    set(
      (state: any) => ({
        isGlobalLoading: true,
        loadingMessage: message || state.loadingMessage,
        loadingProgress: progress,
      }),
      false,
      "loading/updateLoadingProgress",
    );
  },
});

// ============================================================================
// UPDATE LOGS SLICE
// ============================================================================

export interface UpdateLogsSlice {
  // State
  updateLogs: UpdateLog[];
  updateLogsLoading: boolean;
  updateLogsError: string | null;

  // Actions
  loadUpdateLogs: () => Promise<void>;
  addUpdateLog: (
    log: Omit<UpdateLog, "id" | "created_at" | "updated_at">,
  ) => Promise<UpdateLog>;
  updateUpdateLog: (
    id: string,
    updates: Partial<UpdateLog>,
  ) => Promise<UpdateLog>;
  deleteUpdateLog: (id: string) => Promise<void>;
  refreshUpdateLogs: () => Promise<void>;
  setUpdateLogs: (updateLogs: UpdateLog[]) => void;
  setUpdateLogsLoading: (loading: boolean) => void;
  setUpdateLogsError: (error: string | null) => void;
}

const createUpdateLogsSlice = (set: any, get: any): UpdateLogsSlice => ({
  // Initial state
  updateLogs: [],
  updateLogsLoading: true,
  updateLogsError: null,

  // Actions
  loadUpdateLogs: async () => {
    try {
      set(
        { updateLogsLoading: true, updateLogsError: null },
        false,
        "updateLogs/loadUpdateLogs/start",
      );

      const response = await updateLogsApi.getUpdateLogs({
        sortBy: "date",
        sortOrder: "desc",
        limit: 100,
      });

      const responseData = safeExtractArrayData<UpdateLog>(
        response,
        "update logs API",
      );

      set(
        {
          updateLogs: responseData,
          updateLogsLoading: false,
        },
        false,
        "updateLogs/loadUpdateLogs/success",
      );
    } catch (error) {
      console.error("Error loading update logs:", error);
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : "Failed to load update logs";

      set(
        {
          updateLogsError: errorMessage,
          updateLogs: [],
          updateLogsLoading: false,
        },
        false,
        "updateLogs/loadUpdateLogs/error",
      );
    }
  },

  addUpdateLog: async (
    log: Omit<UpdateLog, "id" | "created_at" | "updated_at">,
  ) => {
    try {
      const newLog = await updateLogsApi.createUpdateLog(log);
      set(
        (state: any) => ({
          updateLogs: [newLog, ...state.updateLogs],
        }),
        false,
        "updateLogs/addUpdateLog",
      );
      return newLog;
    } catch (error) {
      console.error("Error adding update log:", error);
      throw error;
    }
  },

  updateUpdateLog: async (id: string, updates: Partial<UpdateLog>) => {
    try {
      const updatedLog = await updateLogsApi.updateUpdateLog(id, updates);
      set(
        (state: any) => ({
          updateLogs: state.updateLogs.map((log: UpdateLog) =>
            compareEntityIds(log.id, id) ? updatedLog : log,
          ),
        }),
        false,
        "updateLogs/updateUpdateLog",
      );
      return updatedLog;
    } catch (error) {
      console.error("Error updating update log:", error);
      throw error;
    }
  },

  deleteUpdateLog: async (id: string) => {
    try {
      await updateLogsApi.deleteUpdateLog(id);
      set(
        (state: any) => ({
          updateLogs: state.updateLogs.filter(
            (log: UpdateLog) => !compareEntityIds(log.id, id),
          ),
        }),
        false,
        "updateLogs/deleteUpdateLog",
      );
    } catch (error) {
      console.error("Error deleting update log:", error);
      throw error;
    }
  },

  refreshUpdateLogs: async () => {
    await get().loadUpdateLogs();
  },

  setUpdateLogs: (updateLogs: UpdateLog[]) => {
    set({ updateLogs }, false, "updateLogs/setUpdateLogs");
  },

  setUpdateLogsLoading: (loading: boolean) => {
    set({ updateLogsLoading: loading }, false, "updateLogs/setLoading");
  },

  setUpdateLogsError: (error: string | null) => {
    set({ updateLogsError: error }, false, "updateLogs/setError");
  },
});

// ============================================================================
// DOCUMENTS SLICE
// ============================================================================

export interface DocumentsSlice {
  // State
  documents: Document[];
  documentsLoading: boolean;
  documentsError: string | null;

  // Actions
  loadDocuments: () => Promise<void>;
  addDocument: (
    document: Omit<Document, "id" | "created_at" | "updated_at">,
  ) => Promise<Document>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<Document>;
  deleteDocument: (id: string) => Promise<void>;
  refreshDocuments: () => Promise<void>;
  getDocumentsByCategory: (category: string) => Document[];
  setDocuments: (documents: Document[]) => void;
  setDocumentsLoading: (loading: boolean) => void;
  setDocumentsError: (error: string | null) => void;
}

const createDocumentsSlice = (set: any, get: any): DocumentsSlice => ({
  // Initial state
  documents: [],
  documentsLoading: true,
  documentsError: null,

  // Actions
  loadDocuments: async () => {
    try {
      set(
        { documentsLoading: true, documentsError: null },
        false,
        "documents/loadDocuments/start",
      );

      const response = await documentsApi.getDocuments({
        sortBy: "updated_at",
        sortOrder: "desc",
        limit: 1000,
      });

      const responseData = safeExtractArrayData<Document>(
        response,
        "documents API",
      );

      set(
        {
          documents: responseData,
          documentsLoading: false,
        },
        false,
        "documents/loadDocuments/success",
      );
    } catch (error) {
      console.error("Error loading documents:", error);
      const errorMessage =
        error instanceof ApiError
          ? error.message
          : "Failed to load documents";

      set(
        {
          documentsError: errorMessage,
          documents: [],
          documentsLoading: false,
        },
        false,
        "documents/loadDocuments/error",
      );
    }
  },

  addDocument: async (
    document: Omit<Document, "id" | "created_at" | "updated_at">,
  ) => {
    try {
      const newDocument = await documentsApi.createDocument(document);
      set(
        (state: any) => ({
          documents: [newDocument, ...state.documents],
        }),
        false,
        "documents/addDocument",
      );
      return newDocument;
    } catch (error) {
      console.error("Error adding document:", error);
      throw error;
    }
  },

  updateDocument: async (id: string, updates: Partial<Document>) => {
    try {
      const updatedDocument = await documentsApi.updateDocument(id, updates);
      set(
        (state: any) => ({
          documents: state.documents.map((doc: Document) =>
            compareEntityIds(doc.id, id) ? updatedDocument : doc,
          ),
        }),
        false,
        "documents/updateDocument",
      );
      return updatedDocument;
    } catch (error) {
      console.error("Error updating document:", error);
      throw error;
    }
  },

  deleteDocument: async (id: string) => {
    try {
      await documentsApi.deleteDocument(id);
      set(
        (state: any) => ({
          documents: state.documents.filter(
            (doc: Document) => !compareEntityIds(doc.id, id),
          ),
        }),
        false,
        "documents/deleteDocument",
      );
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  },

  refreshDocuments: async () => {
    await get().loadDocuments();
  },

  getDocumentsByCategory: (category: string) => {
    return get().documents.filter(
      (doc: Document) => generateDocumentCategory(doc) === category,
    );
  },

  setDocuments: (documents: Document[]) => {
    set({ documents }, false, "documents/setDocuments");
  },

  setDocumentsLoading: (loading: boolean) => {
    set({ documentsLoading: loading }, false, "documents/setLoading");
  },

  setDocumentsError: (error: string | null) => {
    set({ documentsError: error }, false, "documents/setError");
  },
});

// ============================================================================
// COMBINED STORE
// ============================================================================

export type AppStore = AccessibilitySlice &
  LoadingSlice &
  UpdateLogsSlice &
  DocumentsSlice;

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...createAccessibilitySlice(set, get),
        ...createLoadingSlice(set),
        ...createUpdateLogsSlice(set, get),
        ...createDocumentsSlice(set, get),
      }),
      {
        name: "app-store",
        partialize: (state) => ({
          fontSize: state.fontSize,
          // Don't persist system preferences or data that should be fetched fresh
        }),
      },
    ),
    {
      name: "app-store",
    },
  ),
);

// ============================================================================
// CONVENIENCE SELECTORS
// ============================================================================

// Accessibility selectors
export const useAccessibility = () =>
  useAppStore(
    useShallow((state) => ({
      reducedMotion: state.reducedMotion,
      highContrast: state.highContrast,
      fontSize: state.fontSize,
      setReducedMotion: state.setReducedMotion,
      setHighContrast: state.setHighContrast,
      setFontSize: state.setFontSize,
      announceMessage: state.announceMessage,
      initializeFromSystem: state.initializeFromSystem,
    }))
  );

// Loading selectors
export const useLoading = () =>
  useAppStore(
    useShallow((state) => ({
      isGlobalLoading: state.isGlobalLoading,
      loadingMessage: state.loadingMessage,
      loadingProgress: state.loadingProgress,
      setGlobalLoading: state.setGlobalLoading,
      clearGlobalLoading: state.clearGlobalLoading,
      showGlobalLoading: state.showGlobalLoading,
      hideGlobalLoading: state.hideGlobalLoading,
      updateLoadingProgress: state.updateLoadingProgress,
    }))
  );

// Update logs selectors
export const useUpdateLogs = () =>
  useAppStore(
    useShallow((state) => ({
      updateLogs: state.updateLogs,
      isLoading: state.updateLogsLoading,
      error: state.updateLogsError,
      loadUpdateLogs: state.loadUpdateLogs,
      addUpdateLog: state.addUpdateLog,
      updateUpdateLog: state.updateUpdateLog,
      deleteUpdateLog: state.deleteUpdateLog,
      refreshUpdateLogs: state.refreshUpdateLogs,
    }))
  );

// Documents selectors
export const useDocuments = () =>
  useAppStore(
    useShallow((state) => ({
      documents: state.documents,
      isLoading: state.documentsLoading,
      error: state.documentsError,
      loadDocuments: state.loadDocuments,
      addDocument: state.addDocument,
      updateDocument: state.updateDocument,
      deleteDocument: state.deleteDocument,
      refreshDocuments: state.refreshDocuments,
      getDocumentsByCategory: state.getDocumentsByCategory,
    }))
  );

// Legacy exports for backward compatibility
export const useAccessibilityStore = useAppStore;
export const useLoadingStore = useAppStore;
export const useUpdateLogsStore = useAppStore;
export const useDocumentsStore = useAppStore;

// ============================================================================
// INITIALIZATION
// ============================================================================

// Initialize the store with system preferences and load data
if (typeof window !== "undefined") {
  useAppStore.getState().initializeFromSystem();
  useAppStore.getState().loadUpdateLogs();
  useAppStore.getState().loadDocuments();
}

