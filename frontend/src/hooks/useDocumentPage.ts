import { useState, useEffect, useCallback, useMemo } from "react";
import { Document, DocumentViewMode, SortDirection } from "@/types";
import { useDocuments } from "@/hooks";
import { useDebounce } from "@/hooks";

type ActiveSection = "checklist-creation" | "checking-guide" | "tutorial";

interface UseDocumentPageProps {
  initialSection?: ActiveSection;
}

export const useDocumentPage = (props: UseDocumentPageProps = {}) => {
  const { documents, updateDocument, loadDocuments, isLoading } =
    useDocuments();

  // State management
  const [activeSection, setActiveSection] = useState<ActiveSection>(
    props.initialSection || "checklist-creation",
  );
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<DocumentViewMode>("list");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filterValues, setFilterValues] = useState<
    Record<string, string | number | boolean>
  >({
    search: "",
    category: "",
    author: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState<string>("");
  const [editedJsonContent, setEditedJsonContent] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Debounce search to improve performance
  const debouncedSearch = useDebounce(filterValues.search, 500);

  // Ensure documents are loaded when component mounts
  useEffect(() => {
    if (documents.length === 0 && !isLoading) {
      loadDocuments();
    }
  }, [documents.length, isLoading, loadDocuments]);

  // Refresh data when window gains focus (user switches back to this tab/page)
  useEffect(() => {
    const handleFocus = () => {
      if (documents.length > 0) {
        loadDocuments();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [documents.length, loadDocuments]);

  // Listen for cross-page data synchronization events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "doaxvv-documents-updated" && e.newValue) {
        loadDocuments();
        localStorage.removeItem("doaxvv-documents-updated");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadDocuments]);

  // Filter documents based on active section
  const getSectionDocuments = useCallback(() => {
    return documents.filter((doc) => {
      if (activeSection === "checklist-creation") {
        return doc.document_type === "checklist";
      } else if (activeSection === "checking-guide") {
        return doc.document_type === "guide";
      } else if (activeSection === "tutorial") {
        return doc.document_type === "tutorial";
      }
      return false;
    });
  }, [documents, activeSection]);

  // Memoized filter values that include debounced search
  const filterValuesWithDebouncedSearch = useMemo(
    () =>
      ({
        ...filterValues,
        search: debouncedSearch,
      }) as Record<string, string | number | boolean>,
    [filterValues, debouncedSearch],
  );

  // Event handlers
  const handleDocumentClick = useCallback((document: Document) => {
    setSelectedDocument(document);
    setEditedContent(document.content);
    setEditedJsonContent(document.content_json_en || null); // Initialize JSON content
    setViewMode("document");
    setIsEditMode(false);
  }, []);

  const handleBackToList = useCallback(() => {
    setViewMode("list");
    setSelectedDocument(null);
    setIsEditMode(false);
    setEditedContent("");
    setEditedJsonContent(null);
  }, []);

  const handleEditToggle = useCallback(() => {
    if (isEditMode) {
      // Exiting edit mode - reset to original content
      setIsEditMode(false);
      setEditedContent(selectedDocument?.content || "");
      setEditedJsonContent(selectedDocument?.content_json_en || null);
    } else {
      // Entering edit mode - initialize with current content
      setIsEditMode(true);
      setEditedContent(selectedDocument?.content || "");
      setEditedJsonContent(selectedDocument?.content_json_en || null);
    }
  }, [isEditMode, selectedDocument]);

  const handleSaveDocument = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
    errorType?:
      | "validation"
      | "network"
      | "auth"
      | "notfound"
      | "conflict"
      | "server"
      | "unknown";
  }> => {
    if (!selectedDocument) {
      return {
        success: false,
        error: "No document selected",
        errorType: "validation",
      };
    }

    setIsSaving(true);
    try {
      // Validate content before saving
      // Always use JSON content as source of truth
      const jsonContentToSave = editedJsonContent || selectedDocument?.content_json_en;

      if (!jsonContentToSave) {
        throw new Error(
          "Cannot save: No valid document content available. Please ensure the editor has loaded properly."
        );
      }

      // Validate TipTap JSON format
      if (!jsonContentToSave.type || jsonContentToSave.type !== "doc") {
        throw new Error(
          'Invalid document format: TipTap document must have type "doc"',
        );
      }
      if (!Array.isArray(jsonContentToSave.content)) {
        throw new Error(
          "Invalid document format: TipTap document content must be an array",
        );
      }

      // Update the document with validated JSON content only
      const updateData = {
        content_json_en: jsonContentToSave
      };

      await updateDocument(selectedDocument.id.toString(), updateData);

      // Update selected document with the saved JSON content
      setSelectedDocument((prev) =>
        prev
          ? {
              ...prev,
              content_json_en: jsonContentToSave,
              content: editedContent, // Keep HTML for display
            }
          : null,
      );
      setIsEditMode(false);

      return { success: true };
    } catch (error: any) {
      console.error("Error saving document:", error);

      let errorType:
        | "validation"
        | "network"
        | "auth"
        | "notfound"
        | "conflict"
        | "server"
        | "unknown" = "unknown";
      let errorMessage = "Failed to save document. Please try again.";

      if (
        error?.message?.includes("empty") ||
        error?.message?.includes("validation") ||
        error?.message?.includes("Invalid")
      ) {
        errorType = "validation";
        errorMessage = error.message;
      } else if (
        error?.message?.includes("Network Error") ||
        error?.message?.includes("fetch")
      ) {
        errorType = "network";
        errorMessage =
          "Unable to connect to server. Please check your connection and try again.";
      } else if (error?.status === 400) {
        errorType = "validation";
        errorMessage =
          "Invalid document data. Please check your content and try again.";
      } else if (error?.status === 401) {
        errorType = "auth";
        errorMessage = "You are not authorized to save this document.";
      } else if (error?.status === 404) {
        errorType = "notfound";
        errorMessage =
          "Document not found. It may have been deleted. Please refresh the page.";
      } else if (error?.status === 409) {
        errorType = "conflict";
        errorMessage =
          "Document conflict detected. Please refresh and try again.";
      } else if (error?.status >= 500) {
        errorType = "server";
        errorMessage =
          "Server error occurred. Please try again later or contact support.";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      return { success: false, error: errorMessage, errorType };
    } finally {
      setIsSaving(false);
    }
  }, [selectedDocument, editedContent, editedJsonContent, updateDocument]);

  const handleFilterChange = useCallback(
    (key: string, value: string | number | boolean) => {
      setFilterValues((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleSortChange = useCallback(
    (newSortBy: string, newDirection: SortDirection) => {
      setSortBy(newSortBy);
      setSortDirection(newDirection);
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setFilterValues({
      search: "",
      category: "",
      author: "",
    });
  }, []);

  const handleSectionChange = useCallback((sectionId: string) => {
    setActiveSection(sectionId as ActiveSection);
    setViewMode("list");
    setSelectedDocument(null);
    setIsEditMode(false);
  }, []);

  const handleOnContentChange = useCallback((content: string) => {
    setEditedContent(content);
  }, []);

  const handleOnJsonContentChange = useCallback((jsonContent: any) => {
    setEditedJsonContent(jsonContent);
  }, []);

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (viewMode === "document") {
          handleBackToList();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, handleBackToList]);

  return {
    // State
    documents,
    activeSection,
    selectedDocument,
    viewMode,
    showFilters,
    sortBy,
    sortDirection,
    filterValues: filterValuesWithDebouncedSearch,
    isEditMode,
    editedContent,
    editedJsonContent,
    isSaving,
    debouncedSearch,
    isLoading,

    // Computed values
    sectionDocuments: getSectionDocuments(),

    // Actions
    setShowFilters,
    setEditedContent,
    handleDocumentClick,
    handleBackToList,
    handleEditToggle,
    handleSaveDocument,
    handleOnContentChange,
    handleOnJsonContentChange,
    handleFilterChange,
    handleSortChange,
    clearFilters,
    handleSectionChange,
    refreshDocuments: loadDocuments,
  };
};
