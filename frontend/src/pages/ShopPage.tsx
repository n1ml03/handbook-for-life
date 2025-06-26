import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight,
  ShoppingCart,
  Coins
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageLoadingState } from '@/components/ui';
import UnifiedFilter from '@/components/features/UnifiedFilter';
import type { FilterField, SortOption, SortDirection } from '@/components/features/UnifiedFilter';
import { type ShopListing } from '@/types';
import { shopListingsApi } from '@/services/api';
import React from 'react';

// Shop Listing Card Component
interface ShopListingCardProps {
  listing: ShopListing;
  onClick?: () => void;
}

const ShopListingCard = React.memo(function ShopListingCard({ listing }: ShopListingCardProps) {
  const itemName = listing.item?.name_en || listing.item?.name_jp || 'Unknown Item';
  const costItemName = listing.cost_currency_item?.name_en || listing.cost_currency_item?.name_jp || 'Unknown Currency';

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
              <h3 className="font-bold text-white text-lg truncate">{itemName}</h3>
            </div>
            <div className="text-xs text-gray-400">
              Shop Type: {listing.shop_type}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-xl flex items-center justify-center border border-accent-cyan/20">
              <span className="text-2xl">🛍️</span>
            </div>
          </div>
        </div>

        {/* Item Details */}
        <div className="mb-4">
          <p className="text-sm text-gray-300 leading-relaxed">
            {listing.item?.description_en || 'Shop listing item'}
          </p>
          {listing.item?.item_category && (
            <p className="text-xs text-gray-400 mt-1">Category: {listing.item.item_category}</p>
          )}
        </div>

        {/* Cost */}
        <div className="mb-4">
          <div className="bg-gradient-to-r from-accent-cyan/10 to-accent-purple/10 rounded-xl p-3 border border-accent-cyan/20">
            <p className="text-xs font-bold text-accent-cyan mb-2">Cost</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-accent-gold">
                  <Coins className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-accent-gold">
                    {listing.cost_amount}
                  </span>
                  <span className="text-sm text-gray-400">
                    {costItemName}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {listing.start_date && (
              <span className="text-xs bg-blue-500/20 px-2 py-1 rounded-sm border border-blue-500/30 text-blue-400">
                📅 Available from {new Date(listing.start_date).toLocaleDateString()}
              </span>
            )}
            {listing.end_date && (
              <span className="text-xs bg-orange-500/20 px-2 py-1 rounded-sm border border-orange-500/30 text-orange-400">
                ⏰ Until {new Date(listing.end_date).toLocaleDateString()}
              </span>
            )}
            {listing.item?.rarity && (
              <span className="text-xs bg-accent-pink/20 px-2 py-1 rounded-sm border border-accent-pink/30 text-accent-pink">
                ★ {listing.item.rarity}
              </span>
            )}
          </div>
        </div>

        {/* Shop ID */}
        <div className="pt-3 border-t border-dark-border/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-mono bg-dark-primary/30 px-2 py-1 rounded-sm">
              #{listing.id}
            </span>
            <span className="text-xs text-gray-400">
              {listing.shop_type}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

ShopListingCard.displayName = 'ShopListingCard';

export default function ShopPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Filter state management
  const [filterValues, setFilterValues] = useState({
    search: '',
    shop_type: '',
    rarity: '',
    item_category: '',
    available_only: false,
  });

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
        limit: 24,
        sortBy: sortBy,
        sortDirection: sortDirection,
      };

      // Add filters
      if (filterValues.search) params.search = filterValues.search;
      if (filterValues.shop_type) params.shop_type = filterValues.shop_type;
      if (filterValues.rarity) params.rarity = filterValues.rarity;
      if (filterValues.item_category) params.item_category = filterValues.item_category;
      if (filterValues.available_only) params.available_only = filterValues.available_only;

      const response = await shopListingsApi.getShopListings(params);
      
      setShopData({
        listings: response.data || [],
        loading: false,
        error: null,
        totalListings: response.pagination?.total || 0
      });

    } catch (err) {
      console.error('Failed to fetch shop listings:', err);
      setShopData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch shop listings. Please try again.'
      }));
    }
  }, [currentPage, sortBy, sortDirection, filterValues]);

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
    { key: 'name', label: 'Item Name' },
    { key: 'cost_amount', label: 'Cost' },
    { key: 'start_date', label: 'Start Date' },
    { key: 'end_date', label: 'End Date' }
  ], []);

  // Pagination
  const itemsPerPage = 24;
  const totalPages = Math.ceil(shopData.totalListings / itemsPerPage);

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
            <p className="modern-page-subtitle">
              Browse and discover all available shop items • {shopData.listings.length} of {shopData.totalListings} listings
            </p>
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
              onFilterChange={(key, value) => {
                setFilterValues(prev => ({ ...prev, [key]: value }));
                setCurrentPage(1);
              }}
              onClearFilters={() => {
                setFilterValues({
                  search: '',
                  shop_type: '',
                  rarity: '',
                  item_category: '',
                  available_only: false,
                });
                setCurrentPage(1);
              }}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSortChange={(sortBy, sortDirection) => {
                setSortBy(sortBy);
                setSortDirection(sortDirection);
                setCurrentPage(1);
              }}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {shopData.listings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ShopListingCard listing={listing} />
                </motion.div>
              ))}
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
                  Try adjusting your search criteria or reset filters to see all listings.
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