import React, { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { FormGroup } from '@/components/ui/spacing';
import { cn } from '@/services/utils';

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  suggestions?: string[];
  label?: string;
  description?: string;
  placeholder?: string;
  quickAddTags?: string[];
  className?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onTagsChange,
  suggestions = [],
  label = "Tags",
  description = "Add tags to categorize and organize",
  placeholder = "Type to add tags...",
  quickAddTags = [],
  className
}) => {
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [selectedTagIndex, setSelectedTagIndex] = useState(-1);

  const getFilteredTagSuggestions = useCallback((input: string) => {
    if (!input.trim()) return [];
    const inputLower = input.toLowerCase();
    return suggestions
      .filter(tag =>
        tag.toLowerCase().includes(inputLower) &&
        !tags.includes(tag)
      )
      .slice(0, 8);
  }, [suggestions, tags]);

  const addTag = useCallback((tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag]);
    }
    setTagInput('');
    setShowTagSuggestions(false);
    setSelectedTagIndex(-1);
  }, [tags, onTagsChange]);

  const removeTag = useCallback((tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  }, [tags, onTagsChange]);

  return (
    <FormGroup label={label} description={description} className={className}>
      <div className="space-y-3">
        {/* Current Tags Display */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1 bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan px-3 py-1 rounded-full text-sm font-medium"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 p-0.5 rounded-full transition-colors duration-200 focus:ring-2 focus:ring-accent-cyan/20 focus:outline-hidden"
                  aria-label={`Remove ${tag} tag`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tag Input with Suggestions */}
        <div className="relative">
          <Input
            value={tagInput}
            onChange={(e) => {
              setTagInput(e.target.value);
              setShowTagSuggestions(e.target.value.length > 0);
              setSelectedTagIndex(-1);
            }}
            onKeyDown={(e) => {
              const filteredSuggestions = getFilteredTagSuggestions(tagInput);

              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                if (selectedTagIndex >= 0 && filteredSuggestions[selectedTagIndex]) {
                  addTag(filteredSuggestions[selectedTagIndex]);
                } else if (tagInput.trim()) {
                  addTag(tagInput);
                }
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedTagIndex(prev =>
                  prev < filteredSuggestions.length - 1 ? prev + 1 : 0
                );
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedTagIndex(prev =>
                  prev > 0 ? prev - 1 : filteredSuggestions.length - 1
                );
              } else if (e.key === 'Escape') {
                setShowTagSuggestions(false);
                setSelectedTagIndex(-1);
              }
            }}
            onBlur={() => {
              // Delay hiding suggestions to allow clicking
              setTimeout(() => {
                setShowTagSuggestions(false);
                setSelectedTagIndex(-1);
              }, 200);
            }}
            placeholder={placeholder}
            className="h-11 px-4 border-2 border-border rounded-xl transition-all duration-200 focus:ring-2 focus:ring-accent-cyan/20 focus:border-accent-cyan focus:outline-hidden"
          />

          {/* Tag Suggestions Dropdown */}
          {showTagSuggestions && tagInput.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border-2 border-border rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
              {getFilteredTagSuggestions(tagInput).map((suggestion, index) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addTag(suggestion)}
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl",
                    index === selectedTagIndex
                      ? "bg-accent-cyan/20 text-accent-cyan"
                      : "text-foreground hover:bg-muted/50"
                  )}
                >
                  {suggestion}
                </button>
              ))}
              {getFilteredTagSuggestions(tagInput).length === 0 && (
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  No suggestions found. Press Enter to add "{tagInput}" as a new tag.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Tag Suggestions */}
        {quickAddTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground font-medium py-1">Quick add:</span>
            {quickAddTags
              .filter(tag => !tags.includes(tag))
              .slice(0, 6)
              .map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="text-xs bg-muted/50 border border-border px-2 py-1 rounded-md transition-colors duration-200 hover:bg-muted focus:ring-2 focus:ring-accent-cyan/20 focus:outline-hidden"
                >
                  + {tag}
                </button>
              ))}
          </div>
        )}
      </div>
    </FormGroup>
  );
}; 