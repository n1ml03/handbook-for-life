import { Zap, Search, Calendar, Shield, Tag, Star } from 'lucide-react';
import { FilterField, SortOption } from './UnifiedFilter';

// Common filter field configurations for different page types

export const createAccessoryFilterConfig = (rarities: string[], types: string[], versions: string[] = []): FilterField[] => [
  {
    key: 'search',
    label: 'Search',
    type: 'text',
    placeholder: 'Search accessories in all languages...',
    icon: <Search className="w-3 h-3 mr-1" />,
  },
  {
    key: 'rarity',
    label: 'Rarity',
    type: 'select',
    placeholder: 'All Rarities',
    options: rarities.map(r => ({ value: r, label: r })),
    icon: <Star className="w-3 h-3 mr-1" />,
  },
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    placeholder: 'All Types',
    options: types.map(t => ({ value: t, label: t })),
    icon: <Tag className="w-3 h-3 mr-1" />,
  },
  {
    key: 'version',
    label: 'Version',
    type: 'select',
    placeholder: 'All Versions',
    options: versions.map(v => ({ value: v, label: v })),
    icon: <Calendar className="w-3 h-3 mr-1" />,
  },
  // Stat filters (will be expandable)
  {
    key: 'minPow',
    label: 'Min POW',
    type: 'number',
    placeholder: '0',
    min: 0,
    icon: <Zap className="w-3 h-3 mr-1" />,
    color: 'text-red-400',
  },
  {
    key: 'minTec',
    label: 'Min TEC',
    type: 'number',
    placeholder: '0',
    min: 0,
    icon: <Zap className="w-3 h-3 mr-1" />,
    color: 'text-blue-400',
  },
  {
    key: 'minStm',
    label: 'Min STM',
    type: 'number',
    placeholder: '0',
    min: 0,
    icon: <Zap className="w-3 h-3 mr-1" />,
    color: 'text-green-400',
  },
  {
    key: 'minApl',
    label: 'Min APL',
    type: 'number',
    placeholder: '0',
    min: 0,
    icon: <Zap className="w-3 h-3 mr-1" />,
    color: 'text-yellow-400',
  },
];

export const createSwimsuitFilterConfig = (rarities: string[], characters: string[], releaseYears: string[], versions: string[] = []): FilterField[] => [
  {
    key: 'search',
    label: 'Search',
    type: 'text',
    placeholder: 'Search swimsuits in all languages...',
    icon: <Search className="w-3 h-3 mr-1" />,
  },
  {
    key: 'character',
    label: 'Character',
    type: 'select',
    placeholder: 'All Characters',
    options: characters.map(c => ({ value: c, label: c })),
    icon: <Tag className="w-3 h-3 mr-1" />,
  },
  {
    key: 'rarity',
    label: 'Rarity',
    type: 'select',
    placeholder: 'All Rarities',
    options: rarities.map(r => ({ value: r, label: r })),
    icon: <Star className="w-3 h-3 mr-1" />,
  },
  {
    key: 'releaseYear',
    label: 'Release Year',
    type: 'select',
    placeholder: 'All Years',
    options: releaseYears.map(y => ({ value: y, label: y })),
    icon: <Calendar className="w-3 h-3 mr-1" />,
  },
  {
    key: 'version',
    label: 'Version',
    type: 'select',
    placeholder: 'All Versions',
    options: versions.map(v => ({ value: v, label: v })),
    icon: <Calendar className="w-3 h-3 mr-1" />,
  },
  {
    key: 'hasSkills',
    label: 'Has Skills',
    type: 'checkbox',
  },
  // Stat filters (will be expandable)
  {
    key: 'minPow',
    label: 'Min POW',
    type: 'number',
    placeholder: '0',
    min: 0,
    icon: <Zap className="w-3 h-3 mr-1" />,
    color: 'text-red-400',
  },
  {
    key: 'minTec',
    label: 'Min TEC',
    type: 'number',
    placeholder: '0',
    min: 0,
    icon: <Zap className="w-3 h-3 mr-1" />,
    color: 'text-blue-400',
  },
  {
    key: 'minStm',
    label: 'Min STM',
    type: 'number',
    placeholder: '0',
    min: 0,
    icon: <Zap className="w-3 h-3 mr-1" />,
    color: 'text-green-400',
  },
  {
    key: 'minApl',
    label: 'Min APL',
    type: 'number',
    placeholder: '0',
    min: 0,
    icon: <Zap className="w-3 h-3 mr-1" />,
    color: 'text-yellow-400',
  },
];

