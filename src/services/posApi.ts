// EG Retail POS API Integration Service
import { ItemSaleRequest, ItemSaleResponse, CartResponse, AddItemRequest, POSEnvironment, EnvironmentConfig, CheckoutRequest, CheckoutResponse, Payment } from '../types/posApiTypes';

export class POSApiService {
  private isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  private environments: EnvironmentConfig = {
    dev: this.isDevelopment ? '/api/posapi-dev' : 'https://posapi.egretail-dev.cloud/api',
    test: this.isDevelopment ? '/api/posapi-test' : 'https://posapi.egretail-test.cloud/api',
    prod: this.isDevelopment ? '/api/posapi-prod' : 'https://posapi.egretail.cloud/api'
  };

  private currentEnvironment: POSEnvironment = 'test';
  private bearerToken: string | null = null;
  private apiKey: string = 'mobile';
  private storeNum: number = 1000;

  constructor() {
    console.log('🔧 POS API Service initialized');
    console.log(`🏠 Development mode: ${this.isDevelopment}`);
    console.log('🌐 Environment URLs:', this.environments);
    // Load saved environment preference
    const savedEnv = localStorage.getItem('pos_environment') as POSEnvironment;
    if (savedEnv && this.environments[savedEnv]) {
      this.currentEnvironment = savedEnv;
    }
  }

  // Environment Management
  setEnvironment(environment: POSEnvironment): void {
    if (this.environments[environment]) {
      this.currentEnvironment = environment;
      localStorage.setItem('pos_environment', environment);
      console.log(`🌍 Environment set to: ${environment} (${this.environments[environment]})`);
    } else {
      throw new Error(`Invalid environment: ${environment}`);
    }
  }

  getCurrentEnvironment(): POSEnvironment {
    return this.currentEnvironment;
  }

  getEnvironmentURL(): string {
    return this.environments[this.currentEnvironment];
  }

  getAllEnvironments(): { key: POSEnvironment; label: string; url: string }[] {
    return Object.entries(this.environments).map(([key, url]) => ({
      key: key as POSEnvironment,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      url
    }));
  }

  // Token Management
  setBearerToken(token: string): void {
    this.bearerToken = token;
    console.log('🔑 Bearer token set');
  }

  setStoreNumber(storeNum: number): void {
    this.storeNum = storeNum;
    console.log(`🏪 Store number set to: ${storeNum}`);
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    console.log(`🔐 API key set to: ${apiKey}`);
  }

  // Configuration Management
  getConfig(): { hasToken: boolean; storeNum: number; apiKey: string; environment: POSEnvironment; environmentURL: string } {
    return {
      hasToken: !!this.bearerToken,
      storeNum: this.storeNum,
      apiKey: this.apiKey,
      environment: this.currentEnvironment,
      environmentURL: this.getEnvironmentURL()
    };
  }

