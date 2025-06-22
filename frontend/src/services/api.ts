import { Document, UpdateLog, Character, Swimsuit, Skill, Accessory, Event, Bromide, Girl, Memory } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data.data || data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error', 0);
  }
}

// Documents API
export const documentsApi = {
  // Get all documents with optional filtering
  async getDocuments(params?: {
    page?: number;
    limit?: number;
    category?: string;
    published?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: Document[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return apiRequest(`/documents${queryString ? `?${queryString}` : ''}`);
  },

  // Get a specific document by ID
  async getDocument(id: string): Promise<Document> {
    return apiRequest(`/documents/${id}`);
  },

  // Create a new document
  async createDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document> {
    return apiRequest('/documents', {
      method: 'POST',
      body: JSON.stringify(document),
    });
  },

  // Update an existing document
  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    return apiRequest(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete a document
  async deleteDocument(id: string): Promise<void> {
    return apiRequest(`/documents/${id}`, {
      method: 'DELETE',
    });
  },

  // Get documents by category
  async getDocumentsByCategory(category: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: Document[]; pagination: any }> {
    return this.getDocuments({ ...params, category });
  },
};

// Update Logs API
export const updateLogsApi = {
  // Get all update logs
  async getUpdateLogs(params?: {
    page?: number;
    limit?: number;
    published?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: UpdateLog[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return apiRequest(`/update-logs${queryString ? `?${queryString}` : ''}`);
  },

  // Get only published update logs
  async getPublishedUpdateLogs(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: UpdateLog[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return apiRequest(`/update-logs/published${queryString ? `?${queryString}` : ''}`);
  },

  // Get a specific update log by ID
  async getUpdateLog(id: string): Promise<UpdateLog> {
    return apiRequest(`/update-logs/${id}`);
  },

  // Create a new update log
  async createUpdateLog(updateLog: Omit<UpdateLog, 'id' | 'createdAt' | 'updatedAt'>): Promise<UpdateLog> {
    return apiRequest('/update-logs', {
      method: 'POST',
      body: JSON.stringify(updateLog),
    });
  },

  // Update an existing update log
  async updateUpdateLog(id: string, updates: Partial<UpdateLog>): Promise<UpdateLog> {
    return apiRequest(`/update-logs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete an update log
  async deleteUpdateLog(id: string): Promise<void> {
    return apiRequest(`/update-logs/${id}`, {
      method: 'DELETE',
    });
  },
};

// Characters API
export const charactersApi = {
  // Get all characters
  async getCharacters(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: Character[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return apiRequest(`/characters${queryString ? `?${queryString}` : ''}`);
  },

  // Get a specific character by ID
  async getCharacter(id: string): Promise<Character> {
    return apiRequest(`/characters/${id}`);
  },

  // Get character skills
  async getCharacterSkills(id: string): Promise<Skill[]> {
    return apiRequest(`/characters/${id}/skills`);
  },

  // Get character swimsuits
  async getCharacterSwimsuits(id: string): Promise<Swimsuit[]> {
    return apiRequest(`/characters/${id}/swimsuits`);
  },

  // Create a new character
  async createCharacter(character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>): Promise<Character> {
    return apiRequest('/characters', {
      method: 'POST',
      body: JSON.stringify(character),
    });
  },

  // Update an existing character
  async updateCharacter(id: string, updates: Partial<Character>): Promise<Character> {
    return apiRequest(`/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete a character
  async deleteCharacter(id: string): Promise<void> {
    return apiRequest(`/characters/${id}`, {
      method: 'DELETE',
    });
  },
};

// Swimsuits API
export const swimsuitsApi = {
  // Get all swimsuits
  async getSwimsuits(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: Swimsuit[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return apiRequest(`/swimsuits${queryString ? `?${queryString}` : ''}`);
  },

  // Get a specific swimsuit by ID
  async getSwimsuit(id: string): Promise<Swimsuit> {
    return apiRequest(`/swimsuits/${id}`);
  },

  // Create a new swimsuit
  async createSwimsuit(swimsuit: Omit<Swimsuit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Swimsuit> {
    return apiRequest('/swimsuits', {
      method: 'POST',
      body: JSON.stringify(swimsuit),
    });
  },

  // Update an existing swimsuit
  async updateSwimsuit(id: string, updates: Partial<Swimsuit>): Promise<Swimsuit> {
    return apiRequest(`/swimsuits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete a swimsuit
  async deleteSwimsuit(id: string): Promise<void> {
    return apiRequest(`/swimsuits/${id}`, {
      method: 'DELETE',
    });
  },
};

// Skills API
export const skillsApi = {
  // Get all skills
  async getSkills(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: Skill[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return apiRequest(`/skills${queryString ? `?${queryString}` : ''}`);
  },

  // Get a specific skill by ID
  async getSkill(id: string): Promise<Skill> {
    return apiRequest(`/skills/${id}`);
  },

  // Create a new skill
  async createSkill(skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>): Promise<Skill> {
    return apiRequest('/skills', {
      method: 'POST',
      body: JSON.stringify(skill),
    });
  },

  // Update an existing skill
  async updateSkill(id: string, updates: Partial<Skill>): Promise<Skill> {
    return apiRequest(`/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete a skill
  async deleteSkill(id: string): Promise<void> {
    return apiRequest(`/skills/${id}`, {
      method: 'DELETE',
    });
  },
};

// Events API
export const eventsApi = {
  // Get all events
  async getEvents(params?: {
    page?: number;
    limit?: number;
    type?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: Event[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return apiRequest(`/events${queryString ? `?${queryString}` : ''}`);
  },

  // Get a specific event by ID
  async getEvent(id: string): Promise<Event> {
    return apiRequest(`/events/${id}`);
  },

  // Create a new event
  async createEvent(event: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>): Promise<Event> {
    return apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },

  // Update an existing event
  async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
    return apiRequest(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete an event
  async deleteEvent(id: string): Promise<void> {
    return apiRequest(`/events/${id}`, {
      method: 'DELETE',
    });
  },
};

// Items API (replaces accessories and shop items)
export const itemsApi = {
  // Get all items
  async getItems(params?: {
    page?: number;
    limit?: number;
    category?: string;
    rarity?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: any[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return apiRequest(`/items${queryString ? `?${queryString}` : ''}`);
  },

  // Get a specific item by ID
  async getItem(id: string): Promise<any> {
    return apiRequest(`/items/${id}`);
  },

  // Get item by unique key
  async getItemByKey(uniqueKey: string): Promise<any> {
    return apiRequest(`/items/key/${uniqueKey}`);
  },

  // Get currency items
  async getCurrencyItems(): Promise<any[]> {
    return apiRequest('/items/currency');
  },

  // Search items
  async searchItems(query: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: any[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return apiRequest(`/items/search?${queryString}`);
  },

  // Create a new item
  async createItem(item: any): Promise<any> {
    return apiRequest('/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  // Update an existing item
  async updateItem(id: string, updates: any): Promise<any> {
    return apiRequest(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete an item
  async deleteItem(id: string): Promise<void> {
    return apiRequest(`/items/${id}`, {
      method: 'DELETE',
    });
  },
};

// Episodes API (new)
export const episodesApi = {
  // Get all episodes
  async getEpisodes(params?: {
    page?: number;
    limit?: number;
    type?: string;
    entityType?: string;
    entityId?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: any[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return apiRequest(`/episodes${queryString ? `?${queryString}` : ''}`);
  },

  // Get a specific episode by ID
  async getEpisode(id: string): Promise<any> {
    return apiRequest(`/episodes/${id}`);
  },

  // Get episode by unique key
  async getEpisodeByKey(uniqueKey: string): Promise<any> {
    return apiRequest(`/episodes/key/${uniqueKey}`);
  },

  // Get main story episodes
  async getMainStoryEpisodes(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: any[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return apiRequest(`/episodes/main-story${queryString ? `?${queryString}` : ''}`);
  },

  // Get character episodes
  async getCharacterEpisodes(characterId: number, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: any[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return apiRequest(`/episodes/character/${characterId}${queryString ? `?${queryString}` : ''}`);
  },

  // Search episodes
  async searchEpisodes(query: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: any[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return apiRequest(`/episodes/search?${queryString}`);
  },

  // Create a new episode
  async createEpisode(episode: any): Promise<any> {
    return apiRequest('/episodes', {
      method: 'POST',
      body: JSON.stringify(episode),
    });
  },

  // Update an existing episode
  async updateEpisode(id: string, updates: any): Promise<any> {
    return apiRequest(`/episodes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete an episode
  async deleteEpisode(id: string): Promise<void> {
    return apiRequest(`/episodes/${id}`, {
      method: 'DELETE',
    });
  },
};

// Bromides API
export const bromidesApi = {
  // Get all bromides
  async getBromides(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: Bromide[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return apiRequest(`/bromides${queryString ? `?${queryString}` : ''}`);
  },

  // Get a specific bromide by ID
  async getBromide(id: string): Promise<Bromide> {
    return apiRequest(`/bromides/${id}`);
  },

  // Create a new bromide
  async createBromide(bromide: Omit<Bromide, 'id' | 'createdAt' | 'updatedAt'>): Promise<Bromide> {
    return apiRequest('/bromides', {
      method: 'POST',
      body: JSON.stringify(bromide),
    });
  },

  // Update an existing bromide
  async updateBromide(id: string, updates: Partial<Bromide>): Promise<Bromide> {
    return apiRequest(`/bromides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete a bromide
  async deleteBromide(id: string): Promise<void> {
    return apiRequest(`/bromides/${id}`, {
      method: 'DELETE',
    });
  },
};

// Legacy APIs for backward compatibility (will be deprecated)
// Accessories API - now redirects to items
export const accessoriesApi = {
  async getAccessories(params?: any): Promise<{ data: Accessory[]; pagination: any }> {
    // Map to items API with category filter for accessories
    return itemsApi.getItems({ ...params, category: 'accessory' });
  },

  async getAccessory(id: string): Promise<Accessory> {
    return itemsApi.getItem(id);
  },

  async getAccessoryGirls(_id: string): Promise<Character[]> {
    // This might need special handling or removal
    return [];
  },

  async createAccessory(accessory: any): Promise<Accessory> {
    return itemsApi.createItem({ ...accessory, category: 'accessory' });
  },

  async updateAccessory(id: string, updates: any): Promise<Accessory> {
    return itemsApi.updateItem(id, updates);
  },

  async deleteAccessory(id: string): Promise<void> {
    return itemsApi.deleteItem(id);
  },
};

// Girls API - now redirects to characters
export const girlsApi = {
  async getGirls(params?: any): Promise<{ data: Girl[]; pagination: any }> {
    return charactersApi.getCharacters(params) as any;
  },

  async getGirl(id: string): Promise<Girl> {
    return charactersApi.getCharacter(id) as any;
  },

  async getGirlSkills(id: string): Promise<Skill[]> {
    return charactersApi.getCharacterSkills(id);
  },

  async getGirlSwimsuits(id: string): Promise<Swimsuit[]> {
    return charactersApi.getCharacterSwimsuits(id);
  },
};

// Memories API - deprecated, no backend support
export const memoriesApi = {
  async getMemories(_params?: any): Promise<{ data: Memory[]; pagination: any }> {
    console.warn('Memories API is deprecated - no backend support');
    return { data: [], pagination: { total: 0, totalPages: 0, currentPage: 1, limit: 10 } };
  },

  async getMemory(_id: string): Promise<Memory> {
    throw new Error('Memories API is deprecated - no backend support');
  },

  async createMemory(_memory: any): Promise<Memory> {
    throw new Error('Memories API is deprecated - no backend support');
  },

  async updateMemory(_id: string, _updates: any): Promise<Memory> {
    throw new Error('Memories API is deprecated - no backend support');
  },

  async toggleMemoryFavorite(_id: string, _favorite: boolean): Promise<Memory> {
    throw new Error('Memories API is deprecated - no backend support');
  },

  async deleteMemory(_id: string): Promise<void> {
    throw new Error('Memories API is deprecated - no backend support');
  },
};

// Shop Items API - now redirects to items
export const shopItemsApi = {
  async getShopItems(params?: any): Promise<{ data: any[]; pagination: any }> {
    // Map shop-specific parameters to items API
    const itemsParams = {
      page: params?.page,
      limit: params?.limit,
      sortBy: params?.sort,
      sortOrder: params?.order,
      category: params?.type,
      rarity: params?.rarity,
    };
    return itemsApi.getItems(itemsParams);
  },

  async getShopItem(id: string): Promise<any> {
    return itemsApi.getItem(id);
  },

  async createShopItem(shopItem: any): Promise<any> {
    return itemsApi.createItem(shopItem);
  },

  async updateShopItem(id: string, updates: any): Promise<any> {
    return itemsApi.updateItem(id, updates);
  },

  async deleteShopItem(id: string): Promise<void> {
    return itemsApi.deleteItem(id);
  },
};

export default { 
  documentsApi, 
  updateLogsApi, 
  charactersApi, 
  swimsuitsApi, 
  skillsApi, 
  eventsApi,
  bromidesApi,
  itemsApi,
  episodesApi,
  // Legacy APIs
  accessoriesApi,
  girlsApi,
  memoriesApi,
  shopItemsApi
}; 