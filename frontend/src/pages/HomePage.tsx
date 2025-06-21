import { useState, useMemo } from 'react';
import { 
  Database, 
  Shield,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Code,
  Bug,
  Wrench,
  Image as ImageIcon} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUpdateLogs } from '@/contexts/UpdateLogsContext';

// Enhanced Update Log Component
function UpdateLog() {
  const { publishedUpdateLogs, isLoading } = useUpdateLogs();
  const [expandedUpdate, setExpandedUpdate] = useState<string | null>('2.1.0');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredUpdates = useMemo(() => {
    return publishedUpdateLogs.filter(update => {
      const matchesSearch = searchTerm === '' || 
        update.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        update.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        update.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesSearch;
    });
  }, [publishedUpdateLogs, searchTerm]);

  const toggleExpanded = (version: string) => {
    setExpandedUpdate(expandedUpdate === version ? null : version);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-cyan"></div>
      </div>
    );
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
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/40 pb-6">
        <div className="flex justify-center">
          <div className="relative w-full max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search updates, features, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 text-lg doax-glass border-2 border-accent-cyan/20 hover:border-accent-cyan/40 focus:border-accent-cyan transition-all duration-300"
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
              <div key={update.version} className="relative">
                {/* Timeline Node */}
                <div className="absolute left-3 md:left-9 w-6 h-6 rounded-full bg-background border-2 border-accent-cyan z-10 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-accent-cyan"></div>
                </div>
                
                {/* Main Card */}
                <div className="ml-12 md:ml-24">
                  <Card className="doax-card border-0 group hover:scale-[1.02] hover:shadow-2xl hover:shadow-accent-cyan/20 transition-all duration-700 ease-out overflow-hidden">
                    <CardContent className="p-0">
                      {/* Header */}
                      <div 
                        className="p-6 cursor-pointer transition-all duration-500"
                        onClick={() => toggleExpanded(update.version)}
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
                          
                          <Button variant="ghost" size="sm" className="shrink-0">
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
                            {update.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="border-t border-border/40 bg-gradient-to-br from-muted/20 to-accent-cyan/5 animate-in slide-in-from-top-4 duration-700 ease-out">
                          <div className="p-6 space-y-8 animate-in fade-in duration-1000 delay-200">
                            {/* Features */}
                            <div className="animate-in slide-in-from-left-4 duration-500 delay-300">
                              <h5 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                                <Sparkles className="w-5 h-5 mr-2 text-accent-cyan" />
                                New Features
                              </h5>
                            </div>

                            {/* Technical Details */}
                            {update.technicalDetails.length > 0 && (
                              <div className="animate-in slide-in-from-left-4 duration-500 delay-400">
                                <h5 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                                  <Code className="w-5 h-5 mr-2 text-accent-gold" />
                                  Technical Details
                                </h5>
                                <div className="space-y-3">
                                  {update.technicalDetails.map((detail, detailIndex) => (
                                    <div key={detailIndex} className="flex items-start space-x-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transform hover:scale-[1.02] transition-all duration-300 animate-in fade-in slide-in-from-right-2" style={{animationDelay: `${detailIndex * 100 + 500}ms`}}>
                                      <Wrench className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
                                      <span className="text-sm text-foreground font-mono">{detail}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Bug Fixes */}
                            {update.bugFixes.length > 0 && (
                              <div className="animate-in slide-in-from-left-4 duration-500 delay-500">
                                <h5 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                                  <Shield className="w-5 h-5 mr-2 text-accent-purple" />
                                  Bug Fixes
                                </h5>
                                <div className="space-y-3">
                                  {update.bugFixes.map((fix, fixIndex) => (
                                    <div key={fixIndex} className="flex items-start space-x-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transform hover:scale-[1.02] transition-all duration-300 animate-in fade-in slide-in-from-right-2" style={{animationDelay: `${fixIndex * 100 + 600}ms`}}>
                                      <Bug className="w-4 h-4 text-accent-purple shrink-0 mt-0.5" />
                                      <span className="text-sm text-foreground">{fix}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Screenshots */}
                            {update.screenshots.length > 0 && (
                              <div className="animate-in slide-in-from-left-4 duration-500 delay-600">
                                <h5 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                                  <ImageIcon className="w-5 h-5 mr-2 text-accent-pink" />
                                  Images
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {update.screenshots.map((screenshot, screenshotIndex) => (
                                    <div key={screenshotIndex} className="relative group animate-in fade-in slide-in-from-bottom-4 duration-500" style={{animationDelay: `${screenshotIndex * 200 + 700}ms`}}>
                                      <div className="aspect-video bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-lg border border-border/40 flex items-center justify-center hover:scale-105 hover:shadow-lg hover:shadow-accent-pink/20 transition-all duration-500 group-hover:border-accent-pink/60">
                                        <div className="text-center space-y-2">
                                          <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto group-hover:text-accent-pink transition-colors duration-300" />
                                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">{screenshot}</span>
                                        </div>
                                      </div>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 hover:bg-accent-pink/20"
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {

  return (
    <div className="min-h-screen space-y-8">
      {/* Header */}
      <div className="compact-container pt-6">
        
        <div className="text-center space-y-4 mb-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-2xl doax-glass">
              <Database className="w-12 h-12 text-accent-pink" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold doax-gradient-text leading-tight">
            Update Log
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Latest improvements and feature releases for the Handbook
          </p>
        </div>
      </div>

      {/* Update Log */}
      <section className="viewport-optimized pb-8">
        <div className="compact-container">
          <div className="max-w-6xl mx-auto">
            <UpdateLog />
          </div>
        </div>
      </section>
    </div>
  );
} 