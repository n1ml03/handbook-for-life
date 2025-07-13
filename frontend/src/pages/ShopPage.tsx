import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight,
  ShoppingCart,
  Coins,
  Calendar,
  Clock,
  Tag,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLoadingState, MultiLanguageCard, type MultiLanguageNames } from '@/components/ui';
import UnifiedFilter from '@/components/features/UnifiedFilter';
import type { FilterField, SortOption, SortDirection } from '@/components/features/UnifiedFilter';
import { type ShopListing } from '@/types';
import { shopApi } from '@/services/api';
import { safeExtractArrayData, safeExtractPaginationData } from '@/services/utils';
import { useDebounce } from '@/hooks/useDebounce';
import React from 'react';

// Shop Listing Card Component
interface ShopListingCardProps {
  listing: ShopListing;
  onClick?: () => void;
}

const ShopListingCard = React.memo(function ShopListingCard({ listing }: ShopListingCardProps) {
  const costItemName = listing.cost_currency_item?.name_en || listing.cost_currency_item?.name_jp || 'Unknown Currency';

  const names: MultiLanguageNames = {
    name_jp: listing.item?.name_jp || '',
    name_en: listing.item?.name_en || '',
    name_cn: listing.item?.name_cn || '',
    name_tw: listing.item?.name_tw || '',
    name_kr: listing.item?.name_kr || ''
  };

  const header = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-lg flex items-center justify-center border border-accent-cyan/20">
          <span className="text-xl">🛍️</span>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            {listing.item?.rarity && (
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-accent-pink/20 border border-accent-pink/30">
                <Star className="w-3 h-3 text-accent-pink" />
                <span className="text-xs font-bold text-accent-pink">{listing.item.rarity}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Tag className="w-3 h-3 text-accent-cyan" />
            <span className="text-xs text-accent-cyan font-medium">{listing.shop_type}</span>
          </div>
        </div>
      </div>
    </div>
  );


  const itemDetails = (
    <div className="space-y-3">
      {/* Item Description */}
      {listing.item?.description_en && (
        <div className="p-3 bg-dark-primary/30 rounded-lg border border-white/10">
          <p className="text-sm text-gray-300 leading-relaxed">
            {listing.item.description_en}
          </p>
        </div>
      )}

      {/* Cost Display */}
      <div className="bg-gradient-to-r from-accent-gold/10 to-accent-gold/20 rounded-lg p-3 border border-accent-gold/20">
        <div className="flex items-center gap-2 mb-2">
          <Coins className="w-4 h-4 text-accent-gold" />
          <span className="text-xs font-medium text-accent-gold">Cost</span>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-accent-gold">
            {listing.cost_amount}
          </div>
          <div className="text-xs text-gray-400">
            {costItemName}
          </div>
        </div>
      </div>

      {/* Item Category */}
      {listing.item?.item_category && (
        <div className="flex items-center gap-2 p-2 bg-dark-primary/20 rounded-lg border border-white/10">
          <Tag className="w-3 h-3 text-accent-purple" />
          <span className="text-xs font-medium text-gray-400">Category:</span>
          <span className="text-xs font-bold text-white">{listing.item.item_category}</span>
        </div>
      )}

      {/* Availability */}
      <div className="space-y-2">
        {listing.start_date && (
          <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Calendar className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-blue-400">Available from:</span>
            <span className="text-xs font-bold text-white">
              {new Date(listing.start_date).toLocaleDateString()}
            </span>
          </div>
        )}
        {listing.end_date && (
          <div className="flex items-center gap-2 p-2 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <Clock className="w-3 h-3 text-orange-400" />
            <span className="text-xs text-orange-400">Until:</span>
            <span className="text-xs font-bold text-white">
              {new Date(listing.end_date).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>
    </div>
  );


  return (
    <MultiLanguageCard
      names={names}
      primaryLanguage="en"
      languageVariant="compact"
      header={header}
    >
      {itemDetails}
    </MultiLanguageCard>
  );
});

ShopListingCard.displayName = 'ShopListingCard';

export default function ShopPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Filter state management with improved type safety
  const [filterValues, setFilterValues] = useState<{
    search: string;
    shop_type: string;
    rarity: string;
    item_category: string;
    available_only: boolean;
  }>({
    search: '',
    shop_type: '',
    rarity: '',
    item_category: '',
    available_only: false,
  });

  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(filterValues.search, 500);

  // API state
  const [shopData, setShopData] = useState({
    listings: [] as ShopListing[],
    loading: false,
    error: null as string | null,
    totalListings: 0,
  });

  // Fetch shop listings
  const fetchShopListings = useCallback(async () => {
    try {
      setShopData(prev => ({ ...prev, loading: true, error: null }));
      
      // Build query parameters
      const params: Record<string, any> = {
        page: currentPage,
        limit: 24
      };
      
      // Only add sortBy if it's a valid field (not 'name' which doesn't exist)
      if (sortBy && sortBy !== 'name') {
        params.sortBy = sortBy;
        params.sortOrder = sortDirection; // Backend expects sortOrder, not sortDirection
      }

      // Add filters
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterValues.shop_type) params.shop_type = filterValues.shop_type;
      if (filterValues.rarity) params.rarity = filterValues.rarity;
      if (filterValues.item_category) params.item_category = filterValues.item_category;
      if (filterValues.available_only) params.available_only = filterValues.available_only;

      const response = await shopApi.getShopListings(params);
      
      // Safely extract data and pagination
      const responseData = safeExtractArrayData<ShopListing>(response, 'shop listings API');
      const paginationData = safeExtractPaginationData(response, responseData.length);
      
      setShopData({
        listings: responseData,
        loading: false,
        error: null,
        totalListings: paginationData.total
      });

    } catch (err) {
      console.error('Failed to fetch shop listings:', err);
      setShopData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch shop listings. Please try again.'
      }));
    }
  }, [currentPage, sortBy, sortDirection, debouncedSearch, filterValues.shop_type, filterValues.rarity, filterValues.item_category, filterValues.available_only]);

  useEffect(() => {
    fetchShopListings();
  }, [fetchShopListings]);

  // Filter configuration
  const filterFields: FilterField[] = useMemo(() => [
    {
      key: 'search',
      label: 'Search Shop Items',
      type: 'text',
      placeholder: 'Search by item name...',
      gridCols: 2
    },
    {
      key: 'shop_type',
      label: 'Shop Type',
      type: 'select',
      options: [
        { value: '', label: 'All Shop Types' },
        { value: 'event', label: 'Event Shop' },
        { value: 'general', label: 'General Shop' },
        { value: 'vip', label: 'VIP Shop' },
        { value: 'special', label: 'Special Shop' }
      ]
    },
    {
      key: 'item_category',
      label: 'Item Category',
      type: 'select',
      options: [
        { value: '', label: 'All Categories' },
        { value: 'ACCESSORY', label: 'Accessories' },
        { value: 'CURRENCY', label: 'Currency' },
        { value: 'CONSUMABLE', label: 'Consumables' },
        { value: 'DECORATION', label: 'Decorations' }
      ]
    },
    {
      key: 'rarity',
      label: 'Rarity',
      type: 'select',
      options: [
        { value: '', label: 'All Rarities' },
        { value: 'R', label: 'R (Common)' },
        { value: 'SR', label: 'SR (Rare)' },
        { value: 'SSR', label: 'SSR (Super Rare)' }
      ]
    },
    {
      key: 'available_only',
      label: 'Available Only',
      type: 'checkbox'
    }
  ], []);

  const sortOptions: SortOption[] = useMemo(() => [
    { key: 'id', label: 'ID' },
    { key: 'cost_amount', label: 'Cost' },
    { key: 'start_date', label: 'Start Date' },
    { key: 'end_date', label: 'End Date' }
  ], []);

  // Pagination
  const itemsPerPage = 24;
  const totalPages = Math.ceil(shopData.totalListings / itemsPerPage);

  // Optimized event handlers with useCallback
  const handleFilterChange = useCallback((key: string, value: string | number | boolean) => {
    if (key === 'available_only') {
      setFilterValues(prev => ({ ...prev, [key]: Boolean(value) }));
    } else {
      setFilterValues(prev => ({ ...prev, [key]: String(value) }));
    }
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((newSortBy: string, newSortDirection: SortDirection) => {
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);
    setCurrentPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilterValues({
      search: '',
      shop_type: '',
      rarity: '',
      item_category: '',
      available_only: false,
    });
    setCurrentPage(1);
  }, []);

  return (
    <PageLoadingState isLoading={shopData.loading} message="Loading shop listings...">
      <div className="modern-page">
        <div className="modern-container-xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="modern-page-header"
          >
            <h1 className="modern-page-title">
              Shop Collection
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >

            {/* Filters */}
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
              resultCount={shopData.listings.length}
              totalCount={shopData.totalListings}
              itemLabel="shop listings"
              searchAriaLabel="Search shop items"
            />
          </motion.div>

          {/* Shop Listings Display */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid-container-full-width">
              <div className="grid-responsive-cards mb-8">
                {shopData.listings.map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.15,
                      delay: Math.min(index * 0.02, 0.1) // Limit max delay to 0.1s
                    }}
                  >
                    <ShopListingCard listing={listing} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-2 mb-8"
              >
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className={currentPage === pageNum 
                          ? "bg-gradient-to-r from-accent-cyan to-accent-purple text-white" 
                          : "border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10"
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                  className="border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* Empty State */}
            {shopData.listings.length === 0 && !shopData.loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-accent-cyan/20">
                  <ShoppingCart className="w-12 h-12 text-accent-cyan/60" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">No shop listings found</h3>
                <p className="text-muted-foreground mb-6">
                  {debouncedSearch ?
                    'Try adjusting your search terms or clear the search to see all shop listings.' :
                    'Try adjusting your filters or clear them to see all shop listings.'
                  }
                </p>
                <Button 
                  onClick={() => {
                    setFilterValues({
                      search: '',
                      shop_type: '',
                      rarity: '',
                      item_category: '',
                      available_only: false,
                    });
                    setCurrentPage(1);
                  }}
                  className="bg-gradient-to-r from-accent-pink to-accent-purple hover:from-accent-pink/90 hover:to-accent-purple/90 text-white"
                >
                  Reset Filters
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </PageLoadingState>
  );
} 