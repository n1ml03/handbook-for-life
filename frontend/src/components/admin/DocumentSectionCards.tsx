import React from 'react';
import { BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/services/utils';
import { StatusBadge } from '@/components/ui/spacing';
import { Document } from '@/types';
import { safeNormalizeTags, safeToString } from '@/services/utils';

interface DocumentSectionCardsProps {
  documents: Document[];
  activeSection: 'checklist-creation' | 'checking-guide' | 'all';
  onSectionChange: (section: 'checklist-creation' | 'checking-guide' | 'all') => void;
}

export const DocumentSectionCards: React.FC<DocumentSectionCardsProps> = ({
  documents,
  activeSection,
  onSectionChange
}) => {
  const getChecklistCreationCount = () => {
    return documents.filter(doc => {
      const tags = safeNormalizeTags(doc.tags);
      return tags.some(tag => {
        const tagStr = safeToString(tag).toLowerCase();
        return tagStr.includes('checklist') || 
               tagStr.includes('creation') ||
               tagStr.includes('guide');
      }) || doc.category === 'checklist-creation';
    }).length;
  };

  const getCheckingGuideCount = () => {
    return documents.filter(doc => {
      const tags = safeNormalizeTags(doc.tags);
      return tags.some(tag => {
        const tagStr = safeToString(tag).toLowerCase();
        return tagStr.includes('checking') || 
               tagStr.includes('verification') ||
               tagStr.includes('validation');
      }) || doc.category === 'checking-guide';
    }).length;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* All Documents Card */}
      <div 
        className={cn(
          "doax-card p-4 cursor-pointer transition-all duration-200 hover:shadow-lg border-2",
          activeSection === 'all'
            ? 'border-accent-cyan bg-accent-cyan/5'
            : 'border-border hover:border-accent-cyan/50'
        )}
        onClick={() => onSectionChange('all')}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={cn(
            "p-2 rounded-lg",
            activeSection === 'all'
              ? 'bg-accent-cyan text-white'
              : 'bg-accent-cyan/10 text-accent-cyan'
          )}>
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">All Documents</h3>
            <p className="text-xs text-muted-foreground">Complete collection</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total documents</span>
          <StatusBadge status="info" className="text-xs">
            {documents.length}
          </StatusBadge>
        </div>
      </div>

      {/* Checklist Creation Card */}
      <div 
        className={cn(
          "doax-card p-4 cursor-pointer transition-all duration-200 hover:shadow-lg border-2",
          activeSection === 'checklist-creation'
            ? 'border-accent-pink bg-accent-pink/5'
            : 'border-border hover:border-accent-pink/50'
        )}
        onClick={() => onSectionChange('checklist-creation')}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={cn(
            "p-2 rounded-lg",
            activeSection === 'checklist-creation'
              ? 'bg-accent-pink text-white'
              : 'bg-accent-pink/10 text-accent-pink'
          )}>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Checklist Creation</h3>
            <p className="text-xs text-muted-foreground">Creation guides</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Creation docs</span>
          <StatusBadge status="success" className="text-xs">
            {getChecklistCreationCount()}
          </StatusBadge>
        </div>
      </div>

      {/* Checking Guide Card */}
      <div 
        className={cn(
          "doax-card p-4 cursor-pointer transition-all duration-200 hover:shadow-lg border-2",
          activeSection === 'checking-guide'
            ? 'border-accent-purple bg-accent-purple/5'
            : 'border-border hover:border-accent-purple/50'
        )}
        onClick={() => onSectionChange('checking-guide')}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className={cn(
            "p-2 rounded-lg",
            activeSection === 'checking-guide'
              ? 'bg-accent-purple text-white'
              : 'bg-accent-purple/10 text-accent-purple'
          )}>
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">Checking Guide</h3>
            <p className="text-xs text-muted-foreground">Verification docs</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Checking docs</span>
          <StatusBadge status="warning" className="text-xs">
            {getCheckingGuideCount()}
          </StatusBadge>
        </div>
      </div>
    </div>
  );
}; 