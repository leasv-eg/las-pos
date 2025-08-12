// Item Service API Integration with EG Retail Item Gateway API

import { 
  ItemServiceConfig, 
  GetItemsByIdentifiersRequest,
  GetItemsByIdentifiersResult,
  ItemStorePriceRequest,
  ItemStorePricesResponse,
  ItemIdentifier,
  StoreIdentifier,
  Item,
  ItemPrice,
  POSEnvironment,
  SearchableItem,
  SearchItemsWithDetails,
  AdvancedSearchItem,
  FacetResults,
  ItemSearchResult
} from '../types/posApiTypes';

class ItemServiceAPI {
  private config: ItemServiceConfig | null = null;

  // Environment-specific base URLs
  private readonly environmentUrls = {
    dev: '/api/itemservice-dev',
    test: '/api/itemservice-test', 
    prod: '/api/itemservice-prod'
  };

  // Configure the service with bearer token and environment
  configure(bearerToken: string, environment: POSEnvironment = 'test') {
    const baseURL = this.environmentUrls[environment];
    
    this.config = {
      bearerToken,
      environment,
      baseURL
    };

    console.log('📦 Item Service configured:', {
      environment,
      baseURL,
      hasToken: !!bearerToken
    });
  }

  // Get configuration status
  getConfig() {
    return this.config;
  }

  // Check if service is configured
  isConfigured(): boolean {
    return !!(this.config?.bearerToken && this.config?.baseURL);
  }

  // Get development mode status
  private get isDevelopment(): boolean {
    return import.meta.env.DEV || window.location.hostname === 'localhost';
  }

