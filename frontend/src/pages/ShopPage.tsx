import { useState, useEffect, useCallback } from 'react';
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
import UnifiedFilter from '@/components/features/UnifiedFilter';
import type { FilterField, SortOption, SortDirection } from '@/components/features/UnifiedFilter';
import { type ShopItem, type ShopItemCardProps, type ShopItemType, type Currency, type ShopItemRarity } from '@/types';
import { shopItemsApi } from '@/services/api';

function ShopItemCard({ item }: ShopItemCardProps) {
  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'coins': return <Coins className="w-4 h-4" />;
      case 'gems': return <Gem className="w-4 h-4" />;
      case 'tickets': return <Tag className="w-4 h-4" />;
      default: return <Coins className="w-4 h-4" />;
    }
  };

  const getCurrencyColor = (currency: string) => {
    switch (currency) {
      case 'coins': return 'text-yellow-400';
      case 'gems': return 'text-purple-400';
      case 'tickets': return 'text-green-400';
      default: return 'text-yellow-400';
    }
  };

  const finalPrice = item.discount ? Math.floor(item.price * (1 - item.discount / 100)) : item.price;

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
            {item.description || item.description || 'No description available'}
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
}

export default function ShopPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [activeSection, setActiveSection] = useState<'owner' | 'event' | 'venus' | 'vip'>('owner');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
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

  // API state
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);

  const itemsPerPage = 8;

  // Load shop items from API
  const loadShopItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    
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
      
      // Transform items to shop item format - response is already { data: unknown[], pagination: unknown }
      const transformedItems = (response.data || []).map((item: Record<string, unknown>) => {
        // Map item category to shop item type
        let shopType: ShopItemType = 'currency';
        if (item.category === 'ACCESSORY' || item.item_category === 'ACCESSORY') {
          shopType = 'accessory';
        } else if (item.category === 'CURRENCY' || item.item_category === 'CURRENCY') {
          shopType = 'currency';
        } else if (item.category === 'DECORATION' || item.type === 'decoration') {
          shopType = 'decoration';
        } else if (item.category === 'BOOSTER' || item.type === 'booster') {
          shopType = 'booster';
        }

        // Map rarity to shop item rarity
        let shopRarity: ShopItemRarity = 'common';
        const itemRarity = String(item.rarity || '').toLowerCase();
        if (itemRarity === 'rare' || itemRarity === 'r') {
          shopRarity = 'rare';
        } else if (itemRarity === 'epic' || itemRarity === 'sr') {
          shopRarity = 'epic';
        } else if (itemRarity === 'legendary' || itemRarity === 'ssr') {
          shopRarity = 'legendary';
        }

        return {
          id: String(item.id || item.unique_key || ''),
          name: String(item.name_en || item.name || ''),
          description: String(item.description_en || item.description || ''),
          type: shopType,
          category: String(item.category || item.item_category || 'general'),
          section: activeSection,
          rarity: shopRarity,
          price: Number(item.price || 0),
          currency: (item.currency || 'coins') as Currency,
          image: String(item.image || '📦'),
          inStock: item.in_stock !== false,
          isNew: Boolean(item.is_new),
          featured: Boolean(item.featured),
          discount: Number(item.discount || 0),
          limitedTime: Boolean(item.limited_time)
        };
      });
      
      // Apply client-side filtering for checkbox filters
      let filteredItems = transformedItems;
      
      if (filterValues.inStock) {
        filteredItems = filteredItems.filter((item) => item.inStock);
      }
      if (filterValues.featured) {
        filteredItems = filteredItems.filter((item) => item.featured);
      }
      if (filterValues.isNew) {
        filteredItems = filteredItems.filter((item) => item.isNew);
      }
      if (filterValues.hasDiscount) {
        filteredItems = filteredItems.filter((item) => item.discount > 0);
      }
      if (filterValues.currency) {
        filteredItems = filteredItems.filter((item) => item.currency === filterValues.currency);
      }

      setShopItems(filteredItems);
      setTotalItems(response.pagination?.total || filteredItems.length);

      // Extract available types for filter options
      if (!availableTypes.length) {
        const types = [...new Set(transformedItems.map((item) => item.type))].filter(Boolean) as string[];
        setAvailableTypes(types);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load shop items';
      setError(errorMessage);
      console.error('Failed to load shop items:', err);
      
      // If it's a network error, show a more helpful message
      if (errorMessage?.includes('Network error') || (err as Record<string, unknown>)?.status === 0) {
        setError('Unable to connect to the shop service. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortBy, sortDirection, filterValues.search, filterValues.type, filterValues.rarity, filterValues.inStock, filterValues.featured, filterValues.isNew, filterValues.hasDiscount, filterValues.currency, availableTypes.length]);

  // Load items on component mount and when filters change
  useEffect(() => {
    loadShopItems();
  }, [loadShopItems]);

  const totalPages = Math.ceil((totalItems || 0) / itemsPerPage);

  // Filter fields configuration
  const filterFields: FilterField[] = [
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
      options: availableTypes.map(type => ({ 
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
      icon: <Gem className="w-3 h-3 mr-1" />,
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
      label: 'On Sale Only',
      type: 'checkbox',
    }
  ];

  // Sort options
  const sortOptions: SortOption[] = [
    { key: 'name', label: 'Name' },
    { key: 'price', label: 'Price' },
    { key: 'rarity', label: 'Rarity' },
    { key: 'type', label: 'Type' }
  ];

  const handleFilterChange = (key: string, value: string | number | boolean) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleSortChange = (newSortBy: string, newDirection: SortDirection) => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  const clearFilters = () => {
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
  };

  const sections = [
    { key: 'owner' as const, label: 'Owner Room', icon: '🏠' },
    { key: 'event' as const, label: 'Event Shop', icon: '🎪' },
    { key: 'venus' as const, label: 'Venus Shop', icon: '💎' },
    { key: 'vip' as const, label: 'VIP Shop', icon: '👑' }
  ];

  return (
    <div className="modern-page">
      <div className="modern-container-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="modern-page-header"
        >
          <h1 className="modern-page-title">
            Shop
          </h1>
          <p className="modern-page-subtitle">
            Showing {totalItems} items
          </p>
        </motion.div>

        {/* Search and Filter Controls */}
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
          resultCount={totalItems}
          itemLabel="shop items"
          accentColor="accent-cyan"
          secondaryColor="accent-purple"
          headerIcon={<ShoppingCart className="w-4 h-4" />}
        />

        {/* Shop Sections */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {sections.map((section) => (
            <button
              key={section.key}
              onClick={() => setActiveSection(section.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                activeSection === section.key
                  ? 'bg-accent-cyan/20 border-accent-cyan/50 text-accent-cyan'
                  : 'bg-dark-card/50 border-dark-border/30 text-gray-400 hover:border-accent-cyan/30 hover:text-accent-cyan'
              }`}
            >
              <span className="mr-2">{section.icon}</span>
              {section.label}
            </button>
          ))}
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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent-cyan" />
            <span className="ml-3 text-gray-300">Loading shop items...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 text-red-400 mb-2">
              <ShoppingCart className="w-5 h-5" />
              <span className="font-medium">Failed to load shop items</span>
            </div>
            <p className="text-red-300 text-sm">{error}</p>
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
        {!loading && !error && shopItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
          >
            {shopItems.map((item) => (
              <ShopItemCard key={item.id} item={item} />
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && shopItems.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">No items found</h3>
            <p className="text-gray-400">Try adjusting your filters or check back later</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="bg-dark-card/50 border-dark-border/30 text-gray-300 hover:border-accent-cyan/30 hover:text-accent-cyan"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <span className="px-4 py-2 text-sm text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="bg-dark-card/50 border-dark-border/30 text-gray-300 hover:border-accent-cyan/30 hover:text-accent-cyan"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}