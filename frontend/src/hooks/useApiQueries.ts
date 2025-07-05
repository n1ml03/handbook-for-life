import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  charactersApi,
  swimsuitsApi,
  skillsApi,
  itemsApi,
  eventsApi,
  bromidesApi,
  dashboardApi
} from '@/services/api';


// Query keys for consistent cache management
export const queryKeys = {
  characters: ['characters'] as const,
  character: (id: string) => ['characters', id] as const,
  swimsuits: ['swimsuits'] as const,
  swimsuit: (id: string) => ['swimsuits', id] as const,
  skills: ['skills'] as const,
  skill: (id: string) => ['skills', id] as const,
  items: ['items'] as const,
  item: (id: string) => ['items', id] as const,
  events: ['events'] as const,
  event: (id: string) => ['events', id] as const,
  bromides: ['bromides'] as const,
  bromide: (id: string) => ['bromides', id] as const,
  dashboard: {
    overview: ['dashboard', 'overview'] as const,
    characterStats: ['dashboard', 'character-stats'] as const,
  },
};

// Characters hooks
export function useCharacters(params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: [...queryKeys.characters, params],
    queryFn: () => charactersApi.getCharacters(params),
    staleTime: 5 * 60 * 1000, // 5 minutes for static data
  });
}

export function useCharacter(id: string) {
  return useQuery({
    queryKey: queryKeys.character(id),
    queryFn: () => charactersApi.getCharacter(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Swimsuits hooks
export function useSwimsuits(params?: {
  page?: number;
  limit?: number;
  characterId?: number;
  rarity?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: [...queryKeys.swimsuits, params],
    queryFn: () => swimsuitsApi.getSwimsuits(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSwimsuit(id: string) {
  return useQuery({
    queryKey: queryKeys.swimsuit(id),
    queryFn: () => swimsuitsApi.getSwimsuit(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Skills hooks
export function useSkills(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: [...queryKeys.skills, params],
    queryFn: () => skillsApi.getSkills(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSkill(id: string) {
  return useQuery({
    queryKey: queryKeys.skill(id),
    queryFn: () => skillsApi.getSkill(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Items hooks
export function useItems(params?: {
  page?: number;
  limit?: number;
  category?: string;
  rarity?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: [...queryKeys.items, params],
    queryFn: () => itemsApi.getItems(params),
    staleTime: 5 * 60 * 1000,
  });
}

// Events hooks (shorter cache time as they change more frequently)
export function useEvents(params?: {
  page?: number;
  limit?: number;
  type?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: [...queryKeys.events, params],
    queryFn: () => eventsApi.getEvents(params),
    staleTime: 2 * 60 * 1000, // 2 minutes for dynamic data
  });
}

// Bromides hooks
export function useBromides(params?: {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  return useQuery({
    queryKey: [...queryKeys.bromides, params],
    queryFn: () => bromidesApi.getBromides(params),
    staleTime: 5 * 60 * 1000,
  });
}

// Mutation hooks with cache invalidation
export function useCreateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: charactersApi.createCharacter,
    onSuccess: () => {
      // Invalidate and refetch characters list
      queryClient.invalidateQueries({ queryKey: queryKeys.characters });
    },
  });
}

export function useUpdateCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      charactersApi.updateCharacter(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific character and characters list
      queryClient.invalidateQueries({ queryKey: queryKeys.character(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.characters });
    },
  });
}

export function useDeleteCharacter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: charactersApi.deleteCharacter,
    onSuccess: (_, id) => {
      // Remove specific character from cache and invalidate list
      queryClient.removeQueries({ queryKey: queryKeys.character(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.characters });
    },
  });
}

export function useCreateSwimsuit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: swimsuitsApi.createSwimsuit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.swimsuits });
    },
  });
}

export function useUpdateSwimsuit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      swimsuitsApi.updateSwimsuit(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.swimsuit(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.swimsuits });
    },
  });
}

export function useDeleteSwimsuit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: swimsuitsApi.deleteSwimsuit,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.swimsuit(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.swimsuits });
    },
  });
}

// Dashboard hooks
export function useDashboardOverview() {
  return useQuery({
    queryKey: queryKeys.dashboard.overview,
    queryFn: () => dashboardApi.getOverview(),
    staleTime: 2 * 60 * 1000, // 2 minutes for dashboard data
  });
}

export function useDashboardCharacterStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.characterStats,
    queryFn: () => dashboardApi.getCharacterStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes for stats data
  });
}
