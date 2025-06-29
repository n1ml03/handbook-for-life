import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight,
  Zap,
  Shield,
  Sparkles,
  Info
} from 'lucide-react';
import { skillsApi } from '@/services/api';
import { safeExtractArrayData, safeExtractPaginationData } from '@/services/utils';
import { 
  type Skill,
  type SortDirection,
  type SkillCategory
} from '@/types';
import UnifiedFilter from '@/components/features/UnifiedFilter';
import { PageLoadingState, LoadingSpinner, MultiLanguageCard, type MultiLanguageNames } from '@/components/ui';
import { PageSection } from '@/components/ui/spacing';
import { useDebounce } from '@/hooks/useDebounce';
import React from 'react';

const SkillCard = React.memo(function SkillCard({ skill }: { skill: Skill }) {
  const getCategoryColor = (category: SkillCategory) => {
    switch (category) {
      case 'ACTIVE': return 'bg-gradient-to-r from-red-400 to-pink-500';
      case 'PASSIVE': return 'bg-gradient-to-r from-cyan-400 to-blue-500';
      case 'POTENTIAL': return 'bg-gradient-to-r from-purple-400 to-pink-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600';
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

  const names: MultiLanguageNames = {
    name_jp: skill.name_jp,
    name_en: skill.name_en,
    name_cn: skill.name_cn,
    name_tw: skill.name_tw,
    name_kr: skill.name_kr
  };

  const header = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-lg flex items-center justify-center border border-accent-cyan/20">
          {getCategoryIcon(skill.skill_category)}
        </div>
        <div>
          <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${getCategoryColor(skill.skill_category)} mb-1`}>
            {getCategoryIcon(skill.skill_category)}
            <span>{skill.skill_category}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const skillDetails = (
    <div className="space-y-3">
      {/* Description */}
      {skill.description_en && (
        <div className="p-3 bg-dark-primary/30 rounded-lg border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-3 h-3 text-accent-cyan" />
            <span className="text-xs font-medium text-accent-cyan">Description</span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{skill.description_en}</p>
        </div>
      )}

      {/* Effect Type */}
      {skill.effect_type && (
        <div className="p-3 bg-gradient-to-r from-accent-purple/10 to-accent-pink/10 rounded-lg border border-accent-purple/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3 h-3 text-accent-purple" />
            <span className="text-xs font-medium text-accent-purple">Effect Type</span>
          </div>
          <span className="text-sm font-bold text-white">{skill.effect_type}</span>
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
      {skillDetails}
    </MultiLanguageCard>
  );
});

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState('name_en');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterValues, setFilterValues] = useState<{
    search: string;
    category: string;
  }>({
    search: '',
    category: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 12;
  
  // Debounce search to avoid too many API calls
  const debouncedSearch = useDebounce(filterValues.search as string, 500);

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      
      let response;
      
      if (debouncedSearch) {
        // Use search endpoint when there's a search query
        response = await skillsApi.searchSkills(debouncedSearch, {
          page: currentPage,
          limit: itemsPerPage,
          sortBy,
          sortOrder: sortDirection,
          ...(filterValues.category && { category: filterValues.category }),
        });
      } else {
        // Use regular endpoint with filters
        response = await skillsApi.getSkills({
          page: currentPage,
          limit: itemsPerPage,
          sortBy,
          sortOrder: sortDirection,
          ...(filterValues.category && { category: filterValues.category }),
        });
      }
      
      // Safely extract data and pagination
      const responseData = safeExtractArrayData<Skill>(response, 'skills API');
      const paginationData = safeExtractPaginationData(response, responseData.length);
      
      setSkills(responseData);
      setTotalPages(paginationData.totalPages);
      setTotalItems(paginationData.total);
    } catch (err) {
      console.error('Failed to fetch skills:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, filterValues.category, sortBy, sortDirection]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const filterFields = [
    {
      key: 'search',
      label: 'Search Skills',
      type: 'text' as const,
      placeholder: 'Search by name, description, or effect type...',
      gridCols: 2,
    },
    {
      key: 'category',
      label: 'Category',
      type: 'select' as const,
      options: [
        { value: '', label: 'All Categories' },
        { value: 'ACTIVE', label: 'Active Skills' },
        { value: 'PASSIVE', label: 'Passive Skills' },
        { value: 'POTENTIAL', label: 'Potential Skills' },
      ],
    },
  ];

  const sortOptions = [
    { key: 'name_en', label: 'Name (English)' },
    { key: 'name_jp', label: 'Name (Japanese)' },
    { key: 'skill_category', label: 'Category' },
    { key: 'id', label: 'ID' },
  ];

  const handleFilterChange = (key: string, value: string | number | boolean) => {
    setFilterValues(prev => ({ 
      ...prev, 
      [key]: String(value) // Convert all values to string for consistency
    }));
    setCurrentPage(1);
  };

  const handleSortChange = (newSortBy: string, newDirection: SortDirection) => {
    setSortBy(newSortBy);
    setSortDirection(newDirection);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilterValues({
      search: '',
      category: ''
    });
    setSortBy('name_en');
    setSortDirection('asc');
    setCurrentPage(1);
  };

  return (
    <PageLoadingState 
      isLoading={loading && skills.length === 0} 
      message="Loading skills list..."
    >
    <div className="modern-page">
      <div className="modern-container-lg">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="modern-page-header"
        >
          <h1 className="modern-page-title">
            Skills Collection
          </h1>
          <p className="modern-page-subtitle">
            Explore and discover powerful skills across all categories • {totalItems} total skills
          </p>
        </motion.div>

        {/* Filters */}
        <PageSection>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
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
            />
          </motion.div>
        </PageSection>

        {/* Skills Display */}
        <PageSection>
          {/* Results Summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-4">
              {loading && (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm text-muted-foreground">
                    {debouncedSearch ? 'Searching skills...' : 'Loading skills...'}
                  </span>
                </div>
              )}
              {!loading && debouncedSearch && (
                <div className="text-sm text-muted-foreground">
                  Search results for: <span className="font-medium text-foreground">"{debouncedSearch}"</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Skills Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid-responsive-cards mb-8"
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
              <motion.div
                className="w-24 h-24 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-accent-cyan/20"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-12 h-12 text-accent-cyan/60" />
              </motion.div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {debouncedSearch ? `No skills found for "${debouncedSearch}"` : 'No skills found'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {debouncedSearch ? 
                  'Try adjusting your search terms or clear the search to see all skills.' : 
                  'Try adjusting your filters or clear them to see all skills.'
                }
              </p>
              <motion.button
                onClick={clearFilters}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-accent-pink to-accent-purple hover:from-accent-pink/90 hover:to-accent-purple/90 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg"
              >
                {debouncedSearch ? 'Clear Search' : 'Clear All Filters'}
              </motion.button>
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
                {(() => {
                  const maxVisiblePages = 5;
                  const halfVisible = Math.floor(maxVisiblePages / 2);
                  
                  let startPage = Math.max(1, currentPage - halfVisible);
                  const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                  
                  // Adjust startPage if we're near the end
                  if (endPage - startPage + 1 < maxVisiblePages) {
                    startPage = Math.max(1, endPage - maxVisiblePages + 1);
                  }
                  
                  const pages = [];
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`w-10 h-10 rounded-lg font-bold transition-colors ${
                          currentPage === i
                            ? 'bg-accent-cyan text-dark-primary'
                            : 'btn-modern-ghost text-foreground'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }
                  
                  return pages;
                })()}

                {/* Show ellipsis and last page if needed */}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && (
                      <span className="text-muted-foreground px-2">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="btn-modern-ghost w-10 h-10 rounded-lg font-bold transition-colors text-foreground"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
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
        </PageSection>
      </div>
    </div>
    </PageLoadingState>
  );
} 