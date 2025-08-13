// Integrated Item Service combining API calls and local caching

import { itemServiceAPI } from './itemApi';
import { itemCacheService } from './itemCache';
import { TokenValidator } from './tokenValidator';
import { 
  ItemIdentifier, 
  StoreIdentifier, 
  Item, 
  ItemPrice, 
  POSEnvironment 
} from '../types/posApiTypes';

interface ItemLookupResult {
  item: Item;
  prices?: ItemPrice[];
  source: 'cache' | 'api';
  priceError?: string;
}

interface ItemLookupOptions {
  forceRefresh?: boolean; // Skip cache and fetch from API
  includeCache?: boolean; // Whether to cache the result
  storeNumber?: number;   // Store number for price lookup
}

class IntegratedItemService {
  private initialized = false;

  // Initialize the service
  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      await itemCacheService.init();
      this.initialized = true;
      console.log('✅ Integrated Item Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Integrated Item Service:', error);
      throw error;
    }
  }

  // Configure the API service
  configure(bearerToken: string, environment: POSEnvironment = 'test') {
    itemServiceAPI.configure(bearerToken, environment);
  }

  // Check if service is ready
  isReady(): boolean {
    return this.initialized && itemServiceAPI.isConfigured();
  }

  // Get item with caching support
  async getItem(
    identifier: ItemIdentifier,
    options: ItemLookupOptions = {}
  ): Promise<{ success: boolean; result?: ItemLookupResult; error?: string }> {
    if (!this.isReady()) {
      return {
        success: false,
        error: 'Service not initialized or API not configured'
      };
    }

    const { forceRefresh = false, includeCache = true, storeNumber } = options;
    console.log('🏪 Item Service getItem options:', options);
    console.log('🏪 Extracted storeNumber:', storeNumber);
    const storeIdentifier: StoreIdentifier = storeNumber ? { storeNumber } : {};
    console.log('🏪 Final storeIdentifier:', storeIdentifier);

    try {
      // Try cache first (unless forced refresh)
      if (!forceRefresh && includeCache) {
        const cached = await itemCacheService.getCachedItem(identifier, storeNumber);
        if (cached) {
          console.log('💰 Returning cached item');
          return {
            success: true,
            result: {
              item: cached.item,
              prices: cached.prices,
              source: 'cache'
            }
          };
        }
      }

      // Fetch from API
      console.log('🌐 Fetching item from API');
      const apiResult = await itemServiceAPI.getItemWithPrices(identifier, storeIdentifier);

      if (!apiResult.success) {
        return {
          success: false,
          error: apiResult.error
        };
      }

      if (!apiResult.item) {
        return {
          success: false,
          error: 'Item not found'
        };
      }

      // Cache the result if enabled
      if (includeCache) {
        await itemCacheService.cacheItem(apiResult.item, apiResult.prices, storeNumber);
      }

      return {
        success: true,
        result: {
          item: apiResult.item,
          prices: apiResult.prices,
          source: 'api',
          priceError: apiResult.error
        }
      };

    } catch (error) {
      console.error('❌ Error in getItem:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get multiple items with caching support
  async getItems(
    identifiers: ItemIdentifier[],
    options: ItemLookupOptions = {}
  ): Promise<{ 
    success: boolean; 
    results?: ItemLookupResult[]; 
    error?: string 
  }> {
    if (!this.isReady()) {
      return {
        success: false,
        error: 'Service not initialized or API not configured'
      };
    }

    const { forceRefresh = false, includeCache = true, storeNumber } = options;
    const results: ItemLookupResult[] = [];
    const identifiersToFetch: ItemIdentifier[] = [];

    try {
      // Check cache for each item (unless forced refresh)
      if (!forceRefresh && includeCache) {
        for (const identifier of identifiers) {
          const cached = await itemCacheService.getCachedItem(identifier, storeNumber);
          if (cached) {
            results.push({
              item: cached.item,
              prices: cached.prices,
              source: 'cache'
            });
          } else {
            identifiersToFetch.push(identifier);
          }
        }
      } else {
        identifiersToFetch.push(...identifiers);
      }

      // Fetch missing items from API
      if (identifiersToFetch.length > 0) {
        console.log(`🌐 Fetching ${identifiersToFetch.length} items from API`);
        
        const storeIdentifier: StoreIdentifier = storeNumber ? { storeNumber } : {};
        const apiResult = await itemServiceAPI.getMultipleItemsWithPrices(
          identifiersToFetch, 
          storeIdentifier
        );

        if (apiResult.success && apiResult.results) {
          for (const apiItem of apiResult.results) {
            // Cache the result if enabled
            if (includeCache) {
              await itemCacheService.cacheItem(
                apiItem.item, 
                apiItem.prices, 
                storeNumber
              );
            }

            results.push({
              item: apiItem.item,
              prices: apiItem.prices,
              source: 'api',
              priceError: apiItem.priceError
            });
          }
        }
      }

      console.log(`📦 Returning ${results.length} items (${results.filter(r => r.source === 'cache').length} from cache, ${results.filter(r => r.source === 'api').length} from API)`);

      return {
        success: true,
        results
      };

    } catch (error) {
      console.error('❌ Error in getItems:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Search for items (cache first, then API if needed)
  async searchItems(
    searchTerm: string,
    options: ItemLookupOptions = {}
  ): Promise<{ 
    success: boolean; 
    results?: ItemLookupResult[]; 
    error?: string 
  }> {
    if (!this.isReady()) {
      return {
        success: false,
        error: 'Service not initialized or API not configured'
      };
    }

    const { storeNumber } = options;

    try {
      // Search cache first
      const cachedResults = await itemCacheService.searchCachedItems(searchTerm, storeNumber);
      
      if (cachedResults.length > 0) {
        console.log(`🔍 Found ${cachedResults.length} cached items for search: ${searchTerm}`);
        
        const results: ItemLookupResult[] = cachedResults.map(cached => ({
          item: cached.item,
          prices: cached.prices,
          source: 'cache' as const
        }));

        return {
          success: true,
          results
        };
      }

      // If no cache results and search term looks like an identifier, try API
      if (this.isProductIdentifier(searchTerm)) {
        console.log(`🌐 Searching API for identifier: ${searchTerm}`);
        
        const identifier = this.parseSearchTerm(searchTerm);
        const apiResult = await this.getItem(identifier, options);
        
        if (apiResult.success && apiResult.result) {
          return {
            success: true,
            results: [apiResult.result]
          };
        }
      }

      return {
        success: true,
        results: []
      };

    } catch (error) {
      console.error('❌ Error in searchItems:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Helper: Check if search term looks like a product identifier
  private isProductIdentifier(searchTerm: string): boolean {
    // Check if it's all digits (likely GTIN/EAN)
    if (/^\d+$/.test(searchTerm) && searchTerm.length >= 8) {
      return true;
    }
    
    // Check if it looks like a SKU (alphanumeric)
    if (/^[A-Za-z0-9-_]+$/.test(searchTerm) && searchTerm.length >= 3) {
      return true;
    }
    
    return false;
  }

  // Helper: Parse search term into ItemIdentifier
  private parseSearchTerm(searchTerm: string): ItemIdentifier {
    // If it's all digits, treat as GTIN
    if (/^\d+$/.test(searchTerm)) {
      return { gtin: searchTerm };
    }
    
    // Otherwise treat as SKU or external item number
    return { 
      sku: searchTerm,
      externalItemNo: searchTerm
    };
  }

  // Get cache statistics
  async getCacheStats() {
    if (!this.initialized) {
      await this.init();
    }
    return itemCacheService.getCacheStats();
  }

  // Clear cache
  async clearCache() {
    if (!this.initialized) {
      await this.init();
    }
    return itemCacheService.clearCache();
  }

  // Search for products by text query
  async searchProducts(
    query: string,
    options: {
      maxResults?: number;
      useAdvancedSearch?: boolean;
      storeNumber?: number;
      includeOutOfStock?: boolean;
      includePromotions?: boolean;
      departmentNumbers?: string[];
      brandCodes?: string[];
    } = {}
  ): Promise<{ 
    success: boolean; 
    items?: Array<{
      identifier?: ItemIdentifier;
      itemText?: string;
      brandName?: string;
      modelNo?: string;
      gtin?: string;
      colorText?: string;
      sizeText?: string;
      currentPrice?: number;
      promotionPrice?: number;
      inStock?: boolean;
      thumbnailUrl?: string;
      source: 'search';
    }>; 
    totalCount?: number;
    error?: string 
  }> {
    console.log('🚨 SEARCH FUNCTION CALLED WITH FRESH CODE - VERSION 2.0!');
    console.log('🚨 Service ready status:', this.isReady());
    
    // Auto-initialize if not ready but tokens are available
    if (!this.isReady()) {
      console.log('🔧 itemService.searchProducts: Service not ready, attempting auto-initialization...');
      
      // Check token validity first
      const tokenStatus = TokenValidator.checkStoredTokens();
      TokenValidator.logTokenStatus();
      
      if (tokenStatus.needsRefresh) {
        console.error('❌ itemService.searchProducts: Tokens are expired or invalid');
        return {
          success: false,
          error: 'Tokens have expired. Please refresh your authentication.'
        };
      }
      
      const itemToken = localStorage.getItem('item_bearer_token');
      const itemEnvironment = localStorage.getItem('item_environment');
      
      if (itemToken) {
        console.log('🔧 itemService.searchProducts: Found valid tokens, initializing service...');
        try {
          await this.init();
          this.configure(itemToken, itemEnvironment as any);
          console.log('✅ itemService.searchProducts: Auto-initialization successful!');
        } catch (error) {
          console.error('❌ itemService.searchProducts: Auto-initialization failed:', error);
          return {
            success: false,
            error: 'Failed to auto-initialize service'
          };
        }
      } else {
        console.log('❌ itemService.searchProducts: No tokens available for auto-initialization');
        return {
          success: false,
          error: 'Service not initialized or API not configured'
        };
      }
    }

    if (!query.trim()) {
      return {
        success: false,
        error: 'Search query cannot be empty'
      };
    }

    try {
      const {
        maxResults = 20,
        useAdvancedSearch = false,
        storeNumber,
        includeOutOfStock = true,
        includePromotions = true,
        departmentNumbers,
        brandCodes
      } = options;

      console.log(`🔍 Searching for products: "${query}" (max: ${maxResults})`);

      if (useAdvancedSearch) {
        // Use advanced search for more detailed filtering
        const searchRequest = {
          fullTextQuery: query.trim(),
          top: maxResults,
          isInStock: includeOutOfStock ? undefined : true,
          storeNo: storeNumber,
          isInPromotion: includePromotions ? undefined : false,
          departmentNumbers,
          brandCodes
        };

        const searchResult = await itemServiceAPI.advancedSearch(searchRequest);
        
        if (!searchResult.success) {
          return {
            success: false,
            error: searchResult.error || 'Advanced search failed'
          };
        }

        const items = (searchResult.results || []).map(item => ({
          identifier: item.identifier,
          itemText: item.itemText,
          brandName: item.brandName,
          modelNo: item.modelNo,
          gtin: item.identifier?.gtin,
          colorText: item.color?.text,
          sizeText: item.size?.text,
          currentPrice: item.currentOrdinaryPrice?.amount || item.currentEffectivePrice?.amount,
          promotionPrice: item.currentPromotionPrice?.amount,
          inStock: item.availableInStore && (item.currentStockQuantityAvailable || 0) > 0,
          thumbnailUrl: item.thumbnailUrl,
          source: 'search' as const
        }));

        return {
          success: true,
          items,
          totalCount: searchResult.totalCount
        };

      } else {
        // Use basic search for speed
        console.log('🚀 Using basic search...');
        const searchResult = await itemServiceAPI.searchItemsWithDetails(query, {
          top: maxResults,
          storeNumber: storeNumber
        });

        console.log('🔍 Basic search raw result:', JSON.stringify(searchResult, null, 2));

        if (!searchResult.success) {
          return {
            success: false,
            error: searchResult.error || 'Basic search failed'
          };
        }

        console.log('🔍 Raw items array (first 2):', JSON.stringify(searchResult.items?.slice(0, 2), null, 2));

        const items = (searchResult.items || []).map((item: any, index) => {
          console.log(`🔍 Processing item ${index + 1}:`, JSON.stringify(item, null, 2));
          
          // Map the actual API response structure to our expected format
          const identifier = {
            sku: item.sku,
            gtin: item.mainGtin || item.gtin
          };
          const itemText = item.itemTexts?.NO?.itemName || item.itemTexts?.EN?.itemName || `Product ${index + 1}`;
          const brandName = item.brand?.name || 'Unknown Brand';
          
          return {
            identifier,
            itemText,
            brandName,
            modelNo: item.modelNo,
            gtin: item.mainGtin || item.gtin,
            colorText: item.colorName,
            sizeText: item.sizeName,
            currentPrice: item.currentOrdinaryPrice?.amount || item.currentEffectivePrice?.amount || 0,
            promotionPrice: item.currentPromotionPrice?.amount,
            inStock: item.availableInStore && (item.currentStockQuantityAvailable || 0) > 0,
            thumbnailUrl: item.thumbnailUrl,
            source: 'search' as const
          };
        });

        console.log('🔍 Processed items (first 2):', JSON.stringify(items.slice(0, 2), null, 2));

        return {
          success: true,
          items,
          totalCount: searchResult.totalCount
        };
      }

    } catch (error) {
      console.error('❌ Error in searchProducts:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown search error'
      };
    }
  }

  // Quick search for autocomplete/suggestions (optimized for speed)
  async quickSearch(
    query: string,
    maxResults: number = 10
  ): Promise<{ 
    success: boolean; 
    suggestions?: Array<{
      gtin?: string;
      itemText?: string;
      brandName?: string;
      modelNo?: string;
    }>; 
    error?: string 
  }> {
    if (!this.isReady()) {
      return {
        success: false,
        error: 'Service not initialized or API not configured'
      };
    }

    if (!query.trim() || query.trim().length < 2) {
      return {
        success: true,
        suggestions: []
      };
    }

    try {
      console.log(`⚡ Quick search: "${query}" (max: ${maxResults})`);

      const searchResult = await itemServiceAPI.searchItems(query, {
        top: maxResults
      });

      if (!searchResult.success) {
        return {
          success: false,
          error: searchResult.error || 'Quick search failed'
        };
      }

      const suggestions = (searchResult.items || []).map(item => ({
        gtin: item.gtin,
        itemText: item.itemText,
        brandName: item.brandName,
        modelNo: item.modelNo
      }));

      return {
        success: true,
        suggestions
      };

    } catch (error) {
      console.error('❌ Error in quickSearch:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown quick search error'
      };
    }
  }

  // Test both API and cache
  async testService(): Promise<{ 
    success: boolean; 
    apiTest?: { success: boolean; message: string };
    cacheTest?: { success: boolean; message: string };
    error?: string 
  }> {
    try {
      if (!this.initialized) {
        await this.init();
      }

      // Test API
      const apiTest = await itemServiceAPI.testConnection();

      // Test cache (try to store and retrieve a test item)
      const testItem: Item = {
        identifier: { gtin: 'test123', sku: 'TEST' },
        itemText: 'Test Item',
        itemStatus: 'Active'
      };

      await itemCacheService.cacheItem(testItem);
      const retrieved = await itemCacheService.getCachedItem({ gtin: 'test123' });
      await itemCacheService.removeCachedItem({ gtin: 'test123' });

      const cacheTest = {
        success: !!retrieved,
        message: retrieved ? '✅ Cache working correctly' : '❌ Cache test failed'
      };

      return {
        success: apiTest.success && cacheTest.success,
        apiTest,
        cacheTest
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get service status
  getStatus() {
    return {
      initialized: this.initialized,
      apiConfigured: itemServiceAPI.isConfigured(),
      apiConfig: itemServiceAPI.getConfig(),
      ready: this.isReady()
    };
  }
}

// Export singleton instance
export const itemService = new IntegratedItemService();
export default itemService;
