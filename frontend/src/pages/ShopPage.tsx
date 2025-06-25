import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight,
  Search,
  ShoppingCart,
  Coins,
  Tag,
  Gem,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLoadingState } from '@/components/ui';
import UnifiedFilter from '@/components/features/UnifiedFilter';
import type { FilterField, SortOption, SortDirection } from '@/components/features/UnifiedFilter';
import { type ShopItem, type ShopItemCardProps, type ShopItemType, type Currency, type ShopItemRarity } from '@/types';
import { shopItemsApi } from '@/services/api';
import React from 'react';

// Memoized shop item card component
const ShopItemCard = React.memo(function ShopItemCard({ item }: ShopItemCardProps) {
  const getCurrencyIcon = useCallback((currency: string) => {
    switch (currency) {
      case 'coins': return <Coins className="w-4 h-4" />;
      case 'gems': return <Gem className="w-4 h-4" />;
      case 'tickets': return <Tag className="w-4 h-4" />;
      default: return <Coins className="w-4 h-4" />;
    }
  }, []);

  const getCurrencyColor = useCallback((currency: string) => {
    switch (currency) {
      case 'coins': return 'text-yellow-400';
      case 'gems': return 'text-purple-400';
      case 'tickets': return 'text-green-400';
      default: return 'text-yellow-400';
    }
  }, []);

  const finalPrice = useMemo(() => 
    item.discount ? Math.floor(item.price * (1 - item.discount / 100)) : item.price,
    [item.discount, item.price]
  );

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="relative bg-dark-card/80 backdrop-blur-sm border border-dark-border/50 rounded-2xl p-8 overflow-hidden group"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/5 via-accent-cyan/5 to-accent-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-accent-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-bold text-white text-lg truncate">{item.name}</h3>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-xl flex items-center justify-center border border-accent-cyan/20">
              <span className="text-2xl">{item.image || '📦'}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">
            {item.description || 'No description available'}
          </p>
        </div>

        {/* Type and Category */}
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart className="w-4 h-4 text-accent-cyan" />
          <span className="text-xs text-gray-400">
            {item.type?.charAt(0).toUpperCase() + item.type?.slice(1) || item.category || 'Item'} • {item.category || item.type}
          </span>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="bg-gradient-to-r from-accent-cyan/10 to-accent-purple/10 rounded-xl p-3 border border-accent-cyan/20">
            <p className="text-xs font-bold text-accent-cyan mb-2">Price</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={getCurrencyColor(item.currency || 'coins')}>
                  {getCurrencyIcon(item.currency || 'coins')}
                </div>
                <div className="flex items-center gap-2">
                  {item.discount && (
                    <span className="text-xs text-gray-400 line-through">
                      {item.price || 100}
                    </span>
                  )}
                  <span className={`text-lg font-bold ${getCurrencyColor(item.currency || 'coins')}`}>
                    {finalPrice}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features/Tags */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {item.featured && (
              <span className="text-xs bg-yellow-500/20 px-2 py-1 rounded-sm border border-yellow-500/30 text-yellow-400">
                ⭐Featured
              </span>
            )}
            {item.isNew && (
              <span className="text-xs bg-green-500/20 px-2 py-1 rounded-sm border border-green-500/30 text-green-400">
                🆕New
              </span>
            )}
            {item.discount && (
              <span className="text-xs bg-red-500/20 px-2 py-1 rounded-sm border border-red-500/30 text-red-400">
                🔥-{item.discount}%
              </span>
            )}
            {item.limitedTime && (
              <span className="text-xs bg-orange-500/20 px-2 py-1 rounded-sm border border-orange-500/30 text-orange-400">
                ⏰Limited
              </span>
            )}
            <span className="text-xs bg-accent-pink/20 px-2 py-1 rounded-sm border border-accent-pink/30 text-accent-pink">
              #{item.rarity || 'Common'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

// Helper functions for dynamic styling - memoized
const getActiveIconClasses = (sectionKey: string) => {
  switch (sectionKey) {
    case 'owner': return 'bg-blue-400/20 shadow-md shadow-blue-400/20';
    case 'event': return 'bg-purple-400/20 shadow-md shadow-purple-400/20';
    case 'venus': return 'bg-emerald-400/20 shadow-md shadow-emerald-400/20';
    case 'vip': return 'bg-yellow-400/20 shadow-md shadow-yellow-400/20';
    default: return 'bg-gray-700/50';
  }
};

const getActiveTextColor = (sectionKey: string) => {
  switch (sectionKey) {
    case 'owner': return 'text-blue-400';
    case 'event': return 'text-purple-400';
    case 'venus': return 'text-emerald-400';
    case 'vip': return 'text-yellow-400';
    default: return 'text-white';
  }
};

const getActiveIndicatorColor = (sectionKey: string) => {
  switch (sectionKey) {
    case 'owner': return 'bg-blue-400 shadow-sm shadow-blue-400/50';
    case 'event': return 'bg-purple-400 shadow-sm shadow-purple-400/50';
    case 'venus': return 'bg-emerald-400 shadow-sm shadow-emerald-400/50';
    case 'vip': return 'bg-yellow-400 shadow-sm shadow-yellow-400/50';
    default: return 'bg-gray-400';
  }
};

export default function ShopPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [activeSection, setActiveSection] = useState<'owner' | 'event' | 'venus' | 'vip'>('owner');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Optimized filter state management
  const [filterValues, setFilterValues] = useState({
    search: '',
    type: '',
    rarity: '',
    currency: '',
    inStock: false,
    isNew: false,
    hasDiscount: false,
    featured: false,
    priceMin: '',
    priceMax: ''
  });

  // API state with better organization
  const [shopData, setShopData] = useState({
    items: [] as ShopItem[],
    loading: false,
    error: null as string | null,
    totalItems: 0,
    availableTypes: [] as string[]
  });

  const itemsPerPage = 8;

  // Optimized load function with better error handling
  const loadShopItems = useCallback(async () => {
    setShopData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortBy,
        sortOrder: sortDirection,
        ...(filterValues.search && { search: filterValues.search }),
        ...(filterValues.type && { category: filterValues.type }),
        ...(filterValues.rarity && { rarity: filterValues.rarity }),
      };

      const response = await shopItemsApi.getShopItems(params);
      
      // Transform items to shop item format with better type safety
      const transformedItems: ShopItem[] = (response.data || []).map((item: Record<string, unknown>) => {
        let shopType: ShopItemType = 'currency';
        const category = String(item.category || item.item_category || '');
        
        if (category === 'ACCESSORY') shopType = 'accessory';
        else if (category === 'CURRENCY') shopType = 'currency';
        else if (String(item.type) === 'decoration') shopType = 'decoration';
        else if (String(item.type) === 'booster') shopType = 'booster';

        let shopRarity: ShopItemRarity = 'common';
        const itemRarity = String(item.rarity || '').toLowerCase();
        if (itemRarity === 'rare' || itemRarity === 'r') shopRarity = 'rare';
        else if (itemRarity === 'epic' || itemRarity === 'sr') shopRarity = 'epic';
        else if (itemRarity === 'legendary' || itemRarity === 'ssr') shopRarity = 'legendary';

        return {
          id: String(item.id || item.unique_key || ''),
          name: String(item.name_en || item.name || ''),
          description: String(item.description_en || item.description || ''),
          type: shopType,
          category: category,
          section: activeSection,
          rarity: shopRarity,
          price: Number(item.price || 0),
          currency: (item.currency || 'coins') as Currency,
          image: String(item.image || '📦'),
          inStock: Boolean(item.in_stock !== false), // Default to true if not specified
          featured: Boolean(item.featured),
          isNew: Boolean(item.is_new),
          discount: Number(item.discount || 0) || undefined,
          limitedTime: Boolean(item.limited_time)
        };
      });

      setShopData(prev => ({
        ...prev,
        items: transformedItems,
        totalItems: response.pagination?.total || transformedItems.length,
        loading: false,
        error: null
      }));

      // Extract unique types for filter options
      const types = [...new Set(transformedItems.map(item => item.type))];
      setShopData(prev => ({ ...prev, availableTypes: types }));

    } catch (err) {
      console.error('Failed to load shop items:', err);
      setShopData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load shop items'
      }));
    }
  }, [currentPage, sortBy, sortDirection, filterValues.search, filterValues.type, filterValues.rarity, activeSection]);

  // Load shop items when dependencies change
  useEffect(() => {
    loadShopItems();
  }, [loadShopItems]);

  // Optimized filter change handler
  const handleFilterChange = useCallback((key: string, value: string | number | boolean) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  // Optimized sort change handler
  const handleSortChange = useCallback((newSortBy: string, newDirection: SortDirection) => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
    setCurrentPage(1); // Reset to first page when sorting
  }, []);

  // Optimized clear filters
  const clearFilters = useCallback(() => {
    setFilterValues({
      search: '',
      type: '',
      rarity: '',
      currency: '',
      inStock: false,
      isNew: false,
      hasDiscount: false,
      featured: false,
      priceMin: '',
      priceMax: ''
    });
    setCurrentPage(1);
  }, []);

  // Shop sections configuration
  const sections = useMemo(() => [
    { key: 'owner' as const, label: 'Owner Room', icon: '🏠' },
    { key: 'event' as const, label: 'Event Shop', icon: '🎪' },
    { key: 'venus' as const, label: 'Venus Shop', icon: '💎' },
    { key: 'vip' as const, label: 'VIP Shop', icon: '👑' }
  ], []);

  // Memoized filter configuration
  const filterFields: FilterField[] = useMemo(() => [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search shop items...',
      icon: <Search className="w-3 h-3 mr-1" />,
    },
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      placeholder: 'All Types',
      options: shopData.availableTypes.map(type => ({ 
        value: type, 
        label: type.charAt(0).toUpperCase() + type.slice(1) 
      })),
      icon: <Tag className="w-3 h-3 mr-1" />,
    },
    {
      key: 'rarity',
      label: 'Rarity',
      type: 'select',
      placeholder: 'All Rarities',
      options: [
        { value: 'common', label: 'Common' },
        { value: 'rare', label: 'Rare' },
        { value: 'epic', label: 'Epic' },
        { value: 'legendary', label: 'Legendary' }
      ],
    },
    {
      key: 'currency',
      label: 'Currency',
      type: 'select',
      placeholder: 'All Currencies',
      options: [
        { value: 'coins', label: 'Coins' },
        { value: 'gems', label: 'Gems' },
        { value: 'tickets', label: 'Tickets' }
      ],
      icon: <Coins className="w-3 h-3 mr-1" />,
    },
    {
      key: 'inStock',
      label: 'In Stock Only',
      type: 'checkbox',
    },
    {
      key: 'featured',
      label: 'Featured Only',
      type: 'checkbox',
    },
    {
      key: 'isNew',
      label: 'New Items Only',
      type: 'checkbox',
    },
    {
      key: 'hasDiscount',
      label: 'On Sale',
      type: 'checkbox',
    }
  ], [shopData.availableTypes]);

  // Memoized sort options
  const sortOptions: SortOption[] = useMemo(() => [
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Price' },
    { key: 'rarity', label: 'Rarity' },
    { key: 'type', label: 'Type' }
  ], []);

  // Memoized filtered items for better performance
  const filteredItems = useMemo(() => {
    return shopData.items.filter(item => {
      if (filterValues.featured && !item.featured) return false;
      if (filterValues.hasDiscount && !item.discount) return false;
      if (filterValues.inStock && !item.inStock) return false;
      if (filterValues.isNew && !item.isNew) return false;
      if (filterValues.currency && item.currency !== filterValues.currency) return false;
      return true;
    });
  }, [shopData.items, filterValues.featured, filterValues.hasDiscount, filterValues.inStock, filterValues.isNew, filterValues.currency]);

  // Memoized pagination calculations
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredItems.slice(startIndex, endIndex);
    
    return {
      totalPages,
      currentItems,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [filteredItems, currentPage, itemsPerPage]);

  // Page navigation handlers
  const handleNextPage = useCallback(() => {
    if (paginationData.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [paginationData.hasNextPage]);

  const handlePrevPage = useCallback(() => {
    if (paginationData.hasPrevPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [paginationData.hasPrevPage]);

  return (
    <PageLoadingState 
      isLoading={shopData.loading && shopData.items.length === 0} 
      message="Loading shop items..."
    >
      <div className="modern-page">
        <div className="modern-container-md">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="modern-page-header"
          >
            <h1 className="modern-page-title">Shop</h1>
            <p className="modern-page-subtitle">
              Showing {shopData.totalItems} items
            </p>
          </motion.div>

          {/* Search and Filter Controls */}
          <div className="mb-4">
            <UnifiedFilter
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              filterFields={filterFields}
              sortOptions={sortOptions}
              filterValues={filterValues}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
              resultCount={filteredItems.length}
              totalCount={shopData.totalItems}
              itemLabel="shop items"
              accentColor="accent-cyan"
              secondaryColor="accent-purple"
              headerIcon={<ShoppingCart className="w-4 h-4" />}
            />
          </div>

          {/* Shop Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex flex-wrap gap-2 justify-between md:justify-evenly">
              {sections.map((section) => (
                <motion.button
                  key={section.key}
                  onClick={() => setActiveSection(section.key)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`shop-section-card relative group px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 flex items-center gap-3 flex-1 min-w-[140px] max-w-[200px] ${
                    activeSection === section.key
                      ? `active-${section.key}`
                      : 'bg-dark-card/40 border-dark-border/30 hover:border-gray-600/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all duration-300 flex-shrink-0 ${
                      activeSection === section.key
                        ? getActiveIconClasses(section.key)
                        : 'bg-gray-700/50 group-hover:bg-gray-600/50'
                    }`}>
                      {section.icon}
                    </div>
                    
                    {/* Content */}
                    <div className="text-left flex-1 min-w-0">
                      <h3 className={`font-medium text-sm transition-colors duration-300 truncate ${
                        activeSection === section.key
                          ? getActiveTextColor(section.key)
                          : 'text-white group-hover:text-gray-200'
                      }`}>
                        {section.label}
                      </h3>
                    </div>
                    
                    {/* Active Indicator */}
                    {activeSection === section.key && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${getActiveIndicatorColor(section.key)}`}
                      />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Notice about shop functionality */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6"
          >
            <div className="flex items-center gap-3 text-blue-400">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-medium">
                Shop system is integrated with the items catalog. Items shown are from the unified items database.
              </span>
            </div>
          </motion.div>

          {/* Error State */}
          {shopData.error && !shopData.loading && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-3 text-red-400 mb-2">
                <ShoppingCart className="w-5 h-5" />
                <span className="font-medium">Failed to load shop items</span>
              </div>
              <p className="text-red-300 text-sm">{shopData.error}</p>
              <Button
                onClick={loadShopItems}
                className="mt-3 bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                size="sm"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Items Grid */}
          {!shopData.loading && !shopData.error && paginationData.currentItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
            >
              {paginationData.currentItems.map((item) => (
                <ShopItemCard key={item.id} item={item} />
              ))}
            </motion.div>
          )}

          {/* Empty State */}
          {!shopData.loading && !shopData.error && paginationData.currentItems.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">No items found</h3>
              <p className="text-gray-400">
                {filterValues.search || Object.values(filterValues).some(v => v) 
                  ? 'No items match your search criteria.' 
                  : 'No shop items available.'}
              </p>
            </div>
          )}

          {/* Loading State */}
          {shopData.loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-accent-cyan" />
              <span className="ml-3 text-gray-300">Loading shop items...</span>
            </div>
          )}

          {/* Pagination */}
          {paginationData.totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={!paginationData.hasPrevPage || shopData.loading}
                className="bg-dark-card/50 border-dark-border/30 text-gray-300 hover:border-accent-cyan/30 hover:text-accent-cyan"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <span className="px-4 py-2 text-sm text-gray-300">
                Page {currentPage} of {paginationData.totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!paginationData.hasNextPage || shopData.loading}
                className="bg-dark-card/50 border-dark-border/30 text-gray-300 hover:border-accent-cyan/30 hover:text-accent-cyan"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </PageLoadingState>
  );
}