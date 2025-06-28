import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Calendar
} from 'lucide-react';
import { charactersApi } from '@/services/api';
import { safeExtractArrayData } from '@/services/utils';
import { type Character, type SortDirection } from '@/types';
import UnifiedFilter, { FilterField, SortOption } from '@/components/features/UnifiedFilter';
import { addTranslationsToItems, searchInAllLanguages } from '@/services/multiLanguageSearch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoadingState } from '@/components/ui';
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

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
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
              <h3 className="font-bold text-white text-lg">{character.name_en || character.name_jp}</h3>
              {character.is_active && (
                <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs">
                  Active
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-3 text-sm text-gray-400">
              <span className="flex items-center">
                <User className="w-4 h-4 mr-1 text-accent-cyan" />
                ID: {character.id}
              </span>
              {character.birthday && (
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-accent-pink" />
                  {formatBirthday(character.birthday)}
                </span>
              )}
            </div>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-accent-pink/20 to-accent-purple/20 rounded-xl flex items-center justify-center border border-accent-cyan/20">
            {character.profile_image_url ? (
              <img
                src={character.profile_image_url}
                alt={character.name_en}
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <User className="w-8 h-8 text-accent-cyan hidden" />
          </div>
        </div>

        {/* Character Details */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {character.height && (
            <div className="flex justify-between items-center p-2 bg-dark-primary/30 rounded-lg border border-dark-border/30">
              <span className="uppercase font-bold text-xs text-accent-cyan">Height</span>
              <span className="font-bold text-white text-sm">{character.height}cm</span>
            </div>
          )}
          
          {character.blood_type && (
            <div className="flex justify-between items-center p-2 bg-dark-primary/30 rounded-lg border border-dark-border/30">
              <span className="uppercase font-bold text-xs text-accent-pink">Blood</span>
              <span className="font-bold text-white text-sm">{character.blood_type}</span>
            </div>
          )}
          
          {character.voice_actor_jp && (
            <div className="col-span-2 flex justify-between items-center p-2 bg-dark-primary/30 rounded-lg border border-dark-border/30">
              <span className="uppercase font-bold text-xs text-accent-purple">Voice Actor</span>
              <span className="font-bold text-white text-sm truncate ml-2">{character.voice_actor_jp}</span>
            </div>
          )}
          
          {character.measurements && (
            <div className="col-span-2 flex justify-between items-center p-2 bg-dark-primary/30 rounded-lg border border-dark-border/30">
              <span className="uppercase font-bold text-xs text-accent-gold">Measurements</span>
              <span className="font-bold text-white text-sm">{character.measurements}</span>
            </div>
          )}
        </div>

        {/* Multi-language names preview */}
        <div className="bg-dark-primary/50 rounded-xl p-3 border border-dark-border/30 mb-4">
          <p className="text-xs font-bold text-accent-cyan mb-2 flex items-center">
            <span className="mr-1">🌐</span>
            Multi-language
          </p>
          <div className="text-xs text-gray-300 space-y-1">
            {character.name_jp && <div><span className="text-gray-400">JP:</span> {character.name_jp}</div>}
            {character.name_cn && <div><span className="text-gray-400">CN:</span> {character.name_cn}</div>}
          </div>
        </div>

        {/* ID and Click Indicator */}
        <div className="pt-3 border-t border-dark-border/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-mono bg-dark-primary/30 px-2 py-1 rounded-sm">
              {character.unique_key}
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

CharacterCard.displayName = 'CharacterCard';

export default function CharacterListPage() {
  const navigate = useNavigate();
  
  // State management
  const [charactersData, setCharactersData] = useState({
    characters: [] as Character[],
    loading: true,
    error: null as string | null,
  });
  
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

  // Fetch characters
  const fetchCharacters = useCallback(async () => {
    try {
      setCharactersData(prev => ({ ...prev, loading: true, error: null }));
      
      // Use safer parameters to avoid 400 Bad Request
      const response = await charactersApi.getCharacters({
        page: 1,
        limit: 100,
        sortBy: 'name_en',
        sortOrder: 'asc'
      });
      
      const responseData = safeExtractArrayData<Character>(response, 'characters API');
      setCharactersData(prev => ({ ...prev, characters: responseData, loading: false }));
    } catch (err) {
      console.error('Failed to fetch characters:', err);
      setCharactersData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to fetch characters. Please try again.'
      }));
    }
  }, []);

  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  // Add multi-language support
  const multiLanguageCharacters = useMemo(() => {
    const compatibleCharacters = charactersData.characters.map(char => ({
      ...char,
      id: char.id.toString(),
      name: char.name_en || char.name_jp || '',
      description: char.voice_actor_jp || ''
    }));
    return addTranslationsToItems(compatibleCharacters);
  }, [charactersData.characters]);

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
    <PageLoadingState isLoading={charactersData.loading} message="Loading character list...">
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
            <p className="modern-page-subtitle">
              Explore and discover all characters with detailed information • {filteredAndSortedCharacters.length} of {charactersData.characters.length} characters
            </p>
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
              totalCount={charactersData.characters.length}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
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
            {filteredAndSortedCharacters.length === 0 && !charactersData.loading && (
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