export const createGirlFilterConfig = (types: string[]): FilterField[] => [
  {
    key: 'search',
    label: 'Search',
    type: 'text',
    placeholder: 'Search girls in all languages...',
    icon: <Search className="w-3 h-3 mr-1" />,
  },
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    placeholder: 'All Types',
    options: types.map(t => ({ value: t, label: t })),
    icon: <Tag className="w-3 h-3 mr-1" />,
  },
  {
    key: 'level',
    label: 'Level Range',
    type: 'range',
    min: 1,
    max: 100,
  },
  {
    key: 'hasSwimsuit',
    label: 'Has Swimsuit',
    type: 'checkbox',
  },
  {
    key: 'hasAccessories',
    label: 'Has Accessories',
    type: 'checkbox',
  },
  // Stat filters (will be expandable)
  {
    key: 'minPow',
    label: 'Min POW',
    type: 'number',
    placeholder: '0',
    min: 0,
    icon: <Zap className="w-3 h-3 mr-1" />,
    color: 'text-red-400',
  },
  {
    key: 'minTec',
    label: 'Min TEC',
    type: 'number',
    placeholder: '0',
    min: 0,
    icon: <Zap className="w-3 h-3 mr-1" />,
    color: 'text-blue-400',
  },
  {
    key: 'minStm',
    label: 'Min STM',
    type: 'number',
    placeholder: '0',
    min: 0,
    icon: <Zap className="w-3 h-3 mr-1" />,
    color: 'text-green-400',
  },
  {
    key: 'minApl',
    label: 'Min APL',
    type: 'number',
    placeholder: '0',
    min: 0,
    icon: <Zap className="w-3 h-3 mr-1" />,
    color: 'text-yellow-400',
  },
];

export const createShopFilterConfig = (types: string[], rarities: string[], currencies: string[]): FilterField[] => [
  {
    key: 'search',
    label: 'Search',
    type: 'text',
    placeholder: 'Search items...',
    icon: <Search className="w-3 h-3 mr-1" />,
  },
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    placeholder: 'All Types',
    options: types.map(t => ({ value: t, label: t })),
    icon: <Tag className="w-3 h-3 mr-1" />,
  },
  {
    key: 'rarity',
    label: 'Rarity',
    type: 'select',
    placeholder: 'All Rarities',
    options: rarities.map(r => ({ value: r, label: r })),
    icon: <Star className="w-3 h-3 mr-1" />,
  },
  {
    key: 'currency',
    label: 'Currency',
    type: 'select',
    placeholder: 'All Currencies',
    options: currencies.map(c => ({ value: c, label: c })),
  },
  {
    key: 'price',
    label: 'Price Range',
    type: 'range',
    min: 0,
  },
  {
    key: 'inStock',
    label: 'In Stock',
    type: 'checkbox',
  },
  {
    key: 'isNew',
    label: 'New Items',
    type: 'checkbox',
  },
  {
    key: 'hasDiscount',
    label: 'On Sale',
    type: 'checkbox',
  },
];

export const createEventFilterConfig = (eventTypes: string[]): FilterField[] => [
  {
    key: 'search',
    label: 'Search',
    type: 'text',
    placeholder: 'Search events...',
    icon: <Search className="w-3 h-3 mr-1" />,
  },
  {
    key: 'type',
    label: 'Event Type',
    type: 'select',
    placeholder: 'All Types',
    options: eventTypes.map(t => ({ value: t, label: t })),
    icon: <Tag className="w-3 h-3 mr-1" />,
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
    icon: <Shield className="w-3 h-3 mr-1" />,
  },
];

export const createGachaFilterConfig = (types: string[], statuses: string[], versions: string[] = []): FilterField[] => [
  {
    key: 'search',
    label: 'Search',
    type: 'text',
    placeholder: 'Search gacha...',
    icon: <Search className="w-3 h-3 mr-1" />,
  },
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    placeholder: 'All Types',
    options: types.map(t => ({ value: t, label: t })),
    icon: <Tag className="w-3 h-3 mr-1" />,
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'All Status',
    options: statuses.map(s => ({ value: s, label: s })),
    icon: <Shield className="w-3 h-3 mr-1" />,
  },
  {
    key: 'version',
    label: 'Version',
    type: 'select',
    placeholder: 'All Versions',
    options: versions.map(v => ({ value: v, label: v })),
    icon: <Calendar className="w-3 h-3 mr-1" />,
  },
];

export const createSkillFilterConfig = (skillTypes: string[], targets: string[]): FilterField[] => [
  {
    key: 'search',
    label: 'Search',
    type: 'text',
    placeholder: 'Search skills in all languages...',
    icon: <Search className="w-3 h-3 mr-1" />,
  },
  {
    key: 'type',
    label: 'Skill Type',
    type: 'select',
    placeholder: 'All Types',
    options: skillTypes.map(t => ({ value: t, label: t })),
    icon: <Tag className="w-3 h-3 mr-1" />,
  },
  {
    key: 'target',
    label: 'Target',
    type: 'select',
    placeholder: 'All Targets',
    options: targets.map(t => ({ value: t, label: t })),
  },
];

// Common sort options for different page types
export const accessorySortOptions: SortOption[] = [
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
  { key: 'rarity', label: 'Rarity' },
  { key: 'total', label: 'Total Power' },
];

