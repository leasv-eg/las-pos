// Core business entity types for LAS POS

export interface Company {
  id: string;
  name: string;
  settings: CompanySettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanySettings {
  currency: string;
  taxRate: number;
  timezone: string;
  logoUrl?: string;
}

export interface StoreConcept {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Store {
  id: string;
  storeConceptId: string;
  companyId: string;
  name: string;
  address: Address;
  settings: StoreSettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface StoreSettings {
  allowNegativeInventory: boolean;
  requireCustomerForReturns: boolean;
  maxDiscountPercent: number;
  timezone: string;
}

export interface Device {
  id: string;
  storeId: string;
  name: string;
  deviceType: 'REGISTER' | 'TABLET' | 'MOBILE';
  isActive: boolean;
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  companyId: string;
  userNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  storeIds: string[]; // Stores this user can access
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'CASHIER' | 'STORE_MANAGER' | 'REGIONAL_MANAGER' | 'ADMIN';

export interface Product {
  id: string;
  companyId: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  cost?: number;
  weight?: number;
  dimensions?: ProductDimensions;
  images: string[];
  isActive: boolean;
  inventory: ProductInventory[];
  attributes: ProductAttribute[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

export interface ProductInventory {
  storeId: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  lastUpdated: Date;
}

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface Customer {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  loyaltyNumber?: string;
  loyaltyPoints: number;
  totalSpent: number;
  lastVisit?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  companyId: string;
  storeId: string;
  deviceId: string;
  userId: string;
  customerId?: string;
  transactionNumber: string;
  type: 'SALE' | 'RETURN' | 'EXCHANGE';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  items: TransactionItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  payments: Payment[];
  promotions: AppliedPromotion[];
  isOffline: boolean;
  syncedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  totalPrice: number;
}

export interface Payment {
  id: string;
  method: PaymentMethod;
  amount: number;
  reference?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  processedAt?: Date;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'VIPPS' | 'GIFT_CARD' | 'STORE_CREDIT';

export interface Promotion {
  id: string;
  companyId: string;
  name: string;
  description: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y' | 'SPEND_X_GET_Y';
  value: number;
  conditions: PromotionCondition[];
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PromotionCondition {
  type: 'MIN_AMOUNT' | 'MIN_QUANTITY' | 'SPECIFIC_PRODUCT' | 'CATEGORY';
  value: string | number;
}

export interface AppliedPromotion {
  promotionId: string;
  name: string;
  discountAmount: number;
  appliedToItems: string[]; // Transaction item IDs
}
