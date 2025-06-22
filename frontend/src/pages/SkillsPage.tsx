import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight,
  Zap,
  Shield,
  Sparkles} from 'lucide-react';
import { skillsApi } from '@/services/api';
import { 
  type Skill,
  type SortDirection,
  type SkillCategory,
  getLocalizedName
} from '@/types';
import UnifiedFilter from '@/components/features/UnifiedFilter';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorState } from '@/components/ui/ErrorState';
import React from 'react';

const SkillCard = React.memo(function SkillCard({ skill }: { skill: Skill }) {
  const getCategoryColor = (category: SkillCategory) => {
    switch (category) {
      case 'ACTIVE': return 'from-red-400 to-pink-500';
      case 'PASSIVE': return 'from-cyan-400 to-blue-500';
      case 'POTENTIAL': return 'from-purple-400 to-pink-500';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getCategoryIcon = (category: SkillCategory) => {
    switch (category) {
      case 'ACTIVE': return <Zap className="w-4 h-4" />;
      case 'PASSIVE': return <Shield className="w-4 h-4" />;
      case 'POTENTIAL': return <Sparkles className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className="relative modern-card p-6 overflow-hidden group cursor-pointer transition-all duration-300 hover:border-accent-cyan/50"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-pink/5 via-accent-cyan/5 to-accent-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-accent-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-white text-lg">{getLocalizedName(skill, 'en')}</h3>
              <motion.div
                className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${getCategoryColor(skill.skill_category)} text-white shadow-lg flex items-center space-x-1`}
                whileHover={{ scale: 1.1 }}
              >
                {getCategoryIcon(skill.skill_category)}
                <span>{skill.skill_category}</span>
              </motion.div>
            </div>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-xl flex items-center justify-center border border-accent-cyan/20 overflow-hidden">
            {getCategoryIcon(skill.skill_category)}
          </div>
        </div>

        {/* Description */}
        {skill.description_en && (
          <div className="mb-4 p-3 modern-glass rounded-xl border border-border/30">
            <p className="text-sm text-muted-foreground leading-relaxed">{skill.description_en}</p>
          </div>
        )}

        {/* Effect Type */}
        {skill.effect_type && (
          <div className="mb-4">
            <p className="text-xs font-bold text-accent-cyan mb-2 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              Effect Type
            </p>
            <div className="p-2 modern-glass rounded-lg border border-border/30">
              <p className="text-xs text-muted-foreground">{skill.effect_type}</p>
            </div>
          </div>
        )}

        {/* ID */}
        <div className="pt-3 border-t border-border/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-mono modern-glass px-2 py-1 rounded-sm">
              #{skill.id}
            </span>
            <motion.div
              className="text-xs text-accent-cyan/60 group-hover:text-accent-cyan transition-colors"
              whileHover={{ scale: 1.1 }}
            >
              Click to view details →
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name_en');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 12;

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sortOrder: sortDirection,
        ...(searchQuery && { search: searchQuery }),
        ...(filterValues.category && { category: filterValues.category }),
      };

      const response = await skillsApi.getSkills(params);
      
      setSkills(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
    } catch (err) {
      console.error('Failed to fetch skills:', err);
      setError('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [currentPage, searchQuery, sortBy, sortDirection, filterValues]);

  const filterFields = [
    {
      key: 'search',
      label: 'Search Skills',
      type: 'text' as const,
      placeholder: 'Search by name...',
      gridCols: 2,
    },
    {
      key: 'category',
      label: 'Category',
      type: 'select' as const,
      options: [
        { value: '', label: 'All Categories' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'PASSIVE', label: 'Passive' },
        { value: 'POTENTIAL', label: 'Potential' },
      ],
    },
  ];

  const sortOptions = [
    { key: 'name_en', label: 'Name (English)' },
    { key: 'name_jp', label: 'Name (Japanese)' },
    { key: 'skill_category', label: 'Category' },
    { key: 'id', label: 'ID' },
  ];

  const handleFilterChange = (key: string, value: any) => {
    if (key === 'search') {
      setSearchQuery(value);
    } else {
      setFilterValues(prev => ({ ...prev, [key]: value }));
    }
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy: string, newDirection: SortDirection) => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterValues({});
    setSortBy('name_en');
    setSortDirection('asc');
    setCurrentPage(1);
  };

  const handleSkillClick = (skill: Skill) => {
    // Navigate to detail page when implemented
    console.log('Clicked skill:', skill);
  };

  if (loading && skills.length === 0) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-primary flex items-center justify-center">
        <ErrorState 
          description={error}
          onRetry={fetchSkills}
        />
      </div>
    );
  }

  return (
    <div className="modern-page">
      <div className="modern-container-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="modern-page-header"
        >
          <h1 className="modern-page-title">
            Skills
          </h1>
          <p className="modern-page-subtitle">
            Discover and learn about the diverse range of skills available in DOAXVV. Master the game mechanics and enhance your gameplay.
          </p>
        </motion.div>

        {/* Content */}
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
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
            itemLabel="skills"
            blackTheme={true}
          />
        </motion.div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-6"
        >
          <p className="text-muted-foreground">
            Showing {skills.length} of {totalItems} skills
          </p>
          {loading && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <LoadingSpinner size="sm" />
              <span>Loading...</span>
            </div>
          )}
        </motion.div>

        {/* Skills Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
        >
          {skills.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index % 8) }}
            >
              <SkillCard skill={skill} />
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {skills.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No skills found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search criteria.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-accent-cyan hover:bg-accent-cyan/90 text-dark-primary font-bold rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center items-center space-x-4 mt-8"
          >
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn-modern-ghost flex items-center space-x-2 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i));
                return pageNum <= totalPages ? (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                      currentPage === pageNum
                        ? 'bg-accent-cyan text-dark-primary'
                        : 'btn-modern-ghost text-foreground'
                    }`}
                  >
                    {pageNum}
                  </button>
                ) : null;
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn-modern-ghost flex items-center space-x-2 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
} 