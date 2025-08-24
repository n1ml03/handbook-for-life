import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  Code, 
  Settings, 
  ExternalLink,
  Globe,
  Server
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OptimizedCardGrid } from '@/components/ui/optimized-card-grid';
import { TestingTool } from '@/types';

export interface TestingToolsManagementProps {
  className?: string;
}

// Define the testing tools data
const testingTools: TestingTool[] = [
  {
    id: 'server',
    name: 'Server',
    description: 'Server for the application',
    url: 'http://192.168.200.108:3001',
    icon: Server,
    category: 'server',
    status: 'active',
    port: 3001
  },
  {
    id: 'api',
    name: 'API',
    description: 'API for the application',
    url: 'http://192.168.200.108:3001/api-docs',
    icon: Database,
    category: 'api',
    status: 'active',
    port: 3001
  },
  {
    id: 'health',
    name: 'Health',
    description: 'Health for the application ',
    url: 'http://192.168.200.108:3001/api/health',
    icon: Code,
    category: 'health',
    status: 'active'
  }
  ];

export const TestingToolsManagement: React.FC<TestingToolsManagementProps> = ({
}) => {

    const handleToolClick = (tool: TestingTool) => {
    window.open(tool.url, '_blank', 'noopener,noreferrer');
  };

  // Memoized testing tool card renderer for virtual scrolling
  const renderTestingToolCard = useMemo(() => (tool: TestingTool, index: number) => (
    <motion.div
      className="doax-card p-4 cursor-pointer transition-all duration-200 focus-within:ring-2 focus-within:ring-accent-cyan/20 focus-within:outline-none"
      onClick={() => handleToolClick(tool)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToolClick(tool);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Open ${tool.name} - ${tool.description}`}
      whileTap={{ scale: 0.99 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="text-xs shrink-0">
              {tool.category}
            </Badge>
            <h3 className="text-lg font-semibold truncate">{tool.name}</h3>
          </div>
          <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
            {tool.description}
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            <Badge variant="secondary" className="text-xs">
              {tool.status}
            </Badge>
            {tool.port && (
              <Badge variant="secondary" className="text-xs">
                Port: {tool.port}
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            <Globe className="w-4 h-4 inline mr-1" />
            {tool.url}
          </div>
        </div>
        <div className="flex gap-2 ml-4 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleToolClick(tool);
            }}
            disabled={tool.status === 'inactive'}
            className="text-blue-600 border-blue-200 hover:bg-blue-50 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-colors duration-200"
            aria-label={`Open ${tool.name} in new tab`}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  ), []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Testing Tools</h2>
      </div>

      {/* Virtual Scrolling Testing Tools List */}
      <OptimizedCardGrid
        items={testingTools}
        renderCard={renderTestingToolCard}
        className="admin-card-grid"
        itemsPerPage={20}
        enableLazyLoading={true}
        gridCols={{ mobile: 1, tablet: 1, desktop: 1 }}
        gap="sm"
        enableAnimations={true}
      />

      {/* Empty State */}
      {testingTools.length === 0 && (
        <div className="doax-card p-8 text-center">
          <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No testing tools available</h3>
          <p className="text-muted-foreground mb-4">Testing tools will appear here when configured</p>
        </div>
      )}
    </div>
  );
};

export default TestingToolsManagement; 