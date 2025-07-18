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
    <div className="grid-responsive-cards single-row">
      {/* All Documents Card */}
      <div
        className={cn(
          "doax-card p-2 cursor-pointer transition-colors duration-200 border-2",
          activeSection === 'all'
            ? 'border-accent-cyan bg-accent-cyan/5'
            : 'border-border hover:border-accent-cyan/50'
        )}
        onClick={() => onSectionChange('all')}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div className={cn(
            "p-1 rounded-md",
            activeSection === 'all'
              ? 'bg-accent-cyan text-white'
              : 'bg-accent-cyan/10 text-accent-cyan'
          )}>
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-xs text-foreground truncate">All Documents</h3>
            <p className="text-xs text-muted-foreground hidden sm:block">Complete collection</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground hidden sm:block">Total</span>
          <StatusBadge status="info" className="text-xs ml-auto">
            {documents.length}
          </StatusBadge>
        </div>
      </div>

      {/* Checklist Creation Card */}
      <div
        className={cn(
<<<<<<< Updated upstream
          "doax-card p-3 cursor-pointer transition-all duration-200 hover:shadow-lg border-2",
          activeSection === 'checklist-creation'
=======
          "doax-card p-2 cursor-pointer transition-colors duration-200 border-2",
          activeSection === 'checklist'
>>>>>>> Stashed changes
            ? 'border-accent-pink bg-accent-pink/5'
            : 'border-border hover:border-accent-pink/50'
        )}
        onClick={() => onSectionChange('checklist-creation')}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div className={cn(
<<<<<<< Updated upstream
            "p-1.5 rounded-lg",
            activeSection === 'checklist-creation'
=======
            "p-1 rounded-md",
            activeSection === 'checklist'
>>>>>>> Stashed changes
              ? 'bg-accent-pink text-white'
              : 'bg-accent-pink/10 text-accent-pink'
          )}>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
<<<<<<< Updated upstream
            <h3 className="font-semibold text-sm text-foreground truncate">Creation</h3>
            <p className="text-xs text-muted-foreground hidden sm:block">Creation guides</p>
=======
            <h3 className="font-semibold text-xs text-foreground truncate">Checklist</h3>
            <p className="text-xs text-muted-foreground hidden sm:block">Checklist documents</p>
>>>>>>> Stashed changes
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground hidden sm:block">Docs</span>
          <StatusBadge status="success" className="text-xs ml-auto">
            {getChecklistCreationCount()}
          </StatusBadge>
        </div>
      </div>

      {/* Checking Guide Card */}
      <div
        className={cn(
<<<<<<< Updated upstream
          "doax-card p-3 cursor-pointer transition-all duration-200 hover:shadow-lg border-2",
          activeSection === 'checking-guide'
=======
          "doax-card p-2 cursor-pointer transition-colors duration-200 border-2",
          activeSection === 'guide'
>>>>>>> Stashed changes
            ? 'border-accent-purple bg-accent-purple/5'
            : 'border-border hover:border-accent-purple/50'
        )}
        onClick={() => onSectionChange('checking-guide')}
      >
        <div className="flex items-center gap-2 mb-1.5">
          <div className={cn(
<<<<<<< Updated upstream
            "p-1.5 rounded-lg",
            activeSection === 'checking-guide'
=======
            "p-1 rounded-md",
            activeSection === 'guide'
>>>>>>> Stashed changes
              ? 'bg-accent-purple text-white'
              : 'bg-accent-purple/10 text-accent-purple'
          )}>
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
<<<<<<< Updated upstream
            <h3 className="font-semibold text-sm text-foreground truncate">Checking</h3>
            <p className="text-xs text-muted-foreground hidden sm:block">Verification docs</p>
=======
            <h3 className="font-semibold text-xs text-foreground truncate">Guide</h3>
            <p className="text-xs text-muted-foreground hidden sm:block">Guide documents</p>
>>>>>>> Stashed changes
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground hidden sm:block">Docs</span>
          <StatusBadge status="warning" className="text-xs ml-auto">
            {getCheckingGuideCount()}
          </StatusBadge>
        </div>
      </div>
    </div>
  );
}; 