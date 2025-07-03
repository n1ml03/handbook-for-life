import { Document, UpdateLog, Character, Swimsuit, Skill, Event, Bromide, DashboardOverviewResponse, DashboardCharacterStatsResponse } from '@/types';

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

  // Remove Content-Type for FormData to let browser set it with boundary
  if (options.body instanceof FormData) {
    const headers = { ...config.headers };
    delete (headers as any)['Content-Type'];
    config.headers = headers;
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Handle backend error response format: { success: false, error: string, errorId?: string, timestamp: string }
      throw new ApiError(
        errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    const data = await response.json();
    return data;
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
  async createDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>, jsonContent?: any): Promise<Document> {
    // Convert frontend document format to backend format
    const backendDocument: any = {
      unique_key: document.unique_key,
      title_en: document.title_en,
      summary_en: document.summary_en,
    };

    // Handle content field conversion with validation
    if (jsonContent) {
      // If JSON content is provided, use it directly (preferred)
      backendDocument.content_json_en = jsonContent;
    } else if (document.content_json_en !== undefined) {
      // If content_json_en is provided directly, use it
      backendDocument.content_json_en = document.content_json_en;
    } else if (document.content !== undefined) {
      // If only HTML content is provided, validate and convert it
      backendDocument.content_json_en = this.validateAndFormatContent(document.content);
    }

    // Handle screenshots data
    if (document.screenshots_data) {
      backendDocument.screenshots_data = document.screenshots_data;
    }

    return apiRequest('/documents', {
      method: 'POST',
      body: JSON.stringify(backendDocument),
    });
  },

  // Validate and format content for TipTap
  validateAndFormatContent(content: string): any {
    if (!content || typeof content !== 'string') {
      throw new Error('Content must be a non-empty string');
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      throw new Error('Content cannot be empty or contain only whitespace');
    }

    try {
      // Try to parse as JSON first (TipTap format)
      const parsed = JSON.parse(trimmedContent);

      // Validate TipTap document structure
      if (!parsed.type || parsed.type !== 'doc') {
        throw new Error('Invalid TipTap document structure: missing or invalid type');
      }

      if (!Array.isArray(parsed.content)) {
        throw new Error('Invalid TipTap document structure: content must be an array');
      }

      return parsed;
    } catch (parseError) {
      // If it's not JSON, check if it's HTML (from TipTap editor)
      if (trimmedContent.includes('<') && trimmedContent.includes('>')) {
        // It's HTML content from TipTap editor
        // For now, create a basic TipTap document structure with HTML content
        // In a real implementation, you might want to parse HTML to TipTap JSON
        if (trimmedContent.length > 50000) {
          throw new Error('Content is too long (maximum 50,000 characters)');
        }

        // Create a basic TipTap document with the HTML content as text
        // This is a simplified approach - ideally we'd parse HTML to proper TipTap nodes
        return {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: trimmedContent.replace(/<[^>]*>/g, '') // Strip HTML tags for now
                }
              ]
            }
          ]
        };
      } else {
        // It's plain text, create a basic TipTap document
        if (trimmedContent.length > 50000) {
          throw new Error('Content is too long (maximum 50,000 characters)');
        }

        return {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: trimmedContent
                }
              ]
            }
          ]
        };
      }
    }
  },

  // Update an existing document
  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    // Filter and transform the updates to match backend schema
    const backendUpdates: any = {};
    
    // Map frontend fields to backend schema fields
    if (updates.unique_key !== undefined) backendUpdates.unique_key = updates.unique_key;
    if (updates.title_en !== undefined) backendUpdates.title_en = updates.title_en;
    if (updates.title !== undefined) backendUpdates.title_en = updates.title; // Map title to title_en
    if (updates.summary_en !== undefined) backendUpdates.summary_en = updates.summary_en;
    if (updates.content_json_en !== undefined) backendUpdates.content_json_en = updates.content_json_en;
    
    // Handle content field conversion with validation
    if (updates.content !== undefined && updates.content_json_en === undefined) {
      // If content is provided but content_json_en is not, validate and convert it
      backendUpdates.content_json_en = this.validateAndFormatContent(updates.content);
    }
    
    // Handle screenshots conversion from frontend format to backend format
    if (updates.screenshots !== undefined && Array.isArray(updates.screenshots)) {
      // Filter out any invalid URLs and ensure they are proper URLs
      backendUpdates.screenshots = updates.screenshots
        .filter(url => url && typeof url === 'string' && url.trim() !== '')
        .map(url => {
          // If it's already a proper URL, return it
          if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
            return url;
          }
          // If it's a relative path, convert to absolute URL
          if (url.startsWith('/')) {
            return `${window.location.origin}${url}`;
          }
          // If it's a filename without protocol, treat as relative
          return `${window.location.origin}/uploads/${url}`;
        })
        .filter(url => {
          // Final validation to ensure it's a valid URL format
          try {
            new URL(url);
            return true;
          } catch {
            return false;
          }
        });
    }
    
    // Remove any undefined values
    Object.keys(backendUpdates).forEach(key => {
      if (backendUpdates[key] === undefined) {
        delete backendUpdates[key];
      }
    });

    return apiRequest(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(backendUpdates),
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
  async getCharacter(id: string): Promise<{ data: Character }> {
    return apiRequest(`/characters/${id}`);
  },

  // Get character skills
  async getCharacterSkills(id: string): Promise<Skill[]> {
    const response = await apiRequest<{ success: boolean; data: Skill[]; pagination: any }>(`/characters/${id}/skills`);
    return response.data;
  },

  // Get character swimsuits
  async getCharacterSwimsuits(id: string): Promise<Swimsuit[]> {
    const response = await apiRequest<{ success: boolean; data: Swimsuit[]; pagination: any }>(`/characters/${id}/swimsuits`);
    return response.data;
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
    search?: string;
    category?: string;
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

  // Search skills
  async searchSkills(query: string, params?: {
    page?: number;
    limit?: number;
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: Skill[]; pagination: any }> {
    const searchParams = new URLSearchParams();
    searchParams.append('q', query); // Backend expects 'q' parameter
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return apiRequest(`/skills/search?${queryString}`);
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

  // Search events
  async searchEvents(query: string, params?: {
    page?: number;
    limit?: number;
    type?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: Event[]; pagination: any }> {
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
    return apiRequest(`/events/search?${queryString}`);
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
    search?: string;
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

// Shop Listings API
export const shopListingsApi = {
  // Get all shop listings
  async getShopListings(params?: {
    page?: number;
    limit?: number;
    search?: string;
    shop_type?: string;
    rarity?: string;
    item_category?: string;
    available_only?: boolean;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
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
    return apiRequest(`/shop-listings${queryString ? `?${queryString}` : ''}`);
  },

  // Get a specific shop listing by ID
  async getShopListing(id: string): Promise<any> {
    return apiRequest(`/shop-listings/${id}`);
  },

  // Get active shop listings
  async getActiveShopListings(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
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
    return apiRequest(`/shop-listings/active${queryString ? `?${queryString}` : ''}`);
  },

  // Get shop listings by type
  async getShopListingsByType(shopType: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
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
    return apiRequest(`/shop-listings/type/${shopType}${queryString ? `?${queryString}` : ''}`);
  },

  // Get shop statistics
  async getShopStatistics(): Promise<any> {
    return apiRequest('/shop-listings/statistics');
  },

  // Get shop summary
  async getShopSummary(): Promise<any> {
    return apiRequest('/shop-listings/summary');
  },
};

// Gachas API
export const gachasApi = {
  // Get all gachas
  async getGachas(params?: {
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
    return apiRequest(`/gachas${queryString ? `?${queryString}` : ''}`);
  },

  // Get active gachas
  async getActiveGachas(params?: {
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
    return apiRequest(`/gachas/active${queryString ? `?${queryString}` : ''}`);
  },

  // Get gacha by ID
  async getGacha(id: string): Promise<any> {
    return apiRequest(`/gachas/${id}`);
  },

  // Get gacha by unique key
  async getGachaByKey(uniqueKey: string): Promise<any> {
    return apiRequest(`/gachas/key/${uniqueKey}`);
  },

  // Get gachas by subtype
  async getGachasBySubtype(subtype: string, params?: {
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
    return apiRequest(`/gachas/subtype/${subtype}${queryString ? `?${queryString}` : ''}`);
  },

  // Get gacha pool
  async getGachaPool(id: string, params?: {
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
    return apiRequest(`/gachas/${id}/pool${queryString ? `?${queryString}` : ''}`);
  },

  // Get featured items
  async getFeaturedItems(id: string, params?: {
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
    return apiRequest(`/gachas/${id}/featured${queryString ? `?${queryString}` : ''}`);
  },

  // Search gachas
  async searchGachas(query: string, params?: {
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
    return apiRequest(`/gachas/search?${queryString}`);
  },

  // Validate gacha rates
  async validateGachaRates(id: string): Promise<any> {
    return apiRequest(`/gachas/${id}/validate-rates`);
  },

  // Create gacha
  async createGacha(gacha: any): Promise<any> {
    return apiRequest('/gachas', {
      method: 'POST',
      body: JSON.stringify(gacha),
    });
  },

  // Update gacha
  async updateGacha(id: string, updates: any): Promise<any> {
    return apiRequest(`/gachas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete gacha
  async deleteGacha(id: string): Promise<void> {
    return apiRequest(`/gachas/${id}`, {
      method: 'DELETE',
    });
  },

  // Add pool item
  async addPoolItem(id: string, poolItem: any): Promise<any> {
    return apiRequest(`/gachas/${id}/pool`, {
      method: 'POST',
      body: JSON.stringify(poolItem),
    });
  },

  // Bulk add pool items
  async bulkAddPoolItems(id: string, items: any[]): Promise<any> {
    return apiRequest(`/gachas/${id}/pool/bulk`, {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },

  // Remove pool item
  async removePoolItem(id: string, poolId: string): Promise<void> {
    return apiRequest(`/gachas/${id}/pool/${poolId}`, {
      method: 'DELETE',
    });
  },
};

// Statistics API
export const statsApi = {
  // Get system statistics for admin dashboard
  async getSystemStats(): Promise<any> {
    return apiRequest('/health/stats');
  },
};

// File Upload API
export const uploadApi = {
  // Upload screenshot (matches backend /upload/screenshot endpoint)
  async uploadScreenshot(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest('/upload/screenshot', {
      method: 'POST',
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
      },
      body: formData,
    });
  },

  // Upload single file
  async uploadFile(file: File, category?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (category) {
      formData.append('category', category);
    }

    return apiRequest('/upload', {
      method: 'POST',
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
      },
      body: formData,
    });
  },

  // Upload multiple files
  async uploadMultipleFiles(files: File[], category?: string): Promise<any> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append(`files`, file);
    });
    if (category) {
      formData.append('category', category);
    }

    return apiRequest('/upload/bulk', {
      method: 'POST',
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
      },
      body: formData,
    });
  },

  // Upload CSV file for import
  async uploadCSV(file: File, entity: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entity', entity);

    return apiRequest('/upload/csv', {
      method: 'POST',
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
      },
      body: formData,
    });
  },

  // Get upload history
  async getUploadHistory(params?: {
    page?: number;
    limit?: number;
    category?: string;
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
    return apiRequest(`/upload/history${queryString ? `?${queryString}` : ''}`);
  },

  // Delete uploaded file
  async deleteFile(filename: string): Promise<void> {
    return apiRequest(`/upload/${filename}`, {
      method: 'DELETE',
    });
  },
};

// Dashboard API
export const dashboardApi = {
  getOverview: () => apiRequest<{ success: true; data: DashboardOverviewResponse; message?: string; timestamp: string }>('/dashboard/overview'),
  getCharacterStats: () => apiRequest<{ success: true; data: DashboardCharacterStatsResponse; message?: string; timestamp: string }>('/dashboard/character-stats'),
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
  shopListingsApi,
  gachasApi,
  statsApi,
  uploadApi,
  dashboardApi
};