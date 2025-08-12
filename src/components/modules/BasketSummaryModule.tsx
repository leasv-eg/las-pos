import React from 'react';
import styled from 'styled-components';
import { ModuleProps, ModuleSize } from '../../types/modules';
import { BasketState } from '../../types';

interface BasketSummaryModuleProps extends ModuleProps {
  basket?: BasketState;
  onCheckout?: () => void;
  onClear?: () => void;
}

const ModuleContainer = styled.div<{ size: ModuleSize }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: ${({ size }) => size === 'micro' ? 'row' : 'column'};
  background: white;
  border-radius: 8px;
  overflow: hidden;
  padding: ${({ size }) => {
    switch (size) {
      case 'micro': return '4px 8px';
      case 'small': return '8px 12px';
      case 'medium': return '12px 16px';
      case 'large': return '16px 20px';
      default: return '12px 16px';
    }
  }};
`;

const SummarySection = styled.div<{ size: ModuleSize }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ size }) => {
    switch (size) {
      case 'micro': return '2px';
      case 'small': return '4px';
      case 'medium': return '6px';
      case 'large': return '8px';
      default: return '6px';
    }
  }};
`;

const SummaryRow = styled.div<{ 
  size: ModuleSize; 
  isTotal?: boolean;
  isHidden?: boolean;
}>`
  display: ${({ isHidden }) => isHidden ? 'none' : 'flex'};
  justify-content: space-between;
  align-items: center;
  font-size: ${({ size, isTotal }) => {
    if (isTotal) {
      switch (size) {
        case 'micro': return '12px';
        case 'small': return '16px';
        case 'medium': return '18px';
        case 'large': return '20px';
        default: return '18px';
      }
    } else {
      switch (size) {
        case 'micro': return '10px';
        case 'small': return '12px';
        case 'medium': return '14px';
        case 'large': return '16px';
        default: return '14px';
      }
    }
  }};
  font-weight: ${({ isTotal }) => isTotal ? '700' : '500'};
  color: ${({ isTotal }) => isTotal ? '#1976d2' : '#666'};
  padding: ${({ size, isTotal }) => {
    if (isTotal) {
      switch (size) {
        case 'micro': return '2px 0';
        case 'small': return '4px 0';
        case 'medium': return '6px 0';
        case 'large': return '8px 0';
        default: return '6px 0';
      }
    }
    return '0';
  }};
  border-top: ${({ isTotal }) => isTotal ? '2px solid #e0e0e0' : 'none'};
`;

const ButtonSection = styled.div<{ size: ModuleSize }>`
  display: flex;
  gap: ${({ size }) => {
    switch (size) {
      case 'micro': return '4px';
      case 'small': return '6px';
      case 'medium': return '8px';
      case 'large': return '12px';
      default: return '8px';
    }
  }};
  margin-top: ${({ size }) => size === 'micro' ? '0' : '8px'};
  flex-direction: ${({ size }) => size === 'micro' ? 'column' : 'row'};
`;

const ActionButton = styled.button<{ 
  size: ModuleSize; 
  variant?: 'primary' | 'secondary';
}>`
  flex: 1;
  padding: ${({ size }) => {
    switch (size) {
      case 'micro': return '4px 8px';
      case 'small': return '8px 12px';
      case 'medium': return '12px 16px';
      case 'large': return '16px 20px';
      default: return '12px 16px';
    }
  }};
  border: none;
  border-radius: 6px;
  font-size: ${({ size }) => {
    switch (size) {
      case 'micro': return '10px';
      case 'small': return '12px';
      case 'medium': return '14px';
      case 'large': return '16px';
      default: return '14px';
    }
  }};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: ${({ size }) => {
    switch (size) {
      case 'micro': return '24px';
      case 'small': return '32px';
      case 'medium': return '40px';
      case 'large': return '48px';
      default: return '40px';
    }
  }};
  
  ${({ variant = 'primary' }) => {
    switch (variant) {
      case 'primary':
        return `
          background: #1976d2;
          color: white;
          &:hover { background: #1565c0; }
          &:disabled { background: #ccc; }
        `;
      case 'secondary':
        return `
          background: #f5f5f5;
          color: #333;
          &:hover { background: #e0e0e0; }
          &:disabled { background: #f5f5f5; opacity: 0.5; }
        `;
    }
  }}
  
  &:active {
    transform: scale(0.98);
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const ItemCount = styled.div<{ size: ModuleSize }>`
  font-size: ${({ size }) => {
    switch (size) {
      case 'micro': return '10px';
      case 'small': return '12px';
      case 'medium': return '14px';
      case 'large': return '16px';
      default: return '14px';
    }
  }};
  color: #666;
  margin-bottom: ${({ size }) => {
    switch (size) {
      case 'micro': return '4px';
      case 'small': return '6px';
      case 'medium': return '8px';
      case 'large': return '10px';
      default: return '8px';
    }
  }};
`;

export const BasketSummaryModule: React.FC<BasketSummaryModuleProps> = ({
  module,
  size,
  isEditMode,
  basket,
  onCheckout,
  onClear
}) => {
  const hasItems = basket && basket.items.length > 0;
  const itemCount = basket?.items.length || 0;
  const totalItems = basket?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleCheckout = () => {
    if (isEditMode || !hasItems) return;
    onCheckout?.();
  };

  const handleClear = () => {
    if (isEditMode || !hasItems) return;
    onClear?.();
  };

  const formatCurrency = (amount: number) => amount.toFixed(2);

  return (
    <ModuleContainer size={size}>
      <SummarySection size={size}>
        {size !== 'micro' && (
          <ItemCount size={size}>
            {itemCount === 0 
              ? 'No items' 
              : `${itemCount} item${itemCount !== 1 ? 's' : ''} (${totalItems} total)`
            }
          </ItemCount>
        )}
        
        <SummaryRow 
          size={size} 
          isHidden={size === 'micro'}
        >
          <span>Subtotal:</span>
          <span>{formatCurrency(basket?.subtotal || 0)}</span>
        </SummaryRow>
        
        <SummaryRow 
          size={size} 
          isHidden={size === 'micro' || size === 'small'}
        >
          <span>Tax:</span>
          <span>{formatCurrency(basket?.taxAmount || 0)}</span>
        </SummaryRow>
        
        <SummaryRow 
          size={size} 
          isHidden={size === 'micro' || size === 'small'}
        >
          <span>Discounts:</span>
          <span>-{formatCurrency(basket?.discountAmount || 0)}</span>
        </SummaryRow>
        
        <SummaryRow size={size} isTotal>
          <span>Total:</span>
          <span>{formatCurrency(basket?.totalAmount || 0)}</span>
        </SummaryRow>
      </SummarySection>
      
      <ButtonSection size={size}>
        {size !== 'micro' && (
          <ActionButton
            size={size}
            variant="secondary"
            onClick={handleClear}
            disabled={isEditMode || !hasItems}
          >
            {size === 'small' ? 'Clear' : 'Clear Basket'}
          </ActionButton>
        )}
        
        <ActionButton
          size={size}
          variant="primary"
          onClick={handleCheckout}
          disabled={isEditMode || !hasItems}
        >
          {size === 'micro' 
            ? `Pay ${formatCurrency(basket?.totalAmount || 0)}` 
            : size === 'small'
            ? `Pay ${formatCurrency(basket?.totalAmount || 0)}`
            : `Checkout - ${formatCurrency(basket?.totalAmount || 0)}`
          }
        </ActionButton>
      </ButtonSection>
    </ModuleContainer>
  );
};
