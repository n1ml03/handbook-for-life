import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Gem,
  Shirt,
  Image,
  Zap,
  User,
  Package,
  Star,
  Tag,
  Search,
  ChevronLeft,
  ChevronRight} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/services/utils';
import { Grid } from '@/components/ui/spacing';
import UnifiedFilter, { FilterField, SortOption as UnifiedSortOption } from '@/components/features/UnifiedFilter';

import { useDashboardOverview } from '@/hooks/useApiQueries';
import { 
  type Swimsuit,
  type Item,
  type Skill,
  type Bromide,
  type ItemType,
  type SortDirection,
  type UnifiedItem
} from '@/types';
import { useDebounce } from '@/hooks/useDebounce';
// Import multi-language search functionality
import { 
  addTranslationsToItems, 
  type MultiLanguageItem} from '@/services/multiLanguageSearch';
import { safeExtractArrayData } from '@/services/utils';
import { useMultiLanguageSearch } from '@/services/multiLanguageSearch';
import React from 'react';
import { PageLoadingState, MultiLanguageCard, type MultiLanguageNames } from '@/components/ui';

// Memoized helper functions outside component
const getTypeIcon = (type: ItemType) => {
  switch (type) {
    case 'swimsuit': return <Shirt className="w-4 h-4" />;
    case 'accessory': return <Gem className="w-4 h-4" />;
    case 'skill': return <Zap className="w-4 h-4" />;
    case 'bromide': return <Image className="w-4 h-4" />;
    default: return <Package className="w-4 h-4" />;
  }
};

const getTypeColor = (type: ItemType) => {
  switch (type) {
    case 'swimsuit': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    case 'accessory': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
    case 'skill': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    case 'bromide': return 'text-pink-400 bg-pink-400/10 border-pink-400/20';
    default: return 'text-muted-foreground bg-muted/10 border-border/20';
  }
};

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'SSR': return 'text-yellow-400 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-yellow-400/30';
    case 'SR': return 'text-purple-400 bg-gradient-to-r from-purple-400/20 to-pink-400/20 border-purple-400/30';
    case 'R': return 'text-blue-400 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 border-blue-400/30';
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
  }
};

// Convert database items to multi-language compatible format
const convertToMultiLanguageItem = (item: any, type: ItemType): MultiLanguageItem & UnifiedItem => {
  // Extract the appropriate name and description based on the item type
  let name = '';
  let description = '';
  
  switch (type) {
    case 'swimsuit':
      name = item.name_en || item.name_jp || `Swimsuit ${item.id}`;
      description = item.description_en || '';
      break;
    case 'accessory':
      name = item.name || `Accessory ${item.id}`;
      description = item.description || '';
      break;
    case 'skill':
      name = item.name_en || item.name_jp || `Skill ${item.id}`;
      description = item.description_en || '';
      break;
    case 'bromide':
      name = item.name_en || item.name_jp || `Bromide ${item.id}`;
      description = item.art_url ? 'Bromide artwork' : '';
      break;
    default:
      name = item.name || `Item ${item.id}`;
      description = item.description || '';
  }

  return {
    id: `${type}-${item.id}`,
    name,
    description,
    type,
    rarity: item.rarity,
    character: type === 'swimsuit' ? item.character?.name_en : undefined,
    category: type === 'accessory' ? item.type : type === 'skill' ? item.skill_category : undefined,
    image: `/images/${type}s/${item.id}.jpg`,
    stats: item.stats,
    // Add any other relevant properties from the original item
    ...item
  };
};



// Optimized ItemCard component
const ItemCard = React.memo(function ItemCard({ item }: { item: UnifiedItem & MultiLanguageItem }) {
  const typeIcon = useMemo(() => getTypeIcon(item.type), [item.type]);
  const typeColor = useMemo(() => getTypeColor(item.type), [item.type]);
  const statsEntries = useMemo(() => item.stats ? Object.entries(item.stats).slice(0, 4) : [], [item.stats]);

  // Extract multi-language names from translations
  const names: MultiLanguageNames = useMemo(() => {
    const translations = item.translations || {};
    return {
      name_jp: (translations as any)?.JP?.name || '',
      name_en: (translations as any)?.EN?.name || item.name || '',
      name_cn: (translations as any)?.CN?.name || '',
      name_tw: (translations as any)?.TW?.name || '',
      name_kr: (translations as any)?.KO?.name || ''
    };
  }, [item.translations, item.name]);

  const header = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Enhanced Item Icon */}
        <div className="relative">
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-muted/60 to-muted/40 shrink-0 border border-border/20 flex items-center justify-center">
            {item.image ? (
              <img
                src={item.image}
                alt={names.name_en}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              {typeIcon}
            </div>
          </div>
        </div>

        <div className="flex-1">
          {/* Item Type Badge */}
          <Badge variant="outline" className={cn('text-xs mb-2 shadow-xs', typeColor)}>
            {typeIcon}
            <span className="ml-1 capitalize font-medium">{item.type}</span>
          </Badge>
          
          {/* Item ID */}
          <div className="text-xs text-gray-400">
            ID: {item.id}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <MultiLanguageCard
      names={names}
      primaryLanguage="en"
      languageVariant="expanded"
      header={header}
    >
    </MultiLanguageCard>
  );
});

