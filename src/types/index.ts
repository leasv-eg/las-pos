// Import the entities types first
export * from './entities';

// UI and application state types

export interface BasketItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  totalPrice: number;
}

export interface BasketState {
  items: BasketItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  customerId?: string;
  promotions: AppliedPromotion[];
}

export interface ActionPadMode {
  type: 'KEYPAD' | 'SEARCH';
}

export interface KeypadState {
  display: string;
  operation?: 'QUANTITY' | 'PRICE_OVERRIDE' | 'SKU_ENTRY';
  targetItemId?: string;
}

export interface SearchState {
  query: string;
  results: Product[];
  isLoading: boolean;
}

export interface InsightPanelState {
  mode: 'DEFAULT' | 'PRODUCT_INFO' | 'CUSTOMER_INFO' | 'PROMOTION_ALERT';
  data?: InsightData;
}

export interface InsightData {
  productInfo?: ProductInsight;
  customerInfo?: CustomerInsight;
  promotionAlert?: PromotionAlert;
  upsellItems?: Product[];
  crossSellItems?: Product[];
}

export interface ProductInsight {
  product: Product;
  stockLevels: StockLevel[];
  recommendations: Product[];
}

export interface StockLevel {
  storeId: string;
  storeName: string;
  quantity: number;
}

export interface CustomerInsight {
  customer: Customer;
  recentPurchases: Transaction[];
  personalizedOffers: Promotion[];
  loyaltyStatus: LoyaltyStatus;
}

export interface LoyaltyStatus {
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  points: number;
  nextTierPoints: number;
  benefits: string[];
}

export interface PromotionAlert {
  promotion: Promotion;
  message: string;
  actionRequired?: string;
  suggestedProducts?: Product[];
}

export interface AppState {
  user: User | null;
  company: Company | null;
  store: Store | null;
  device: Device | null;
  isOnline: boolean;
  isTrainingMode: boolean;
  basket: BasketState;
  actionPad: ActionPadMode;
  keypad: KeypadState;
  search: SearchState;
  insightPanel: InsightPanelState;
}

export interface LoginCredentials {
  userNumber: string;
  password: string;
  storeId?: string;
  deviceId?: string;
}

export interface AuthResponse {
  user: User;
  company: Company;
  store: Store;
  device: Device;
  token: string;
  expiresAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: Date;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Offline sync types
export interface SyncQueueItem {
  id: string;
  type: 'TRANSACTION' | 'INVENTORY_UPDATE' | 'CUSTOMER_UPDATE';
  data: any;
  attempts: number;
  createdAt: Date;
  lastAttempt?: Date;
}

export interface SyncStatus {
  isOnline: boolean;
  queueSize: number;
  lastSyncAt?: Date;
  isSyncing: boolean;
  failedItems: number;
}
