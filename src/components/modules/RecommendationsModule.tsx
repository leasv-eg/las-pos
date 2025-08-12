import React from 'react';
import styled from 'styled-components';
import { ModuleProps, ModuleSize } from '../../types/modules';
import { Item } from '../../types/posApiTypes';

interface RecommendationsModuleProps extends ModuleProps {
  recommendations?: Item[];
  onProductSelect?: (product: Item) => void;
  onAddToCart?: (product: Item) => void;
}

const ModuleContainer = styled.div<{ size: ModuleSize }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
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

const Header = styled.div<{ size: ModuleSize }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ size }) => {
    switch (size) {
      case 'micro': return '4px';
      case 'small': return '6px';
      case 'medium': return '8px';
      case 'large': return '12px';
      default: return '8px';
    }
  }};
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
  color: #333;
`;

const RecommendationsList = styled.div<{ size: ModuleSize }>`
  flex: 1;
  display: ${({ size }) => {
    switch (size) {
      case 'micro': return 'flex';
      case 'small': return 'flex';
      case 'medium': return 'grid';
      case 'large': return 'grid';
      default: return 'grid';
    }
  }};
  
  ${({ size }) => {
    switch (size) {
      case 'micro': 
        return 'flex-direction: column; gap: 4px; overflow-y: auto;';
      case 'small': 
        return 'flex-direction: column; gap: 6px; overflow-y: auto;';
      case 'medium':
        return 'grid-template-columns: repeat(2, 1fr); gap: 8px; overflow-y: auto;';
      case 'large':
        return 'grid-template-columns: repeat(3, 1fr); gap: 12px; overflow-y: auto;';
      default:
        return 'grid-template-columns: repeat(2, 1fr); gap: 8px; overflow-y: auto;';
    }
  }}
