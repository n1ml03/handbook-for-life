import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight,
  Search,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Music,
  Sparkles,
  Trophy} from 'lucide-react';
import { type Event, type SortDirection } from '@/types';
import { eventsApi } from '@/services/api';
import UnifiedFilter from '@/components/features/UnifiedFilter';
import type { FilterField, SortOption } from '@/components/features/UnifiedFilter';
import { PageLoadingState, MultiLanguageCard, type MultiLanguageNames } from '@/components/ui';
import { useDebounce } from '@/hooks';
import { safeExtractArrayData, safeExtractPaginationData } from '@/services/utils';

function FestivalCard({ festival }: { festival: any }) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventStatus = () => {
    const now = new Date();
    const start = festival.start_date ? new Date(festival.start_date) : null;
    const end = festival.end_date ? new Date(festival.end_date) : null;
    if (!start || !end) return 'unknown';
    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'active';
  };

  const status = getEventStatus();

  const names: MultiLanguageNames = {
    name_jp: festival.name_jp || '',
    name_en: festival.name_en || '',
    name_cn: festival.name_cn || '',
    name_tw: festival.name_tw || '',
    name_kr: festival.name_kr || ''
  };

  const header = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-lg flex items-center justify-center border border-yellow-400/20">
          <Sparkles className="w-6 h-6 text-yellow-400" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-yellow-400 font-medium">Festival Event</span>
          </div>
          {/* Status Badge */}
          <div
            className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${
              status === 'active' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : status === 'upcoming'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}
          >
            {status === 'active' ? (
              <CheckCircle className="w-3 h-3" />
            ) : status === 'upcoming' ? (
              <Clock className="w-3 h-3" />
            ) : (
              <AlertCircle className="w-3 h-3" />
            )}
            {status.toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );

  const festivalDetails = (
    <div className="space-y-3">
      {/* Event Dates */}
      <div className="space-y-2">
        <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-3 h-3 text-green-400" />
            <span className="text-xs font-medium text-green-400">Start</span>
          </div>
          <span className="text-xs font-bold text-white">{formatDate(festival.start_date)}</span>
        </div>
        
        <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-3 h-3 text-red-400" />
            <span className="text-xs font-medium text-red-400">End</span>
          </div>
          <span className="text-xs font-bold text-white">{formatDate(festival.end_date)}</span>
        </div>
      </div>

      {/* Event Information */}
      <div className="bg-gradient-to-r from-yellow-400/10 to-orange-500/10 rounded-lg p-3 border border-yellow-400/20">
        <div className="flex items-center gap-2 mb-2">
          <Music className="w-3 h-3 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-400">Festival Details</span>
        </div>
        <div className="text-xs text-gray-300">
          <p>Join this exciting festival event and compete with other players!</p>
          <p className="mt-1">Earn exclusive rewards and climb the rankings.</p>
        </div>
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
      {festivalDetails}
    </MultiLanguageCard>
  );
}

