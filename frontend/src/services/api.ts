import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { Document, UpdateLog, Character, Swimsuit, Skill, Event, Bromide, DashboardOverviewResponse, DashboardCharacterStatsResponse } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

// Create Axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging and authentication
apiClient.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and logging
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error: AxiosError) => {
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error);
    }

    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const errorData = error.response.data as any;
      throw new ApiError(
        errorData?.error || errorData?.message || `HTTP ${error.response.status}: ${error.response.statusText}`,
        error.response.status
      );
    } else if (error.request) {
      // Request was made but no response received
      throw new ApiError('Network error - no response received', 0);
    } else {
      // Something else happened
      throw new ApiError(error.message || 'Request setup error', 0);
    }
  }
);

// Enhanced API request function using Axios
async function apiRequest<T>(endpoint: string, options: AxiosRequestConfig = {}): Promise<T> {
  try {
    const response = await apiClient.request<T>({
      url: endpoint,
      ...options,
    });
    return response.data;
  } catch (error) {
    // Re-throw ApiError instances
    if (error instanceof ApiError) {
      throw error;
    }
    // This shouldn't happen due to interceptor, but just in case
    throw new ApiError('Unexpected error', 500);
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
    return apiRequest('/documents', {
      method: 'GET',
      params,
    });
  },

  // Get a specific document by ID
  async getDocument(id: string): Promise<Document> {
    return apiRequest(`/documents/${id}`, {
      method: 'GET',
    });
  },

  // Create a new document
  async createDocument(document: Omit<Document, 'id' | 'created_at' | 'updated_at'>): Promise<Document> {
    return apiRequest('/documents', {
      method: 'POST',
      data: document,
    });
  },

  // Update an existing document
  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    return apiRequest(`/documents/${id}`, {
      method: 'PUT',
      data: updates,
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
    return apiRequest('/update-logs', {
      method: 'GET',
      params,
    });
  },

  // Get a specific update log by ID
  async getUpdateLog(id: string): Promise<UpdateLog> {
    return apiRequest(`/update-logs/${id}`, {
      method: 'GET',
    });
  },

  // Create a new update log
  async createUpdateLog(updateLog: Omit<UpdateLog, 'id' | 'created_at' | 'updated_at'>): Promise<UpdateLog> {
    return apiRequest('/update-logs', {
      method: 'POST',
      data: updateLog,
    });
  },

  // Update an existing update log
  async updateUpdateLog(id: string, updates: Partial<UpdateLog>): Promise<UpdateLog> {
    return apiRequest(`/update-logs/${id}`, {
      method: 'PUT',
      data: updates,
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
    return apiRequest('/characters', {
      method: 'GET',
      params,
    });
  },

  // Get a specific character by ID
  async getCharacter(id: string): Promise<{ data: Character }> {
    return apiRequest(`/characters/${id}`, {
      method: 'GET',
    });
  },

  // Get character skills
  async getCharacterSkills(id: string): Promise<Skill[]> {
    const response = await apiRequest<{ data: Skill[] }>(`/characters/${id}/skills`, {
      method: 'GET',
    });
    return response.data;
  },

  // Get character swimsuits
  async getCharacterSwimsuits(id: string): Promise<Swimsuit[]> {
    const response = await apiRequest<{ data: Swimsuit[] }>(`/characters/${id}/swimsuits`, {
      method: 'GET',
    });
    return response.data;
  },

  // Create a new character
  async createCharacter(character: Omit<Character, 'id' | 'created_at' | 'updated_at'>): Promise<Character> {
    return apiRequest('/characters', {
      method: 'POST',
      data: character,
    });
  },

  // Update an existing character
  async updateCharacter(id: string, updates: Partial<Character>): Promise<Character> {
    return apiRequest(`/characters/${id}`, {
      method: 'PUT',
      data: updates,
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
    return apiRequest('/swimsuits', {
      method: 'GET',
      params,
    });
  },

  // Get a specific swimsuit by ID
  async getSwimsuit(id: string): Promise<Swimsuit> {
    return apiRequest(`/swimsuits/${id}`);
  },

  // Create a new swimsuit
  async createSwimsuit(swimsuit: Omit<Swimsuit, 'id' | 'created_at' | 'updated_at'>): Promise<Swimsuit> {
    return apiRequest('/swimsuits', {
      method: 'POST',
      data: swimsuit,
    });
  },

  // Update an existing swimsuit
  async updateSwimsuit(id: string, updates: Partial<Swimsuit>): Promise<Swimsuit> {
    return apiRequest(`/swimsuits/${id}`, {
      method: 'PUT',
      data: updates,
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
    return apiRequest('/skills', {
      method: 'GET',
      params: params
    });
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
    return apiRequest('/skills/search', {
      method: 'GET',
      params: { q: query, ...params }
    });
  },

  // Create a new skill
  async createSkill(skill: Omit<Skill, 'id' | 'created_at' | 'updated_at'>): Promise<Skill> {
    return apiRequest('/skills', {
      method: 'POST',
      data: skill,
    });
  },

  // Update an existing skill
  async updateSkill(id: string, updates: Partial<Skill>): Promise<Skill> {
    return apiRequest(`/skills/${id}`, {
      method: 'PUT',
      data: updates,
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
    return apiRequest('/events', {
      method: 'GET',
      params: params
    });
  },

  // Get a specific event by ID
  async getEvent(id: string): Promise<Event> {
    return apiRequest(`/events/${id}`);
  },

  // Create a new event
  async createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
    return apiRequest('/events', {
      method: 'POST',
      data: event,
    });
  },

  // Update an existing event
  async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
    return apiRequest(`/events/${id}`, {
      method: 'PUT',
      data: updates,
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
    return apiRequest('/events/search', {
      method: 'GET',
      params: { q: query, ...params }
    });
  },

  // Delete an event
  async deleteEvent(id: string): Promise<void> {
    return apiRequest(`/events/${id}`, {
      method: 'DELETE',
    });
  },
};

// Items API
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
    return apiRequest('/items', {
      method: 'GET',
      params: params
    });
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
    const response = await apiRequest<{ data: any[] }>('/items?category=CURRENCY');
    return response.data;
  },

  // Search items
  async searchItems(query: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: any[]; pagination: any }> {
    return apiRequest('/items/search', {
      method: 'GET',
      params: { q: query, ...params }
    });
  },

  // Create a new item
  async createItem(item: any): Promise<any> {
    return apiRequest('/items', {
      method: 'POST',
      data: item,
    });
  },

  // Update an existing item
  async updateItem(id: string, updates: any): Promise<any> {
    return apiRequest(`/items/${id}`, {
      method: 'PUT',
      data: updates,
    });
  },

  // Delete an item
  async deleteItem(id: string): Promise<void> {
    return apiRequest(`/items/${id}`, {
      method: 'DELETE',
    });
  },
};

// Episodes API
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
    return apiRequest('/episodes', {
      method: 'GET',
      params: params
    });
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
    return apiRequest('/episodes/main-story', {
      method: 'GET',
      params: params
    });
  },

  // Get character episodes
  async getCharacterEpisodes(characterId: number, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: any[]; pagination: any }> {
    return apiRequest(`/episodes/character/${characterId}`, {
      method: 'GET',
      params: params
    });
  },

  // Search episodes
  async searchEpisodes(query: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: any[]; pagination: any }> {
    return apiRequest('/episodes/search', {
      method: 'GET',
      params: { q: query, ...params }
    });
  },

  // Create a new episode
  async createEpisode(episode: any): Promise<any> {
    return apiRequest('/episodes', {
      method: 'POST',
      data: episode,
    });
  },

  // Update an existing episode
  async updateEpisode(id: string, updates: any): Promise<any> {
    return apiRequest(`/episodes/${id}`, {
      method: 'PUT',
      data: updates,
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
    return apiRequest('/bromides', {
      method: 'GET',
      params: params
    });
  },

  // Get a specific bromide by ID
  async getBromide(id: string): Promise<Bromide> {
    return apiRequest(`/bromides/${id}`);
  },

  // Create a new bromide
  async createBromide(bromide: Omit<Bromide, 'id' | 'created_at' | 'updated_at'>): Promise<Bromide> {
    return apiRequest('/bromides', {
      method: 'POST',
      data: bromide,
    });
  },

  // Update an existing bromide
  async updateBromide(id: string, updates: Partial<Bromide>): Promise<Bromide> {
    return apiRequest(`/bromides/${id}`, {
      method: 'PUT',
      data: updates,
    });
  },

  // Delete a bromide
  async deleteBromide(id: string): Promise<void> {
    return apiRequest(`/bromides/${id}`, {
      method: 'DELETE',
    });
  },
};

// Shop API
export const shopApi = {
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
    return apiRequest('/shop-listings', {
      method: 'GET',
      params: params
    });
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
    return apiRequest('/shop-listings/active', {
      method: 'GET',
      params: params
    });
  },

  // Get shop listings by type
  async getShopListingsByType(shopType: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortDirection?: 'asc' | 'desc';
  }): Promise<{ data: any[]; pagination: any }> {
    return apiRequest(`/shop-listings/type/${shopType}`, {
      method: 'GET',
      params: params
    });
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
    return apiRequest('/gachas', {
      method: 'GET',
      params: params
    });
  },

  // Get active gachas
  async getActiveGachas(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: any[]; pagination: any }> {
    return apiRequest('/gachas/active', {
      method: 'GET',
      params: params
    });
  },

  // Get a specific gacha by ID
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
    return apiRequest(`/gachas/subtype/${subtype}`, {
      method: 'GET',
      params: params
    });
  },

  // Get gacha pool
  async getGachaPool(id: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: any[]; pagination: any }> {
    return apiRequest(`/gachas/${id}/pool`, {
      method: 'GET',
      params: params
    });
  },

  // Get featured items
  async getFeaturedItems(id: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: any[]; pagination: any }> {
    return apiRequest(`/gachas/${id}/featured`, {
      method: 'GET',
      params: params
    });
  },

  // Search gachas
  async searchGachas(query: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ data: any[]; pagination: any }> {
    return apiRequest('/gachas/search', {
      method: 'GET',
      params: { q: query, ...params }
    });
  },

  // Validate gacha rates
  async validateGachaRates(id: string): Promise<any> {
    return apiRequest(`/gachas/${id}/validate-rates`);
  },

  // Create a new gacha
  async createGacha(gacha: any): Promise<any> {
    return apiRequest('/gachas', {
      method: 'POST',
      data: gacha,
    });
  },

  // Update an existing gacha
  async updateGacha(id: string, updates: any): Promise<any> {
    return apiRequest(`/gachas/${id}`, {
      method: 'PUT',
      data: updates,
    });
  },

  // Delete a gacha
  async deleteGacha(id: string): Promise<void> {
    return apiRequest(`/gachas/${id}`, {
      method: 'DELETE',
    });
  },

  // Add pool item
  async addPoolItem(id: string, poolItem: any): Promise<any> {
    return apiRequest(`/gachas/${id}/pool`, {
      method: 'POST',
      data: poolItem,
    });
  },

  // Bulk add pool items
  async bulkAddPoolItems(id: string, items: any[]): Promise<any> {
    return apiRequest(`/gachas/${id}/pool/bulk`, {
      method: 'POST',
      data: { items },
    });
  },

  // Remove pool item
  async removePoolItem(id: string, poolId: string): Promise<void> {
    return apiRequest(`/gachas/${id}/pool/${poolId}`, {
      method: 'DELETE',
    });
  },
};

// Dashboard API
export const dashboardApi = {
  // Get dashboard overview
  async getOverview(): Promise<DashboardOverviewResponse> {
    return apiRequest('/dashboard/overview');
  },

  // Get character statistics
  async getCharacterStats(): Promise<DashboardCharacterStatsResponse> {
    return apiRequest('/dashboard/character-stats');
  },
};

// System API
export const systemApi = {
  // Get system stats
  async getSystemStats(): Promise<any> {
    return apiRequest('/health/stats');
  },
};

// Upload API
export const uploadApi = {
  // Upload screenshot
  async uploadScreenshot(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest('/upload/screenshot', {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload file
  async uploadFile(file: File, category?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (category) {
      formData.append('category', category);
    }

    return apiRequest('/upload', {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload multiple files
  async uploadMultipleFiles(files: File[], category?: string): Promise<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    if (category) {
      formData.append('category', category);
    }

    return apiRequest('/upload/multiple', {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload CSV
  async uploadCSV(file: File, entity: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entity', entity);

    return apiRequest('/upload/csv', {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload PDF file
  async uploadPdf(file: File, options?: { compress?: boolean; quality?: 'low' | 'medium' | 'high' }): Promise<any> {
    const formData = new FormData();
    formData.append('pdf', file);
    
    if (options?.compress) {
      formData.append('compress', 'true');
      if (options.quality) {
        formData.append('quality', options.quality);
      }
    }

    return apiRequest('/upload/pdf', {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Analyze PDF for compression recommendations
  async analyzePdf(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('pdf', file);

    return apiRequest('/upload/pdf/analyze', {
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
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
    return apiRequest('/upload/history', {
      method: 'GET',
      params: params
    });
  },

  // Delete file
  async deleteFile(filename: string): Promise<void> {
    return apiRequest(`/upload/${filename}`, {
      method: 'DELETE',
    });
  },
};