import React from 'react';
import styled from 'styled-components';
import { Product, BasketState, Customer } from '../types';

const InsightContainer = styled.div`
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const InsightCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardContent = styled.div`
  font-size: 14px;
  line-height: 1.5;
  color: #666;
`;

const ProductDetail = styled.div`
  margin-bottom: 8px;
`;

const ProductLabel = styled.span`
  font-weight: 500;
  color: #333;
  margin-right: 8px;
`;

const StockLevel = styled.div<{ level: 'high' | 'medium' | 'low' }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    switch (props.level) {
      case 'high': return '#e8f5e8';
      case 'medium': return '#fff3cd';
      case 'low': return '#f8d7da';
      default: return '#f8f9fa';
    }
  }};
  color: ${props => {
    switch (props.level) {
      case 'high': return '#2e7d2e';
      case 'medium': return '#856404';
      case 'low': return '#721c24';
      default: return '#666';
    }
  }};
`;

const PromotionAlert = styled.div`
  background: linear-gradient(135deg, #ff9800, #ffc107);
  color: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  font-weight: 500;
  text-align: center;
`;

const PromotionTitle = styled.div`
  font-size: 16px;
  margin-bottom: 8px;
`;

const PromotionAction = styled.div`
  font-size: 14px;
  opacity: 0.9;
`;

const DefaultInsight = styled.div`
  text-align: center;
  color: #999;
  padding: 40px 20px;
`;

const DefaultIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const ProductImage = styled.img`
  width: 100%;
  max-width: 200px;
  height: auto;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid #e0e0e0;
  background: #f8f9fa;
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  max-width: 200px;
  height: 150px;
  border-radius: 8px;
  margin-bottom: 16px;
  border: 1px solid #e0e0e0;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
`;

const RecommendationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RecommendationItem = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #1976d2;
    background: #f8f9fa;
  }
`;

const RecommendationName = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
`;

const RecommendationPrice = styled.div`
  font-size: 12px;
  color: #666;
`;

const TrainingTip = styled.div`
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const TipTitle = styled.div`
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TipContent = styled.div`
  font-size: 14px;
  color: #333;
  line-height: 1.5;
`;

interface InsightEngineProps {
  selectedProduct: Product | null;
  basket: BasketState;
  customer: Customer | null;
  isTrainingMode: boolean;
}

