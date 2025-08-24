import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/services/utils';
import { DocumentSectionInfo } from '@/types';

interface DocumentSectionNavigationProps {
  documentSections: DocumentSectionInfo[];
  activeSection: string;
  onSectionChange: (sectionId: string) => void;
}

export const DocumentSectionNavigation: React.FC<DocumentSectionNavigationProps> = ({
  documentSections,
  activeSection,
  onSectionChange
}) => {
  return (
    <Card className="p-3 mb-5 rounded-2xl">
      <CardContent className="p-0">
        <div className="grid grid-cols-3 gap-2">
          {documentSections.map((section, index) => {
            const IconComponent = section.icon;
            const isActive = activeSection === section.id;
            return (
              <motion.button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                onKeyDown={(e) => {
                  // Enhanced keyboard navigation
                  if (e.key === 'ArrowLeft' && index > 0) {
                    e.preventDefault();
                    const prevSection = documentSections[index - 1];
                    onSectionChange(prevSection.id);
                  } else if (e.key === 'ArrowRight' && index < documentSections.length - 1) {
                    e.preventDefault();
                    const nextSection = documentSections[index + 1];
                    onSectionChange(nextSection.id);
                  }
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                  'px-3 py-2 rounded-xl transition-all duration-200 group border',
                  'focus:ring-2 focus:ring-accent-cyan/30 focus:outline-none focus:ring-offset-2',
                  isActive
                    ? 'bg-gradient-to-r from-accent-pink to-accent-purple text-white shadow-lg border-accent-pink/50'
                    : 'bg-card/50 text-muted-foreground hover:text-foreground border-border/30 hover:border-accent-cyan/30 hover:bg-card/80 hover:shadow-md'
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className={cn(
                    'p-1.5 rounded-lg transition-all',
                    isActive
                      ? 'bg-white/20'
                      : 'bg-accent-cyan/10 group-hover:bg-accent-cyan/20'
                  )}>
                    <IconComponent className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-white' : 'text-accent-cyan'
                    )} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{section.title}</h3>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
