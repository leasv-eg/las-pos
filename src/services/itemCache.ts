// Local Item Cache Service using IndexedDB for offline storage

import { Item, ItemPrice, ItemIdentifier } from '../types/posApiTypes';

interface CachedItem {
  id?: string; // Cache key
  item: Item;
  prices?: ItemPrice[];
  storeNumber?: number;
  lastUpdated: number;
  lastAccessed: number;
}

interface CacheMetadata {
  totalItems: number;
  oldestEntry: number;
  newestEntry: number;
  lastCleanup: number;
}

class ItemCacheService {
  private dbName = 'LASPOSItemCache';
  private dbVersion = 1;
  private itemStoreName = 'items';
  private metadataStoreName = 'metadata';
  private maxCacheAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private maxCacheSize = 10000; // Maximum number of items to cache
  private db: IDBDatabase | null = null;

  // Initialize the database
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('❌ Failed to open item cache database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ Item cache database opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create items store
        if (!db.objectStoreNames.contains(this.itemStoreName)) {
          const itemStore = db.createObjectStore(this.itemStoreName, { keyPath: 'id' });
          
          // Create indexes for efficient lookups
          itemStore.createIndex('gtin', 'gtin', { unique: false });
          itemStore.createIndex('sku', 'sku', { unique: false });
          itemStore.createIndex('externalItemNo', 'externalItemNo', { unique: false });
          itemStore.createIndex('lastAccessed', 'lastAccessed', { unique: false });
          itemStore.createIndex('storeNumber', 'storeNumber', { unique: false });
          
          console.log('🏪 Created item cache store with indexes');
        }

        // Create metadata store
        if (!db.objectStoreNames.contains(this.metadataStoreName)) {
          db.createObjectStore(this.metadataStoreName, { keyPath: 'key' });
          console.log('📊 Created metadata store');
        }
      };
    });
  }

  // Generate a unique cache key for an item
  private generateCacheKey(identifier: ItemIdentifier, storeNumber?: number): string {
    const parts = [];
    
    if (identifier.gtin) parts.push(`gtin:${identifier.gtin}`);
    if (identifier.sku) parts.push(`sku:${identifier.sku}`);
    if (identifier.externalItemNo) parts.push(`ext:${identifier.externalItemNo}`);
    if (storeNumber) parts.push(`store:${storeNumber}`);
    
    return parts.join('|');
  }

  // Store item in cache
  async cacheItem(
    item: Item, 
    prices?: ItemPrice[], 
    storeNumber?: number
  ): Promise<void> {
    if (!this.db || !item.identifier) {
      console.warn('⚠️ Cannot cache item: database not initialized or item has no identifier');
      return;
    }

    const cacheKey = this.generateCacheKey(item.identifier, storeNumber);
    const now = Date.now();

    const cachedItem: CachedItem = {
      id: cacheKey,
      item,
      prices,
      storeNumber,
      lastUpdated: now,
      lastAccessed: now
    };

    try {
      const transaction = this.db.transaction([this.itemStoreName], 'readwrite');
      const store = transaction.objectStore(this.itemStoreName);
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put({
          id: cacheKey,
          ...cachedItem,
          gtin: item.identifier?.gtin,
          sku: item.identifier?.sku,
          externalItemNo: item.identifier?.externalItemNo
        });

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log(`💾 Cached item: ${cacheKey}`);
      
      // Update metadata
      await this.updateMetadata();
      
      // Cleanup old entries if cache is getting too large
      await this.cleanupIfNeeded();
      
    } catch (error) {
      console.error('❌ Failed to cache item:', error);
    }
  }

  // Retrieve item from cache
  async getCachedItem(
    identifier: ItemIdentifier, 
    storeNumber?: number
  ): Promise<CachedItem | null> {
    if (!this.db) {
      console.warn('⚠️ Cannot get cached item: database not initialized');
      return null;
    }

    const cacheKey = this.generateCacheKey(identifier, storeNumber);
    const now = Date.now();

    try {
      const transaction = this.db.transaction([this.itemStoreName], 'readwrite');
      const store = transaction.objectStore(this.itemStoreName);
      
      const cachedItem = await new Promise<any>((resolve, reject) => {
        const request = store.get(cacheKey);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      if (!cachedItem) {
        console.log(`🔍 Cache miss: ${cacheKey}`);
        return null;
      }

      // Check if cache entry is still valid
      if (now - cachedItem.lastUpdated > this.maxCacheAge) {
        console.log(`⏰ Cache expired: ${cacheKey}`);
        await this.removeCachedItem(identifier, storeNumber);
        return null;
      }

      // Update last accessed time
      cachedItem.lastAccessed = now;
      store.put(cachedItem);

      console.log(`💰 Cache hit: ${cacheKey}`);
      return cachedItem;
      
    } catch (error) {
      console.error('❌ Failed to get cached item:', error);
      return null;
    }
  }

  // Search for items by various identifiers
  async searchCachedItems(
    searchTerm: string, 
    storeNumber?: number
  ): Promise<CachedItem[]> {
    if (!this.db) {
      return [];
    }

    const results: CachedItem[] = [];
    const searchLower = searchTerm.toLowerCase();

    try {
      const transaction = this.db.transaction([this.itemStoreName], 'readonly');
      const store = transaction.objectStore(this.itemStoreName);
      
      // Search by GTIN
      if (/^\d+$/.test(searchTerm)) {
        const gtinIndex = store.index('gtin');
        const gtinResults = await this.searchIndex(gtinIndex, searchTerm);
        results.push(...gtinResults);
      }

      // Search by SKU
      const skuIndex = store.index('sku');
      const skuResults = await this.searchIndex(skuIndex, searchTerm);
      results.push(...skuResults);

      // Search by external item number
      const extIndex = store.index('externalItemNo');
      const extResults = await this.searchIndex(extIndex, searchTerm);
      results.push(...extResults);

      // Filter by store if specified
      const filteredResults = storeNumber 
        ? results.filter(item => !item.storeNumber || item.storeNumber === storeNumber)
        : results;

      // Remove duplicates and filter by text search
      const uniqueResults = Array.from(
        new Map(filteredResults.map(item => [item.id, item])).values()
      ).filter(item => {
        const itemText = item.item.itemText?.toLowerCase() || '';
        const brand = item.item.brand?.text?.toLowerCase() || '';
        return itemText.includes(searchLower) || brand.includes(searchLower);
      });

      // Update last accessed time for all results
      const writeTransaction = this.db.transaction([this.itemStoreName], 'readwrite');
      const writeStore = writeTransaction.objectStore(this.itemStoreName);
      const now = Date.now();
      
      for (const item of uniqueResults) {
        item.lastAccessed = now;
        writeStore.put(item);
      }

      console.log(`🔍 Found ${uniqueResults.length} cached items for search: ${searchTerm}`);
      return uniqueResults;
      
    } catch (error) {
      console.error('❌ Failed to search cached items:', error);
      return [];
    }
  }

  // Helper method to search an index
  private async searchIndex(index: IDBIndex, value: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const request = index.openCursor();
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          if (cursor.key && cursor.key.toString().includes(value)) {
            results.push(cursor.value);
          }
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Remove item from cache
  async removeCachedItem(identifier: ItemIdentifier, storeNumber?: number): Promise<void> {
    if (!this.db) {
      return;
    }

    const cacheKey = this.generateCacheKey(identifier, storeNumber);

    try {
      const transaction = this.db.transaction([this.itemStoreName], 'readwrite');
      const store = transaction.objectStore(this.itemStoreName);
      
      await new Promise<void>((resolve, reject) => {
        const request = store.delete(cacheKey);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log(`🗑️ Removed cached item: ${cacheKey}`);
      
    } catch (error) {
      console.error('❌ Failed to remove cached item:', error);
    }
  }

  // Get cache statistics
  async getCacheStats(): Promise<CacheMetadata> {
    if (!this.db) {
      return { totalItems: 0, oldestEntry: 0, newestEntry: 0, lastCleanup: 0 };
    }

    try {
      const transaction = this.db.transaction([this.itemStoreName, this.metadataStoreName], 'readonly');
      const itemStore = transaction.objectStore(this.itemStoreName);
      const metaStore = transaction.objectStore(this.metadataStoreName);
      
      // Count total items
      const totalItems = await new Promise<number>((resolve, reject) => {
        const request = itemStore.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      // Get metadata
      const metadata = await new Promise<CacheMetadata>((resolve, reject) => {
        const request = metaStore.get('stats');
        request.onsuccess = () => resolve(request.result?.data || { totalItems: 0, oldestEntry: 0, newestEntry: 0, lastCleanup: 0 });
        request.onerror = () => reject(request.error);
      });

      return { ...metadata, totalItems };
      
    } catch (error) {
      console.error('❌ Failed to get cache stats:', error);
      return { totalItems: 0, oldestEntry: 0, newestEntry: 0, lastCleanup: 0 };
    }
  }

  // Update cache metadata
  private async updateMetadata(): Promise<void> {
    if (!this.db) return;

    try {
      const transaction = this.db.transaction([this.metadataStoreName], 'readwrite');
      const store = transaction.objectStore(this.metadataStoreName);
      
      const stats = await this.getCacheStats();
      
      await new Promise<void>((resolve, reject) => {
        const request = store.put({
          key: 'stats',
          data: { ...stats, lastCleanup: Date.now() }
        });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      
    } catch (error) {
      console.error('❌ Failed to update metadata:', error);
    }
  }

  // Cleanup old entries if cache is too large
  private async cleanupIfNeeded(): Promise<void> {
    if (!this.db) return;

    const stats = await this.getCacheStats();
    
    if (stats.totalItems <= this.maxCacheSize) {
      return;
    }

    console.log(`🧹 Cache cleanup needed: ${stats.totalItems} items > ${this.maxCacheSize} max`);

    try {
      const transaction = this.db.transaction([this.itemStoreName], 'readwrite');
      const store = transaction.objectStore(this.itemStoreName);
      const index = store.index('lastAccessed');
      
      // Get oldest items
      const itemsToDelete: string[] = [];
      const itemsToKeep = Math.floor(this.maxCacheSize * 0.8); // Keep 80% of max
      
      await new Promise<void>((resolve, reject) => {
        let count = 0;
        const request = index.openCursor();
        
        request.onsuccess = (event) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor && count < (stats.totalItems - itemsToKeep)) {
            itemsToDelete.push(cursor.value.id);
            count++;
            cursor.continue();
          } else {
            resolve();
          }
        };
        
        request.onerror = () => reject(request.error);
      });

      // Delete old items
      for (const id of itemsToDelete) {
        store.delete(id);
      }

      console.log(`🗑️ Cleaned up ${itemsToDelete.length} old cache entries`);
      
    } catch (error) {
      console.error('❌ Failed to cleanup cache:', error);
    }
  }

  // Clear all cache
  async clearCache(): Promise<void> {
    if (!this.db) {
      return;
    }

    try {
      const transaction = this.db.transaction([this.itemStoreName], 'readwrite');
      const store = transaction.objectStore(this.itemStoreName);
      
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      console.log('🧹 Cache cleared successfully');
      
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
    }
  }
}

// Export singleton instance
export const itemCacheService = new ItemCacheService();
export default itemCacheService;
