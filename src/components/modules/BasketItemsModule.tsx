import React from 'react';
import styled from 'styled-components';
import { ModuleProps, ModuleSize } from '../../types/modules';
import { BasketItem } from '../../types';

interface BasketItemsModuleProps extends ModuleProps {
  items?: BasketItem[];
  onQuantityChange?: (itemId: string, quantity: number) => void;
  onRemoveItem?: (itemId: string) => void;
}

const ModuleContainer = styled.div<{ size: ModuleSize }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
`;

const ItemsList = styled.div<{ size: ModuleSize }>`
  flex: 1;
  overflow-y: auto;
  padding: ${({ size }) => {
    switch (size) {
      case 'micro': return '4px';
      case 'small': return '8px';
      case 'medium': return '12px';
      case 'large': return '16px';
      default: return '12px';
    }
  }};
`;

const BasketItemCard = styled.div<{ size: ModuleSize }>`
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: ${({ size }) => {
    switch (size) {
      case 'micro': return '2px';
      case 'small': return '4px';
      case 'medium': return '8px';
      case 'large': return '12px';
      default: return '8px';
    }
  }};
  padding: ${({ size }) => {
    switch (size) {
      case 'micro': return '4px';
      case 'small': return '8px';
      case 'medium': return '12px';
      case 'large': return '16px';
      default: return '12px';
    }
  }};
  background: white;
  transition: all 0.2s;
  
  &:hover {
    border-color: #1976d2;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`;

const ItemHeader = styled.div<{ size: ModuleSize }>`
  display: flex;
  justify-content: space-between;
  align-items: ${({ size }) => size === 'micro' ? 'center' : 'flex-start'};
  margin-bottom: ${({ size }) => {
    switch (size) {
      case 'micro': return '0';
      case 'small': return '4px';
      case 'medium': return '6px';
      case 'large': return '8px';
      default: return '6px';
    }
  }};
`;

const ItemName = styled.div<{ size: ModuleSize }>`
  font-weight: 600;
  font-size: ${({ size }) => {
    switch (size) {
      case 'micro': return '10px';
      case 'small': return '12px';
      case 'medium': return '14px';
      case 'large': return '16px';
      default: return '14px';
    }
  }};
  color: #333;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RemoveButton = styled.button<{ size: ModuleSize }>`
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  width: ${({ size }) => {
    switch (size) {
      case 'micro': return '16px';
      case 'small': return '20px';
      case 'medium': return '24px';
      case 'large': return '28px';
      default: return '24px';
    }
  }};
  height: ${({ size }) => {
    switch (size) {
      case 'micro': return '16px';
      case 'small': return '20px';
      case 'medium': return '24px';
      case 'large': return '28px';
      default: return '24px';
    }
  }};
  font-size: ${({ size }) => {
    switch (size) {
      case 'micro': return '8px';
      case 'small': return '10px';
      case 'medium': return '12px';
      case 'large': return '14px';
      default: return '12px';
    }
  }};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #d32f2f;
  }
`;

const ItemDetails = styled.div<{ size: ModuleSize }>`
  display: ${({ size }) => size === 'micro' ? 'none' : 'flex'};
  justify-content: space-between;
  align-items: center;
  gap: ${({ size }) => {
    switch (size) {
      case 'small': return '8px';
      case 'medium': return '12px';
      case 'large': return '16px';
      default: return '12px';
    }
  }};
`;

const QuantityControl = styled.div<{ size: ModuleSize }>`
  display: flex;
  align-items: center;
  gap: ${({ size }) => {
    switch (size) {
      case 'small': return '4px';
      case 'medium': return '6px';
      case 'large': return '8px';
      default: return '6px';
    }
  }};
`;

const QuantityButton = styled.button<{ size: ModuleSize }>`
  background: #e0e0e0;
  border: none;
  border-radius: 4px;
  width: ${({ size }) => {
    switch (size) {
      case 'small': return '20px';
      case 'medium': return '24px';
      case 'large': return '28px';
      default: return '24px';
    }
  }};
  height: ${({ size }) => {
    switch (size) {
      case 'small': return '20px';
      case 'medium': return '24px';
      case 'large': return '28px';
      default: return '24px';
    }
  }};
  font-size: ${({ size }) => {
    switch (size) {
      case 'small': return '12px';
      case 'medium': return '14px';
      case 'large': return '16px';
      default: return '14px';
    }
  }};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #d0d0d0;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuantityDisplay = styled.span<{ size: ModuleSize }>`
  font-weight: 600;
  font-size: ${({ size }) => {
    switch (size) {
      case 'small': return '12px';
      case 'medium': return '14px';
      case 'large': return '16px';
      default: return '14px';
    }
  }};
  min-width: ${({ size }) => {
    switch (size) {
      case 'small': return '20px';
      case 'medium': return '24px';
      case 'large': return '28px';
      default: return '24px';
    }
  }};
  text-align: center;
`;

const ItemPrice = styled.div<{ size: ModuleSize }>`
  font-weight: 600;
  font-size: ${({ size }) => {
    switch (size) {
      case 'small': return '12px';
      case 'medium': return '14px';
      case 'large': return '16px';
      default: return '14px';
    }
  }};
  color: #1976d2;
`;

const EmptyState = styled.div<{ size: ModuleSize }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-size: ${({ size }) => {
    switch (size) {
      case 'micro': return '10px';
      case 'small': return '12px';
      case 'medium': return '14px';
      case 'large': return '16px';
      default: return '14px';
    }
  }};
  text-align: center;
`;

export const BasketItemsModule: React.FC<BasketItemsModuleProps> = ({
  module,
  size,
  isEditMode,
  items = [],
  onQuantityChange,
  onRemoveItem
}) => {
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (isEditMode || newQuantity < 1) return;
    onQuantityChange?.(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    if (isEditMode) return;
    onRemoveItem?.(itemId);
  };

  if (items.length === 0) {
    return (
      <ModuleContainer size={size}>
        <EmptyState size={size}>
          {size === 'micro' ? 'Empty' : 'No items in basket'}
        </EmptyState>
      </ModuleContainer>
    );
  }

  return (
    <ModuleContainer size={size}>
      <ItemsList size={size}>
        {items.map((item) => (
          <BasketItemCard key={item.id} size={size}>
            <ItemHeader size={size}>
              <ItemName size={size}>{item.name}</ItemName>
              <RemoveButton 
                size={size} 
                onClick={() => handleRemoveItem(item.id)}
                disabled={isEditMode}
              >
                ×
              </RemoveButton>
            </ItemHeader>
            
            <ItemDetails size={size}>
              <QuantityControl size={size}>
                <QuantityButton
                  size={size}
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  disabled={isEditMode || item.quantity <= 1}
                >
                  −
                </QuantityButton>
                <QuantityDisplay size={size}>
                  {item.quantity}
                </QuantityDisplay>
                <QuantityButton
                  size={size}
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  disabled={isEditMode}
                >
                  +
                </QuantityButton>
              </QuantityControl>
              
              <ItemPrice size={size}>
                {item.totalPrice.toFixed(2)}
              </ItemPrice>
            </ItemDetails>
          </BasketItemCard>
        ))}
      </ItemsList>
    </ModuleContainer>
  );
};
