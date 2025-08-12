import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ModuleProps, ModuleSize } from '../../types/modules';
import { Item } from '../../types/posApiTypes';
import { itemService } from '../../services/itemService';
import { useNotifications } from '../NotificationProvider';

interface SearchModuleProps extends ModuleProps {
  onProductSelect?: (product: Item) => void;
  onProductAdd?: (product: Item) => void;
}

// Base module container
const ModuleContainer = styled.div<{ size: ModuleSize }>`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  overflow: hidden;
`;

// Responsive search input
const SearchInput = styled.input<{ size: ModuleSize }>`
  padding: ${({ size }) => {
    switch (size) {
      case 'micro': return '8px';
      case 'small': return '12px';
      case 'medium': return '16px';
      case 'large': return '20px';
      default: return '16px';
    }
  }};
  border: none;
  border-bottom: 2px solid #e0e0e0;
  font-size: ${({ size }) => {
    switch (size) {
      case 'micro': return '12px';
      case 'small': return '14px';
      case 'medium': return '16px';
      case 'large': return '18px';
      default: return '16px';
    }
  }};
  background: #f8f9fa;

  &:focus {
    outline: none;
    border-bottom-color: #1976d2;
    background: white;
  }

  &::placeholder {
    color: #999;
  }
`;

// Responsive search results container
const SearchResults = styled.div<{ size: ModuleSize }>`
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

// Responsive product card
const ProductCard = styled.div<{ 
  size: ModuleSize;
  isSelected?: boolean; 
  isPreview?: boolean;
}>`
  border: 1px solid ${props => 
    props.isSelected ? '#1976d2' : 
    props.isPreview ? '#4caf50' : 
    '#e0e0e0'
  };
  border-radius: 6px;
  padding: ${({ size }) => {
    switch (size) {
      case 'micro': return '4px';
      case 'small': return '8px';
      case 'medium': return '12px';
      case 'large': return '16px';
      default: return '12px';
    }
  }};
  margin-bottom: ${({ size }) => {
    switch (size) {
      case 'micro': return '2px';
      case 'small': return '4px';
      case 'medium': return '8px';
      case 'large': return '12px';
      default: return '8px';
    }
  }};
  cursor: pointer;
  transition: all 0.2s;
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
  align-items: center;
  background: ${props => 
    props.isSelected ? '#e3f2fd' : 
    props.isPreview ? '#e8f5e8' : 
    'white'
  };

  &:hover {
    border-color: #1976d2;
    background: ${props => props.isSelected ? '#e3f2fd' : '#f8f9fa'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Responsive product image
const ProductImage = styled.img<{ size: ModuleSize }>`
  width: ${({ size }) => {
    switch (size) {
      case 'micro': return '24px';
      case 'small': return '32px';
      case 'medium': return '48px';
      case 'large': return '64px';
      default: return '48px';
    }
  }};
  height: ${({ size }) => {
    switch (size) {
      case 'micro': return '24px';
      case 'small': return '32px';
      case 'medium': return '48px';
      case 'large': return '64px';
      default: return '48px';
    }
  }};
  object-fit: cover;
  border-radius: 4px;
  background: #f0f0f0;
`;

// Responsive product info
const ProductInfo = styled.div<{ size: ModuleSize }>`
  flex: 1;
  min-width: 0;
`;

const ProductName = styled.div<{ size: ModuleSize }>`
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: ${({ size }) => size === 'micro' ? 'none' : 'block'};
`;

const ProductPrice = styled.div<{ size: ModuleSize }>`
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
  color: #1976d2;
  min-width: ${({ size }) => {
    switch (size) {
      case 'micro': return '30px';
      case 'small': return '40px';
      case 'medium': return '50px';
      case 'large': return '60px';
      default: return '50px';
    }
  }};
  text-align: right;
`;

// Loading and empty states
const StateMessage = styled.div<{ size: ModuleSize }>`
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
  padding: 16px;
`;

export const SearchModule: React.FC<SearchModuleProps> = ({
  module,
  size,
  isEditMode,
  onProductSelect,
  onProductAdd
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [previewIndex, setPreviewIndex] = useState(-1);
  const { showError, showSuccess } = useNotifications();

  // Search functionality
  useEffect(() => {
    const searchProducts = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        setSelectedIndex(-1);
        setPreviewIndex(-1);
        return;
      }

      setIsLoading(true);
      try {
        const response = await itemService.searchProducts(searchTerm.trim(), {
          maxResults: 20,
          storeNumber: 1000
        });
        console.log(`🔍 SearchModule: Raw response for "${searchTerm}":`, response);
        
        if (response.success && response.items) {
          console.log(`🔍 SearchModule: Processing ${response.items.length} items`);
          // Convert search results to Item format
          const items: Item[] = response.items.map(searchItem => ({
            identifier: searchItem.identifier || {},
            itemText: searchItem.itemText || '',
            modelNo: searchItem.modelNo || '',
            color: searchItem.colorText ? { text: searchItem.colorText } : undefined,
            size: searchItem.sizeText ? { text: searchItem.sizeText } : undefined,
            itemStatus: 'Active',
            status: { isDeactivated: false, isDeleted: false },
            unit: 'Stk',
            canBeOrdered: true,
            minOrderQty: 1,
            trackStockChangesForItem: true,
            openPrice: false
          }));
          console.log(`🔍 SearchModule: Converted to ${items.length} Item objects:`, items);
          setSearchResults(items);
        } else {
          console.log(`🔍 SearchModule: No results - success: ${response.success}, items: ${response.items?.length || 0}`);
          setSearchResults([]);
          if (response.error) {
            showError('Search Error', response.error);
          }
        }
        setSelectedIndex(-1);
        setPreviewIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        showError('Search Error', 'Failed to search products');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, showError]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (searchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev < searchResults.length - 1 ? prev + 1 : 0;
          setPreviewIndex(newIndex);
          if (onProductSelect && searchResults[newIndex]) {
            onProductSelect(searchResults[newIndex]);
          }
          return newIndex;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => {
          const newIndex = prev > 0 ? prev - 1 : searchResults.length - 1;
          setPreviewIndex(newIndex);
          if (onProductSelect && searchResults[newIndex]) {
            onProductSelect(searchResults[newIndex]);
          }
          return newIndex;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex] && onProductAdd) {
          onProductAdd(searchResults[selectedIndex]);
          showSuccess('Product Added', `Added "${searchResults[selectedIndex].itemText}" to cart`);
        }
        break;
      case 'Escape':
        setSelectedIndex(-1);
        setPreviewIndex(-1);
        break;
    }
  };

  // Product click handlers
  const handleProductClick = (product: Item, index: number) => {
    if (isEditMode) return;
    
    setSelectedIndex(index);
    setPreviewIndex(index);
    if (onProductSelect) {
      onProductSelect(product);
    }
  };

  const handleProductDoubleClick = (product: Item) => {
    if (isEditMode) return;
    
    if (onProductAdd) {
      onProductAdd(product);
      showSuccess('Product Added', `Added "${product.itemText}" to cart`);
    }
  };

  // Get placeholder text based on size
  const getPlaceholder = () => {
    switch (size) {
      case 'micro': return 'Search...';
      case 'small': return 'Search products...';
      case 'medium': return 'Search products by name or code...';
      case 'large': return 'Search products by name, code, or barcode...';
      default: return 'Search products...';
    }
  };

  // Render product card based on size
  const renderProductCard = (product: Item, index: number) => {
    const isSelected = index === selectedIndex;
    const isPreview = index === previewIndex;

    return (
      <ProductCard
        key={product.identifier?.sku || product.identifier?.productId || Math.random().toString()}
        size={size}
        isSelected={isSelected}
        isPreview={isPreview}
        onClick={() => handleProductClick(product, index)}
        onDoubleClick={() => handleProductDoubleClick(product)}
      >
        {size !== 'micro' && (
          <ProductImage 
            size={size}
            src={`https://via.placeholder.com/64x64/f0f0f0/666?text=${product.itemText?.charAt(0) || '?'}`}
            alt={product.itemText}
          />
        )}
        <ProductInfo size={size}>
          <ProductName size={size}>{product.itemText}</ProductName>
          <ProductCode size={size}>{product.identifier?.sku || product.identifier?.productId}</ProductCode>
        </ProductInfo>
        <ProductPrice size={size}>
          0.00
        </ProductPrice>
      </ProductCard>
    );
  };

  return (
    <ModuleContainer size={size}>
      <SearchInput
        size={size}
        type="text"
        placeholder={getPlaceholder()}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isEditMode}
      />
      
      <SearchResults size={size}>
        {(() => {
          console.log(`🔍 SearchModule Render: searchTerm="${searchTerm}", results=${searchResults.length}, loading=${isLoading}`);
          if (isLoading) {
            return (
              <StateMessage size={size}>
                {size === 'micro' ? '...' : 'Searching...'}
              </StateMessage>
            );
          } else if (searchTerm && searchResults.length === 0) {
            return (
              <StateMessage size={size}>
                {size === 'micro' ? 'None' : 'No products found'}
              </StateMessage>
            );
          } else if (searchResults.length === 0) {
            return (
              <StateMessage size={size}>
                {size === 'micro' ? 'Search' : 
                 size === 'small' ? 'Start typing to search' :
                 'Start typing to search for products'}
              </StateMessage>
            );
          } else {
            console.log(`🔍 SearchModule Render: Rendering ${searchResults.length} results`);
            return searchResults.map((product, index) => renderProductCard(product, index));
          }
        })()}
      </SearchResults>
    </ModuleContainer>
  );
};
