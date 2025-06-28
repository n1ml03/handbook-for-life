import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Database,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Image as ImageIcon} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageSection } from '@/components/ui/spacing';
import { InlinePageLoader } from '@/components/ui';
import { useUpdateLogs } from '@/hooks';
import { safeNormalizeTags, safeToString } from '@/services/utils';
import React from 'react';

// Enhanced Update Log Component with performance optimizations
const UpdateLog = React.memo(function UpdateLog() {
  const { publishedUpdateLogs, isLoading } = useUpdateLogs();
  const [expandedUpdate, setExpandedUpdate] = useState<string | null>('2.1.0');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Memoized search function for better performance
  const debouncedSearchTerm = useMemo(() => searchTerm, [searchTerm]);

  const filteredUpdates = useMemo(() => {
    if (!debouncedSearchTerm) return publishedUpdateLogs;
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    return publishedUpdateLogs.filter(update => {
      const tags = safeNormalizeTags(update.tags);
      return update.title.toLowerCase().includes(searchLower) ||
        update.description.toLowerCase().includes(searchLower) ||
        tags.some(tag => safeToString(tag).toLowerCase().includes(searchLower));
    });
  }, [publishedUpdateLogs, debouncedSearchTerm]);

  const toggleExpanded = useCallback((version: string) => {
    setExpandedUpdate(prev => prev === version ? null : version);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  if (isLoading) {
    return <InlinePageLoader message="Loading update logs..." className="py-12" />;
  }

  if (filteredUpdates.length === 0) {
    return (
      <div className="text-center py-12">
        <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Update Logs Found</h3>
        <p className="text-muted-foreground">
          {searchTerm ? 'No updates match your search criteria.' : 'No published updates available.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Search */}
      <div className="sticky top-12 z-10 modern-glass border-b border-border/30 pb-4 mb-6">
        <div className="flex justify-center">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search updates, features, tags..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-12 pr-4 py-3 text-lg modern-glass border-2 border-border/30 hover:border-accent-cyan/50 focus:border-accent-cyan transition-all duration-300"
              aria-label="Search update logs"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 md:left-12 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent-pink via-accent-cyan to-accent-purple"></div>
        
        <div className="space-y-8">
          {filteredUpdates.map((update, index) => {
            const isExpanded = expandedUpdate === update.version;
            
            return (
              <UpdateCard
                key={update.version}
                update={update}
                index={index}
                isExpanded={isExpanded}
                onToggleExpanded={toggleExpanded}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});

// Extracted UpdateCard component for better performance
const UpdateCard = React.memo(function UpdateCard({ 
  update, 
  index, 
  isExpanded, 
  onToggleExpanded 
}: {
  update: any;
  index: number;
  isExpanded: boolean;
  onToggleExpanded: (version: string) => void;
}) {
  const handleToggle = useCallback(() => {
    onToggleExpanded(update.version);
  }, [update.version, onToggleExpanded]);

  return (
    <div className="relative">
      {/* Timeline Node */}
      <div className="absolute left-3 md:left-9 w-6 h-6 rounded-full bg-background border-2 border-accent-cyan z-10 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-accent-cyan"></div>
      </div>
      
      {/* Main Card */}
      <div className="ml-12 md:ml-24">
        <Card className="modern-card border-0 group modern-interactive hover:shadow-2xl hover:shadow-accent-cyan/20 transition-all duration-700 ease-out overflow-hidden">
          <CardContent className="p-0">
            {/* Header */}
            <div 
              className="p-6 cursor-pointer transition-all duration-500"
              onClick={handleToggle}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl border border-accent-cyan/30 bg-accent-cyan/20 text-accent-cyan">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-foreground">
                        Version {update.version}
                      </h3>
                      {index === 0 && (
                        <Badge className="bg-gradient-to-r from-accent-pink to-accent-purple text-white border-0">
                          Latest
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{update.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button variant="modern" size="sm" className="shrink-0" aria-label={isExpanded ? "Collapse details" : "Expand details"}>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2 text-lg">{update.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {update.content}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {safeNormalizeTags(update.tags).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{safeToString(tag)}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <ExpandedContent update={update} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

// Extracted ExpandedContent for lazy loading
const ExpandedContent = React.memo(function ExpandedContent({ update }: { update: any }) {
  return (
    <div className="border-t border-border/40 bg-gradient-to-br from-muted/20 to-accent-cyan/5 animate-in slide-in-from-top-4 duration-700 ease-out">
      <div className="p-6 space-y-8 animate-in fade-in duration-1000 delay-200">
        {/* Features */}
        <div className="animate-in slide-in-from-left-4 duration-500 delay-300">
          <h5 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-accent-cyan" />
            New Features
          </h5>
        </div>

        {/* Screenshots */}
        {update.screenshots.length > 0 && (
          <Screenshots screenshots={update.screenshots} />
        )}
      </div>
    </div>
  );
});

const Screenshots = React.memo(function Screenshots({ screenshots }: { screenshots: string[] }) {
  return (
    <div className="animate-in slide-in-from-left-4 duration-500 delay-600">
      <h5 className="text-lg font-semibold text-foreground mb-4 flex items-center">
        <ImageIcon className="w-5 h-5 mr-2 text-accent-pink" />
        Images
      </h5>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {screenshots.map((screenshot, screenshotIndex) => (
          <div key={screenshotIndex} className="relative group animate-in fade-in slide-in-from-bottom-4 duration-500" style={{animationDelay: `${screenshotIndex * 200 + 700}ms`}}>
            <div className="aspect-video bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-lg border border-border/40 flex items-center justify-center hover:scale-105 hover:shadow-lg hover:shadow-accent-pink/20 transition-all duration-500 group-hover:border-accent-pink/60">
              <div className="text-center space-y-2">
                <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto group-hover:text-accent-pink transition-colors duration-300" />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">{screenshot}</span>
              </div>
            </div>
            <Button
              variant="modern"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
              aria-label="View screenshot"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
});

export default function HomePage() {
  const { publishedUpdateLogs } = useUpdateLogs();

  return (
    <div className="modern-page">
      <div className="modern-container-lg">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="modern-page-header"
        >
          <h1 className="modern-page-title">
            Update Log
          </h1>
          <p className="modern-page-subtitle">
            Your comprehensive guide to the tropical paradise • {publishedUpdateLogs.length} updates available
          </p>
        </motion.div>

        <PageSection>
          <UpdateLog />
        </PageSection>
      </div>
    </div>
  );
}