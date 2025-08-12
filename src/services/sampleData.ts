import { db } from './database';
import { Product, User, Company, Store, Device } from '../types';

// Sample data for development and testing
export class SampleDataService {
  static async initializeSampleData(): Promise<void> {
    try {
      // Check if data already exists
      const productCount = await db.products.count();
      if (productCount > 0) {
        console.log('Sample data already exists');
        return;
      }

      // Create sample products
      const sampleProducts: Product[] = [
        {
          id: '1',
          companyId: 'company-1',
          sku: 'SHI-001',
          name: 'Classic White Shirt',
          description: 'Premium cotton dress shirt',
          category: 'Shirts',
          price: 79.99,
          cost: 35.00,
          isActive: true,
          images: [],
          inventory: [
            {
              storeId: 'store-1',
              quantity: 25,
              minQuantity: 5,
              maxQuantity: 50,
              lastUpdated: new Date()
            }
          ],
          attributes: [
            { name: 'Material', value: '100% Cotton' },
            { name: 'Size', value: 'M' },
            { name: 'Color', value: 'White' }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          companyId: 'company-1',
          sku: 'TRO-001',
          name: 'Navy Blue Trousers',
          description: 'Tailored fit business trousers',
          category: 'Trousers',
          price: 129.99,
          cost: 55.00,
          isActive: true,
          images: [],
          inventory: [
            {
              storeId: 'store-1',
              quantity: 18,
              minQuantity: 3,
              maxQuantity: 30,
              lastUpdated: new Date()
            }
          ],
          attributes: [
            { name: 'Material', value: 'Wool Blend' },
            { name: 'Size', value: '32' },
            { name: 'Color', value: 'Navy' }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '3',
          companyId: 'company-1',
          sku: 'JAC-001',
          name: 'Leather Jacket',
          description: 'Genuine leather biker jacket',
          category: 'Jackets',
          price: 299.99,
          cost: 140.00,
          isActive: true,
          images: [],
          inventory: [
            {
              storeId: 'store-1',
              quantity: 8,
              minQuantity: 2,
              maxQuantity: 15,
              lastUpdated: new Date()
            }
          ],
          attributes: [
            { name: 'Material', value: 'Genuine Leather' },
            { name: 'Size', value: 'L' },
            { name: 'Color', value: 'Black' }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '4',
          companyId: 'company-1',
          sku: 'SHO-001',
          name: 'Oxford Shoes',
          description: 'Classic brown oxford dress shoes',
          category: 'Shoes',
          price: 159.99,
          cost: 70.00,
          isActive: true,
          images: [],
          inventory: [
            {
              storeId: 'store-1',
              quantity: 12,
              minQuantity: 3,
              maxQuantity: 20,
              lastUpdated: new Date()
            }
          ],
          attributes: [
            { name: 'Material', value: 'Leather' },
            { name: 'Size', value: '42' },
            { name: 'Color', value: 'Brown' }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '5',
          companyId: 'company-1',
          sku: 'ACC-001',
          name: 'Leather Belt',
          description: 'Premium leather belt with silver buckle',
          category: 'Accessories',
          price: 45.99,
          cost: 18.00,
          isActive: true,
          images: [],
          inventory: [
            {
              storeId: 'store-1',
              quantity: 30,
              minQuantity: 10,
              maxQuantity: 50,
              lastUpdated: new Date()
            }
          ],
          attributes: [
            { name: 'Material', value: 'Leather' },
            { name: 'Size', value: '95cm' },
            { name: 'Color', value: 'Black' }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Add products to database
      await db.syncProducts(sampleProducts);

      console.log('Sample data initialized successfully');
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  }

  static getSampleAuthResponse() {
    const company: Company = {
      id: 'company-1',
      name: 'LAS Fashion Store',
      settings: {
        currency: 'USD',
        taxRate: 0.25, // 25% VAT
        timezone: 'Europe/Oslo',
        logoUrl: undefined
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const store: Store = {
      id: 'store-1',
      storeConceptId: 'concept-1',
      companyId: 'company-1',
      name: 'Oslo Downtown Store',
      address: {
        street: 'Karl Johans gate 1',
        city: 'Oslo',
        state: 'Oslo',
        postalCode: '0154',
        country: 'Norway'
      },
      settings: {
        allowNegativeInventory: false,
        requireCustomerForReturns: true,
        maxDiscountPercent: 20,
        timezone: 'Europe/Oslo'
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const device: Device = {
      id: 'device-1',
      storeId: 'store-1',
      name: 'Register 1',
      deviceType: 'REGISTER',
      isActive: true,
      lastSeen: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const user: User = {
      id: 'user-1',
      companyId: 'company-1',
      userNumber: '1',
      firstName: 'Demo',
      lastName: 'Cashier',
      email: 'demo@laspos.com',
      role: 'CASHIER',
      storeIds: ['store-1'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return {
      user,
      company,
      store,
      device,
      token: 'demo-jwt-token',
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours
    };
  }

  static async clearAllData(): Promise<void> {
    try {
      await db.clearAllData();
      console.log('All data cleared successfully');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  static async getStorageStats() {
    try {
      const stats = await db.getStorageStats();
      console.log('Storage statistics:', stats);
      return stats;
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return null;
    }
  }
}
