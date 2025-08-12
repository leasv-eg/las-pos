import React from 'react';
import styled from 'styled-components';
import { BasketState, BasketItem } from '../types';
import { posApiService } from '../services/posApi';

const BasketContainer = styled.div`
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const BasketItemsList = styled.div`
  flex: 1;
  overflow-y: auto;
  margin-bottom: 16px;
`;

const ItemRow = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  gap: 12px;

  &:last-child {
    border-bottom: none;
  }
`;

const ItemInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemName = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: #333;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ItemSku = styled.div`
  font-size: 12px;
  color: #666;
`;

const QuantityControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QuantityButton = styled.button`
  width: 28px;
  height: 28px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;

  &:hover {
    background: #f5f5f5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuantityDisplay = styled.span`
  min-width: 30px;
  text-align: center;
  font-weight: 500;
`;

const ItemPrice = styled.div`
  text-align: right;
  min-width: 80px;
`;

const UnitPrice = styled.div`
  font-size: 12px;
  color: #666;
`;

const TotalPrice = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: #333;
`;

const RemoveButton = styled.button`
  width: 24px;
  height: 24px;
  border: none;
  background: #f44336;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #d32f2f;
  }
`;

const BasketSummary = styled.div`
  border-top: 2px solid #e0e0e0;
  padding-top: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-top: auto;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
`;

const SummaryLabel = styled.span`
  color: #666;
`;

const SummaryValue = styled.span<{ isTotal?: boolean }>`
  font-weight: ${props => props.isTotal ? '600' : '400'};
  color: ${props => props.isTotal ? '#333' : '#666'};
  font-size: ${props => props.isTotal ? '16px' : '14px'};
`;

const CheckoutButton = styled.button<{ disabled?: boolean }>`
  width: 100%;
  padding: 16px;
  margin-top: 16px;
  background: ${props => props.disabled ? '#ccc' : '#4CAF50'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #45a049;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
  }
`;

const EmptyBasket = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
  text-align: center;
`;

const EmptyBasketIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyBasketText = styled.div`
  font-size: 16px;
  margin-bottom: 8px;
`;

const EmptyBasketSubtext = styled.div`
  font-size: 14px;
  opacity: 0.7;
`;

const TrainingModeNotice = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 16px;
  font-size: 12px;
  color: #856404;
  text-align: center;
`;

const POSApiNotice = styled.div`
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 16px;
  font-size: 12px;
  color: #155724;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const DemoModeNotice = styled.div`
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 16px;
  font-size: 12px;
  color: #721c24;
  text-align: center;
`;

interface BasketPanelProps {
  basket: BasketState;
  onRemoveItem: (itemId: string) => void;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onCheckout?: () => void;
  isTrainingMode: boolean;
  posApiActive?: boolean;
  posCartId?: string | null;
}

export const BasketPanel: React.FC<BasketPanelProps> = ({
  basket,
  onRemoveItem,
  onUpdateQuantity,
  onCheckout,
  isTrainingMode,
  posApiActive = false,
  posCartId = null,
}) => {
  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  if (basket.items.length === 0) {
    return (
      <BasketContainer>
        {isTrainingMode && (
          <TrainingModeNotice>
            🎓 Training Mode Active - No real transactions
          </TrainingModeNotice>
        )}
        
        {posApiActive ? (
          <POSApiNotice>
            🔗 Connected to POS API
            {posCartId && <span>• Cart: {posCartId.slice(-8)}</span>}
          </POSApiNotice>
        ) : (
          <DemoModeNotice>
            📱 Demo Mode - Using sample data
          </DemoModeNotice>
        )}
        
        <EmptyBasket>
          <EmptyBasketIcon>🛒</EmptyBasketIcon>
          <EmptyBasketText>Basket is empty</EmptyBasketText>
          <EmptyBasketSubtext>Add products to start a sale</EmptyBasketSubtext>
        </EmptyBasket>

        <BasketSummary>
          <SummaryRow>
            <SummaryLabel>Total</SummaryLabel>
            <SummaryValue isTotal>{formatCurrency(0)}</SummaryValue>
          </SummaryRow>
        </BasketSummary>
      </BasketContainer>
    );
  }

  return (
    <BasketContainer>
      {isTrainingMode && (
        <TrainingModeNotice>
          🎓 Training Mode Active - No real transactions
        </TrainingModeNotice>
      )}

      {posApiActive ? (
        <POSApiNotice>
          🔗 Connected to POS API
          {posCartId && <span>• Cart: {posCartId.slice(-8)}</span>}
        </POSApiNotice>
      ) : (
        <DemoModeNotice>
          📱 Demo Mode - Using sample data
        </DemoModeNotice>
      )}

      <BasketItemsList>
        {basket.items.map((item) => (
          <ItemRow key={item.id}>
            <ItemInfo>
              <ItemName title={item.name}>{item.name}</ItemName>
              <ItemSku>{item.sku}</ItemSku>
            </ItemInfo>

            <QuantityControls>
              <QuantityButton
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                −
              </QuantityButton>
              <QuantityDisplay>{item.quantity}</QuantityDisplay>
              <QuantityButton
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              >
                +
              </QuantityButton>
            </QuantityControls>

            <ItemPrice>
              <UnitPrice>{formatCurrency(item.unitPrice)} each</UnitPrice>
              <TotalPrice>{formatCurrency(item.totalPrice)}</TotalPrice>
            </ItemPrice>

            <RemoveButton onClick={() => onRemoveItem(item.id)}>
              ×
            </RemoveButton>
          </ItemRow>
        ))}
      </BasketItemsList>

      <BasketSummary>
        <SummaryRow>
          <SummaryLabel>Subtotal ({basket.items.length} items)</SummaryLabel>
          <SummaryValue>{formatCurrency(basket.subtotal)}</SummaryValue>
        </SummaryRow>
        
        {basket.discountAmount > 0 && (
          <SummaryRow>
            <SummaryLabel>Discount</SummaryLabel>
            <SummaryValue>-{formatCurrency(basket.discountAmount)}</SummaryValue>
          </SummaryRow>
        )}
        
        <SummaryRow>
          <SummaryLabel>Tax</SummaryLabel>
          <SummaryValue>{formatCurrency(basket.taxAmount)}</SummaryValue>
        </SummaryRow>
        
        <SummaryRow>
          <SummaryLabel>Total</SummaryLabel>
          <SummaryValue isTotal>{formatCurrency(basket.totalAmount)}</SummaryValue>
        </SummaryRow>
      </BasketSummary>

      {onCheckout && (
        <CheckoutButton 
          onClick={onCheckout}
          disabled={basket.items.length === 0}
        >
          {basket.items.length === 0 ? 'Add items to checkout' : `Checkout - ${formatCurrency(basket.totalAmount)}`}
        </CheckoutButton>
      )}
    </BasketContainer>
  );
};
