import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Image as ImageIcon,
  Filter,
  X,
  Hash,
  Clock} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageSection } from '@/components/ui/spacing';
import { InlinePageLoader } from '@/components/ui';
import { useUpdateLogs } from '@/hooks';
import { useDebounce } from '@/hooks';
import { safeNormalizeTags, safeToString } from '@/services/utils';
import React from 'react';

// Enhanced Update Log Component with performance optimizations
const UpdateLog = React.memo(function UpdateLog() {
  const { updateLogs, isLoading } = useUpdateLogs();
  const [expandedUpdate, setExpandedUpdate] = useState<string | null>('2.1.0');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounced search for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Get all unique tags for filter options
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    updateLogs.forEach(update => {
      safeNormalizeTags(update.tags).forEach(tag => {
        tags.add(safeToString(tag));
      });
    });
    return Array.from(tags).sort();
  }, [updateLogs]);

  // Enhanced search and filter function
  const filteredUpdates = useMemo(() => {
    let filtered = updateLogs;

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(update => {
        const updateTags = safeNormalizeTags(update.tags).map(tag => safeToString(tag));
        return selectedTags.some(selectedTag => updateTags.includes(selectedTag));
      });
    }

    // Filter by search term
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(update => {
        const tags = safeNormalizeTags(update.tags);
        return update.title.toLowerCase().includes(searchLower) ||
          update.description.toLowerCase().includes(searchLower) ||
          update.content.toLowerCase().includes(searchLower) ||
          tags.some(tag => safeToString(tag).toLowerCase().includes(searchLower));
      });
    }

    return filtered;
  }, [updateLogs, debouncedSearchTerm, selectedTags]);

  const toggleExpanded = useCallback((version: string) => {
    setExpandedUpdate(prev => prev === version ? null : version);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSelectedTags([]);
    searchInputRef.current?.focus();
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const highlightText = useCallback((text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-accent-cyan/30 text-accent-cyan px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  }, []);

  if (isLoading) {
    return <InlinePageLoader message="Loading update logs..." className="py-12" />;
  }

  const hasActiveFilters = searchTerm || selectedTags.length > 0;

  return (
    <div className="space-y-6">
      {/* Enhanced Search Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-4 z-20 space-y-4"
      >
        {/* Search Bar */}
        <div className="modern-glass border border-border/40 rounded-responsive p-responsive backdrop-blur-xl shadow-lg">
          <div className="relative">
            <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search updates, features, tags... (⌘K)"
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 md:pl-12 pr-16 md:pr-20 py-3 md:py-4 text-responsive-base border-0 bg-transparent focus:ring-2 focus:ring-accent-cyan/50 transition-all duration-300 touch-target"
              aria-label="Search update logs"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`touch-target p-2 hover:bg-accent-cyan/20 ${showFilters ? 'text-accent-cyan bg-accent-cyan/10' : ''}`}
                aria-label="Toggle filters"
              >
                <Filter className="w-4 h-4" />
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="touch-target p-2 hover:bg-red-500/20 hover:text-red-500"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Filter Panel */}
            <AnimatePresence>
             {showFilters && (
               <motion.div
                 initial={{ opacity: 0, height: 0 }}
                 animate={{ opacity: 1, height: 'auto' }}
                 exit={{ opacity: 0, height: 0 }}
                 transition={{ duration: 0.2 }}
                 className="mt-4 pt-4 border-t border-border/30"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground flex items-center">
                      <Hash className="w-4 h-4 mr-2" />
                      Filter by Tags
                    </h4>
                    {selectedTags.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTags([])}
                        className="text-xs hover:text-accent-cyan"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {allTags.map(tag => (
                      <Button
                        key={tag}
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTag(tag)}
                        className={`text-xs transition-all duration-200 ${
                          selectedTags.includes(tag)
                            ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40'
                            : 'hover:bg-muted'
                        }`}
                      >
                        #{tag}
                      </Button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search Results Summary */}
        {(hasActiveFilters || filteredUpdates.length !== updateLogs.length) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-3 border border-border/30"
          >
            <div className="flex items-center space-x-3 text-sm">
              <Database className="w-4 h-4 text-accent-cyan" />
              <span className="text-foreground">
                Found <strong className="text-accent-cyan">{filteredUpdates.length}</strong> of {updateLogs.length} updates
              </span>
              {selectedTags.length > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
              )}
            </div>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="text-xs hover:text-accent-cyan"
              >
                Clear filters
              </Button>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {filteredUpdates.length === 0 ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center py-16"
          >
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-muted/40 to-accent-cyan/20 flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">No Updates Found</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {searchTerm 
                    ? `No updates match "${searchTerm}". Try different keywords or clear your search.`
                    : 'No updates match your current filters. Try adjusting your selection.'
                  }
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={clearSearch}
                className="mt-4"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Search
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            {/* Timeline Line */}
            <div className="absolute left-6 md:left-12 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent-pink via-accent-cyan to-accent-purple opacity-60"></div>
            
            <div className="space-y-6">
              {filteredUpdates.map((update, index) => {
                const isExpanded = expandedUpdate === update.version;
                
                return (
                  <motion.div
                    key={update.version}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <UpdateCard
                      update={update}
                      index={index}
                      isExpanded={isExpanded}
                      onToggleExpanded={toggleExpanded}
                      searchTerm={debouncedSearchTerm}
                      highlightText={highlightText}
                    />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

// Enhanced UpdateCard component with search highlighting
const UpdateCard = React.memo(function UpdateCard({ 
  update, 
  index, 
  isExpanded, 
  onToggleExpanded,
  searchTerm,
  highlightText
}: {
  update: any;
  index: number;
  isExpanded: boolean;
  onToggleExpanded: (version: string) => void;
  searchTerm: string;
  highlightText: (text: string, searchTerm: string) => any;
}) {
  const handleToggle = useCallback(() => {
    onToggleExpanded(update.version);
  }, [update.version, onToggleExpanded]);

  return (
    <div className="relative">
      {/* Enhanced Timeline Node */}
      <motion.div 
        className="absolute left-3 md:left-9 w-6 h-6 rounded-full bg-background border-2 border-accent-cyan z-10 flex items-center justify-center shadow-lg"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <motion.div 
          className="w-3 h-3 rounded-full bg-accent-cyan"
          animate={{ 
            scale: index === 0 ? [1, 1.2, 1] : 1,
            boxShadow: index === 0 ? [
              "0 0 0 0 rgba(6, 182, 212, 0.7)",
              "0 0 0 10px rgba(6, 182, 212, 0)",
              "0 0 0 0 rgba(6, 182, 212, 0)"
            ] : "none"
          }}
          transition={{ 
            duration: 1,
            repeat: index === 0 ? Infinity : 0,
            repeatType: "loop"
          }}
        />
      </motion.div>
      
      {/* Enhanced Main Card */}
      <div className="ml-12 md:ml-24">
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Card className="modern-card border-0 group modern-interactive hover:shadow-2xl hover:shadow-accent-cyan/20 transition-all duration-700 ease-out overflow-hidden backdrop-blur-sm">
            <CardContent className="p-0">
              {/* Enhanced Header */}
              <div 
                className="p-6 cursor-pointer transition-all duration-500 hover:bg-accent-cyan/5"
                onClick={handleToggle}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <motion.div 
                      className="p-3 rounded-xl border border-accent-cyan/30 bg-accent-cyan/20 text-accent-cyan"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Database className="w-5 h-5" />
                    </motion.div>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-foreground">
                          Version {update.version}
                        </h3>
                        {index === 0 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                          >
                            <Badge className="bg-gradient-to-r from-accent-pink to-accent-purple text-white border-0 shadow-lg">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Latest
                            </Badge>
                          </motion.div>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{update.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button variant="modern" size="sm" className="shrink-0" aria-label={isExpanded ? "Collapse details" : "Expand details"}>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </Button>
                  </motion.div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 text-lg">
                      {highlightText(update.title, searchTerm)}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {highlightText(update.content, searchTerm)}
                    </p>
                  </div>

                  {/* Enhanced Tags */}
                  <motion.div 
                    className="flex flex-wrap gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    {safeNormalizeTags(update.tags).map((tag, tagIndex) => (
                                              <motion.div
                          key={tagIndex}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: tagIndex * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                      >
                        <Badge variant="secondary" className="text-xs hover:bg-accent-cyan/20 hover:text-accent-cyan transition-colors duration-200">
                          #{highlightText(safeToString(tag), searchTerm)}
                        </Badge>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </div>

              {/* Enhanced Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <ExpandedContent update={update} />
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
});

// Enhanced ExpandedContent with smooth animations
const ExpandedContent = React.memo(function ExpandedContent({ update }: { update: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ 
        duration: 0.3, 
        ease: "easeInOut",
      }}
      className="border-t border-border/40 bg-gradient-to-br from-muted/20 to-accent-cyan/5 overflow-hidden"
    >
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="p-6 space-y-8"
      >
        {/* Features */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <h5 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-accent-cyan" />
            New Features
          </h5>
        </motion.div>

        {/* Screenshots */}
        {update.screenshots.length > 0 && (
          <Screenshots screenshots={update.screenshots} />
        )}
      </motion.div>
    </motion.div>
  );
});

// Enhanced Screenshots with staggered animations
const Screenshots = React.memo(function Screenshots({ screenshots }: { screenshots: string[] }) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <h5 className="text-lg font-semibold text-foreground mb-4 flex items-center">
        <ImageIcon className="w-5 h-5 mr-2 text-accent-pink" />
        Images
      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-responsive">
        {screenshots.map((screenshot, screenshotIndex) => (
          <motion.div 
            key={screenshotIndex} 
            className="relative group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: screenshotIndex * 0.05 + 0.25 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="aspect-video bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-lg border border-border/40 flex items-center justify-center transition-all duration-500 group-hover:border-accent-pink/60 group-hover:shadow-lg group-hover:shadow-accent-pink/20">
              <div className="text-center space-y-2">
                <motion.div
                  whileHover={{ rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto group-hover:text-accent-pink transition-colors duration-300" />
                </motion.div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">{screenshot}</span>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="absolute top-2 right-2"
            >
              <Button
                variant="modern"
                size="sm"
                className="transition-all duration-300 hover:scale-110 shadow-lg"
                aria-label="View screenshot"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});

export default function HomePage() {
  const { updateLogs } = useUpdateLogs();

  return (
    <div className="modern-page">
      <div className="modern-container-lg">
        {/* Enhanced Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="modern-page-header"
        >
          <motion.h1 
            className="text-responsive-3xl font-bold gradient-text leading-tight text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Update Log
          </motion.h1>
          <motion.p 
            className="text-responsive-base text-muted-foreground max-w-2xl mx-auto leading-relaxed text-center mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Your comprehensive guide to the tropical paradise
            <motion.span 
              className="block xs:inline ml-0 xs:ml-1 font-semibold text-accent-cyan mt-1 xs:mt-0"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              <span className="mobile-only">•</span> {updateLogs.length} updates available
            </motion.span>
          </motion.p>
        </motion.div>

        <PageSection>
          <UpdateLog />
        </PageSection>
      </div>
    </div>
  );
}