// Add display name for better debugging
ItemCard.displayName = 'ItemCard';

export default function ItemsPage() {
  // Use React Query with the new dashboard overview endpoint (single API call instead of 4)
  const { data: overviewResponse, isLoading, error: queryError } = useDashboardOverview();

  // Extract data safely from the combined response
  const swimsuits = useMemo(() => {
    return overviewResponse?.data?.swimsuits?.data || [];
  }, [overviewResponse]);

  const accessories = useMemo(() => {
    return overviewResponse?.data?.accessories?.data || [];
  }, [overviewResponse]);

  const skills = useMemo(() => {
    return overviewResponse?.data?.skills?.data || [];
  }, [overviewResponse]);

  const bromides = useMemo(() => {
    return overviewResponse?.data?.bromides?.data || [];
  }, [overviewResponse]);

  // Convert query error to string for compatibility
  const error = queryError ? (queryError as Error).message : null;

  const [uiState, setUiState] = useState({
    showFilters: false,
  });

  const [sortState, setSortState] = useState({
    sortBy: 'name',
    sortDirection: 'asc' as SortDirection,
  });

  const [filterValues, setFilterValues] = useState<Record<string, string | number | boolean>>({
    search: '',
    type: 'all',
    rarity: '',
    character: ''
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // 6 rows × 2 cards per row

  // Debounce search to improve performance
  const debouncedSearchTerm = useDebounce(String(filterValues.search || ''), 300);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterValues.type, filterValues.rarity, filterValues.character, sortState.sortBy, sortState.sortDirection]);

  // Data is now automatically fetched and cached by React Query

  // Memoized unified items data with multi-language support
  const rawUnifiedItems = useMemo(() => {
    const items: (MultiLanguageItem & UnifiedItem)[] = [];

    // Add swimsuits (safely)
    if (Array.isArray(swimsuits)) {
      swimsuits.forEach((swimsuit: Swimsuit) => {
        items.push(convertToMultiLanguageItem(swimsuit, 'swimsuit'));
      });
    }

    // Add accessories (safely)
    if (Array.isArray(accessories)) {
      accessories.forEach((accessory: Item) => {
        items.push(convertToMultiLanguageItem(accessory, 'accessory'));
      });
    }

    // Add skills (safely)
    if (Array.isArray(skills)) {
      skills.forEach((skill: Skill) => {
        items.push(convertToMultiLanguageItem(skill, 'skill'));
      });
    }

    // Add bromides (safely)
    if (Array.isArray(bromides)) {
      bromides.forEach((bromide: Bromide) => {
        items.push(convertToMultiLanguageItem(bromide, 'bromide'));
      });
    }

    return items;
  }, [swimsuits, accessories, skills, bromides]);

  // Add translations to items using the multi-language search service
  const unifiedItems = useMemo(() => {
    return addTranslationsToItems(rawUnifiedItems);
  }, [rawUnifiedItems]);

  // Get unique values for filters - memoized
  const filterOptions = useMemo(() => {
    const uniqueRarities = [...new Set(unifiedItems.map(item => item.rarity).filter(Boolean))];
    const uniqueCharacters = [...new Set(unifiedItems.map(item => item.character).filter(Boolean))];
    return { uniqueRarities, uniqueCharacters };
  }, [unifiedItems]);

  // Create additional filters function for multi-language search
  const additionalFilters = useCallback((item: any) => {
    // Type filter
    const typeMatch = filterValues.type === 'all' || item.type === filterValues.type;

    // Rarity filter
    const rarityMatch = !filterValues.rarity || item.rarity === filterValues.rarity;

    // Character filter
    const characterMatch = !filterValues.character || item.character === filterValues.character;

    return typeMatch && rarityMatch && characterMatch;
  }, [filterValues.type, filterValues.rarity, filterValues.character]);

  // Use the multi-language search hook
  const { items: filteredAndSortedItems } = useMultiLanguageSearch(
    unifiedItems,
    debouncedSearchTerm,
    additionalFilters,
    sortState.sortBy,
    sortState.sortDirection
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredAndSortedItems.slice(startIndex, endIndex);
  }, [filteredAndSortedItems, currentPage, itemsPerPage]);

  // Create filter configuration
  const filterFields: FilterField[] = useMemo(() => [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search items in all languages...',
      icon: <Search className="w-3 h-3 mr-1" />,
    },
    {
      key: 'type',
      label: 'Item Type',
      type: 'select',
      placeholder: 'All Types',
      options: [
        { value: 'all', label: 'All Types' },
        { value: 'swimsuit', label: 'Swimsuits' },
        { value: 'accessory', label: 'Accessories' },
        { value: 'skill', label: 'Skills' },
        { value: 'bromide', label: 'Bromides' }
      ],
      icon: <Tag className="w-3 h-3 mr-1" />,
    },
    {
      key: 'rarity',
      label: 'Rarity',
      type: 'select',
      placeholder: 'All Rarities',
      options: filterOptions.uniqueRarities.map(r => ({ value: r!, label: r! })),
      icon: <Star className="w-3 h-3 mr-1" />,
    },
    {
      key: 'character',
      label: 'Character',
      type: 'select',
      placeholder: 'All Characters',
      options: filterOptions.uniqueCharacters.map(c => ({ value: c!, label: c! })),
      icon: <User className="w-3 h-3 mr-1" />,
    }
  ], [filterOptions.uniqueRarities, filterOptions.uniqueCharacters]);

  // Sort options - memoized
  const sortOptions: UnifiedSortOption[] = useMemo(() => [
    { key: 'name', label: 'Name' },
    { key: 'type', label: 'Type' },
    { key: 'rarity', label: 'Rarity' },
    { key: 'stats', label: 'Stats' }
  ], []);

  // Optimized event handlers with useCallback
  const handleFilterChange = useCallback((key: string, value: string | number | boolean) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilterValues({
      search: '',
      type: 'all',
      rarity: '',
      character: ''
    });
    setSortState({
      sortBy: 'name',
      sortDirection: 'asc'
    });
  }, []);

  const handleSortChange = useCallback((newSortBy: string, direction: SortDirection) => {
    setSortState({ sortBy: newSortBy, sortDirection: direction });
  }, []);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePrevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  const handleShowFilters = useCallback((show: boolean) => {
    setUiState(prev => ({ ...prev, showFilters: show }));
  }, []);

  return (
    <PageLoadingState
      isLoading={isLoading}
      message="Loading items list..."
    >
    <div className="modern-page">
      <div className="modern-container-lg">
        {/* Modern Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="modern-page-header"
        >
          <h1 className="modern-page-title">
            Items Collection
          </h1>
          
        </motion.div>

      {/* Unified Filter Component */}
      <UnifiedFilter
        showFilters={uiState.showFilters}
        setShowFilters={handleShowFilters}
        filterFields={filterFields}
        sortOptions={sortOptions}
        filterValues={filterValues}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        sortBy={sortState.sortBy}
        sortDirection={sortState.sortDirection}
        onSortChange={handleSortChange}
        resultCount={filteredAndSortedItems.length}
        itemLabel="items"
        accentColor="accent-pink"
        secondaryColor="accent-purple"
        headerIcon={<Package className="w-4 h-4" />}
      />

      {/* Items Grid */}
      <Grid cols={2} gap="md" className="mt-8">
        {filteredAndSortedItems.length === 0 && !isLoading ? (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-full text-center py-16"
          >
            <motion.div
              className="w-24 h-24 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-accent-cyan/20"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Package className="w-12 h-12 text-accent-cyan/60" />
            </motion.div>
            <h3 className="text-2xl font-bold text-foreground mb-3">No items found</h3>
            <p className="text-muted-foreground mb-6">
              {debouncedSearchTerm ?
                'Try adjusting your search terms or clear the search to see all items.' :
                'Try adjusting your filters or clear them to see all items.'
              }
            </p>
            <motion.button
              onClick={clearFilters}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-accent-pink to-accent-purple hover:from-accent-pink/90 hover:to-accent-purple/90 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg"
            >
              Clear All Filters
            </motion.button>
          </motion.div>
        ) : (
          paginatedItems.map((item, index) => (
            <ItemCard key={`${item.type}-${item.id}-${index}`} item={item} />
          ))
        )}
      </Grid>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center space-x-2 mt-8"
        >
          <motion.button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-xl bg-dark-card/70 border border-dark-border/50 text-gray-400 hover:text-white hover:bg-accent-cyan/20 disabled:opacity-50 disabled:hover:bg-dark-card/70 disabled:hover:text-gray-400 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>

          <div className="flex space-x-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <motion.button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    currentPage === page
                      ? 'bg-gradient-to-r from-accent-cyan to-accent-purple text-white shadow-lg'
                      : 'bg-dark-card/70 border border-dark-border/50 text-gray-400 hover:text-white hover:bg-accent-cyan/20'
                  }`}
                >
                  {page}
                </motion.button>
              );
            })}
          </div>

          <motion.button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-3 rounded-xl bg-dark-card/70 border border-dark-border/50 text-gray-400 hover:text-white hover:bg-accent-cyan/20 disabled:opacity-50 disabled:hover:bg-dark-card/70 disabled:hover:text-gray-400 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      )}
      </div>
    </div>
    </PageLoadingState>
  );
}