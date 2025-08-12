import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { itemService } from '../itemService'

// Mock the itemServiceAPI
vi.mock('../itemApi', () => ({
  itemServiceAPI: {
    configure: vi.fn(),
    isConfigured: vi.fn(),
    searchItemsWithDetails: vi.fn(),
    getItemWithPrices: vi.fn(),
    advancedSearch: vi.fn()
  }
}))

// Mock the itemCacheService
vi.mock('../itemCache', () => ({
  itemCacheService: {
    init: vi.fn(),
    getCachedItem: vi.fn(),
    cacheItem: vi.fn()
  }
}))

import { itemServiceAPI } from '../itemApi'
import { itemCacheService } from '../itemCache'

describe('itemService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock successful initialization
    vi.mocked(itemCacheService.init).mockResolvedValue(undefined)
    vi.mocked(itemServiceAPI.isConfigured).mockReturnValue(true)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      // Reset the service state
      (itemService as any).initialized = false
      
      await itemService.init()
      
      expect(itemCacheService.init).toHaveBeenCalled()
      expect(itemService.isReady()).toBe(true)
    })

    it('should handle initialization failure', async () => {
      // Reset the service state
      (itemService as any).initialized = false
      vi.mocked(itemCacheService.init).mockRejectedValue(new Error('Cache init failed'))
      
      await expect(itemService.init()).rejects.toThrow('Cache init failed')
    })

    it('should configure API correctly', async () => {
      itemService.configure('test-token', 'prod')
      
      expect(itemServiceAPI.configure).toHaveBeenCalledWith('test-token', 'prod')

      await itemService.init()

      expect(itemService.isReady()).toBe(true)
    })

    it('should check if service is ready when both API and cache are ready', () => {
      expect(itemService.isReady()).toBe(true)
    })

    it('should return false when service is not configured', () => {
      vi.mocked(itemServiceAPI.isConfigured).mockReturnValue(false)
      
      expect(itemService.isReady()).toBe(false)
    })
  })

  describe('Product Search', () => {
    beforeEach(async () => {
      await itemService.init()
    })

    it('should search products with basic query', async () => {
      vi.mocked(itemServiceAPI.searchItemsWithDetails).mockResolvedValue({
        success: true,
        items: [
          {
            identifier: { gtin: '1234567890123' },
            itemText: 'Test Product',
            color: { text: 'Red' },
            size: { text: 'M' }
          }
        ]
      })

      const result = await itemService.searchProducts('test query', {
        maxResults: 10,
        storeNumber: 1
      })

      expect(itemServiceAPI.searchItemsWithDetails).toHaveBeenCalledWith('test query', {
        top: 10,
        storeNumber: 1
      })
      expect(result.success).toBe(true)
      expect(result.items).toHaveLength(1)
      expect(result.items![0].gtin).toBe('1234567890123')
      expect(result.items![0].itemText).toBe('Test Product')
      expect(result.items![0].colorText).toBe('Red')
      expect(result.items![0].sizeText).toBe('M')
    })

    it('should handle search with advanced search', async () => {
      vi.mocked(itemServiceAPI.advancedSearch).mockResolvedValue({
        success: true,
        results: [
          {
            identifier: { gtin: '2234567890123' },
            itemText: 'Premium Product',
            color: { text: 'Blue' },
            size: { text: 'L' }
          }
        ]
      })

      const result = await itemService.searchProducts('premium', {
        useAdvancedSearch: true,
        maxResults: 5
      })

      expect(itemServiceAPI.advancedSearch).toHaveBeenCalledWith({
        fullTextQuery: 'premium',
        top: 5,
        brandCodes: undefined,
        departmentNumbers: undefined,
        isInStock: undefined,
        isInPromotion: undefined,
        storeNo: undefined
      })
      expect(result.success).toBe(true)
      expect(result.items).toHaveLength(1)
    })

    it('should return empty results for empty query', async () => {
      const result = await itemService.searchProducts('')
      
      expect(itemServiceAPI.searchItemsWithDetails).not.toHaveBeenCalled()
      expect(result.success).toBe(false)
      expect(result.items || []).toHaveLength(0)
      expect(result.totalCount || 0).toBe(0)
    })

    it('should handle API not configured', async () => {
      vi.mocked(itemServiceAPI.isConfigured).mockReturnValue(false)
      
      const result = await itemService.searchProducts('test')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Service not initialized or API not configured')
    })

    it('should handle API errors gracefully', async () => {
      vi.mocked(itemServiceAPI.searchItemsWithDetails).mockRejectedValue(
        new Error('API Error')
      )
      
      const result = await itemService.searchProducts('test')
      
      expect(result.success).toBe(false)
      expect(result.error).toContain('API Error')
    })
  })

  describe('Get Item', () => {
    beforeEach(async () => {
      await itemService.init()
    })

    it('should return cached item if available', async () => {
      const cachedItem = {
        item: {
          identifier: { gtin: '1234567890123' },
          itemText: 'Cached Product'
        },
        prices: [{ 
          salesPrice: { amount: 39.99, currencyCode: 'NOK' }
        }],
        lastUpdated: Date.now(),
        lastAccessed: Date.now()
      }
      
      vi.mocked(itemCacheService.getCachedItem).mockResolvedValue(cachedItem)

      const result = await itemService.getItem(
        { gtin: '1234567890123' },
        { storeNumber: 1 }
      )

      expect(result.success).toBe(true)
      expect(result.result?.item.itemText).toBe('Cached Product')
      expect(itemServiceAPI.getItemWithPrices).not.toHaveBeenCalled()
    })

    it('should fetch from API if not cached', async () => {
      vi.mocked(itemCacheService.getCachedItem).mockResolvedValue(null)
      vi.mocked(itemServiceAPI.getItemWithPrices).mockResolvedValue({
        success: true,
        item: {
          identifier: { gtin: '1234567890123' },
          itemText: 'Fresh Product'
        },
        prices: [{ 
          salesPrice: { amount: 49.99, currencyCode: 'NOK' }
        }]
      })

      const result = await itemService.getItem(
        { gtin: '1234567890123' },
        { storeNumber: 1 }
      )

      expect(result.success).toBe(true)
      expect(result.result?.item.itemText).toBe('Fresh Product')
      expect(itemServiceAPI.getItemWithPrices).toHaveBeenCalled()
    })

    it('should handle item not found', async () => {
      vi.mocked(itemCacheService.getCachedItem).mockResolvedValue(null)
      vi.mocked(itemServiceAPI.getItemWithPrices).mockResolvedValue({
        success: true,
        item: {
          identifier: { gtin: '9999999999999' },
          itemText: 'Not Found Product'
        },
        prices: [{ 
          salesPrice: { amount: 0, currencyCode: 'NOK' }
        }]
      })

      const result = await itemService.getItem(
        { gtin: '9999999999999' },
        { storeNumber: 1 }
      )

      expect(result.success).toBe(true)
      expect(result.result?.item.identifier?.gtin).toBe('9999999999999')
    })
  })
})