export const InsightEngine: React.FC<InsightEngineProps> = ({
  selectedProduct,
  basket,
  customer,
  isTrainingMode,
}) => {
  const getStockLevel = (quantity: number): 'high' | 'medium' | 'low' => {
    if (quantity > 20) return 'high';
    if (quantity > 5) return 'medium';
    return 'low';
  };

  const formatCurrency = (amount: number) => {
    return amount.toFixed(2);
  };

  // Sample recommendations based on selected product
  const getRecommendations = (product: Product): Product[] => {
    // In a real implementation, this would come from an API
    return [
      {
        id: '2',
        companyId: product.companyId,
        sku: 'ACC-001',
        name: 'Leather Belt',
        price: 45.00,
        category: 'Accessories',
        isActive: true,
        images: [],
        inventory: [],
        attributes: [],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        companyId: product.companyId,
        sku: 'SHO-001',
        name: 'Oxford Shoes',
        price: 120.00,
        category: 'Shoes',
        isActive: true,
        images: [],
        inventory: [],
        attributes: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  };

  // Check for potential promotions
  const checkPromotions = () => {
    if (basket.items.length >= 2) {
      return {
        title: '🎉 Multi-item Discount Available!',
        action: 'Add one more item to get 10% off entire purchase'
      };
    }
    
    if (basket.subtotal > 80) {
      return {
        title: '🎁 Free Shipping Unlocked!',
        action: 'Spend $20 more to get a free tote bag'
      };
    }

    return null;
  };

  const promotion = checkPromotions();

  if (isTrainingMode) {
    return (
      <InsightContainer>
        <TrainingTip>
          <TipTitle>
            🎓 Training Mode Tips
          </TipTitle>
          <TipContent>
            This panel shows context-aware information:
            <br />• Product details when items are added
            <br />• Customer info when selected
            <br />• Promotion alerts and recommendations
            <br />• Real-time upsell suggestions
          </TipContent>
        </TrainingTip>

        {selectedProduct ? (
          <InsightCard>
            <CardTitle>📦 Product Information</CardTitle>
            <CardContent>
              <ProductDetail>
                <ProductLabel>Name:</ProductLabel>
                {selectedProduct.name}
              </ProductDetail>
              <ProductDetail>
                <ProductLabel>Price:</ProductLabel>
                {formatCurrency(selectedProduct.price)}
              </ProductDetail>
              <ProductDetail>
                <ProductLabel>Category:</ProductLabel>
                {selectedProduct.category}
              </ProductDetail>
              <ProductDetail>
                <ProductLabel>Stock:</ProductLabel>
                <StockLevel level="high">In Stock (25 units)</StockLevel>
              </ProductDetail>
            </CardContent>
          </InsightCard>
        ) : (
          <DefaultInsight>
            <DefaultIcon>💡</DefaultIcon>
            <div>Add products to see insights</div>
          </DefaultInsight>
        )}
      </InsightContainer>
    );
  }

  return (
    <InsightContainer>
      {promotion && (
        <PromotionAlert>
          <PromotionTitle>{promotion.title}</PromotionTitle>
          <PromotionAction>{promotion.action}</PromotionAction>
        </PromotionAlert>
      )}

      {customer && (
        <InsightCard>
          <CardTitle>👤 Customer Information</CardTitle>
          <CardContent>
            <ProductDetail>
              <ProductLabel>Name:</ProductLabel>
              {customer.firstName} {customer.lastName}
            </ProductDetail>
            <ProductDetail>
              <ProductLabel>Loyalty Points:</ProductLabel>
              {customer.loyaltyPoints.toLocaleString()}
            </ProductDetail>
            <ProductDetail>
              <ProductLabel>Total Spent:</ProductLabel>
              {formatCurrency(customer.totalSpent)}
            </ProductDetail>
          </CardContent>
        </InsightCard>
      )}

      {selectedProduct ? (
        <>
          <InsightCard>
            <CardTitle>📦 Product Details</CardTitle>
            <CardContent>
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                <ProductImage 
                  src={selectedProduct.images[0]} 
                  alt={selectedProduct.name}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    console.log('🖼️ Product image failed to load:', selectedProduct.images[0]);
                  }}
                />
              ) : (
                <ImagePlaceholder>
                  📷 No image available
                </ImagePlaceholder>
              )}
              <ProductDetail>
                <ProductLabel>Name:</ProductLabel>
                {selectedProduct.name}
              </ProductDetail>
              <ProductDetail>
                <ProductLabel>SKU:</ProductLabel>
                {selectedProduct.sku}
              </ProductDetail>
              <ProductDetail>
                <ProductLabel>Price:</ProductLabel>
                {formatCurrency(selectedProduct.price)}
              </ProductDetail>
              <ProductDetail>
                <ProductLabel>Category:</ProductLabel>
                {selectedProduct.category}
              </ProductDetail>
              <ProductDetail>
                <ProductLabel>Stock Level:</ProductLabel>
                <StockLevel level={getStockLevel(15)}>
                  {15} units available
                </StockLevel>
              </ProductDetail>
            </CardContent>
          </InsightCard>

          <InsightCard>
            <CardTitle>✨ Recommended Items</CardTitle>
            <CardContent>
              <RecommendationList>
                {getRecommendations(selectedProduct).map((item) => (
                  <RecommendationItem key={item.id}>
                    <RecommendationName>{item.name}</RecommendationName>
                    <RecommendationPrice>{formatCurrency(item.price)}</RecommendationPrice>
                  </RecommendationItem>
                ))}
              </RecommendationList>
            </CardContent>
          </InsightCard>
        </>
      ) : (
        <DefaultInsight>
          <DefaultIcon>💡</DefaultIcon>
          <div>Smart insights will appear here</div>
          <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
            Add products or select customers to see recommendations
          </div>
        </DefaultInsight>
      )}
    </InsightContainer>
  );
};
