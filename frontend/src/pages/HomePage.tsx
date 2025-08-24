import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Sparkles,
  ChevronDown,
  Search,
  ExternalLink,
  Image as ImageIcon,
  Filter,
  X,
  Hash,
  Clock,
  ChevronLeft,
  ChevronRight,
  ZoomIn} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageSection } from '@/components/ui/spacing';
import { useUpdateLogs } from '@/hooks';
import { useDebounce } from '@/hooks';
import { safeNormalizeTags, safeToString, cn } from '@/services/utils';
import React from 'react';

// Enhanced Update Log Component with performance optimizations
const UpdateLog = React.memo(function UpdateLog() {
  const { updateLogs, isLoading, loadUpdateLogs } = useUpdateLogs();
  const [expandedUpdate, setExpandedUpdate] = useState<string | null>('2.1.0');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounced search for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Ensure update logs are loaded when component mounts
  useEffect(() => {
    if (updateLogs.length === 0 && !isLoading) {
      loadUpdateLogs();
    }
  }, [updateLogs.length, isLoading, loadUpdateLogs]);

  // Refresh data when window gains focus (user switches back to this tab/page)
  useEffect(() => {
    const handleFocus = () => {
      // Only refresh if we have existing data (avoid unnecessary loading on first focus)
      if (updateLogs.length > 0) {
        loadUpdateLogs();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [updateLogs.length, loadUpdateLogs]);

  // Listen for cross-page data synchronization events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'doaxvv-update-logs-updated' && e.newValue) {
        // Another page/tab updated update logs, refresh our data
        loadUpdateLogs();
        // Clear the flag
        localStorage.removeItem('doaxvv-update-logs-updated');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [loadUpdateLogs]);

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
          (update.description || '').toLowerCase().includes(searchLower) ||
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


  const hasActiveFilters = searchTerm || selectedTags.length > 0;

  return (
    <div className="space-y-6">
      {/* Enhanced Search Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-4 z-20 space-y-6"
      >
        {/* Main Search Container */}
        <div className="relative">
          {/* Gradient Background Blur */}
          <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan/5 via-accent-pink/5 to-accent-purple/5 rounded-3xl blur-xl opacity-60"></div>
          
          {/* Search Bar Container */}
          <div className="relative modern-glass border border-border/20 rounded-3xl p-3 backdrop-blur-xl shadow-2xl bg-background/80 hover:shadow-accent-cyan/10 transition-all duration-500 hover:bg-background/90">
            {/* Search Input Section */}
            <div className="relative group">
              {/* Search Icon */}
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-accent-cyan transition-all duration-300">
                <Search className="w-5 h-5" />
              </div>
              
              {/* Search Input */}
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search updates, features, tags... (⌘K)"
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-11 pr-24 py-4 text-base border-0 bg-transparent focus:ring-2 focus:ring-accent-cyan/30 transition-all duration-500 rounded-2xl placeholder:text-muted-foreground/60 group-hover:placeholder:text-muted-foreground/80"
                aria-label="Search update logs"
              />
              
              {/* Action Buttons Container */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                {/* Filter Toggle Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`relative touch-target p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                    showFilters 
                      ? 'text-accent-cyan bg-accent-cyan/15 shadow-lg shadow-accent-cyan/20' 
                      : 'hover:bg-accent-cyan/10 hover:text-accent-cyan'
                  }`}
                  aria-label="Toggle filters"
                >
                  <Filter className="w-4 h-4" />
                  {selectedTags.length > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-accent-pink rounded-full flex items-center justify-center text-xs text-white font-bold shadow-lg"
                    >
                      {selectedTags.length}
                    </motion.div>
                  )}
                </Button>
                
                {/* Clear Button */}
                <AnimatePresence>
                  {hasActiveFilters && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="touch-target p-3 rounded-xl hover:bg-red-500/15 hover:text-red-500 hover:scale-105 transition-all duration-300"
                        aria-label="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Focus Ring */}
              <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-focus-within:ring-accent-cyan/30 transition-all duration-300 pointer-events-none"></div>
            </div>

            {/* Enhanced Filter Panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                                     className="mt-6 pt-6 border-t border-border/30 relative before:absolute before:top-0 before:left-1/2 before:transform before:-translate-x-1/2 before:w-32 before:h-px before:bg-gradient-to-r before:from-transparent before:via-accent-cyan/50 before:to-transparent"
                >
                  <div className="space-y-4">
                    {/* Filter Header */}
                    <div className="flex items-center justify-between">
                      <motion.h4 
                        className="text-sm font-semibold text-foreground flex items-center"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <div className="p-2 rounded-lg bg-gradient-to-r from-accent-cyan/20 to-accent-pink/20 mr-3">
                          <Hash className="w-4 h-4 text-accent-cyan" />
                        </div>
                        Filter by Tags
                        <Badge variant="secondary" className="ml-3 px-2 py-1 text-xs">
                          {allTags.length} available
                        </Badge>
                      </motion.h4>
                      
                      {selectedTags.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTags([])}
                            className="text-xs hover:text-accent-cyan hover:bg-accent-cyan/10 transition-all duration-300 rounded-lg px-3 py-2"
                          >
                            Clear all ({selectedTags.length})
                          </Button>
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Tag Grid */}
                    <div className="relative">
                      <div className="flex flex-wrap gap-3 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-accent-cyan/30 scrollbar-track-transparent p-1">
                        {allTags.map((tag, index) => {
                          const isSelected = selectedTags.includes(tag);
                          return (
                            <motion.div
                              key={tag}
                              initial={{ opacity: 0, scale: 0.8, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{
                                delay: Math.min(index * 0.01, 0.05),
                                duration: 0.15
                              }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleTag(tag)}
                                className={`relative text-xs transition-all duration-300 rounded-full px-4 py-2 border ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-accent-cyan/20 to-accent-pink/20 text-accent-cyan border-accent-cyan/40 shadow-lg shadow-accent-cyan/20'
                                    : 'hover:bg-muted/80 hover:border-border/60 border-transparent'
                                }`}
                              >
                                <span className="relative z-10">#{tag}</span>
                                {isSelected && (
                                  <motion.div
                                    layoutId={`tag-bg-${tag}`}
                                    className="absolute inset-0 bg-gradient-to-r from-accent-cyan/10 to-accent-pink/10 rounded-full"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                  />
                                )}
                              </Button>
                            </motion.div>
                          );
                        })}
                      </div>
                      
                      {/* Scroll Gradient Overlay */}
                      {allTags.length > 10 && (
                        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background/80 to-transparent pointer-events-none rounded-b-lg"></div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Enhanced Search Results Summary */}
        <AnimatePresence>
          {(hasActiveFilters || filteredUpdates.length !== updateLogs.length) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="relative"
            >
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan/5 via-background/50 to-accent-pink/5 rounded-2xl"></div>
              
              <div className="relative bg-background/70 backdrop-blur-sm rounded-2xl px-6 py-4 border border-border/30 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Results Icon */}
                    <div className="p-2 rounded-xl bg-gradient-to-r from-accent-cyan/20 to-accent-pink/20">
                      <Database className="w-5 h-5 text-accent-cyan" />
                    </div>
                    
                    {/* Results Text */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm font-medium">
                        <span className="text-foreground">Found</span>
                        <motion.span 
                          className="text-accent-cyan font-bold text-lg"
                          key={filteredUpdates.length}
                          initial={{ scale: 1.2, color: "#06b6d4" }}
                          animate={{ scale: 1, color: "#06b6d4" }}
                          transition={{ duration: 0.3 }}
                        >
                          {filteredUpdates.length}
                        </motion.span>
                        <span className="text-muted-foreground">of {updateLogs.length} updates</span>
                      </div>
                      
                      {selectedTags.length > 0 && (
                        <motion.div 
                          className="flex items-center space-x-2 text-xs text-muted-foreground"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <div className="w-1 h-1 bg-accent-pink rounded-full"></div>
                          <span>
                            {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''} selected
                          </span>
                          <div className="flex items-center space-x-1 ml-2">
                            {selectedTags.slice(0, 3).map((tag) => (
                              <Badge 
                                key={tag} 
                                variant="secondary" 
                                className="text-xs px-2 py-0.5 bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/20"
                              >
                                #{tag}
                              </Badge>
                            ))}
                            {selectedTags.length > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{selectedTags.length - 3} more
                              </span>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                  
                  {/* Clear Filters Button */}
                  {hasActiveFilters && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSearch}
                        className="text-xs hover:text-accent-cyan hover:border-accent-cyan/30 hover:bg-accent-cyan/5 hover:scale-105 transition-all duration-300 rounded-xl px-4 py-2 group"
                      >
                        <X className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                        Clear filters
                      </Button>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {filteredUpdates.length === 0 ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 via-accent-pink/5 to-accent-purple/5 rounded-3xl opacity-50"></div>
            
            <div className="relative text-center py-20">
              <div className="space-y-8">
                {/* Enhanced Icon Container */}
                <motion.div 
                  className="relative w-32 h-32 mx-auto"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  {/* Background Circles */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-cyan/20 to-accent-pink/20 blur-xl"></div>
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-accent-pink/15 to-accent-purple/15 blur-lg"></div>
                  
                  {/* Main Icon Container */}
                  <div className="relative w-full h-full rounded-full bg-background/90 backdrop-blur-sm border border-border/40 flex items-center justify-center shadow-2xl">
                    <Search className="w-12 h-12 text-accent-cyan" />
                  </div>
                  

                </motion.div>

                {/* Enhanced Text Content */}
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="space-y-3">
                    <motion.h3 
                      className="text-2xl font-bold text-foreground"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      No Updates Found
                    </motion.h3>
                    <motion.p 
                      className="text-muted-foreground max-w-lg mx-auto text-lg leading-relaxed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      {searchTerm 
                        ? (
                          <>
                            No updates match <span className="font-semibold text-accent-cyan">"{searchTerm}"</span>
                            <br />
                            <span className="text-sm">Try different keywords or clear your search to explore all updates.</span>
                          </>
                        )
                        : (
                          <>
                            No updates match your current filters
                            <br />
                            <span className="text-sm">Try adjusting your tag selection to see more results.</span>
                          </>
                        )
                      }
                    </motion.p>
                  </div>
                  
                  {/* Enhanced Action Buttons */}
                  <motion.div 
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        variant="outline" 
                        onClick={clearSearch}
                        className="px-8 py-3 rounded-2xl border-accent-cyan/30 hover:border-accent-cyan/60 hover:bg-accent-cyan/5 hover:text-accent-cyan transition-all duration-300 group"
                      >
                        <X className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                        Clear All Filters
                      </Button>
                    </motion.div>
                    
                    {searchTerm && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button 
                          variant="ghost"
                          onClick={() => setSearchTerm('')}
                          className="px-6 py-3 rounded-2xl hover:bg-muted/80 transition-all duration-300"
                        >
                          <Search className="w-4 h-4 mr-2" />
                          Clear Search Only
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              </div>
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
                    transition={{
                      delay: Math.min(index * 0.02, 0.1),
                      duration: 0.15
                    }}
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
                          transition={{
                            delay: Math.min(tagIndex * 0.01, 0.05),
                            duration: 0.1
                          }}
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
        {((update.screenshots && update.screenshots.length > 0) || (update.screenshots_data && update.screenshots_data.length > 0)) && (
          <Screenshots
            screenshots={update.screenshots}
            screenshotsData={update.screenshots_data}
            updateLogId={update.id}
          />
        )}
      </motion.div>
    </motion.div>
  );
});

// Enhanced Screenshots with staggered animations - now displays actual images
const Screenshots = React.memo(function Screenshots({
  screenshots,
  screenshotsData,
  updateLogId
}: {
  screenshots?: string[];
  screenshotsData?: Array<{data: string; mimeType: string; filename: string}>;
  updateLogId?: number;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Convert screenshotsData to URLs - use optimized approach when possible
  const imageUrls = React.useMemo(() => {
    if (screenshotsData && screenshotsData.length > 0) {
      if (updateLogId) {
        // Use optimized API endpoints for update log screenshots
        return screenshotsData.map((_, index) =>
          `/api/images/update-log/${updateLogId}/screenshot/${index}`
        );
      }
      // Fallback to base64 for cases without updateLogId
      return screenshotsData.map(screenshot =>
        `data:${screenshot.mimeType};base64,${screenshot.data}`
      );
    }
    return screenshots || [];
  }, [screenshotsData, screenshots, updateLogId]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % imageUrls.length);
    }
  };

  const previousImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === 0 ? imageUrls.length - 1 : lightboxIndex - 1);
    }
  };

  if (!imageUrls || imageUrls.length === 0) {
    return null;
  }

  return (
    <>
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h5 className="text-lg font-semibold text-foreground mb-4 flex items-center">
          <ImageIcon className="w-5 h-5 mr-2 text-accent-pink" />
          Images ({imageUrls.length})
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-responsive">
          {imageUrls.map((imageUrl, screenshotIndex) => (
            <ScreenshotCard
              key={screenshotIndex}
              imageUrl={imageUrl}
              index={screenshotIndex}
              filename={screenshotsData?.[screenshotIndex]?.filename}
              onClick={() => openLightbox(screenshotIndex)}
            />
          ))}
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
              onClick={closeLightbox}
            >
              <X className="w-5 h-5" />
            </Button>

            {imageUrls.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    previousImage();
                  }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            <motion.img
              key={lightboxIndex}
              src={imageUrls[lightboxIndex]}
              alt={`Screenshot ${lightboxIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            />

            {imageUrls.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {lightboxIndex + 1} / {imageUrls.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

// Individual screenshot card component
const ScreenshotCard = React.memo(({
  imageUrl,
  index,
  filename,
  onClick
}: {
  imageUrl: string;
  index: number;
  filename?: string;
  onClick: () => void;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      className="relative group cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(index * 0.02 + 0.1, 0.2),
        duration: 0.15
      }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
    >
      <div className="aspect-video bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-lg border border-border/40 overflow-hidden transition-all duration-500 group-hover:border-accent-pink/60 group-hover:shadow-lg group-hover:shadow-accent-pink/20">
        {imageUrl && !imageError ? (
          <>
            <img
              src={imageUrl}
              alt={filename || `Screenshot ${index + 1}`}
              className={cn(
                'w-full h-full object-cover transition-all duration-300',
                imageLoaded ? 'opacity-100' : 'opacity-0',
                'group-hover:scale-105'
              )}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
              decoding="async"
            />

            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse" />
            )}

            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <motion.div
                whileHover={{ rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto group-hover:text-accent-pink transition-colors duration-300" />
              </motion.div>
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                {imageError ? 'Failed to load' : filename || `Screenshot ${index + 1}`}
              </span>
            </div>
          </div>
        )}
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
            className="modern-page-title"
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
              <span className="mobile-only">•</span> {updateLogs?.length || 0} updates available
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