  // Get headers with proper authentication for Azure vs development
  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'lrs-userid': 'ZGV2ZWxvcGVy' // Default user ID from swagger docs
    };

    if (this.config?.bearerToken) {
      if (this.isDevelopment) {
        headers['Authorization'] = `Bearer ${this.config.bearerToken}`;
      } else {
        // In production (Azure), use custom header to avoid Azure's auth injection
        headers['X-Item-Authorization'] = `Bearer ${this.config.bearerToken}`;
      }
    }

    return headers;
  }

  // Private method to make API calls
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; error?: string }> {
    if (!this.isConfigured()) {
      return { 
        success: false, 
        error: 'Item Service not configured. Please provide bearer token and environment.' 
      };
    }

    const url = `${this.config!.baseURL}${endpoint}`;
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    };

    try {
      console.log(`🚀 Item Service API Request: ${options.method || 'GET'} ${url}`);
      console.log('📋 Request Headers:', requestOptions.headers);
      
      if (requestOptions.body) {
        console.log('📦 Request Body:', requestOptions.body);
      }

      const response = await fetch(url, requestOptions);
      
      console.log(`📥 Item Service API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Item Service API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        
        return {
          success: false,
          error: `API Error ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`
        };
      }

      const data = await response.json();
      console.log('✅ Item Service API Success:', data);

      return { success: true, data };
    } catch (error) {
      console.error('💥 Item Service API Request Failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Get items by identifiers (GTIN, SKU, ExternalItemNo)
  async getItemsByIdentifiers(
    itemIdentifiers: ItemIdentifier[]
  ): Promise<{ success: boolean; items?: Item[]; error?: string }> {
    if (!itemIdentifiers || itemIdentifiers.length === 0) {
      return { success: false, error: 'No item identifiers provided' };
    }

    const request: GetItemsByIdentifiersRequest = {
      itemIdentifiers
    };

    const result = await this.makeRequest<GetItemsByIdentifiersResult>(
      '/gateway/Items/GetItemsByItemIdentifiers',
      {
        method: 'POST',
        body: JSON.stringify(request)
      }
    );

    if (result.success && result.data) {
      return {
        success: true,
        items: result.data.items || []
      };
    }

    return {
      success: false,
      error: result.error || 'Failed to get items'
    };
  }

  // Get ordinary prices for an item in a specific store
  async getOrdinaryPrices(
    itemIdentifier: ItemIdentifier,
    storeIdentifier: StoreIdentifier
  ): Promise<{ success: boolean; prices?: ItemPrice[]; error?: string }> {
    const request: ItemStorePriceRequest = {
      itemIdentifier,
      storeIdentifier
    };

    const result = await this.makeRequest<ItemStorePricesResponse>(
      '/gateway/Items/GetOrdinaryPrices',
      {
        method: 'POST',
        body: JSON.stringify(request)
      }
    );

    if (result.success && result.data) {
      return {
        success: true,
        prices: result.data.prices || []
      };
    }

    return {
      success: false,
      error: result.error || 'Failed to get prices'
    };
  }

  // Convenience method: Get item with prices
  async getItemWithPrices(
    itemIdentifier: ItemIdentifier,
    storeIdentifier: StoreIdentifier
  ): Promise<{ 
    success: boolean; 
    item?: Item; 
    prices?: ItemPrice[]; 
    error?: string 
  }> {
    // Get item details
    const itemResult = await this.getItemsByIdentifiers([itemIdentifier]);
    
    if (!itemResult.success) {
      return {
        success: false,
        error: itemResult.error || 'Failed to get item details'
      };
    }

    const item = itemResult.items?.[0];
    if (!item) {
      return {
        success: false,
        error: 'Item not found'
      };
    }

    // Get prices
    const priceResult = await this.getOrdinaryPrices(itemIdentifier, storeIdentifier);
    
    return {
      success: true,
      item,
      prices: priceResult.success ? priceResult.prices : undefined,
      error: priceResult.success ? undefined : `Item found but price lookup failed: ${priceResult.error}`
    };
  }

  // Convenience method: Get multiple items with their prices
  async getMultipleItemsWithPrices(
    itemIdentifiers: ItemIdentifier[],
    storeIdentifier: StoreIdentifier
  ): Promise<{ 
    success: boolean; 
    results?: Array<{
      item: Item;
      prices?: ItemPrice[];
      priceError?: string;
    }>; 
    error?: string 
  }> {
    // Get all items first
    const itemsResult = await this.getItemsByIdentifiers(itemIdentifiers);
    
    if (!itemsResult.success) {
      return {
        success: false,
        error: itemsResult.error || 'Failed to get items'
      };
    }

    const items = itemsResult.items || [];
    const results: Array<{
      item: Item;
      prices?: ItemPrice[];
      priceError?: string;
    }> = [];

    // Get prices for each item
    for (const item of items) {
      if (item.identifier) {
        const priceResult = await this.getOrdinaryPrices(item.identifier, storeIdentifier);
        
        results.push({
          item,
          prices: priceResult.success ? priceResult.prices : undefined,
          priceError: priceResult.success ? undefined : priceResult.error
        });
      } else {
        results.push({
          item,
          priceError: 'Item has no identifier for price lookup'
        });
      }
    }

    return {
      success: true,
      results
    };
  }

  // Search for items by text query
  async searchItems(
    query: string,
    options: {
      top?: number;
      skip?: number;
      supplierNo?: string;
    } = {}
  ): Promise<{ 
    success: boolean; 
    items?: SearchableItem[]; 
    totalCount?: number;
    error?: string 
  }> {
    if (!query.trim()) {
      return {
        success: false,
        error: 'Search query cannot be empty'
      };
    }

    const params = new URLSearchParams();
    params.append('query', query.trim());
    
    if (options.top !== undefined) {
      params.append('top', options.top.toString());
    } else {
      params.append('top', '100'); // Default to 100 results
    }
    
    if (options.skip !== undefined) {
      params.append('skip', options.skip.toString());
    }
    
    if (options.supplierNo) {
      params.append('supplierNo', options.supplierNo);
    }

    const result = await this.makeRequest<SearchableItem[]>(
      `/gateway/ItemSearch?${params.toString()}`,
      {
        method: 'GET'
      }
    );

    if (result.success && result.data) {
      return {
        success: true,
        items: result.data,
        totalCount: result.data.length
      };
    }

    return {
      success: false,
      error: result.error || 'Failed to search items'
    };
  }

  // Search for items with detailed information
  async searchItemsWithDetails(
    query: string,
    options: {
      top?: number;
      skip?: number;
    } = {}
  ): Promise<{ 
    success: boolean; 
    items?: SearchableItem[]; 
    totalCount?: number;
    error?: string 
  }> {
    if (!query.trim()) {
      return {
        success: false,
        error: 'Search query cannot be empty'
      };
    }

    const params = new URLSearchParams();
    params.append('query', query.trim());
    
    if (options.top !== undefined) {
      params.append('top', options.top.toString());
    } else {
      params.append('top', '50'); // Default to 50 results for detailed search
    }
    
    if (options.skip !== undefined) {
      params.append('skip', options.skip.toString());
    }

    const result = await this.makeRequest<SearchItemsWithDetails>(
      `/gateway/ItemSearch/items?${params.toString()}`,
      {
        method: 'GET'
      }
    );

    if (result.success && result.data) {
      return {
        success: true,
        items: result.data.searchableItems || [],
        totalCount: result.data.totalCount
      };
    }

    return {
      success: false,
      error: result.error || 'Failed to search items with details'
    };
  }

  // Advanced search with full text query and filtering options
  async advancedSearch(
    searchRequest: {
      fullTextQuery?: string;
      fullTextQueryLanguageCode?: string;
      top: number;
      isInStock?: boolean;
      storeNo?: number;
      effectivePriceFrom?: number;
      effectivePriceTo?: number;
      isInPromotion?: boolean;
      isAvailableInStore?: boolean;
      departmentNumbers?: string[];
      areaNumbers?: string[];
      itemGroupNumbers?: string[];
      brandCodes?: string[];
    }
  ): Promise<{ 
    success: boolean; 
    results?: AdvancedSearchItem[]; 
    totalCount?: number;
    facets?: FacetResults;
    error?: string 
  }> {
    if (!searchRequest.fullTextQuery?.trim()) {
      return {
        success: false,
        error: 'Search query cannot be empty'
      };
    }

    const result = await this.makeRequest<ItemSearchResult>(
      '/gateway/Search/items',
      {
        method: 'POST',
        body: JSON.stringify(searchRequest)
      }
    );

    if (result.success && result.data) {
      return {
        success: true,
        results: result.data.results || [],
        totalCount: result.data.totalCount,
        facets: result.data.facets
      };
    }

    return {
      success: false,
      error: result.error || 'Failed to perform advanced search'
    };
  }

  // Test connection method
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Item Service not configured. Please provide bearer token and environment.'
      };
    }

    // Test with a simple item lookup using a common GTIN
    const testResult = await this.getItemsByIdentifiers([
      { gtin: '1234567890123' } // Test GTIN
    ]);

    if (testResult.success) {
      return {
        success: true,
        message: `✅ Item Service connection successful! Environment: ${this.config!.environment}`
      };
    }

    // Even if the specific item isn't found, a 200 response means the connection works
    if (testResult.error?.includes('404') || testResult.error?.includes('not found')) {
      return {
        success: true,
        message: `✅ Item Service connection successful! Environment: ${this.config!.environment} (Test item not found, but API is accessible)`
      };
    }

    return {
      success: false,
      message: `❌ Item Service connection failed: ${testResult.error}`
    };
  }
}

// Export singleton instance
export const itemServiceAPI = new ItemServiceAPI();
export default itemServiceAPI;
