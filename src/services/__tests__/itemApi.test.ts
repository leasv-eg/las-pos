import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { itemServiceAPI } from '../itemApi'
import { AdvancedSearchItem, ItemSearchResult } from '../../types/posApiTypes'

// Mock fetch globally
const mockFetch = vi.fn()
Object.defineProperty(globalThis, 'fetch', {
  value: mockFetch,
  writable: true
})

describe('ItemServiceAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Configure the service for testing
    itemServiceAPI.configure('test-token', 'test')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Configuration', () => {
    it('should configure correctly with token and environment', () => {
      itemServiceAPI.configure('bearer-token-123', 'prod')
      const config = itemServiceAPI.getConfig()
      
      expect(config).toEqual({
        bearerToken: 'bearer-token-123',
        environment: 'prod',
        baseURL: '/api/itemservice-prod'
      })
    })

    it('should default to test environment', () => {
      itemServiceAPI.configure('token')
      const config = itemServiceAPI.getConfig()
      
      expect(config?.environment).toBe('test')
      expect(config?.baseURL).toBe('/api/itemservice-test')
    })

    it('should report configured state correctly', () => {
      expect(itemServiceAPI.isConfigured()).toBe(true)
    })
  })

  describe('searchItemsWithDetails', () => {
    const mockSearchResponse: ItemSearchResult = {
      results: [
        {
          identifier: { gtin: '1234567890123' },
          itemText: 'Test Product',
          brandName: 'Test Brand',
          modelNo: '12345',
          color: { text: 'Red' },
          size: { text: 'Large' },
          currentOrdinaryPrice: { amount: 29.99 },
          currentPromotionPrice: { amount: 24.99 },
          currentEffectivePrice: { amount: 24.99 },
          availableInStore: true,
          currentStockQuantityAvailable: 5,
          thumbnailUrl: 'https://example.com/image.jpg'
        }
      ],
      totalCount: 1,
      facets: {}
    }

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockSearchResponse)
      })
    })

    it('should search with correct endpoint and method', async () => {
      const result = await itemServiceAPI.searchItemsWithDetails('test query')

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/itemservice-test/gateway/Search/items',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          }),
          body: JSON.stringify({
            fullTextQuery: 'test query',
            top: 50,
            skip: undefined,
            storeNo: undefined
          })
        })
      )
    })

    it('should include store number when provided', async () => {
      await itemServiceAPI.searchItemsWithDetails('test', { storeNumber: 1000, top: 10 })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/itemservice-test/gateway/Search/items',
        expect.objectContaining({
          body: JSON.stringify({
            fullTextQuery: 'test',
            top: 10,
            skip: undefined,
            storeNo: 1000
          })
        })
      )
    })

    it('should return parsed results on success', async () => {
      const result = await itemServiceAPI.searchItemsWithDetails('test query')

      expect(result).toEqual({
        success: true,
        items: mockSearchResponse.results,
        totalCount: 1
      })
    })

    it('should handle empty query', async () => {
      const result = await itemServiceAPI.searchItemsWithDetails('')

      expect(result).toEqual({
        success: false,
        error: 'Search query cannot be empty'
      })
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      const result = await itemServiceAPI.searchItemsWithDetails('test')

      expect(result).toEqual({
        success: false,
        error: 'Network error'
      })
    })

    it('should handle HTTP error responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Server error details')
      })

      const result = await itemServiceAPI.searchItemsWithDetails('test')

      expect(result).toEqual({
        success: false,
        error: 'API Error 500: Internal Server Error - Server error details'
      })
    })

    it('should handle malformed response data', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ unexpected: 'format' })
      })

      const result = await itemServiceAPI.searchItemsWithDetails('test')

      expect(result).toEqual({
        success: true,
        items: [],
        totalCount: undefined
      })
    })
  })

  describe('getItemWithPrices', () => {
    it('should make correct API calls for item lookup', async () => {
      // Mock item lookup response
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            items: [{ identifier: { gtin: '1234567890123' }, itemText: 'Test Item' }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            prices: [{ amount: 29.99, currency: 'NOK' }]
          })
        })

      const result = await itemServiceAPI.getItemWithPrices(
        { gtin: '1234567890123' },
        { storeNumber: 1000 }
      )

      expect(mockFetch).toHaveBeenCalledTimes(2)
      
      // First call should be for item lookup
      expect(mockFetch).toHaveBeenNthCalledWith(1,
        '/api/itemservice-test/gateway/Items/GetItemsByItemIdentifiers',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            itemIdentifiers: [{ gtin: '1234567890123' }]
          })
        })
      )

      // Second call should be for pricing
      expect(mockFetch).toHaveBeenNthCalledWith(2,
        '/api/itemservice-test/gateway/Items/GetOrdinaryPrices',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            itemIdentifier: { gtin: '1234567890123' },
            storeIdentifier: { storeNumber: 1000 }
          })
        })
      )
    })
  })

  describe('advancedSearch', () => {
    const mockAdvancedResponse: ItemSearchResult = {
      results: [
        {
          identifier: { gtin: '9876543210987' },
          itemText: 'Advanced Product',
          brandName: 'Premium Brand',
          currentEffectivePrice: { amount: 49.99 }
        }
      ],
      totalCount: 1,
      facets: {
        brands: [{ code: 'BRAND1', name: 'Premium Brand', count: 1 }]
      }
    }

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockAdvancedResponse)
      })
    })

    it('should use correct endpoint for advanced search', async () => {
      const searchRequest = {
        fullTextQuery: 'premium',
        top: 20,
        storeNo: 1000,
        isInStock: true
      }

      await itemServiceAPI.advancedSearch(searchRequest)

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/itemservice-test/gateway/Search/items',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(searchRequest)
        })
      )
    })

    it('should return advanced search results', async () => {
      const result = await itemServiceAPI.advancedSearch({
        fullTextQuery: 'premium',
        top: 20
      })

      expect(result).toEqual({
        success: true,
        results: mockAdvancedResponse.results,
        totalCount: 1,
        facets: mockAdvancedResponse.facets
      })
    })
  })

  describe('Error handling', () => {
    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Connection failed'))
      
      const result = await itemServiceAPI.searchItemsWithDetails('test')

      expect(result).toEqual({
        success: false,
        error: 'Connection failed'
      })
    })

    it('should handle invalid responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        text: () => Promise.resolve('Invalid request')
      })

      const result = await itemServiceAPI.searchItemsWithDetails('test')

      expect(result).toEqual({
        success: false,
        error: 'API Error 400: Bad Request - Invalid request'
      })
    })
  })
})
