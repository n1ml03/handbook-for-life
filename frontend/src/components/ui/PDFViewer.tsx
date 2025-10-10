import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  FileText,
  Eye,
  AlertCircle,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Clock,
  Highlighter,
  StickyNote,
  Bookmark,
  X,
  Edit3,
  Save,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/services/utils";
import { Document } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { documentsApi } from "@/services/api";

// Responsive breakpoints utility
const useResponsive = () => {
  const [screenSize, setScreenSize] = React.useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    width: 0,
    height: 0,
  });

  React.useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setScreenSize({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width,
        height,
      });
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);

    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
};

interface PDFViewerProps {
  document: Document;
  className?: string;
  showMetadata?: boolean;
  enableAnnotations?: boolean;
  enableFullscreen?: boolean;
  enableTableOfContents?: boolean;
  onPageChange?: (page: number) => void;
  onZoomChange?: (zoom: number) => void;
}

interface TOCItem {
  title: string;
  page: number;
  level: number;
  children?: TOCItem[];
}

// Annotation types
interface Annotation {
  id: string;
  type: 'highlight' | 'note' | 'bookmark';
  page: number;
  content: string;
  position?: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

type AnnotationMode = 'highlight' | 'note' | 'bookmark' | null;

export const PDFViewer: React.FC<PDFViewerProps> = ({
  document,
  className,
  showMetadata = true,
  enableAnnotations = false,
  enableFullscreen = true,
  enableTableOfContents = true,
  onPageChange,
  onZoomChange,
}) => {
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [tableOfContents, setTableOfContents] = useState<TOCItem[]>([]);
  const [showTOC, setShowTOC] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  // Annotation state
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [annotationMode, setAnnotationMode] = useState<AnnotationMode>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [showAnnotationPanel, setShowAnnotationPanel] = useState(false);
  const [annotationContent, setAnnotationContent] = useState('');

  // Use responsive hook
  const { isMobile } = useResponsive();

  // Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const readingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if document has PDF data
  const hasPDF = document.has_pdf_file && document.pdf_data;

  // Load PDF from binary endpoint (optimized - no base64 encoding)
  useEffect(() => {
    if (!document.has_pdf_file) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadPdf = async () => {
      setIsLoading(true);
      setHasError(false);
      setErrorMessage("");

      try {
        // Fetch PDF as binary blob from dedicated endpoint
        const blob = await documentsApi.getDocumentPdf(document.id.toString());

        if (isMounted) {
          const url = URL.createObjectURL(blob);
          setPdfBlobUrl(url);
          setIsLoading(false);
        }
      } catch (error: any) {
        console.error("Error loading PDF:", error);
        if (isMounted) {
          setHasError(true);
          setErrorMessage(error?.message || "Failed to load PDF");
          setIsLoading(false);
        }
      }
    };

    loadPdf();

    // Cleanup: revoke blob URL when component unmounts or document changes
    return () => {
      isMounted = false;
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [document.id, document.has_pdf_file]);

  // Reading time tracking
  useEffect(() => {
    if (isLoading) return;

    readingTimerRef.current = setInterval(() => {
      setReadingTime(prev => prev + 1);
    }, 1000);

    return () => {
      if (readingTimerRef.current) {
        clearInterval(readingTimerRef.current);
      }
    };
  }, [isLoading]);



  // Zoom controls
  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(zoom + 0.25, 3.0);
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  }, [zoom, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(zoom - 0.25, 0.5);
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  }, [zoom, onZoomChange]);

  const handleZoomReset = useCallback(() => {
    setZoom(1.0);
    onZoomChange?.(1.0);
  }, [onZoomChange]);

  // Rotation controls
  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  // Fullscreen controls
  const handleToggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      // Handle different browser implementations
      const doc = document as any;
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Navigation controls
  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      onPageChange?.(newPage);
    }
  }, [currentPage, onPageChange]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      onPageChange?.(newPage);
    }
  }, [currentPage, totalPages, onPageChange]);

  const handleIframeLoad = useCallback(() => {
    setHasError(false);

    // Try to extract page information from PDF
    if (document.pdf_metadata?.pages) {
      setTotalPages(document.pdf_metadata.pages);
    }
  }, [document.pdf_metadata]);

  const handleIframeError = useCallback(() => {
    setHasError(true);
    setErrorMessage("Failed to render PDF in browser");
  }, []);

  // Format reading time
  const formatReadingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate Table of Contents (mock implementation)
  const generateTableOfContents = useCallback(() => {
    // In a real implementation, this would parse the PDF structure
    // For now, we'll create a mock TOC based on common patterns
    const mockTOC: TOCItem[] = [
      {
        title: "Introduction",
        page: 1,
        level: 1,
      },
      {
        title: "Getting Started",
        page: 5,
        level: 1,
        children: [
          { title: "Installation", page: 5, level: 2 },
          { title: "Configuration", page: 12, level: 2 },
          { title: "First Steps", page: 18, level: 2 },
        ]
      },
      {
        title: "Advanced Features",
        page: 25,
        level: 1,
        children: [
          { title: "Customization", page: 25, level: 2 },
          { title: "Integration", page: 35, level: 2 },
          { title: "Troubleshooting", page: 45, level: 2 },
        ]
      },
      {
        title: "Reference",
        page: 60,
        level: 1,
        children: [
          { title: "API Documentation", page: 60, level: 2 },
          { title: "Configuration Options", page: 80, level: 2 },
        ]
      }
    ];
    setTableOfContents(mockTOC);
  }, []);

  // Handle TOC item click
  const handleTOCItemClick = useCallback((page: number) => {
    setCurrentPage(page);
    onPageChange?.(page);
  }, [onPageChange]);

  // Toggle TOC visibility
  const toggleTOC = useCallback(() => {
    setShowTOC(prev => !prev);
  }, []);

  // Annotation functions
  const createAnnotation = useCallback((type: Annotation['type'], content: string = '') => {
    const newAnnotation: Annotation = {
      id: `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      page: currentPage,
      content,
      color: type === 'highlight' ? '#fef3c7' :
             type === 'note' ? '#dbeafe' : '#ecfdf5',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setAnnotations(prev => [...prev, newAnnotation]);
    return newAnnotation;
  }, [currentPage]);

  const updateAnnotation = useCallback((id: string, updates: Partial<Annotation>) => {
    setAnnotations(prev =>
      prev.map(ann =>
        ann.id === id
          ? { ...ann, ...updates, updatedAt: new Date() }
          : ann
      )
    );
  }, []);

  const deleteAnnotation = useCallback((id: string) => {
    setAnnotations(prev => prev.filter(ann => ann.id !== id));
    if (selectedAnnotation?.id === id) {
      setSelectedAnnotation(null);
      setShowAnnotationPanel(false);
    }
  }, [selectedAnnotation]);

  const handleAnnotationClick = useCallback((annotation: Annotation) => {
    setSelectedAnnotation(annotation);
    setAnnotationContent(annotation.content);
    setShowAnnotationPanel(true);
  }, []);

  const saveAnnotation = useCallback(() => {
    if (selectedAnnotation) {
      updateAnnotation(selectedAnnotation.id, { content: annotationContent });
    }
    setShowAnnotationPanel(false);
    setSelectedAnnotation(null);
    setAnnotationContent('');
  }, [selectedAnnotation, annotationContent, updateAnnotation]);

  const cancelAnnotation = useCallback(() => {
    setShowAnnotationPanel(false);
    setSelectedAnnotation(null);
    setAnnotationContent('');
  }, []);

  // Get annotations for current page
  const currentPageAnnotations = annotations.filter(ann => ann.page === currentPage);

  // Generate TOC on mount
  useEffect(() => {
    if (enableTableOfContents && hasPDF && !isLoading) {
      // Generate TOC with a slight delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        generateTableOfContents();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [enableTableOfContents, hasPDF, isLoading, generateTableOfContents]);



  // If no PDF data, show placeholder
  if (!hasPDF) {
    return (
      <Card className={cn("rounded-2xl", className)}>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <FileText className="w-16 h-16 text-muted-foreground/50" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No PDF Attachment
              </h3>
              <p className="text-muted-foreground">
                This document doesn't have a PDF file attached.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div ref={containerRef} className={cn("space-y-4", className)}>
      {/* Enhanced PDF Metadata Header */}
      {showMetadata && document.pdf_metadata && (
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <FileText className="w-5 h-5 mr-2 text-accent-pink" />
                PDF Document
                {readingTime > 0 && (
                  <Badge variant="outline" className="ml-3 text-xs">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatReadingTime(readingTime)}
                  </Badge>
                )}
              </CardTitle>
              {enableFullscreen && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleFullscreen}
                  className="px-3 py-2"
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-3">
              {document.pdf_filename && (
                <Badge variant="outline" className="text-sm">
                  <FileText className="w-3 h-3 mr-1" />
                  {document.pdf_filename}
                </Badge>
              )}
              {document.pdf_metadata.pages && (
                <Badge variant="outline" className="text-sm">
                  <Eye className="w-3 h-3 mr-1" />
                  {document.pdf_metadata.pages} pages
                </Badge>
              )}
              {document.pdf_size && (
                <Badge variant="outline" className="text-sm">
                  {(document.pdf_size / 1024 / 1024).toFixed(2)} MB
                </Badge>
              )}
              {document.pdf_metadata.version && (
                <Badge variant="outline" className="text-sm">
                  PDF {document.pdf_metadata.version}
                </Badge>
              )}
              {document.pdf_metadata.hasText !== undefined && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-sm",
                    document.pdf_metadata.hasText
                      ? "text-green-600 border-green-200 bg-green-50"
                      : "text-orange-600 border-orange-200 bg-orange-50",
                  )}
                >
                  {document.pdf_metadata.hasText
                    ? "Text Extractable"
                    : "Image-based"}
                </Badge>
              )}
              {document.pdf_metadata.compressed && (
                <Badge
                  variant="outline"
                  className="text-sm text-blue-600 border-blue-200 bg-blue-50"
                >
                  Compressed
                  {document.pdf_metadata.savingsPercentage &&
                    ` (${document.pdf_metadata.savingsPercentage.toFixed(1)}% saved)`}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced PDF Viewer with Controls */}
      <Card className={cn("rounded-2xl overflow-hidden", className)}>
        {/* Control Bar */}
        <div className="bg-background/95 backdrop-blur-sm border-b border-border/50 px-4 py-3">
          {isMobile ? (
            /* Mobile Layout - Stacked */
            <div className="space-y-3">
              {/* Page Navigation - Top Row */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  className="px-4 py-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                <div className="flex items-center space-x-2 text-sm font-medium">
                  <span>{currentPage}</span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-muted-foreground">{totalPages}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  className="px-4 py-2"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Tools - Bottom Row */}
              <div className="flex items-center justify-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  className="px-2 py-2"
                >
                  <ZoomOut className="w-3 h-3" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomReset}
                  className="px-2 py-2 min-w-[40px] text-xs"
                >
                  {Math.round(zoom * 100)}%
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  className="px-2 py-2"
                >
                  <ZoomIn className="w-3 h-3" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRotate}
                  className="px-2 py-2"
                >
                  <RotateCw className="w-3 h-3" />
                </Button>

                {enableTableOfContents && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleTOC}
                    className={cn(
                      "px-2 py-2",
                      showTOC ? "bg-accent-pink/10 text-accent-pink" : ""
                    )}
                  >
                    <BookOpen className="w-3 h-3" />
                  </Button>
                )}

                {enableAnnotations && (
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAnnotationMode(annotationMode === 'highlight' ? null : 'highlight')}
                                          className={cn(
                      "px-2 py-2",
                      annotationMode === 'highlight' ? "bg-yellow-100 text-yellow-700" : ""
                    )}
                    >
                      <Highlighter className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAnnotationMode(annotationMode === 'note' ? null : 'note')}
                                          className={cn(
                      "px-2 py-2",
                      annotationMode === 'note' ? "bg-blue-100 text-blue-700" : ""
                    )}
                    >
                      <StickyNote className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => createAnnotation('bookmark', `Bookmark on page ${currentPage}`)}
                      className="px-2 py-2"
                    >
                      <Bookmark className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Desktop/Tablet Layout - Horizontal */
            <div className="flex items-center justify-between">
              {/* Navigation Controls */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  className="px-3 py-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-muted-foreground">Page</span>
                  <input
                    type="number"
                    value={currentPage}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= totalPages) {
                        setCurrentPage(page);
                        onPageChange?.(page);
                      }
                    }}
                    className="w-16 px-2 py-1 text-center border rounded"
                    min={1}
                    max={totalPages}
                  />
                  <span className="text-muted-foreground">of {totalPages}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  className="px-3 py-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Zoom and View Controls */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  className="px-3 py-2"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomReset}
                  className="px-3 py-2 min-w-[60px]"
                >
                  {Math.round(zoom * 100)}%
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  className="px-3 py-2"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRotate}
                  className="px-3 py-2"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>

                {enableTableOfContents && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleTOC}
                    className={cn(
                      "px-3 py-2",
                      showTOC ? "bg-accent-pink/10 text-accent-pink" : ""
                    )}
                  >
                    <BookOpen className="w-4 h-4" />
                  </Button>
                )}

                              {enableAnnotations && (
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAnnotationMode(annotationMode === 'highlight' ? null : 'highlight')}
                    className={cn(
                      "px-3 py-2",
                      annotationMode === 'highlight' ? "bg-yellow-100 text-yellow-700 border-yellow-300" : ""
                    )}
                  >
                    <Highlighter className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAnnotationMode(annotationMode === 'note' ? null : 'note')}
                    className={cn(
                      "px-3 py-2",
                      annotationMode === 'note' ? "bg-blue-100 text-blue-700 border-blue-300" : ""
                    )}
                  >
                    <StickyNote className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => createAnnotation('bookmark', `Bookmark on page ${currentPage}`)}
                    className="px-3 py-2"
                  >
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
              )}
              </div>
            </div>
          )}
        </div>

        {/* Table of Contents Panel */}
        <AnimatePresence>
          {showTOC && enableTableOfContents && tableOfContents.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-b border-border/50 bg-muted/30"
            >
              <div className="p-4 max-h-64 overflow-y-auto">
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2 text-accent-pink" />
                  Table of Contents
                </h4>
                <div className="space-y-1">
                  {tableOfContents.map((item, index) => (
                    <TOCItemComponent
                      key={index}
                      item={item}
                      currentPage={currentPage}
                      onClick={handleTOCItemClick}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PDF Content */}
        <CardContent className="p-0">
          <div className="relative bg-muted/30">
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10"
                >
                  <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-accent-pink" />
                    <p className="text-sm text-muted-foreground">
                      Loading PDF...
                    </p>
                  </div>
                </motion.div>
              )}

              {hasError && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10"
                >
                  <div className="flex flex-col items-center space-y-3 text-center max-w-md px-4">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        PDF Loading Error
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {errorMessage || "Unable to display the PDF file. Please refresh the page or contact support."}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {pdfBlobUrl ? (
              <div
                className={cn(
                  "relative overflow-auto",
                  isMobile ? "touch-pan-y" : "overflow-auto"
                )}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.2s ease-in-out'
                }}
                onTouchStart={isMobile ? (e) => {
                  // Handle touch gestures for mobile
                  if (e.touches.length === 2) {
                    e.preventDefault();
                  }
                } : undefined}
                onTouchMove={isMobile ? (e) => {
                  // Prevent default scrolling when zooming with two fingers
                  if (e.touches.length === 2) {
                    e.preventDefault();
                  }
                } : undefined}
              >
                <iframe
                  ref={iframeRef}
                  src={pdfBlobUrl}
                  className={cn(
                    "w-full border-0",
                    isMobile ? "min-h-[500px] max-h-[70vh]" : "min-h-[600px] md:min-h-[800px]"
                  )}
                  title={`PDF Viewer - ${document.title}`}
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  style={{
                    height: isFullscreen ? '100vh' : isMobile ? '60vh' : '600px',
                    maxHeight: isMobile ? '70vh' : 'none',
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-center">
                <div className="space-y-3">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      PDF Data Error
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Unable to load PDF data. Please try downloading the file.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Annotation Panel */}
      <AnimatePresence>
        {showAnnotationPanel && selectedAnnotation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-4"
          >
            <Card className="rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    {selectedAnnotation.type === 'highlight' && <Highlighter className="w-5 h-5 mr-2 text-yellow-600" />}
                    {selectedAnnotation.type === 'note' && <StickyNote className="w-5 h-5 mr-2 text-blue-600" />}
                    {selectedAnnotation.type === 'bookmark' && <Bookmark className="w-5 h-5 mr-2 text-green-600" />}
                    Edit {selectedAnnotation.type === 'highlight' ? 'Highlight' : selectedAnnotation.type === 'note' ? 'Note' : 'Bookmark'}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelAnnotation}
                    className="px-2 py-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Content
                  </label>
                  <textarea
                    value={annotationContent}
                    onChange={(e) => setAnnotationContent(e.target.value)}
                    placeholder="Add your notes here..."
                    className="w-full min-h-[100px] p-3 border rounded-lg resize-none focus:ring-2 focus:ring-accent-pink focus:border-transparent"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Page {selectedAnnotation.page} • {selectedAnnotation.createdAt.toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAnnotation(selectedAnnotation.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelAnnotation}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={saveAnnotation}
                      className="bg-accent-pink hover:bg-accent-purple text-white"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Annotations Sidebar */}
      {enableAnnotations && currentPageAnnotations.length > 0 && (
        <div className="mt-4">
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Edit3 className="w-5 h-5 mr-2 text-accent-pink" />
                Annotations ({currentPageAnnotations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {currentPageAnnotations.map((annotation) => (
                <div
                  key={annotation.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-colors",
                    annotation.type === 'highlight' ? "bg-yellow-50 border-yellow-200" :
                    annotation.type === 'note' ? "bg-blue-50 border-blue-200" :
                    annotation.type === 'bookmark' ? "bg-green-50 border-green-200" : ""
                  )}
                  onClick={() => handleAnnotationClick(annotation)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {annotation.type === 'highlight' && <Highlighter className="w-4 h-4 text-yellow-600" />}
                        {annotation.type === 'note' && <StickyNote className="w-4 h-4 text-blue-600" />}
                        {annotation.type === 'bookmark' && <Bookmark className="w-4 h-4 text-green-600" />}
                        <span className="text-sm font-medium capitalize">{annotation.type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {annotation.content || `Quick ${annotation.type} on page ${annotation.page}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAnnotation(annotation.id);
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// TOC Item Component
const TOCItemComponent: React.FC<{
  item: TOCItem;
  currentPage: number;
  onClick: (page: number) => void;
}> = ({ item, currentPage, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    onClick(item.page);
  };

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const isActive = currentPage >= item.page &&
    (!item.children?.length || currentPage < (item.children[item.children.length - 1]?.page || item.page + 10));

  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-accent-pink/10",
          item.level === 1 ? "font-medium" : "font-normal text-muted-foreground",
          isActive ? "bg-accent-pink/10 text-accent-pink border-l-2 border-accent-pink" : ""
        )}
        style={{ paddingLeft: `${(item.level - 1) * 12 + 12}px` }}
      >
        <div className="flex items-center justify-between">
          <span className="truncate">{item.title}</span>
          <div className="flex items-center space-x-2 ml-2">
            <span className="text-xs text-muted-foreground">p.{item.page}</span>
            {item.children && item.children.length > 0 && (
              <button
                onClick={toggleExpanded}
                className="text-muted-foreground hover:text-accent-pink transition-colors"
              >
                <ChevronRight
                  className={cn(
                    "w-3 h-3 transition-transform",
                    isExpanded ? "rotate-90" : ""
                  )}
                />
              </button>
            )}
          </div>
        </div>
      </button>

      {/* Child items */}
      <AnimatePresence>
        {isExpanded && item.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {item.children.map((child, index) => (
              <TOCItemComponent
                key={index}
                item={child}
                currentPage={currentPage}
                onClick={onClick}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
