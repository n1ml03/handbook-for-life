import React from 'react';
import { BookOpen, CheckCircle2, AlertCircle, GraduationCap } from 'lucide-react';
import { cn } from '@/services/utils';
import { StatusBadge } from '@/components/ui/spacing';
import { Document } from '@/types';

interface DocumentSectionCardsProps {
  documents: Document[];
  activeSection: 'checklist' | 'guide' | 'tutorial' | 'all';
  onSectionChange: (section: 'checklist' | 'guide' | 'tutorial' | 'all') => void;
}

export const DocumentSectionCards: React.FC<DocumentSectionCardsProps> = ({
  documents,
  activeSection,
  onSectionChange
}) => {
  const getDocumentCountByType = (type: string) => {
    return documents.filter(doc => doc.document_type === type).length;
  };

  return (
    <div className="grid-responsive-cards single-row">
      {/* All Documents Card */}
      <div 
        className={cn(
          "doax-card p-3 cursor-pointer transition-all duration-200 hover:shadow-lg border-2",
          activeSection === 'all'
            ? 'border-accent-cyan bg-accent-cyan/5'
            : 'border-border hover:border-accent-cyan/50'
        )}
        onClick={() => onSectionChange('all')}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className={cn(
            "p-1.5 rounded-lg",
            activeSection === 'all'
              ? 'bg-accent-cyan text-white'
              : 'bg-accent-cyan/10 text-accent-cyan'
          )}>
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground truncate">All Documents</h3>
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
          "doax-card p-3 cursor-pointer transition-all duration-200 hover:shadow-lg border-2",
          activeSection === 'checklist'
            ? 'border-accent-pink bg-accent-pink/5'
            : 'border-border hover:border-accent-pink/50'
        )}
        onClick={() => onSectionChange('checklist')}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className={cn(
            "p-1.5 rounded-lg",
            activeSection === 'checklist'
              ? 'bg-accent-pink text-white'
              : 'bg-accent-pink/10 text-accent-pink'
          )}>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground truncate">Checklist</h3>
            <p className="text-xs text-muted-foreground hidden sm:block">Checklist documents</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground hidden sm:block">Docs</span>
          <StatusBadge status="success" className="text-xs ml-auto">
            {getDocumentCountByType('checklist')}
          </StatusBadge>
        </div>
      </div>

      {/* Checking Guide Card */}
      <div 
        className={cn(
          "doax-card p-3 cursor-pointer transition-all duration-200 hover:shadow-lg border-2",
          activeSection === 'guide'
            ? 'border-accent-purple bg-accent-purple/5'
            : 'border-border hover:border-accent-purple/50'
        )}
        onClick={() => onSectionChange('guide')}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className={cn(
            "p-1.5 rounded-lg",
            activeSection === 'guide'
              ? 'bg-accent-purple text-white'
              : 'bg-accent-purple/10 text-accent-purple'
          )}>
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground truncate">Guide</h3>
            <p className="text-xs text-muted-foreground hidden sm:block">Guide documents</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground hidden sm:block">Docs</span>
          <StatusBadge status="warning" className="text-xs ml-auto">
            {getDocumentCountByType('guide')}
          </StatusBadge>
        </div>
      </div>

      {/* Tutorial Card */}
      <div 
        className={cn(
          "doax-card p-3 cursor-pointer transition-all duration-200 hover:shadow-lg border-2",
          activeSection === 'tutorial'
            ? 'border-accent-gold bg-accent-gold/5'
            : 'border-border hover:border-accent-gold/50'
        )}
        onClick={() => onSectionChange('tutorial')}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className={cn(
            "p-1.5 rounded-lg",
            activeSection === 'tutorial'
              ? 'bg-accent-gold text-white'
              : 'bg-accent-gold/10 text-accent-gold'
          )}>
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground truncate">Tutorial</h3>
            <p className="text-xs text-muted-foreground hidden sm:block">Tutorial documents</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground hidden sm:block">Docs</span>
          <StatusBadge status="info" className="text-xs ml-auto">
            {getDocumentCountByType('tutorial')}
          </StatusBadge>
        </div>
      </div>

    </div>
  );
}; 