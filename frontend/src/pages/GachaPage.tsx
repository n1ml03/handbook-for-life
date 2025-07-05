import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight,
  Search,
  Calendar,
  Clock,
  Gift,
  CheckCircle,
  AlertCircle,
  Diamond,
  Zap,

  Star
} from 'lucide-react';
import { type Gacha, type SortDirection } from '@/types';
import { gachasApi } from '@/services/api';
import UnifiedFilter from '@/components/features/UnifiedFilter';
import type { FilterField, SortOption } from '@/components/features/UnifiedFilter';
import { PageLoadingState, MultiLanguageCard, type MultiLanguageNames } from '@/components/ui';
import { useDebounce } from '@/hooks/useDebounce';

// Define reward interface for gacha rewards
interface GachaReward {
  icon?: string;
  name: string;
}

// Extend Gacha interface for display properties
interface GachaEvent extends Gacha {
  bannerImage?: string;
  description?: string;
  rewards?: GachaReward[];
}

function GachaCard({ gacha }: { gacha: GachaEvent }) {
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
    const start = gacha.start_date ? new Date(gacha.start_date) : null;
    const end = gacha.end_date ? new Date(gacha.end_date) : null;
    if (!start || !end) return 'upcoming';
    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'active';
  };

  const status = getEventStatus();

  const names: MultiLanguageNames = {
    name_jp: gacha.name_jp || '',
    name_en: gacha.name_en || '',
    name_cn: gacha.name_cn || '',
    name_tw: gacha.name_tw || '',
    name_kr: gacha.name_kr || ''
  };

  const header = (
    <div className="relative">
      {/* Banner Section */}
      <div className="relative h-32 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-indigo-500/20 rounded-lg overflow-hidden mb-3">
        {gacha.bannerImage && gacha.bannerImage !== '⭐' && gacha.bannerImage !== '🌙' && gacha.bannerImage !== '💎' ? (
          <img 
            src={gacha.bannerImage} 
            alt={gacha.name_en}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/30 to-pink-500/30">
            <div className="text-4xl">{gacha.bannerImage ?? '💎'}</div>
            <Diamond className="w-12 h-12 text-purple-300/50 absolute" />
          </div>
        )}
        
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        
        {/* Status Badge */}
        <div className="absolute top-2 left-2">
          <div
            className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 backdrop-blur-sm ${
              status === 'active' 
                ? 'bg-green-500/80 text-white border border-green-400/50' 
                : status === 'upcoming'
                ? 'bg-blue-500/80 text-white border border-blue-400/50'
                : 'bg-gray-500/80 text-white border border-gray-400/50'
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

        {/* Gacha Type Badge */}
        <div className="absolute top-2 right-2">
          <div className="px-2 py-1 rounded bg-purple-500/80 border border-purple-400/50 backdrop-blur-sm">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-white" />
              <span className="text-xs font-bold text-white">{gacha.gacha_subtype}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );


  const gachaDetails = (
    <div className="space-y-3">
      {/* Description */}
      {/* {gacha.description && (
        <div className="p-3 bg-dark-primary/30 rounded-lg border border-white/10">
          <p className="text-sm text-gray-300 leading-relaxed">
            {gacha.description}
          </p>
        </div>
      )} */}

            {/* Dates Display */}
      <div className="space-y-2">
        <div className="p-2 bg-green-500/10 rounded-lg border border-green-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-3 h-3 text-green-400" />
            <span className="text-xs font-medium text-green-400">Start</span>
          </div>
          <span className="text-xs font-bold text-white">{formatDate(gacha.start_date)}</span>
        </div>
        
        <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-3 h-3 text-red-400" />
            <span className="text-xs font-medium text-red-400">End</span>
          </div>
          <span className="text-xs font-bold text-white">{formatDate(gacha.end_date)}</span>
        </div>
      </div>

      {/* Pull Information */}
      <div className="bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-lg p-3 border border-purple-400/20">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-3 h-3 text-purple-400" />
          <span className="text-xs font-medium text-purple-400">Gacha Info</span>
        </div>
        <div className="space-y-1 text-xs">
          <div className="text-gray-300">
            <span className="font-medium">Rate:</span> Enhanced SSR
          </div>
          <div className="text-gray-300">
            <span className="font-medium">Guarantee:</span> 10x Pull
          </div>
        </div>
      </div>

      {/* Featured Items */}
      {gacha.rewards && gacha.rewards.length > 0 && (
        <div className="bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-lg p-3 border border-purple-400/20">
          <div className="flex items-center gap-2 mb-2">
            <Gift className="w-3 h-3 text-purple-400" />
            <span className="text-xs font-bold text-purple-400">
              Featured Items ({gacha.rewards.length})
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {gacha.rewards.slice(0, 3).map((reward: GachaReward, index: number) => (
              <span 
                key={index}
                className="text-xs bg-dark-primary/50 px-2 py-1 rounded border border-dark-border/30 text-gray-300"
              >
                {reward.icon || '💎'} {reward.name}
              </span>
            ))}
            {gacha.rewards.length > 3 && (
              <span className="text-xs text-gray-400 px-2 py-1">
                +{gacha.rewards.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <MultiLanguageCard
      names={names}
      primaryLanguage="en"
      languageVariant="expanded"
      header={header}
    >
      {gachaDetails}
    </MultiLanguageCard>
  );
}

export default function GachaPage() {
  const [events, setEvents] = useState<GachaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>('startDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterValues, setFilterValues] = useState({
    search: '',
    status: '',
    dateRange: '',
    version: ''
  });

  const debouncedSearch = useDebounce(filterValues.search, 500);

  useEffect(() => {
    const fetchGachas = async () => {
      try {
        setLoading(true);
        const response = await gachasApi.getGachas({ limit: 100, page: 1 });
        // Convert Gacha[] to GachaEvent[] by adding display properties
        const responseData = response?.data || [];
        if (!Array.isArray(responseData)) {
          console.warn('Expected array from gachas API, received:', responseData);
          setEvents([]);
          return;
        }
        const gachaEvents: GachaEvent[] = responseData.map(gacha => ({
          ...gacha,
          bannerImage: '💎', // Default banner image
          description: `${gacha.name_en || gacha.name_jp} - ${gacha.gacha_subtype} gacha`, // Default description
          rewards: [] // Default empty rewards - can be populated from pools later
        }));
        setEvents(gachaEvents);
      } catch (err) {
        console.error('Failed to fetch gachas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGachas();
  }, []);

  const itemsPerPage = 8;

  // Filter fields configuration
  const filterFields: FilterField[] = [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search gacha events in all languages...',
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
      icon: <Diamond className="w-3 h-3 mr-1" />,
    }
  ];

  // Sort options
  const sortOptions: SortOption[] = [
    { key: 'name', label: 'Name' },
    { key: 'startDate', label: 'Start Date' },
    { key: 'endDate', label: 'End Date' },
    { key: 'isActive', label: 'Status' }
  ];

  const filteredAndSortedGachas = useMemo(() => {
    const filtered = events.filter(event => {
      if (filterValues.search) {
        const searchTerm = filterValues.search.toLowerCase();
        const matchesName = [
          event.name_jp,
          event.name_en, 
          event.name_cn,
          event.name_tw,
          event.name_kr
        ].some(name => name && name.toLowerCase().includes(searchTerm));
        
        const matchesDescription = (event.description ?? '').toLowerCase().includes(searchTerm);
        
        if (!matchesName && !matchesDescription) return false;
      }
      
      if (filterValues.status) {
        const now = new Date();
        const start = event.start_date ? new Date(event.start_date) : null;
        const end = event.end_date ? new Date(event.end_date) : null;
        const status = (!start || !end) ? 'upcoming' : (now < start ? 'upcoming' : now > end ? 'ended' : 'active');
        if (filterValues.status !== status) return false;
      }
      
      return true;
    });

    return filtered.sort((a, b) => {
      let aValue: string | number | Date, bValue: string | number | Date;
      
      switch (sortBy) {
        case 'name':
          aValue = (a.name_en || a.name_jp).toLowerCase();
          bValue = (b.name_en || b.name_jp).toLowerCase();
          break;
        case 'startDate':
          aValue = a.start_date ? new Date(a.start_date).getTime() : 0;
          bValue = b.start_date ? new Date(b.start_date).getTime() : 0;
          break;
        case 'endDate':
          aValue = a.end_date ? new Date(a.end_date).getTime() : 0;
          bValue = b.end_date ? new Date(b.end_date).getTime() : 0;
          break;
        case 'isActive': {
          const now = new Date();
          aValue = a.start_date && a.end_date && new Date(a.start_date) <= now && now <= new Date(a.end_date) ? 1 : 0;
          bValue = b.start_date && b.end_date && new Date(b.start_date) <= now && now <= new Date(b.end_date) ? 1 : 0;
          break;
        }
        default:
          aValue = (a.name_en || a.name_jp).toLowerCase();
          bValue = (b.name_en || b.name_jp).toLowerCase();
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      const numA = Number(aValue);
      const numB = Number(bValue);
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    });
  }, [filterValues, sortBy, sortDirection, events]);

  const totalPages = Math.ceil(filteredAndSortedGachas.length / itemsPerPage);
  const paginatedGachas = filteredAndSortedGachas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (key: string, value: string | number | boolean) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy: string, newDirection: SortDirection) => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
  };

  const clearFilters = () => {
    setFilterValues({
      search: '',
      status: '',
      dateRange: '',
      version: ''
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Instant scroll to top when changing pages for better performance
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <PageLoadingState isLoading={loading} message="Loading gacha events...">
    
    <div className="modern-page">
      <div className="modern-container-lg">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="modern-page-header"
        >
          <h1 className="modern-page-title">
            Gacha Gallery
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
          resultCount={filteredAndSortedGachas.length}
          itemLabel="gacha events"
          accentColor="purple"
          secondaryColor="pink"
          headerIcon={<Diamond className="w-4 h-4" />}
        />

        {/* Empty State */}
        {filteredAndSortedGachas.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 mt-8"
          >
            <motion.div
              className="w-24 h-24 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-accent-cyan/20"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Diamond className="w-12 h-12 text-accent-cyan/60" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-300 mb-3">No gacha events found</h3>
            <p className="text-muted-foreground mb-6">
              {debouncedSearch ?
                'Try adjusting your search terms or clear the search to see all gacha events.' :
                'Try adjusting your filters or clear them to see all gacha events.'
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
        )}

        {/* Gacha Display */}
        {filteredAndSortedGachas.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <div className="grid-responsive-cards mt-8 mb-8">
              {paginatedGachas.map((gacha, index) => (
                <motion.div
                  key={gacha.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.15,
                    delay: Math.min(index * 0.02, 0.1) // Limit max delay to 0.1s
                  }}
                >
                  <GachaCard gacha={gacha} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-2 mt-8"
          >
            <motion.button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-dark-card/70 border border-dark-border/50 text-gray-400 hover:text-white hover:bg-purple-400/20 disabled:opacity-50 disabled:hover:bg-dark-card/70 disabled:hover:text-gray-400 transition-all"
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
                        ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-lg'
                        : 'bg-dark-card/70 border border-dark-border/50 text-gray-400 hover:text-white hover:bg-purple-400/20'
                    }`}
                  >
                    {page}
                  </motion.button>
                );
              })}
            </div>
            
            <motion.button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-dark-card/70 border border-dark-border/50 text-gray-400 hover:text-white hover:bg-purple-400/20 disabled:opacity-50 disabled:hover:bg-dark-card/70 disabled:hover:text-gray-400 transition-all"
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