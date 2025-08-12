import Dexie, { Table } from 'dexie';
import {
  Transaction,
  Product,
  Customer,
  User,
  Company,
  Store,
  Device,
  Promotion,
  SyncQueueItem
} from '../types';

export class LasPosDatabase extends Dexie {
  // Tables for offline storage
  transactions!: Table<Transaction>;
  products!: Table<Product>;
  customers!: Table<Customer>;
  users!: Table<User>;
  companies!: Table<Company>;
  stores!: Table<Store>;
  devices!: Table<Device>;
  promotions!: Table<Promotion>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super('LasPosDatabase');
    
    this.version(1).stores({
      transactions: '++id, companyId, storeId, deviceId, userId, customerId, transactionNumber, type, status, isOffline, createdAt',
      products: '++id, companyId, sku, name, category, isActive',
      customers: '++id, companyId, email, phone, loyaltyNumber',
      users: '++id, companyId, userNumber, email, role, isActive',
      companies: '++id, name',
      stores: '++id, storeConceptId, companyId, name, isActive',
      devices: '++id, storeId, name, deviceType, isActive',
      promotions: '++id, companyId, name, type, isActive, validFrom, validTo',
      syncQueue: '++id, type, attempts, createdAt'
    });
  }

  // Transaction methods
  async addTransaction(transaction: Omit<Transaction, 'id'>): Promise<string> {
    const id = await this.transactions.add({
      ...transaction,
      id: crypto.randomUUID()
    } as Transaction);
    return id.toString();
  }

  async getOfflineTransactions(): Promise<Transaction[]> {
    return await this.transactions.where('isOffline').equals(1).toArray();
  }

  async markTransactionSynced(transactionId: string): Promise<void> {
    await this.transactions.update(transactionId, {
      isOffline: false,
      syncedAt: new Date()
    });
  }

  // Product methods
  async syncProducts(products: Product[]): Promise<void> {
    await this.products.clear();
    await this.products.bulkAdd(products);
  }

  async getProduct(sku: string): Promise<Product | undefined> {
    return await this.products.where('sku').equals(sku).first();
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return await this.products
      .filter(product => 
        product.name.toLowerCase().includes(lowerQuery) ||
        product.sku.toLowerCase().includes(lowerQuery) ||
        product.category.toLowerCase().includes(lowerQuery)
      )
      .limit(20)
      .toArray();
  }

  // Customer methods
  async syncCustomers(customers: Customer[]): Promise<void> {
    await this.customers.clear();
    await this.customers.bulkAdd(customers);
  }

  async getCustomer(customerId: string): Promise<Customer | undefined> {
    return await this.customers.get(customerId);
  }

  async findCustomerByLoyalty(loyaltyNumber: string): Promise<Customer | undefined> {
    return await this.customers.where('loyaltyNumber').equals(loyaltyNumber).first();
  }

  // Sync queue methods
  async addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'attempts' | 'createdAt'>): Promise<void> {
    await this.syncQueue.add({
      ...item,
      id: crypto.randomUUID(),
      attempts: 0,
      createdAt: new Date()
    });
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    return await this.syncQueue.orderBy('createdAt').toArray();
  }

  async updateSyncQueueItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
    await this.syncQueue.update(id, updates);
  }

  async removeSyncQueueItem(id: string): Promise<void> {
    await this.syncQueue.delete(id);
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    await this.transactions.clear();
    await this.products.clear();
    await this.customers.clear();
    await this.promotions.clear();
    await this.syncQueue.clear();
  }

  async getStorageStats(): Promise<{
    transactions: number;
    products: number;
    customers: number;
    syncQueue: number;
  }> {
    const [transactions, products, customers, syncQueue] = await Promise.all([
      this.transactions.count(),
      this.products.count(),
      this.customers.count(),
      this.syncQueue.count()
    ]);

    return { transactions, products, customers, syncQueue };
  }
}

// Create and export a singleton instance
export const db = new LasPosDatabase();
