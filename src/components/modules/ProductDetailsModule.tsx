import React from 'react';
import styled from 'styled-components';
import { ModuleProps, ModuleSize } from '../../types/modules';
import { Item } from '../../types/posApiTypes';

interface ProductDetailsModuleProps extends ModuleProps {
  product?: Item;
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

const ProductImage = styled.img<{ size: ModuleSize }>`
  width: 100%;
  height: ${({ size }) => {
    switch (size) {
      case 'micro': return '40px';
      case 'small': return '80px';
      case 'medium': return '120px';
      case 'large': return '180px';
      default: return '120px';
    }
  }};
  object-fit: cover;
  border-radius: 6px;
  background: #f0f0f0;
  margin-bottom: ${({ size }) => {
    switch (size) {
      case 'micro': return '4px';
      case 'small': return '8px';
      case 'medium': return '12px';
      case 'large': return '16px';
      default: return '12px';
    }
  }};
`;

const ProductInfo = styled.div<{ size: ModuleSize }>`
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

const ProductName = styled.h3<{ size: ModuleSize }>`
  margin: 0;
  font-size: ${({ size }) => {
    switch (size) {
      case 'micro': return '12px';
      case 'small': return '14px';
      case 'medium': return '16px';
      case 'large': return '18px';
      default: return '16px';
    }
  }};
  font-weight: 600;
  color: #333;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: ${({ size }) => size === 'micro' ? 1 : 2};
  -webkit-box-orient: vertical;
`;

const ProductCode = styled.div<{ size: ModuleSize }>`
  font-size: ${({ size }) => {
    switch (size) {
      case 'micro': return '8px';
      case 'small': return '10px';
      case 'medium': return '12px';
      case 'large': return '14px';
      default: return '12px';
    }
  }};
  color: #666;
  font-family: 'Courier New', monospace;
  display: ${({ size }) => size === 'micro' ? 'none' : 'block'};
`;

const ProductPrice = styled.div<{ size: ModuleSize }>`
  font-size: ${({ size }) => {
    switch (size) {
      case 'micro': return '12px';
      case 'small': return '16px';
      case 'medium': return '20px';
      case 'large': return '24px';
      default: return '20px';
    }
  }};
  font-weight: 700;
  color: #1976d2;
  margin: ${({ size }) => {
    switch (size) {
      case 'micro': return '2px 0';
      case 'small': return '4px 0';
      case 'medium': return '6px 0';
      case 'large': return '8px 0';
      default: return '6px 0';
    }
  }} 0;
`;

const ProductDescription = styled.div<{ size: ModuleSize }>`
  font-size: ${({ size }) => {
    switch (size) {
      case 'small': return '11px';
      case 'medium': return '12px';
      case 'large': return '14px';
      default: return '12px';
    }
  }};
  color: #666;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: ${({ size }) => ['micro', 'small'].includes(size) ? 'none' : '-webkit-box'};
  -webkit-line-clamp: ${({ size }) => size === 'medium' ? 3 : 5};
  -webkit-box-orient: vertical;
`;

const ProductDetails = styled.div<{ size: ModuleSize }>`
  display: ${({ size }) => ['micro', 'small'].includes(size) ? 'none' : 'block'};
  font-size: ${({ size }) => {
    switch (size) {
      case 'medium': return '11px';
      case 'large': return '12px';
      default: return '11px';
    }
  }};
  color: #666;
  line-height: 1.3;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
`;

const AddButton = styled.button<{ size: ModuleSize }>`
  width: 100%;
  padding: ${({ size }) => {
    switch (size) {
      case 'micro': return '4px 8px';
      case 'small': return '8px 12px';
      case 'medium': return '12px 16px';
      case 'large': return '16px 20px';
      default: return '12px 16px';
    }
  }};
  background: #1976d2;
  color: white;
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
  margin-top: ${({ size }) => {
    switch (size) {
      case 'micro': return '4px';
      case 'small': return '8px';
      case 'medium': return '12px';
      case 'large': return '16px';
      default: return '12px';
    }
  }};
  
  &:hover {
    background: #1565c0;
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
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

export const ProductDetailsModule: React.FC<ProductDetailsModuleProps> = ({
  module,
  size,
  isEditMode,
  product,
  onAddToCart
}) => {
  const handleAddToCart = () => {
    if (isEditMode || !product) return;
    onAddToCart?.(product);
  };

  if (!product) {
    return (
      <ModuleContainer size={size}>
        <EmptyState size={size}>
          {size === 'micro' ? 'No product' : 'Select a product to view details'}
        </EmptyState>
      </ModuleContainer>
    );
  }

  const getImageUrl = () => {
    return `https://via.placeholder.com/200x200/f0f0f0/666?text=${product.itemText?.charAt(0) || '?'}`;
  };

  const getPrice = () => {
    // For now, return a placeholder price since Item doesn't have price directly
    return '0.00';
  };

  return (
    <ModuleContainer size={size}>
      <ProductImage 
        size={size}
        src={getImageUrl()}
        alt={product.itemText || 'Product'}
      />
      
      <ProductInfo size={size}>
        <ProductName size={size}>
          {product.itemText || 'Unknown Product'}
        </ProductName>
        
        <ProductCode size={size}>
          {product.identifier?.sku || product.identifier?.productId}
        </ProductCode>
        
        <ProductPrice size={size}>
          {getPrice()}
        </ProductPrice>
        
        <ProductDescription size={size}>
          {product.labelText1 || product.labelText2 || 'No description available.'}
        </ProductDescription>
        
        <ProductDetails size={size}>
          {product.itemGroupNo && (
            <DetailRow>
              <span>Group:</span>
              <span>{product.itemGroupNo}</span>
            </DetailRow>
          )}
          {product.unit && (
            <DetailRow>
              <span>Unit:</span>
              <span>{product.unit}</span>
            </DetailRow>
          )}
          {product.color?.text && (
            <DetailRow>
              <span>Color:</span>
              <span>{product.color.text}</span>
            </DetailRow>
          )}
          {product.size?.text && (
            <DetailRow>
              <span>Size:</span>
              <span>{product.size.text}</span>
            </DetailRow>
          )}
        </ProductDetails>
        
        <AddButton 
          size={size} 
          onClick={handleAddToCart}
          disabled={isEditMode}
        >
          {size === 'micro' ? '+' : 'Add to Cart'}
        </AddButton>
      </ProductInfo>
    </ModuleContainer>
  );
};