export const swimsuitSortOptions: SortOption[] = [
  { key: 'name', label: 'Name' },
  { key: 'character', label: 'Character' },
  { key: 'rarity', label: 'Rarity' },
  { key: 'total', label: 'Total Power' },
  { key: 'release', label: 'Release Date' },
];

export const girlSortOptions: SortOption[] = [
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
  { key: 'level', label: 'Level' },
  { key: 'total', label: 'Total Power' },
];

export const shopSortOptions: SortOption[] = [
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
  { key: 'rarity', label: 'Rarity' },
  { key: 'price', label: 'Price' },
];

export const eventSortOptions: SortOption[] = [
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'endDate', label: 'End Date' },
];

export const gachaSortOptions: SortOption[] = [
  { key: 'name', label: 'Name' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'endDate', label: 'End Date' },
];

export const skillSortOptions: SortOption[] = [
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
  { key: 'target', label: 'Target' },
  { key: 'cooldown', label: 'Cooldown' },
];

export const bromideSortOptions: SortOption[] = [
  { key: 'name', label: 'Name' },
  { key: 'type', label: 'Type' },
  { key: 'rarity', label: 'Rarity' },
  { key: 'character', label: 'Character' },
  { key: 'source', label: 'Source' },
  { key: 'id', label: 'ID' },
];

export const createDecorBromideFilterConfig = (types: string[], rarities: string[], characters: string[], sources: string[], versions: string[] = []): FilterField[] => [
  {
    key: 'search',
    label: 'Search',
    type: 'text',
    placeholder: 'Search bromides and decorations in all languages...',
    icon: <Search className="w-3 h-3 mr-1" />,
  },
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    placeholder: 'All Types',
    options: types.map(t => ({ value: t, label: t })),
    icon: <Tag className="w-3 h-3 mr-1" />,
  },
  {
    key: 'rarity',
    label: 'Rarity',
    type: 'select',
    placeholder: 'All Rarities',
    options: rarities.map(r => ({ value: r, label: r })),
    icon: <Star className="w-3 h-3 mr-1" />,
  },
  {
    key: 'character',
    label: 'Character',
    type: 'select',
    placeholder: 'All Characters',
    options: characters.map(c => ({ value: c, label: c })),
    icon: <Tag className="w-3 h-3 mr-1" />,
  },
  {
    key: 'source',
    label: 'Source',
    type: 'select',
    placeholder: 'All Sources',
    options: sources.map(s => ({ value: s, label: s })),
    icon: <Calendar className="w-3 h-3 mr-1" />,
  },
  {
    key: 'version',
    label: 'Version',
    type: 'select',
    placeholder: 'All Versions',
    options: versions.map(v => ({ value: v, label: v })),
    icon: <Calendar className="w-3 h-3 mr-1" />,
  },
  {
    key: 'hasEffects',
    label: 'Has Effects',
    type: 'checkbox',
  },
  {
    key: 'hasCharacter',
    label: 'Has Character',
    type: 'checkbox',
  },
];

export const createMemoriesFilterConfig = (types: string[], characters: string[], versions: string[] = []): FilterField[] => [
  {
    key: 'search',
    label: 'Search',
    type: 'text',
    placeholder: 'Search memories in all languages...',
    icon: <Search className="w-3 h-3 mr-1" />,
  },
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    placeholder: 'All Types',
    options: types.map(t => ({ value: t, label: t })),
    icon: <Tag className="w-3 h-3 mr-1" />,
  },
  {
    key: 'character',
    label: 'Character',
    type: 'select',
    placeholder: 'All Characters',
    options: characters.map(c => ({ value: c, label: c })),
    icon: <Tag className="w-3 h-3 mr-1" />,
  },
  {
    key: 'version',
    label: 'Version',
    type: 'select',
    placeholder: 'All Versions',
    options: versions.map(v => ({ value: v, label: v })),
    icon: <Calendar className="w-3 h-3 mr-1" />,
  },
  {
    key: 'favorite',
    label: 'Favorites Only',
    type: 'checkbox',
  },
];

export const createFestivalFilterConfig = (types: string[], statuses: string[], versions: string[] = []): FilterField[] => [
  {
    key: 'search',
    label: 'Search',
    type: 'text',
    placeholder: 'Search festivals in all languages...',
    icon: <Search className="w-3 h-3 mr-1" />,
  },
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    placeholder: 'All Types',
    options: types.map(t => ({ value: t, label: t })),
    icon: <Tag className="w-3 h-3 mr-1" />,
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    placeholder: 'All Status',
    options: statuses.map(s => ({ value: s, label: s })),
    icon: <Shield className="w-3 h-3 mr-1" />,
  },
  {
    key: 'version',
    label: 'Version',
    type: 'select',
    placeholder: 'All Versions',
    options: versions.map(v => ({ value: v, label: v })),
    icon: <Calendar className="w-3 h-3 mr-1" />,
  },
]; 