export default function FestivalPage() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('startDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterValues, setFilterValues] = useState({
    search: '',
    status: '',
    dateRange: '',
    version: ''
  });

  const itemsPerPage = 8;
  
  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(filterValues.search, 500);

  // Optimized fetch function with useCallback
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      
      let response;
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: sortBy === 'startDate' ? 'start_date' : sortBy === 'endDate' ? 'end_date' : 'name_en',
        sortOrder: sortDirection,
        ...(filterValues.status && { status: filterValues.status }),
        ...(filterValues.version && { version: filterValues.version }),
      };

      if (debouncedSearch) {
        // Use search endpoint when there's a search query
        response = await eventsApi.searchEvents(debouncedSearch, params);
      } else {
        // Use regular endpoint with filters
        response = await eventsApi.getEvents(params);
      }
      
      // Safely extract data and pagination
      const responseData = safeExtractArrayData<Event>(response, 'events API');
      const paginationData = safeExtractPaginationData(response, responseData.length);
      
      // Use events directly since Event type doesn't have additional display properties
      setAllEvents(responseData);
      setTotalPages(paginationData.totalPages);
      setTotalItems(paginationData.total);
    } catch (err) {
      console.error('Failed to fetch events:', err);
      setAllEvents([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, filterValues.status, filterValues.version, sortBy, sortDirection]);

  // Fetch events when dependencies change
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearch, filterValues.status, filterValues.version]);

  // Filter fields configuration
  const filterFields: FilterField[] = [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search festivals in all languages...',
      icon: <Search className="w-3 h-3 mr-1" />,
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      placeholder: 'All Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'upcoming', label: 'Upcoming' },
        { value: 'ended', label: 'Ended' }
      ],
      icon: <Clock className="w-3 h-3 mr-1" />,
    },
    {
      key: 'version',
      label: 'Version',
      type: 'select',
      placeholder: 'All Versions',
      options: [
        { value: '1.0', label: '1.0' },
        { value: '1.5', label: '1.5' },
        { value: '2.0', label: '2.0' },
        { value: '2.5', label: '2.5' },
        { value: '3.0', label: '3.0' }
      ],
      icon: <Sparkles className="w-3 h-3 mr-1" />,
    }
  ];

  // Sort options
  const sortOptions: SortOption[] = [
    { key: 'name', label: 'Name' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'isActive', label: 'Status' }
  ];

  // Since we're now using server-side filtering and pagination, allEvents is already filtered and paginated
  const paginatedFestivals = allEvents;

  // Optimized event handlers with useCallback
  const handleFilterChange = useCallback((key: string, value: string | number | boolean) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSortChange = useCallback((newSortBy: string, newDirection: SortDirection) => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
  }, []);

  const clearFilters = useCallback(() => {
    setFilterValues({
      search: '',
      status: '',
      dateRange: '',
      version: ''
    });
  }, []);

  return (
    <PageLoadingState 
      isLoading={loading} 
      message="Loading festivals..."
    >
    <div className="modern-page">
      <div className="modern-container-lg">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="modern-page-header"
        >
          <h1 className="modern-page-title">
            Festival Gallery
          </h1>
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
          itemLabel="festivals"
          accentColor="yellow"
          secondaryColor="orange"
          headerIcon={<Music className="w-4 h-4" />}
        />

        {/* Festival Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="grid-responsive-cards mb-8">
            {paginatedFestivals.map((festival, index) => (
              <motion.div
                key={festival.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <FestivalCard festival={festival as any} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-2 mt-8"
          >
            <motion.button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-dark-card/70 border border-dark-border/50 text-gray-400 hover:text-white hover:bg-yellow-400/20 disabled:opacity-50 disabled:hover:bg-dark-card/70 disabled:hover:text-gray-400 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
            
            <div className="flex space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                return (
                  <motion.button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg'
                        : 'bg-dark-card/70 border border-dark-border/50 text-gray-400 hover:text-white hover:bg-yellow-400/20'
                    }`}
                  >
                    {page}
                  </motion.button>
                );
              })}
            </div>
            
            <motion.button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-dark-card/70 border border-dark-border/50 text-gray-400 hover:text-white hover:bg-yellow-400/20 disabled:opacity-50 disabled:hover:bg-dark-card/70 disabled:hover:text-gray-400 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {/* Empty State */}
        {allEvents.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <motion.div
              className="w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-yellow-400/20"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Music className="w-12 h-12 text-yellow-400/60" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-300 mb-3">No festivals found</h3>
            <p className="text-muted-foreground mb-6">
              {debouncedSearch ?
                'Try adjusting your search terms or clear the search to see all festivals.' :
                'Try adjusting your filters or clear them to see all festivals.'
              }
            </p>
            <motion.button
              onClick={clearFilters}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-400/90 hover:to-orange-500/90 text-black px-8 py-3 rounded-xl font-medium transition-all shadow-lg"
            >
              Clear All Filters
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
    </PageLoadingState>
  );
} 