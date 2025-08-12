// Module system types for the modular POS interface

export type ModuleType = 
  | 'search'
  | 'keypad' 
  | 'product-details'
  | 'basket-items'
  | 'basket-summary'
  | 'recent-transactions'
  | 'recommendations'
  | 'quick-actions';

export type ModuleSize = 'micro' | 'small' | 'medium' | 'large';

export interface ModulePosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ModuleConfig {
  id: string;
  type: ModuleType;
  title: string;
  position: ModulePosition;
  visible: boolean;
  locked: boolean;
  minSize: { w: number; h: number };
  maxSize?: { w: number; h: number };
  config?: Record<string, any>;
}

export interface LayoutProfile {
  id: string;
  name: string;
  description?: string;
  modules: ModuleConfig[];
  createdAt: Date;
  updatedAt: Date;
  isDefault?: boolean;
  deviceId?: string;
  userId?: string;
}

export interface ModuleProps {
  module: ModuleConfig;
  size: ModuleSize;
  isEditMode: boolean;
  onConfigChange?: (config: Record<string, any>) => void;
}

// Predefined layout templates
export const LAYOUT_TEMPLATES: Omit<LayoutProfile, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Standard POS',
    description: 'Classic three-panel layout',
    modules: [
      {
        id: 'basket-items-1',
        type: 'basket-items',
        title: 'Cart Items',
        position: { x: 0, y: 0, w: 3, h: 6 },
        visible: true,
        locked: false,
        minSize: { w: 2, h: 4 },
        config: {}
      },
      {
        id: 'search-1',
        type: 'search',
        title: 'Product Search',
        position: { x: 3, y: 0, w: 4, h: 3 },
        visible: true,
        locked: false,
        minSize: { w: 3, h: 2 },
        config: {}
      },
      {
        id: 'keypad-1',
        type: 'keypad',
        title: 'Keypad',
        position: { x: 3, y: 3, w: 4, h: 4 },
        visible: true,
        locked: false,
        minSize: { w: 3, h: 3 },
        config: {}
      },
      {
        id: 'product-details-1',
        type: 'product-details',
        title: 'Product Details',
        position: { x: 7, y: 0, w: 3, h: 4 },
        visible: true,
        locked: false,
        minSize: { w: 2, h: 3 },
        config: {}
      },
      {
        id: 'recommendations-1',
        type: 'recommendations',
        title: 'Recommendations',
        position: { x: 7, y: 4, w: 3, h: 3 },
        visible: true,
        locked: false,
        minSize: { w: 2, h: 2 },
        config: {}
      },
      {
        id: 'basket-summary-1',
        type: 'basket-summary',
        title: 'Checkout',
        position: { x: 0, y: 6, w: 7, h: 2 },
        visible: true,
        locked: false,
        minSize: { w: 4, h: 1 },
        config: {}
      }
    ]
  },
  {
    name: 'Compact Mode',
    description: 'Minimal layout for small screens',
    modules: [
      {
        id: 'search-1',
        type: 'search',
        title: 'Search',
        position: { x: 0, y: 0, w: 6, h: 2 },
        visible: true,
        locked: false,
        minSize: { w: 4, h: 2 },
        config: {}
      },
      {
        id: 'basket-items-1',
        type: 'basket-items',
        title: 'Cart',
        position: { x: 6, y: 0, w: 4, h: 4 },
        visible: true,
        locked: false,
        minSize: { w: 3, h: 3 },
        config: {}
      },
      {
        id: 'keypad-1',
        type: 'keypad',
        title: 'Keypad',
        position: { x: 0, y: 2, w: 4, h: 3 },
        visible: true,
        locked: false,
        minSize: { w: 3, h: 3 },
        config: {}
      },
      {
        id: 'product-details-1',
        type: 'product-details',
        title: 'Details',
        position: { x: 4, y: 2, w: 2, h: 3 },
        visible: true,
        locked: false,
        minSize: { w: 2, h: 2 },
        config: {}
      },
      {
        id: 'basket-summary-1',
        type: 'basket-summary',
        title: 'Pay',
        position: { x: 0, y: 5, w: 10, h: 1 },
        visible: true,
        locked: false,
        minSize: { w: 6, h: 1 },
        config: {}
      }
    ]
  },
  {
    name: 'Training Mode',
    description: 'Extended layout with all available modules',
    modules: [
      {
        id: 'search-1',
        type: 'search',
        title: 'Product Search',
        position: { x: 0, y: 0, w: 4, h: 3 },
        visible: true,
        locked: false,
        minSize: { w: 3, h: 2 },
        config: {}
      },
      {
        id: 'keypad-1',
        type: 'keypad',
        title: 'Keypad',
        position: { x: 4, y: 0, w: 3, h: 4 },
        visible: true,
        locked: false,
        minSize: { w: 3, h: 3 },
        config: {}
      },
      {
        id: 'product-details-1',
        type: 'product-details',
        title: 'Product Details',
        position: { x: 7, y: 0, w: 3, h: 4 },
        visible: true,
        locked: false,
        minSize: { w: 2, h: 3 },
        config: {}
      },
      {
        id: 'basket-items-1',
        type: 'basket-items',
        title: 'Cart Items',
        position: { x: 0, y: 3, w: 4, h: 4 },
        visible: true,
        locked: false,
        minSize: { w: 3, h: 3 },
        config: {}
      },
      {
        id: 'recent-transactions-1',
        type: 'recent-transactions',
        title: 'Recent Sales',
        position: { x: 7, y: 4, w: 3, h: 3 },
        visible: true,
        locked: false,
        minSize: { w: 2, h: 2 },
        config: {}
      },
      {
        id: 'recommendations-1',
        type: 'recommendations',
        title: 'Suggestions',
        position: { x: 4, y: 4, w: 3, h: 2 },
        visible: true,
        locked: false,
        minSize: { w: 2, h: 2 },
        config: {}
      },
      {
        id: 'quick-actions-1',
        type: 'quick-actions',
        title: 'Quick Actions',
        position: { x: 4, y: 6, w: 3, h: 1 },
        visible: true,
        locked: false,
        minSize: { w: 2, h: 1 },
        config: {}
      },
      {
        id: 'basket-summary-1',
        type: 'basket-summary',
        title: 'Checkout',
        position: { x: 0, y: 7, w: 10, h: 1 },
        visible: true,
        locked: false,
        minSize: { w: 6, h: 1 },
        config: {}
      }
    ]
  }
];

// Helper functions
export function getModuleSize(module: ModuleConfig): ModuleSize {
  const area = module.position.w * module.position.h;
  if (area <= 2) return 'micro';
  if (area <= 6) return 'small';
  if (area <= 12) return 'medium';
  return 'large';
}

export function generateModuleId(type: ModuleType): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
