import { useMemo } from 'react';

export type Language = 'EN' | 'CN' | 'TW' | 'KO' | 'JP';

export interface Translation {
  name: string;
  description?: string;
}

export interface MultiLanguageItem {
  id: string;
  name: string;
  description?: string;
  [key: string]: any;
  translations?: {
    [key in Language]?: Translation;
  };
}

// Generate mock translations for any item
export const generateItemTranslations = (item: any): { [key in Language]: Translation } => {
  const languagePrefixes = {
    EN: '',
    CN: '中文_',
    TW: '繁體_',
    KO: '한국_',
    JP: '日本_'
  };

  const translations: { [key in Language]: Translation } = {} as { [key in Language]: Translation };

  Object.keys(languagePrefixes).forEach(lang => {
    const prefix = languagePrefixes[lang as Language];
    translations[lang as Language] = {
      name: prefix ? `${prefix}${item.name}` : item.name,
      description: item.description ? (prefix ? `${prefix}${item.description}` : item.description) : undefined
    };
  });

  return translations;
};

// Add translations to any item
export const addTranslationsToItem = <T extends { id: string; name: string; description?: string }>(
  item: T
): T & { translations: { [key in Language]: Translation } } => {
  return {
    ...item,
    translations: generateItemTranslations(item)
  };
};

// Add translations to array of items
export const addTranslationsToItems = <T extends { id: string; name: string; description?: string }>(
  items: T[]
): (T & { translations: { [key in Language]: Translation } })[] => {
  return items.map(addTranslationsToItem);
};

// Multi-language search function
export const searchInAllLanguages = (
  item: MultiLanguageItem,
  searchText: string
): boolean => {
  if (!searchText) return true;
  
  const searchLower = searchText.toLowerCase();
  
  // Search in original name and description
  const originalNameMatch = item.name.toLowerCase().includes(searchLower);
  const originalDescMatch = item.description?.toLowerCase().includes(searchLower) || false;
  
  // Search across ALL language translations
  const translationMatches = Object.values(item.translations || {}).some(translation => {
    const nameMatch = translation?.name?.toLowerCase().includes(searchLower) || false;
    const descMatch = translation?.description?.toLowerCase().includes(searchLower) || false;
    return nameMatch || descMatch;
  });
  
  return originalNameMatch || originalDescMatch || translationMatches;
};

// Hook for multi-language filtering
export const useMultiLanguageFilter = <T extends MultiLanguageItem>(
  items: T[],
  searchText: string,
  additionalFilters?: (item: T) => boolean
) => {
  return useMemo(() => {
    return items.filter(item => {
      const searchMatch = searchInAllLanguages(item, searchText);
      const additionalMatch = additionalFilters ? additionalFilters(item) : true;
      return searchMatch && additionalMatch;
    });
  }, [items, searchText, additionalFilters]);
};

// Get display name in specific language
export const getDisplayName = (
  item: MultiLanguageItem,
  language: Language = 'EN'
): string => {
  return item.translations?.[language]?.name || item.name;
};

// Get display description in specific language
export const getDisplayDescription = (
  item: MultiLanguageItem,
  language: Language = 'EN'
): string | undefined => {
  return item.translations?.[language]?.description || item.description;
};

// Language options for UI
export const languageOptions = [
  { value: 'EN' as Language, label: 'English' },
  { value: 'CN' as Language, label: '中文' },
  { value: 'TW' as Language, label: '繁體' },
  { value: 'KO' as Language, label: '한국어' },
  { value: 'JP' as Language, label: '日本語' }
]; 