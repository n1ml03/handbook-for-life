import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  Mic
} from 'lucide-react';
import { charactersApi } from '@/services/api';
import { safeExtractArrayData } from '@/services/utils';
import { type Character, type SortDirection } from '@/types';
import { useCharacters } from '@/hooks/useApiQueries';
import UnifiedFilter, { FilterField, SortOption } from '@/components/features/UnifiedFilter';
import { addTranslationsToItems, searchInAllLanguages } from '@/services/multiLanguageSearch';
import { Button } from '@/components/ui/button';
import { PageLoadingState, MultiLanguageCard, type MultiLanguageNames } from '@/components/ui';
import { useDebounce } from '@/hooks/useDebounce';
import React from 'react';

// Character Card Component
interface CharacterCardProps {
  character: Character;
  onClick?: () => void;
}

const CharacterCard = React.memo(function CharacterCard({ character, onClick }: CharacterCardProps) {
  const formatBirthday = useCallback((birthday?: string) => {
    if (!birthday) return 'Unknown';
    try {
      const date = new Date(birthday);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return birthday;
    }
  }, []);

  const names: MultiLanguageNames = {
    name_jp: character.name_jp,
    name_en: character.name_en,
    name_cn: character.name_cn,
    name_tw: character.name_tw,
    name_kr: character.name_kr
  };

  const header = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-lg flex items-center justify-center border border-accent-cyan/20">
          {character.profile_image_url ? (
            <img
              src={character.profile_image_url}
              alt={character.name_en}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <User className="w-6 h-6 text-accent-cyan hidden" />
        </div>
        <div>
          <span className="text-xs text-gray-400">ID: {character.id}</span>
          {character.birthday && (
            <div className="flex items-center text-xs text-gray-400">
              <Calendar className="w-3 h-3 mr-1 text-accent-pink" />
              {formatBirthday(character.birthday)}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const characterInfo = (
    <div className="space-y-3">
      {/* Voice actor */}
      {character.voice_actor_jp && (
        <div className="p-3 bg-gradient-to-r from-accent-purple/10 to-accent-pink/10 rounded-lg border border-accent-purple/20">
          <div className="flex items-center space-x-2 mb-1">
            <Mic className="w-4 h-4 text-accent-purple" />
            <span className="text-xs font-medium text-accent-purple">Voice Actor</span>
          </div>
          <span className="text-sm font-bold text-white">{character.voice_actor_jp}</span>
        </div>
      )}
    </div>
  );

  const footer = (
    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500 font-mono bg-dark-primary/30 px-2 py-1 rounded-sm">
        {character.unique_key}
      </span>
      <motion.div
        className="text-xs text-accent-cyan/60 group-hover:text-accent-cyan transition-colors"
        whileHover={{ scale: 1.05 }}
      >
        View Details →
      </motion.div>
    </div>
  );

  return (
    <MultiLanguageCard
      names={names}
      primaryLanguage="en"
      languageVariant="expanded"
      onClick={onClick}
      header={header}
      footer={footer}
    >
      {characterInfo}
    </MultiLanguageCard>
  );
});

CharacterCard.displayName = 'CharacterCard';

export default function CharacterListPage() {
  const navigate = useNavigate();
  
  // Use React Query for data fetching with caching
  const {
    data: charactersResponse,
    isLoading,
    error: queryError
  } = useCharacters({
    page: 1,
    limit: 100,
    sortBy: 'name_en',
    sortOrder: 'asc'
  });

  // Extract characters data safely
  const characters = useMemo(() => {
    return safeExtractArrayData<Character>(charactersResponse, 'characters API');
  }, [charactersResponse]);

  // Convert query error to string for compatibility
  const error = queryError ? (queryError as Error).message : null;
  
  const [uiState, setUiState] = useState({
    currentPage: 1,
    showFilters: false,
    isFilterExpanded: false,
  });
  
  const [sortState, setSortState] = useState({
    sortBy: 'name',
    sortDirection: 'asc' as SortDirection,
  });
  
  const [filterValues, setFilterValues] = useState({
    search: '',
    is_active: '',
    birthday_month: '',
    height_min: '',
    height_max: '',
  });

  const debouncedSearchTerm = useDebounce(filterValues.search, 300);
  const filterValuesWithDebouncedSearch = useMemo(() => ({
    ...filterValues,
    search: debouncedSearchTerm,
  }), [filterValues, debouncedSearchTerm]);

  // Data is now automatically fetched and cached by React Query

  // Add multi-language support
  const multiLanguageCharacters = useMemo(() => {
    const compatibleCharacters = characters.map(char => ({
      ...char,
      id: char.id.toString(),
      name: char.name_en || char.name_jp || '',
      description: char.voice_actor_jp || ''
    }));
    return addTranslationsToItems(compatibleCharacters);
  }, [characters]);

  // Filter configuration
  const filterFields: FilterField[] = useMemo(() => [
    {
      key: 'search',
      label: 'Search Characters',
      type: 'text',
      placeholder: 'Search characters in all languages...',
      gridCols: 2
    },
    {
      key: 'is_active',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ]
    },
    {
      key: 'birthday_month',
      label: 'Birthday Month',
      type: 'select',
      options: [
        { value: '', label: 'All Months' },
        ...Array.from({length: 12}, (_, i) => ({
          value: (i + 1).toString(),
          label: new Date(2000, i).toLocaleDateString('en-US', { month: 'long' })
        }))
      ]
    },
    {
      key: 'height_min',
      label: 'Min Height (cm)',
      type: 'number',
      min: 140,
      max: 200
    },
    {
      key: 'height_max',
      label: 'Max Height (cm)',
      type: 'number',
      min: 140,
      max: 200
    }
  ], []);

  const sortOptions: SortOption[] = useMemo(() => [
    { key: 'name', label: 'Name' },
    { key: 'id', label: 'ID' },
    { key: 'birthday', label: 'Birthday' },
    { key: 'height', label: 'Height' }
  ], []);

  // Filter and sort logic
  const filteredAndSortedCharacters = useMemo(() => {
    const filtered = multiLanguageCharacters.filter(character => {
      // Use original character properties through the extended object
      const originalChar = character as typeof character & Character;
      
      if (filterValuesWithDebouncedSearch.is_active && originalChar.is_active.toString() !== filterValuesWithDebouncedSearch.is_active) return false;
      if (filterValuesWithDebouncedSearch.search && !searchInAllLanguages(character, filterValuesWithDebouncedSearch.search)) return false;
      if (filterValuesWithDebouncedSearch.birthday_month && originalChar.birthday) {
        const birthMonth = new Date(originalChar.birthday).getMonth() + 1;
        if (birthMonth.toString() !== filterValuesWithDebouncedSearch.birthday_month) return false;
      }
      if (filterValuesWithDebouncedSearch.height_min && originalChar.height && originalChar.height < Number(filterValuesWithDebouncedSearch.height_min)) return false;
      if (filterValuesWithDebouncedSearch.height_max && originalChar.height && originalChar.height > Number(filterValuesWithDebouncedSearch.height_max)) return false;
      return true;
    });

    // Sort
    return filtered.sort((a, b) => {
      const originalA = a as typeof a & Character;
      const originalB = b as typeof b & Character;
      let aValue: string | number, bValue: string | number;
      
      switch (sortState.sortBy) {
        case 'name':
          aValue = originalA.name_en || originalA.name_jp || '';
          bValue = originalB.name_en || originalB.name_jp || '';
          break;
        case 'id':
          aValue = originalA.id;
          bValue = originalB.id;
          break;
        case 'birthday':
          aValue = originalA.birthday ? new Date(originalA.birthday).getTime() : 0;
          bValue = originalB.birthday ? new Date(originalB.birthday).getTime() : 0;
          break;
        case 'height':
          aValue = originalA.height || 0;
          bValue = originalB.height || 0;
          break;
        default:
          aValue = originalA.id;
          bValue = originalB.id;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortState.sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      } else {
        return sortState.sortDirection === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
      }
    });
  }, [multiLanguageCharacters, filterValuesWithDebouncedSearch, sortState]);

  // Pagination
  const itemsPerPage = 24;
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredAndSortedCharacters.length / itemsPerPage);
    const paginatedCharacters = filteredAndSortedCharacters.slice(
      (uiState.currentPage - 1) * itemsPerPage,
      uiState.currentPage * itemsPerPage
    );
    return { totalPages, paginatedCharacters };
  }, [filteredAndSortedCharacters, uiState.currentPage, itemsPerPage]);

  const handleCharacterClick = useCallback((characterId: number) => {
    navigate(`/characters/${characterId}`);
  }, [navigate]);

  return (
    <PageLoadingState isLoading={isLoading} message="Loading character list...">
      <div className="modern-page">
        <div className="modern-container-xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="modern-page-header"
          >
            <h1 className="modern-page-title">
              Character Collection
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >

            {/* Filters */}
            <UnifiedFilter
              showFilters={uiState.showFilters}
              setShowFilters={(show) => setUiState(prev => ({ ...prev, showFilters: show }))}
              filterFields={filterFields}
              sortOptions={sortOptions}
              filterValues={filterValues}
              onFilterChange={(key, value) => {
                setFilterValues(prev => ({ ...prev, [key]: value }));
                setUiState(prev => ({ ...prev, currentPage: 1 }));
              }}
              onClearFilters={() => {
                setFilterValues({
                  search: '',
                  is_active: '',
                  birthday_month: '',
                  height_min: '',
                  height_max: '',
                });
                setUiState(prev => ({ ...prev, currentPage: 1 }));
              }}
              sortBy={sortState.sortBy}
              sortDirection={sortState.sortDirection}
              onSortChange={(sortBy, sortDirection) => setSortState({ sortBy, sortDirection })}
              resultCount={filteredAndSortedCharacters.length}
              totalCount={characters.length}
              itemLabel="characters"
              searchAriaLabel="Search characters by name"
            />
          </motion.div>

          {/* Character Display */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid-responsive-cards mb-8">
              {paginationData.paginatedCharacters.map((character, index) => (
                <motion.div
                  key={character.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CharacterCard
                  character={character as typeof character & Character}
                  onClick={() => handleCharacterClick((character as typeof character & Character).id)}
                />
                </motion.div> 
              ))}
            </div>

            {/* Pagination */}
            {paginationData.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-2 mb-8"
              >
                <Button
                  onClick={() => setUiState(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                  disabled={uiState.currentPage === 1}
                  variant="outline"
                  size="sm"
                  className="border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, paginationData.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => setUiState(prev => ({ ...prev, currentPage: pageNum }))}
                        variant={uiState.currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className={uiState.currentPage === pageNum 
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
                  onClick={() => setUiState(prev => ({ ...prev, currentPage: Math.min(paginationData.totalPages, prev.currentPage + 1) }))}
                  disabled={uiState.currentPage === paginationData.totalPages}
                  variant="outline"
                  size="sm"
                  className="border-accent-cyan/30 text-accent-cyan hover:bg-accent-cyan/10"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* Empty State */}
            {filteredAndSortedCharacters.length === 0 && !isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-accent-cyan/20">
                  <User className="w-12 h-12 text-accent-cyan/60" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">No characters found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search criteria or reset filters to see all characters.
                </p>
                <Button 
                  onClick={() => {
                    setFilterValues({
                      search: '',
                      is_active: '',
                      birthday_month: '',
                      height_min: '',
                      height_max: '',
                    });
                    setUiState(prev => ({ ...prev, currentPage: 1 }));
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