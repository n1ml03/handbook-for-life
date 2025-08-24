import React from 'react';
import { Plus, FileText, GraduationCap, BookOpen, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DocumentType } from '@/types';

export interface ContentTypeSelectorProps {
  onCreateDocument: (type: DocumentType) => void;
  onCreateUpdateLog: () => void;
  className?: string;
}

const contentOptions = [
  {
    id: 'document',
    type: 'guide' as DocumentType,
    title: 'New Document',
    description: 'Tạo hướng dẫn chi tiết',
    icon: FileText,
  },
  {
    id: 'tutorial', 
    type: 'tutorial' as DocumentType,
    title: 'New Tutorial',
    description: 'Hướng dẫn từng bước',
    icon: GraduationCap,
  },
  {
    id: 'update-log',
    type: 'update-log' as const,
    title: 'New Update Log',
    description: 'Ghi lại cập nhật hệ thống',
    icon: BookOpen,
  },
];

export const ContentTypeSelector: React.FC<ContentTypeSelectorProps> = ({
  onCreateDocument,
  onCreateUpdateLog,
  className
}) => {
  const handleCreateContent = (option: typeof contentOptions[0]) => {
    if (option.type === 'update-log') {
      onCreateUpdateLog();
    } else {
      onCreateDocument(option.type);
    }
  };

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="bg-gradient-to-r from-accent-pink to-accent-purple text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Content
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent className="w-64" align="center" sideOffset={5}>
          <DropdownMenuLabel className="text-base font-semibold">
            Choose Content Type
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {contentOptions.map((option) => {
            const IconComponent = option.icon;
            
            return (
              <DropdownMenuItem
                key={option.id}
                onClick={() => handleCreateContent(option)}
                className="flex items-start gap-3 p-3 cursor-pointer"
              >
                <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="font-medium">{option.title}</span>
                  <span className="text-sm text-muted-foreground">
                    {option.description}
                  </span>
                </div>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
