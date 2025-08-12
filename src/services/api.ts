import {
  ApiResponse,
  AuthResponse,
  LoginCredentials,
  Transaction,
  Product,
  Customer,
  Promotion,
  User
} from '../types';
import { SampleDataService } from './sampleData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.laspos.com/v1';

class ApiService {
  private token: string | null = null;
  private companyId: string | null = null;

  constructor() {
    // Load token from localStorage if available
    this.token = localStorage.getItem('laspos_token');
    this.companyId = localStorage.getItem('laspos_company_id');
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (this.companyId) {
      headers['X-Company-ID'] = this.companyId;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: data.message || 'An error occurred',
            details: data.details
          },
          timestamp: new Date()
        };
      }

      return {
        success: true,
        data,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Network error occurred',
        },
        timestamp: new Date()
      };
    }
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    // Handle demo/development login
    if (credentials.userNumber === '1' && credentials.password === '111') {
      const authResponse = SampleDataService.getSampleAuthResponse();
      
      // Initialize sample data
      await SampleDataService.initializeSampleData();
      
      // Store authentication data
      this.token = authResponse.token;
      this.companyId = authResponse.company.id;
      
      localStorage.setItem('laspos_token', this.token);
      localStorage.setItem('laspos_company_id', this.companyId);
      localStorage.setItem('laspos_user', JSON.stringify(authResponse.user));
      localStorage.setItem('laspos_company', JSON.stringify(authResponse.company));
      localStorage.setItem('laspos_store', JSON.stringify(authResponse.store));
      localStorage.setItem('laspos_device', JSON.stringify(authResponse.device));
      
      return {
        success: true,
        data: authResponse,
        timestamp: new Date()
      };
    }

    // Regular API login for production
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    if (response.success && response.data) {
      this.token = response.data.token;
      this.companyId = response.data.company.id;
      
      localStorage.setItem('laspos_token', this.token);
      if (this.companyId) {
        localStorage.setItem('laspos_company_id', this.companyId);
      }
      localStorage.setItem('laspos_user', JSON.stringify(response.data.user));
      localStorage.setItem('laspos_company', JSON.stringify(response.data.company));
      localStorage.setItem('laspos_store', JSON.stringify(response.data.store));
      localStorage.setItem('laspos_device', JSON.stringify(response.data.device));
    }

    return response;
  }

  async logout(): Promise<void> {
    await this.request('/auth/logout', { method: 'POST' });
    
    this.token = null;
    this.companyId = null;
    
    localStorage.removeItem('laspos_token');
    localStorage.removeItem('laspos_company_id');
    localStorage.removeItem('laspos_user');
    localStorage.removeItem('laspos_company');
    localStorage.removeItem('laspos_store');
    localStorage.removeItem('laspos_device');
  }

  // Products
  async getProducts(storeId: string): Promise<ApiResponse<Product[]>> {
    return this.request<Product[]>(`/stores/${storeId}/products`);
  }

  async getProduct(productId: string): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${productId}`);
  }

  async searchProducts(query: string, storeId: string): Promise<ApiResponse<Product[]>> {
    const params = new URLSearchParams({ q: query, storeId });
    return this.request<Product[]>(`/products/search?${params}`);
  }

  // Customers
  async getCustomers(): Promise<ApiResponse<Customer[]>> {
    return this.request<Customer[]>('/customers');
  }

  async getCustomer(customerId: string): Promise<ApiResponse<Customer>> {
    return this.request<Customer>(`/customers/${customerId}`);
  }

  async findCustomerByLoyalty(loyaltyNumber: string): Promise<ApiResponse<Customer>> {
    return this.request<Customer>(`/customers/loyalty/${loyaltyNumber}`);
  }

  // Transactions
  async createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Transaction>> {
    return this.request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transaction)
    });
  }

  async getTransactions(storeId: string, page = 1, limit = 50): Promise<ApiResponse<{ transactions: Transaction[], total: number }>> {
    const params = new URLSearchParams({ 
      storeId, 
      page: page.toString(), 
      limit: limit.toString() 
    });
    return this.request<{ transactions: Transaction[], total: number }>(`/transactions?${params}`);
  }

  // Promotions
  async getPromotions(storeId: string): Promise<ApiResponse<Promotion[]>> {
    return this.request<Promotion[]>(`/stores/${storeId}/promotions`);
  }

  // Sync offline transactions
  async syncTransactions(transactions: Transaction[]): Promise<ApiResponse<{ synced: number, failed: number }>> {
    return this.request<{ synced: number, failed: number }>('/transactions/sync', {
      method: 'POST',
      body: JSON.stringify({ transactions })
    });
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.request('/health');
      return response.success;
    } catch {
      return false;
    }
  }

  // Get stored user data
  getStoredUser(): User | null {
    const userData = localStorage.getItem('laspos_user');
    return userData ? JSON.parse(userData) : null;
  }

  getStoredCompany() {
    const companyData = localStorage.getItem('laspos_company');
    return companyData ? JSON.parse(companyData) : null;
  }

  getStoredStore() {
    const storeData = localStorage.getItem('laspos_store');
    return storeData ? JSON.parse(storeData) : null;
  }

  getStoredDevice() {
    const deviceData = localStorage.getItem('laspos_device');
    return deviceData ? JSON.parse(deviceData) : null;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

export const apiService = new ApiService();
