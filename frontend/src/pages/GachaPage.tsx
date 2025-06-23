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
  Zap
} from 'lucide-react';
import { type Event, type SortDirection } from '@/types';
import { eventsApi } from '@/services/api';
import UnifiedFilter from '@/components/features/UnifiedFilter';
import type { FilterField, SortOption } from '@/components/features/UnifiedFilter';

// Define reward interface for gacha rewards
interface GachaReward {
  icon?: string;
  name: string;
}

// Extend Event interface for gacha-specific properties
interface GachaEvent extends Event {
  eventType?: string; // Make optional since base Event doesn't have this
  bannerImage?: string;
  description?: string;
  rewards?: GachaReward[];
  // Event interface already includes:
  // id: number
  // name_en: string
  // name_jp: string 
  // start_date: string
  // end_date: string
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

  return (
    <div
      className="relative modern-card overflow-hidden"
    >

      
      {/* Banner Image */}
      <div className="relative h-48 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-indigo-500/20 overflow-hidden">
        {gacha.bannerImage && gacha.bannerImage !== '⭐' && gacha.bannerImage !== '🌙' && gacha.bannerImage !== '💎' ? (
          <img 
            src={gacha.bannerImage} 
            alt={gacha.name_en}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/30 to-pink-500/30">
            <div className="text-6xl mb-2">{gacha.bannerImage ?? '💎'}</div>
            <Diamond className="w-16 h-16 text-purple-300/50 absolute" />
          </div>
        )}
        
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
        
        {/* Status Badge - positioned on banner */}
        <div className="absolute top-4 left-4">
          <div
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 backdrop-blur-sm ${
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

        {/* Title overlay on banner */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-bold text-white text-xl mb-1 drop-shadow-lg">{gacha.name_en || gacha.name_jp}</h3>
        </div>
      </div>

      {/* Card Content */}
      <div className="relative z-10 p-6">
        {/* Description */}
        <div className="mb-4">
          <p className="text-sm text-gray-300 leading-relaxed line-clamp-2">
            {gacha.description ?? ''}
          </p>
        </div>

        {/* Dates Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div 
            className="flex flex-col items-center p-3 bg-dark-primary/30 rounded-lg border border-dark-border/30"
          >
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-green-400" />
              <span className="text-xs font-medium text-gray-300">Start</span>
            </div>
            <span className="text-xs font-bold text-white text-center">{formatDate(gacha.start_date)}</span>
          </div>
          
          <div 
            className="flex flex-col items-center p-3 bg-dark-primary/30 rounded-lg border border-dark-border/30"
          >
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-red-400" />
              <span className="text-xs font-medium text-gray-300">End</span>
            </div>
            <span className="text-xs font-bold text-white text-center">{formatDate(gacha.end_date)}</span>
          </div>
        </div>

        {/* Gacha Information */}
        <div className="mb-4">
          <div className="bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-xl p-3 border border-purple-400/20">
            <p className="text-xs font-bold text-purple-400 mb-2 flex items-center">
              <Zap className="w-3 h-3 mr-1" />
              Pull Information
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-gray-300">
                <span className="font-medium">Rate:</span> Enhanced SSR
              </div>
              <div className="text-gray-300">
                <span className="font-medium">Guarantee:</span> 10x Pull
              </div>
            </div>
          </div>
        </div>

        {/* Rewards */}
        {gacha.rewards && gacha.rewards.length > 0 && (
          <div className="mb-4">
            <div className="bg-gradient-to-r from-purple-400/10 to-pink-500/10 rounded-xl p-3 border border-purple-400/20">
              <p className="text-xs font-bold text-purple-400 mb-2 flex items-center">
                <Gift className="w-3 h-3 mr-1" />
                Featured Items ({gacha.rewards.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {gacha.rewards?.slice(0, 3).map((reward: GachaReward, index: number) => (
                  <span 
                    key={index}
                    className="text-xs bg-dark-primary/50 px-2 py-1 rounded-sm border border-dark-border/30 text-gray-300"
                  >
                    {reward.icon || '💎'} {reward.name}
                  </span>
                ))}
                {gacha.rewards && gacha.rewards.length > 3 && (
                  <span className="text-xs text-gray-400 px-2 py-1">
                    +{gacha.rewards.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
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

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await eventsApi.getEvents({ limit: 1000 });
        // Convert Event[] to GachaEvent[] by adding missing properties
        const gachaEvents: GachaEvent[] = (response.data as Event[]).map(event => ({
          ...event,
          eventType: 'gacha', // Add the missing eventType property
          bannerImage: '💎', // Default banner image
          description: `${event.name_en || event.name_jp} gacha event`, // Default description
          rewards: [] // Default empty rewards
        }));
        setEvents(gachaEvents);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const itemsPerPage = 8;

  // Filter fields configuration
  const filterFields: FilterField[] = [
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search gacha events...',
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
      if (filterValues.search && !(event.name_en || event.name_jp).toLowerCase().includes(filterValues.search.toLowerCase()) && 
          !(event.description ?? '').toLowerCase().includes(filterValues.search.toLowerCase())) return false;
      
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-primary flex items-center justify-center">
        <div className="text-white text-lg">Loading gacha events...</div>
      </div>
    );
  }


  return (
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
          <p className="modern-page-subtitle">
            Showing {filteredAndSortedGachas.length} gacha events
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
          resultCount={filteredAndSortedGachas.length}
          itemLabel="gacha events"
          accentColor="purple"
          secondaryColor="pink"
          headerIcon={<Diamond className="w-4 h-4" />}
        />

        {/* Gacha Display */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {paginatedGachas.map((gacha, index) => (
              <motion.div
                key={gacha.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <GachaCard gacha={gacha} />
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
                    onClick={() => setCurrentPage(page)}
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
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-dark-card/70 border border-dark-border/50 text-gray-400 hover:text-white hover:bg-purple-400/20 disabled:opacity-50 disabled:hover:bg-dark-card/70 disabled:hover:text-gray-400 transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}

        {/* Empty State */}
        {filteredAndSortedGachas.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <motion.div
              className="w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-purple-400/20"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Diamond className="w-12 h-12 text-purple-400/60" />
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-300 mb-3">No gacha found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              We couldn't find any gacha matching your current filters. Try adjusting your search criteria.
            </p>
            <motion.button
              onClick={clearFilters}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-400 to-pink-500 hover:from-purple-400/90 hover:to-pink-500/90 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg"
            >
              Clear All Filters
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
} 