`;

const RecommendationCard = styled.div<{ size: ModuleSize }>`
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: ${({ size }) => {
    switch (size) {
      case 'micro': return '4px';
      case 'small': return '6px';
      case 'medium': return '8px';
      case 'large': return '12px';
      default: return '8px';
    }
  }};
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  
  &:hover {
    border-color: #1976d2;
    box-shadow: 0 2px 8px rgba(25, 118, 210, 0.1);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const ProductImage = styled.div<{ size: ModuleSize }>`
  width: 100%;
  height: ${({ size }) => {
    switch (size) {
      case 'micro': return '24px';
      case 'small': return '40px';
      case 'medium': return '60px';
      case 'large': return '80px';
      default: return '60px';
    }
  }};
  background: #f0f0f0;
  border-radius: 4px;
  margin-bottom: ${({ size }) => {
    switch (size) {
      case 'micro': return '2px';
      case 'small': return '4px';
      case 'medium': return '6px';
      case 'large': return '8px';
      default: return '6px';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: ${({ size }) => {
    switch (size) {
      case 'micro': return '8px';
      case 'small': return '10px';
      case 'medium': return '12px';
      case 'large': return '14px';
      default: return '12px';
    }
  }};
  font-weight: 600;
`;

const ProductName = styled.div<{ size: ModuleSize }>`
  font-size: ${({ size }) => {
    switch (size) {
      case 'micro': return '8px';
      case 'small': return '10px';
      case 'medium': return '11px';
      case 'large': return '12px';
      default: return '11px';
    }
  }};
  font-weight: 600;
  color: #333;
  line-height: 1.2;
  margin-bottom: ${({ size }) => {
    switch (size) {
      case 'micro': return '1px';
      case 'small': return '2px';
      case 'medium': return '3px';
      case 'large': return '4px';
      default: return '3px';
    }
  }};
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: ${({ size }) => size === 'micro' ? 1 : 2};
  -webkit-box-orient: vertical;
`;

const ProductPrice = styled.div<{ size: ModuleSize }>`
  font-size: ${({ size }) => {
    switch (size) {
      case 'micro': return '8px';
      case 'small': return '10px';
      case 'medium': return '12px';
      case 'large': return '14px';
      default: return '12px';
    }
  }};
  font-weight: 700;
  color: #1976d2;
`;

const ActionButtons = styled.div<{ size: ModuleSize }>`
  display: ${({ size }) => ['micro', 'small'].includes(size) ? 'none' : 'flex'};
  gap: 4px;
  margin-top: ${({ size }) => {
    switch (size) {
      case 'medium': return '6px';
      case 'large': return '8px';
      default: return '6px';
    }
  }};
`;

const ActionButton = styled.button<{ size: ModuleSize }>`
  flex: 1;
  padding: ${({ size }) => {
    switch (size) {
      case 'medium': return '4px 6px';
      case 'large': return '6px 8px';
      default: return '4px 6px';
    }
  }};
  border: 1px solid #1976d2;
  border-radius: 4px;
  background: white;
  color: #1976d2;
  font-size: ${({ size }) => {
    switch (size) {
      case 'medium': return '9px';
      case 'large': return '10px';
      default: return '9px';
    }
  }};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #1976d2;
    color: white;
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &.primary {
    background: #1976d2;
    color: white;
  }
  
  &.primary:hover {
    background: #1565c0;
  }
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

const sampleRecommendations: Item[] = [
  {
    identifier: { sku: 'REC001', productId: 'REC001' },
    itemText: 'Popular Choice',
    labelText1: 'Best seller this month',
    itemGroupNo: 'GRP001',
    unit: 'pcs'
  },
  {
    identifier: { sku: 'REC002', productId: 'REC002' },
    itemText: 'Similar Product',
    labelText1: 'Customers also bought',
    itemGroupNo: 'GRP002',
    unit: 'pcs'
  },
  {
    identifier: { sku: 'REC003', productId: 'REC003' },
    itemText: 'Frequently Bought',
    labelText1: 'Often purchased together',
    itemGroupNo: 'GRP003',
    unit: 'pcs'
  },
  {
    identifier: { sku: 'REC004', productId: 'REC004' },
    itemText: 'New Arrival',
    labelText1: 'Just added to inventory',
    itemGroupNo: 'GRP004',
    unit: 'pcs'
  },
  {
    identifier: { sku: 'REC005', productId: 'REC005' },
    itemText: 'Special Offer',
    labelText1: 'Limited time promotion',
    itemGroupNo: 'GRP005',
    unit: 'pcs'
  },
  {
    identifier: { sku: 'REC006', productId: 'REC006' },
    itemText: 'Staff Pick',
    labelText1: 'Recommended by our team',
    itemGroupNo: 'GRP006',
    unit: 'pcs'
  }
];

export const RecommendationsModule: React.FC<RecommendationsModuleProps> = ({
  module,
  size,
  isEditMode,
  recommendations = sampleRecommendations,
  onProductSelect,
  onAddToCart
}) => {
  const handleProductClick = (product: Item) => {
    if (isEditMode) return;
    onProductSelect?.(product);
  };

  const handleAddToCart = (product: Item, event: React.MouseEvent) => {
    event.stopPropagation();
    if (isEditMode) return;
    onAddToCart?.(product);
  };

  const getMaxItems = () => {
    switch (size) {
      case 'micro': return 3;
      case 'small': return 4;
      case 'medium': return 6;
      case 'large': return 9;
      default: return 6;
    }
  };

  const displayedRecommendations = recommendations.slice(0, getMaxItems());

  const getPrice = () => {
    // For now, return a placeholder price since Item doesn't have price directly
    return '0.00';
  };

  if (!displayedRecommendations.length) {
    return (
      <ModuleContainer size={size}>
        <Header size={size}>
          {size === 'micro' ? 'Rec' : 'Recommendations'}
        </Header>
        <EmptyState size={size}>
          {size === 'micro' ? 'No items' : 'No recommendations available'}
        </EmptyState>
      </ModuleContainer>
    );
  }

  return (
    <ModuleContainer size={size}>
      <Header size={size}>
        {size === 'micro' ? 'Rec' : 'Recommendations'}
        {size !== 'micro' && (
          <span style={{ fontSize: '80%', color: '#666' }}>
            {displayedRecommendations.length}
          </span>
        )}
      </Header>
      
      <RecommendationsList size={size}>
        {displayedRecommendations.map((product, index) => (
          <RecommendationCard
            key={product.identifier?.sku || index}
            size={size}
            onClick={() => handleProductClick(product)}
          >
            <ProductImage size={size}>
              {product.itemText?.charAt(0) || '?'}
            </ProductImage>
            
            <ProductName size={size}>
              {product.itemText || 'Unknown Product'}
            </ProductName>
            
            <ProductPrice size={size}>
              {getPrice()}
            </ProductPrice>
            
            <ActionButtons size={size}>
              <ActionButton
                size={size}
                onClick={(e) => handleProductClick(product)}
              >
                View
              </ActionButton>
              <ActionButton
                size={size}
                className="primary"
                onClick={(e) => handleAddToCart(product, e)}
              >
                Add
              </ActionButton>
            </ActionButtons>
          </RecommendationCard>
        ))}
      </RecommendationsList>
    </ModuleContainer>
  );
};