  // HTTP Helper Methods
  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.bearerToken) {
      headers['Authorization'] = `Bearer ${this.bearerToken}`;
    }

    return headers;
  }

  // Store Identificator Helper (matching Postman format)
  private createStoreIdentificator() {
    return {
      storenum: this.storeNum,
      storeNumType: "StoreNum"
    };
  }

  // Create new cart with items using ItemSale_NewCartWithItems
  async createCartWithItems(items: { ean: string; quantity: number }[]): Promise<CartResponse> {
    console.log('🛒 Creating cart with items:', items);

    if (!this.bearerToken) {
      throw new Error('Bearer token not set. Please set a valid token first.');
    }

    const requestBody: ItemSaleRequest = {
      apiKey: this.apiKey,
      cartType: "Sale",
      storeIdentificator: this.createStoreIdentificator(),
      physicalStoreIdentificator: this.createStoreIdentificator(),
      items: items.map(item => ({
        ean: item.ean,
        quantity: item.quantity
      }))
    };

    console.log('📤 Request URL:', `${this.getEnvironmentURL()}/ItemSale/NewCartWithItems`);
    console.log('📤 Request Body:', JSON.stringify(requestBody, null, 2));
    console.log('📤 Headers:', this.getHeaders());

    try {
      const response = await fetch(`${this.getEnvironmentURL()}/ItemSale/NewCartWithItems`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        // Try to get error details from response body
        let errorDetails = `HTTP error! status: ${response.status} ${response.statusText}`;
        try {
          const errorBody = await response.text();
          console.error('❌ Error response body:', errorBody);
          errorDetails += `\nResponse: ${errorBody}`;
        } catch (e) {
          console.error('❌ Could not read error response body');
        }
        throw new Error(errorDetails);
      }

      const data: ItemSaleResponse = await response.json();
      console.log('✅ Cart created successfully:', data);

      return {
        success: true,
        cart: data.cart,
        cartItemIdentificators: data.cartItemIdentificators,
        message: 'Cart created successfully'
      };

    } catch (error) {
      console.error('💥 Error creating cart:', error);
      
      // Check for CORS-related errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        return {
          success: false,
          error: 'CORS Error: The API server does not allow requests from localhost. This is common in production environments. Try using the development or test environment, or deploy your app to a proper domain.',
          message: 'CORS Policy Blocked Request'
        };
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to create cart'
      };
    }
  }

  async addItemToCart(cartId: string, revision: number, item: { ean: string; quantity: number }): Promise<CartResponse> {
    console.log('➕ Adding item to cart:', cartId, item);

    if (!this.bearerToken) {
      throw new Error('Bearer token not set. Please set a valid token first.');
    }

    // TODO: Fix CartIdentificator structure
    const cartIdentificator = {
      id: cartId,
      revision: revision,
      hashBasedMessageAuthenticationCode: "" // This would need to be provided by the API
    };

    const requestBody: AddItemRequest = {
      cartId: cartIdentificator,
      ean: item.ean,
      quantity: item.quantity
    };

    try {
      const response = await fetch(`${this.getEnvironmentURL()}/ItemSale/AddItemToCart`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }

      const data: ItemSaleResponse = await response.json();
      console.log('✅ Item added successfully:', data);

      return {
        success: true,
        cart: data.cart,
        cartItemIdentificators: data.cartItemIdentificators,
        message: 'Item added successfully'
      };

    } catch (error) {
      console.error('💥 Error adding item:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to add item'
      };
    }
  }

  async getCart(cartId: string, revision?: number): Promise<CartResponse> {
    console.log('📋 Getting cart:', cartId, revision);

    if (!this.bearerToken) {
      throw new Error('Bearer token not set. Please set a valid token first.');
    }

    const requestBody = {
      apiKey: this.apiKey,
      cartId: cartId,
      storeIdentificator: this.createStoreIdentificator(),
      physicalStoreIdentificator: this.createStoreIdentificator(),
      ...(revision !== undefined && { revision })
    };

    try {
      const response = await fetch(`${this.getEnvironmentURL()}/ItemSale/GetCart`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
      }

      const data: ItemSaleResponse = await response.json();
      console.log('✅ Cart retrieved successfully:', data);

      return {
        success: true,
        cart: data.cart,
        cartItemIdentificators: data.cartItemIdentificators,
        message: 'Cart retrieved successfully'
      };

    } catch (error) {
      console.error('💥 Error getting cart:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to get cart'
      };
    }
  }

  // Checkout cart with payment
  async checkoutCart(cartId: string, totalAmount: number): Promise<CheckoutResponse> {
    if (!this.bearerToken) {
      console.error('❌ No bearer token available for checkout');
      return {
        success: false,
        error: 'No bearer token configured'
      };
    }

    try {
      console.log('💳 Initiating checkout for cart:', cartId, 'Amount:', totalAmount);

      // Create mock payment data with debugging for enum values
      console.log('🔍 Testing checkout with enum values: paymentAction=0, paymentTerminalType=0');
      
      const payment: Payment = {
        paymentReferenceNumber: `POS${Date.now()}`, // Generate unique reference
        paymentIsAuthorizedOnly: false,
        cardIssuerIdentifier: "123", // Simplified issuer ID
        cardName: "VISA",
        uniqueCardHolderIdentifier: `CARD${Date.now()}`,
        amount: totalAmount,
        type: "CreditDebit",
        reference: {
          id: Math.floor(Math.random() * 1000000),
          text: "Mock Payment",
          id2: `REF${Date.now()}`
        },
        paymentAction: 0, // 0 = None
        printText: `VISA **** APPROVED\nAmount: $${totalAmount.toFixed(2)}\nRef: POS${Date.now()}`,
        paymentTerminalType: 0 // 0 = None
      };

      const requestBody: CheckoutRequest = {
        payment: payment,
        cartId: {
          id: cartId
        }
      };

      console.log('📤 Checkout request:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${this.getEnvironmentURL()}/ItemSale/CheckoutCart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const responseText = await response.text();
      console.log('📥 Checkout response status:', response.status);
      console.log('📥 Checkout response body:', responseText);

      if (!response.ok) {
        const errorData = responseText ? JSON.parse(responseText) : null;
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          errorDetails: errorData
        };
      }

      const result = responseText ? JSON.parse(responseText) : {};
      
      return {
        success: true,
        transactionId: result.transactionId || `TXN${Date.now()}`,
        receiptNumber: result.receiptNumber || `RCP${Date.now()}`,
        payment: payment,
        totalAmount: totalAmount
      };

    } catch (error) {
      console.error('💥 Checkout error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown checkout error'
      };
    }
  }

  // Test connection to the API
  async testConnection(): Promise<{success: boolean, message: string, config: any}> {
    console.log('🔄 Testing API connection...');
    console.log(`🌐 Current URL: ${this.getEnvironmentURL()}/ItemSale/NewCartWithItems`);

    if (!this.bearerToken) {
      return {
        success: false,
        message: 'Bearer token not set. Cannot test connection.',
        config: this.getConfig()
      };
    }

    try {
      // Try to create a minimal cart as a connection test
      const testResult = await this.createCartWithItems([]);

      if (testResult.success) {
        return {
          success: true,
          message: 'API connection successful',
          config: this.getConfig()
        };
      } else {
        return {
          success: false,
          message: `Connection test failed: ${testResult.error}`,
          config: this.getConfig()
        };
      }

    } catch (error) {
      console.error('💥 Connection test error:', error);
      return {
        success: false,
        message: `Connection test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        config: this.getConfig()
      };
    }
  }
}

// Global instance
export const posApiService = new POSApiService();
