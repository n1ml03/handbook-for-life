import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, Tags, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/services/utils';
import { Stack, Inline, Grid } from '@/components/ui/spacing';
import { documentCategoriesData, type Document, type SortDirection } from '@/types';
import UnifiedFilter, { FilterField, SortOption as UnifiedSortOption } from '@/components/features/UnifiedFilter';
import { safeNormalizeTags, safeToString } from '@/services/utils';

interface ListViewProps {
  documents: Document[];
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  filterValues: Record<string, string | number | boolean>;
  onFilterChange: (key: string, value: string | number | boolean) => void;
  onClearFilters: () => void;
  sortBy: string;
  sortDirection: SortDirection;
  onSortChange: (sortBy: string, direction: SortDirection) => void;
  onDocumentClick: (document: Document) => void;
  debouncedSearch: string;
}

export const ListView: React.FC<ListViewProps> = ({
  documents,
  showFilters,
  setShowFilters,
  filterValues,
  onFilterChange,
  onClearFilters,
  sortBy,
  sortDirection,
  onSortChange,
  onDocumentClick,
  debouncedSearch
}) => {
  // Extract plain text from HTML content
  const extractPlainText = (content: string) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  // Filter documents
  const filteredDocuments = useMemo(() => {
    const filtered = documents.filter(doc => {
      const tags = safeNormalizeTags(doc.tags);
      
      const searchTerm = String(filterValues.search || '').toLowerCase();
      const matchesSearch = !searchTerm ||
        doc.title.toLowerCase().includes(searchTerm) ||
        doc.content.toLowerCase().includes(searchTerm) ||
        tags.some(tag => safeToString(tag).toLowerCase().includes(searchTerm));
      
      const matchesCategory = !filterValues.category || filterValues.category === 'all' || doc.category === filterValues.category;
      const authorValue = String(filterValues.author || '');
      const matchesAuthor = !authorValue || doc.author.toLowerCase().includes(authorValue.toLowerCase());

      return matchesSearch && matchesCategory && matchesAuthor;
    });

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'author':
          comparison = a.author.localeCompare(b.author);
          break;
      }
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [documents, filterValues, sortBy, sortDirection]);

  // Filter configuration for UnifiedFilter
  const filterFields: FilterField[] = useMemo(() => [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search documents, content, or tags...',
      icon: <Search className="w-3 h-3 mr-1" />,
    },
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      placeholder: 'All Categories',
      options: [
        { value: 'all', label: 'All Categories' },
        ...documentCategoriesData.map(cat => ({ value: cat.id, label: cat.name }))
      ],
      icon: <Tags className="w-3 h-3 mr-1" />,
    },
    {
      key: 'author',
      label: 'Author',
      type: 'text',
      placeholder: 'Filter by author...',
      icon: <User className="w-3 h-3 mr-1" />,
    }
  ], []);

  // Sort options for UnifiedFilter
  const sortOptions: UnifiedSortOption[] = [
    { key: 'date', label: 'Date' },
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'author', label: 'Author' }
  ];

  return (
    <Stack spacing="md">
      {/* Unified Filter */}
      <UnifiedFilter
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filterFields={filterFields}
        sortOptions={sortOptions}
        filterValues={filterValues}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={onSortChange}
        resultCount={filteredDocuments.length}
        accentColor="accent-cyan"
        secondaryColor="accent-purple"
        headerIcon={<FileText className="w-4 h-4" />}
      />

      {/* Document Grid */}
      {filteredDocuments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <motion.div
            className="w-32 h-32 bg-gradient-to-br from-accent-pink/10 to-accent-purple/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-accent-cyan/20"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <FileText className="w-16 h-16 text-accent-cyan/50" />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-300 mb-3">No documents found</h3>
          <p className="text-muted-foreground mb-6">
            {debouncedSearch ?
              'Try adjusting your search terms or clear the search to see all documents.' :
              'Try adjusting your filters or clear them to see all documents.'
            }
          </p>
          <Button
            onClick={onClearFilters}
            className="bg-gradient-to-r from-accent-pink to-accent-purple hover:from-accent-pink/90 hover:to-accent-purple/90 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg"
          >
            Clear All Filters
          </Button>
        </motion.div>
      ) : (
        <Grid cols={1} gap="lg" className="max-w-none">
          {filteredDocuments.map((document, index) => (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.15,
                delay: Math.min(index * 0.02, 0.1) // Limit max delay to 0.1s
              }}
            >
              <Card
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:border-accent-pink/30 overflow-hidden rounded-2xl"
                onClick={() => onDocumentClick(document)}
              >
                <CardContent className="p-6">
                  <Inline align="between" className="mb-4">
                    <div className="flex-1">
                      <Inline spacing="md" className="mb-3">
                        <h3 className="text-xl font-bold text-foreground group-hover:text-accent-pink transition-colors">
                          {document.title}
                        </h3>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs px-2 py-1",
                            documentCategoriesData.find(cat => cat.id === document.category)?.color || 'text-muted-foreground border-border/30 bg-muted/10'
                          )}
                        >
                          {documentCategoriesData.find(cat => cat.id === document.category)?.name || document.category}
                        </Badge>
                      </Inline>

                      <p className="text-muted-foreground leading-relaxed text-base mb-4 line-clamp-2">
                        {extractPlainText(document.content).slice(0, 200)}
                        {extractPlainText(document.content).length > 200 && '...'}
                      </p>

                      {document.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {document.tags.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs bg-accent-cyan/5 border-accent-cyan/20 text-accent-cyan">
                              <Tags className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                          {document.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs bg-muted/10">
                              +{document.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      <Inline spacing="lg" className="text-sm text-muted-foreground">
                        <Inline spacing="sm">
                          <User className="w-4 h-4 text-accent-purple" />
                          <span className="font-medium">{document.author}</span>
                        </Inline>
                        <Inline spacing="sm">
                          <Calendar className="w-4 h-4 text-accent-cyan" />
                          <span>Updated {document.updated_at}</span>
                        </Inline>
                      </Inline>
                    </div>

                    <div className="ml-6 text-accent-cyan group-hover:text-accent-pink transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                  </Inline>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Grid>
      )}
    </Stack>
  );
};
