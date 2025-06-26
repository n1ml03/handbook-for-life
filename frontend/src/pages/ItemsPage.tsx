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
  Search
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/services/utils';
import { Grid } from '@/components/ui/spacing';
import UnifiedFilter, { FilterField, SortOption as UnifiedSortOption } from '@/components/features/UnifiedFilter';
import { 
  swimsuitsApi,
  itemsApi,
  skillsApi,
  bromidesApi
} from '@/services/api';
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
  type MultiLanguageItem,
  getDisplayName,
  getDisplayDescription} from '@/services/multiLanguageSearch';
import { useMultiLanguageSearch } from '@/services/useMultiLanguageSearch';
import React from 'react';
import { PageLoadingState } from '@/components/ui';

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

// Language info constant - updated to match multi-language search format
const languageInfo = {
  EN: { flag: '🇺🇸', name: 'EN' },
  CN: { flag: '🇨🇳', name: 'CN' },
  TW: { flag: '🇹🇼', name: 'TW' },
  KO: { flag: '🇰🇷', name: 'KO' },
  JP: { flag: '🇯🇵', name: 'JP' }
};

// Optimized ItemCard component
const ItemCard = React.memo(function ItemCard({ item }: { item: UnifiedItem & MultiLanguageItem }) {
  const displayName = useMemo(() => getDisplayName(item, 'EN'), [item]);
  const displayDescription = useMemo(() => getDisplayDescription(item, 'EN'), [item]);
  const typeIcon = useMemo(() => getTypeIcon(item.type), [item.type]);
  const typeColor = useMemo(() => getTypeColor(item.type), [item.type]);
  const rarityColor = useMemo(() => item.rarity ? getRarityColor(item.rarity) : '', [item.rarity]);
  const statsEntries = useMemo(() => item.stats ? Object.entries(item.stats).slice(0, 4) : [], [item.stats]);

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="relative bg-card/80 backdrop-blur-sm border border-border/30 rounded-xl p-6 mt-2 overflow-hidden group cursor-pointer"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/5 via-accent-cyan/5 to-accent-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-accent-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex items-start gap-4 mb-6">
          {/* Enhanced Item Icon */}
          <div className="relative">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-muted/60 to-muted/40 shrink-0 border-2 border-border/20 flex items-center justify-center group-hover:border-accent-cyan/20 transition-all duration-200">
              {item.image ? (
                <img
                  src={item.image}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={cn(
                  'w-full h-full flex items-center justify-center text-muted-foreground',
                  item.image ? 'hidden' : 'flex'
                )}
              >
                {typeIcon}
              </div>
            </div>
            
            {/* Rarity badge - positioned as overlay */}
            {item.rarity && (
              <div className="absolute -top-2 -right-2">
                <Badge className={cn('text-xs font-bold shadow-lg', rarityColor)}>
                  <Star className="w-3 h-3 mr-1" />
                  {item.rarity}
                </Badge>
              </div>
            )}
          </div>

          {/* Item Type Badge */}
          <div className="flex-1 min-w-0">
            <Badge variant="outline" className={cn('text-xs mb-3 shadow-xs', typeColor)}>
              {typeIcon}
              <span className="ml-1 capitalize font-medium">{item.type}</span>
            </Badge>
          </div>
        </div>

        {/* Name Section - Enhanced Visual */}
        <div className="mb-6">
          {/* Primary Name with modern styling */}
          <div className="mb-4 p-4 bg-gradient-to-r from-accent-cyan/5 via-accent-cyan/10 to-transparent rounded-lg border border-accent-cyan/10 group-hover:border-accent-cyan/15 transition-all duration-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-accent-cyan rounded-full"></div>
              <span className="text-xs font-medium text-accent-cyan/80 uppercase tracking-wider">
                Primary (EN)
              </span>
            </div>
            <h3 className="font-bold text-foreground text-lg leading-tight">
              {displayName}
            </h3>
          </div>
          
          {/* All Language Translations - Enhanced Cards */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Other Languages
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(languageInfo).map(([lang, info]) => {
                const langName = getDisplayName(item, lang as keyof typeof languageInfo);
                
                // Skip if it's the same as the primary name to avoid duplication
                if (lang === 'EN') return null;
                
                return (
                  <div 
                    key={lang} 
                    className="flex items-center gap-3 p-3 bg-card/40 rounded-lg border border-border/20 hover:bg-card/50 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm shrink-0">{info.flag}</span>
                      <span className="text-xs font-medium text-muted-foreground/60 bg-muted/30 px-2 py-1 rounded-md">
                        {info.name}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground/90 flex-1 min-w-0 truncate">
                      {langName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Character & Description */}
        <div className="space-y-3 mb-6">
          {item.character && (
            <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg border border-border/10">
              <User className="w-4 h-4 text-accent-cyan" />
              <span className="text-sm font-medium text-foreground">{item.character}</span>
            </div>
          )}

          {displayDescription && (
            <div className="p-3 bg-muted/10 rounded-lg border border-border/10">
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {displayDescription}
              </p>
            </div>
          )}
        </div>

        {/* Stats Section - Enhanced */}
        {item.stats && (
          <div className="p-4 bg-gradient-to-br from-accent-cyan/5 to-transparent rounded-lg border border-accent-cyan/10">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-accent-cyan" />
              <span className="text-sm font-semibold text-foreground">Stats</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {statsEntries.map(([stat, value]) => (
                <div key={stat} className="flex justify-between items-center p-2 bg-card/40 rounded-md border border-border/10">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat}</span>
                  <span className="font-bold text-accent-cyan text-sm">{String(value || 0)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});

// Add display name for better debugging
ItemCard.displayName = 'ItemCard';

export default function ItemsPage() {
  // Optimized state management
  const [itemsData, setItemsData] = useState({
    swimsuits: [] as Swimsuit[],
    accessories: [] as Item[],
    skills: [] as Skill[],
    bromides: [] as Bromide[],
    loading: true,
    error: null as string | null,
  });

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

  // Debounce search to improve performance
  const debouncedSearchTerm = useDebounce(String(filterValues.search || ''), 300);

  // Optimized fetch function with useCallback
  const fetchAllData = useCallback(async () => {
    try {
      setItemsData(prev => ({ ...prev, loading: true, error: null }));
      
      const [swimsuitsRes, accessoriesRes, skillsRes, bromidesRes] = await Promise.all([
        swimsuitsApi.getSwimsuits({ limit: 1000 }),
        itemsApi.getItems({ category: 'ACCESSORY', limit: 1000 }),
        skillsApi.getSkills({ limit: 1000 }),
        bromidesApi.getBromides({ limit: 1000 })
      ]);

      setItemsData(prev => ({
        ...prev,
        swimsuits: swimsuitsRes.data,
        accessories: accessoriesRes.data,
        skills: skillsRes.data,
        bromides: bromidesRes.data,
        loading: false
      }));
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setItemsData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch items. Please try again.'
      }));
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Memoized unified items data with multi-language support
  const rawUnifiedItems = useMemo(() => {
    const items: (MultiLanguageItem & UnifiedItem)[] = [];

    // Add swimsuits
    itemsData.swimsuits.forEach((swimsuit: Swimsuit) => {
      items.push(convertToMultiLanguageItem(swimsuit, 'swimsuit'));
    });

    // Add accessories
            itemsData.accessories.forEach((accessory: Item) => {
          items.push(convertToMultiLanguageItem(accessory, 'accessory'));
        });

    // Add skills
    itemsData.skills.forEach((skill: Skill) => {
      items.push(convertToMultiLanguageItem(skill, 'skill'));
    });

    // Add bromides
    itemsData.bromides.forEach((bromide: Bromide) => {
      items.push(convertToMultiLanguageItem(bromide, 'bromide'));
    });

    return items;
  }, [itemsData.swimsuits, itemsData.accessories, itemsData.skills, itemsData.bromides]);

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

  const handleShowFilters = useCallback((show: boolean) => {
    setUiState(prev => ({ ...prev, showFilters: show }));
  }, []);

  return (
    <PageLoadingState 
      isLoading={itemsData.loading} 
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
          <p className="modern-page-subtitle">
            Browse and search through {unifiedItems.length} items with comprehensive multi-language support
          </p>
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
      <Grid cols={3} gap="md" className="pt-2">
        {filteredAndSortedItems.length === 0 && !itemsData.loading ? (
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
          filteredAndSortedItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))
        )}
      </Grid>
      </div>
    </div>
    </PageLoadingState>
  );
}