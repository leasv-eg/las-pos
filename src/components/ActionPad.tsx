import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Product } from '../types';
import { db } from '../services/database';
import { itemService } from '../services/itemService';
import { posApiService } from '../services/posApi';
import { productImageService } from '../services/imageService';

const ActionPadContainer = styled.div`
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const KeypadContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  flex: 1;
  max-height: 400px;
`;

const KeypadButton = styled.button<{ isWide?: boolean; $isAction?: boolean }>`
  height: 60px;
  border: 2px solid #e0e0e0;
  background: ${props => props.$isAction ? '#1976d2' : 'white'};
  color: ${props => props.$isAction ? 'white' : '#333'};
  border-radius: 8px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  grid-column: ${props => props.isWide ? 'span 2' : 'span 1'};

  &:hover {
    background: ${props => props.$isAction ? '#1565c0' : '#f5f5f5'};
    border-color: ${props => props.$isAction ? '#1565c0' : '#1976d2'};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const Display = styled.div`
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DisplayValue = styled.div`
  font-size: 24px;
  font-weight: 500;
  color: #333;
  flex: 1;
`;

const DisplayLabel = styled.div`
  font-size: 14px;
  color: #666;
  margin-right: 16px;
`;

const SearchInput = styled.input`
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 20px;

  &:focus {
    outline: none;
    border-color: #1976d2;
  }
`;

const SearchResults = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ProductCard = styled.div<{ isSelected?: boolean; isPreview?: boolean }>`
  border: 1px solid ${props => 
    props.isSelected ? '#1976d2' : 
    props.isPreview ? '#4caf50' : 
    '#e0e0e0'
  };
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  gap: 12px;
  background: ${props => 
    props.isSelected ? '#e3f2fd' : 
    props.isPreview ? '#e8f5e8' : 
    'white'
  };
  box-shadow: ${props => 
    props.isSelected ? '0 2px 8px rgba(25, 118, 210, 0.2)' : 
    props.isPreview ? '0 2px 8px rgba(76, 175, 80, 0.2)' : 
    'none'
  };

  &:hover {
    border-color: ${props => props.isSelected ? '#1976d2' : '#1976d2'};
    background: ${props => props.isSelected ? '#e3f2fd' : '#f8f9fa'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ProductImageSmall = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  background: #f0f0f0;
  flex-shrink: 0;
`;

const ProductImagePlaceholder = styled.div`
  width: 60px;
  height: 60px;
  background: #f0f0f0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #ccc;
  flex-shrink: 0;
`;

const ProductInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const ProductName = styled.div`
  font-weight: 500;
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
`;

const ProductSku = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
`;

const ProductPrice = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1976d2;
`;

const SearchStatusIndicator = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
  font-style: italic;
  
  &.searching {
    color: #1976d2;
    animation: pulse 1.5s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0% { opacity: 0.6; }
    50% { opacity: 1; }
    100% { opacity: 0.6; }
  }
`;

const SearchHint = styled.div`
  font-size: 12px;
  color: #999;
  text-align: center;
  margin-top: 8px;
  padding: 0 16px;
`;

const NoResults = styled.div`
  text-align: center;
  color: #999;
  padding: 40px 20px;
  font-size: 16px;
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 16px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 16px;
  transition: background-color 0.2s;

  &:hover {
    background: #45a049;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

interface ActionPadProps {
  mode: 'KEYPAD' | 'SEARCH';
  onAddProduct: (productCode: string, quantity?: number) => void;
  onProductSelect: (product: Product | null) => void;
  onModeChange: (mode: 'KEYPAD' | 'SEARCH') => void;
  storeId: string;
}

export const ActionPad: React.FC<ActionPadProps> = ({
  mode,
  onAddProduct,
  onProductSelect,
  onModeChange,
  storeId,
}) => {
  const [display, setDisplay] = useState('');
  const [operation, setOperation] = useState<'PRODUCT_ENTRY' | 'QUANTITY' | null>('PRODUCT_ENTRY');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [previewedProduct, setPreviewedProduct] = useState<Product | null>(null);
  const [lastClickedIndex, setLastClickedIndex] = useState(-1);
  const [lastClickTime, setLastClickTime] = useState(0);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      console.log('🔍 Starting enhanced search for:', searchQuery);
      
      try {
        let foundProducts: Product[] = [];
        
        // First try direct GTIN lookup for exact matches (fast path)
        if (/^\d{8,14}$/.test(searchQuery.trim())) {
          console.log('�‍♂️ Fast GTIN lookup:', searchQuery);
          const posConfig = posApiService.getConfig();
          const itemResult = await itemService.getItem({ gtin: searchQuery.trim() }, { storeNumber: posConfig.storeNum });
          
          if (itemResult.success && itemResult.result) {
            const itemInfo = itemResult.result.item;
            let productName = itemInfo.itemText || itemInfo.labelText1 || searchQuery;
            let productPrice = 0;
            
            // Get price if available
            if (itemResult.result.prices && itemResult.result.prices.length > 0) {
              const price = itemResult.result.prices[0];
              productPrice = price.salesPrice?.amount || price.netPrice?.amount || 0;
            }
            
            // Convert to Product format for display
            const productImages = productImageService.getImageUrls(searchQuery.trim());
            const product: Product = {
              id: itemInfo.identifier?.gtin || itemInfo.identifier?.sku || searchQuery,
              companyId: 'external',
              sku: searchQuery,
              name: productName,
              price: productPrice,
              category: itemInfo.itemCategory?.name || 'General',
              images: productImages,
              isActive: true,
              inventory: [],
              attributes: [],
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            foundProducts.push(product);
            console.log('✅ Direct GTIN match found:', productName);
          }
        }
        
        // If no direct match or not a GTIN, use text search
        // ALWAYS try itemService.searchProducts - it has auto-initialization logic
        if (foundProducts.length === 0) {
          console.log('🔍 Using Item Service text search (with auto-initialization)...');
          const posConfig = posApiService.getConfig();
          
          const searchResult = await itemService.searchProducts(searchQuery, {
            maxResults: 10,
            useAdvancedSearch: false, // Use basic search for speed
            storeNumber: posConfig.storeNum
          });
          
          if (searchResult.success && searchResult.items) {
            console.log(`✅ Found ${searchResult.items.length} items via text search`);
            
            // Convert search results to Product format
            searchResult.items.forEach((item, index) => {
              console.log(`🔍 Converting item ${index + 1}:`, {
                identifier: item.identifier,
                gtin: item.gtin,
                itemText: item.itemText,
                brandName: item.brandName
              });
              
              // More flexible conversion - don't require GTIN
              const gtin = item.gtin || '';
              const itemId = item.identifier?.gtin || item.identifier?.sku || item.gtin || crypto.randomUUID();
              const productImages = gtin ? productImageService.getImageUrls(gtin) : [];
              
              const product: Product = {
                id: itemId,
                companyId: 'external',
                sku: item.identifier?.sku || gtin || itemId,
                name: item.itemText || item.brandName || `Product ${index + 1}`,
                price: item.currentPrice || 0,
                category: 'General',
                images: productImages,
                isActive: true,
                inventory: [],
                attributes: [],
                createdAt: new Date(),
                updatedAt: new Date()
              };
              
              foundProducts.push(product);
              console.log(`✅ Converted item to product: ${product.name} (ID: ${product.id})`);
            });
            
            console.log(`🎉 Successfully converted ${foundProducts.length} items to products!`);
          } else {
            console.log('⚠️ No results from Item Service text search:', searchResult.error);
          }
        }
        
        // Also search local database for fallback
        console.log('💾 Searching local database as fallback...');
        const localResults = await db.searchProducts(searchQuery);
        if (localResults.length > 0) {
          console.log(`✅ Found ${localResults.length} products in local database`);
          // Add local results, avoiding duplicates by SKU
          localResults.forEach(localProduct => {
            if (!foundProducts.some(p => p.sku === localProduct.sku)) {
              foundProducts.push(localProduct);
            }
          });
        }
        
        setSearchResults(foundProducts);
        
        if (foundProducts.length === 0) {
          console.log('❌ No products found anywhere for:', searchQuery);
        } else {
          console.log(`📦 Total products found: ${foundProducts.length}`);
        }
        
      } catch (error) {
        console.error('💥 Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    if (mode === 'SEARCH') {
      const timeoutId = setTimeout(performSearch, 300); // Debounce search
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, mode]);

  // Keyboard navigation for search results
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (mode !== 'SEARCH' || searchResults.length === 0) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => {
            const nextIndex = prev < searchResults.length - 1 ? prev + 1 : 0;
            setPreviewedProduct(searchResults[nextIndex]);
            onProductSelect(searchResults[nextIndex]);
            return nextIndex;
          });
          break;

        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => {
            const nextIndex = prev > 0 ? prev - 1 : searchResults.length - 1;
            setPreviewedProduct(searchResults[nextIndex]);
            onProductSelect(searchResults[nextIndex]);
            return nextIndex;
          });
          break;

        case 'Enter':
          event.preventDefault();
          if (selectedIndex >= 0 && searchResults[selectedIndex]) {
            onAddProduct(searchResults[selectedIndex].sku);
            console.log('🛒 Added product via keyboard:', searchResults[selectedIndex].name);
          }
          break;

        case 'Escape':
          event.preventDefault();
          setSelectedIndex(-1);
          setPreviewedProduct(null);
          onProductSelect(null);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mode, searchResults, selectedIndex, onAddProduct]);

  // Reset selection when search results change
  useEffect(() => {
    setSelectedIndex(-1);
    setPreviewedProduct(null);
    onProductSelect(null);
    setLastClickedIndex(-1);
  }, [searchResults, onProductSelect]);

  const handleKeypadPress = (value: string) => {
    if (value === 'C') {
      setDisplay('');
      setOperation('PRODUCT_ENTRY');
      return;
    }

    if (value === 'ENTER') {
      if (display && operation === 'PRODUCT_ENTRY') {
        onAddProduct(display);
        setDisplay('');
      }
      return;
    }

    if (value === '⌫') {
      setDisplay(prev => prev.slice(0, -1));
      return;
    }

    if (value === 'SEARCH') {
      onModeChange(mode === 'SEARCH' ? 'KEYPAD' : 'SEARCH');
      setSearchQuery('');
      setSearchResults([]);
      setSelectedIndex(-1);
      setPreviewedProduct(null);
      onProductSelect(null);
      setLastClickedIndex(-1);
      setLastClickTime(0);
      return;
    }

    setDisplay(prev => prev + value);
  };

  const handleProductClick = (product: Product, index: number) => {
    const now = Date.now();
    
    // Check if this is a double-click (within 300ms of last click on same item)
    if (lastClickedIndex === index && (now - lastClickTime) < 300) {
      // Double-click: Add to cart
      onAddProduct(product.sku);
      console.log('🛒 Added product via double-click:', product.name);
      setLastClickedIndex(-1);
      setLastClickTime(0);
    } else {
      // Single-click: Show preview and update selection
      setSelectedIndex(index);
      setPreviewedProduct(product);
      onProductSelect(product);
      setLastClickedIndex(index);
      setLastClickTime(now);
      console.log('👁️ Previewing product:', product.name);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // If the search query looks like a product code (numbers or barcode pattern), add it directly
      const trimmedQuery = searchQuery.trim();
      
      // Check if it's likely a product code (mostly digits, or starts with digits)
      // This prevents text searches like "ski" from being treated as product codes
      const isLikelyProductCode = /^[\d][\dA-Z-_.]*$/.test(trimmedQuery) && trimmedQuery.length >= 6;
      
      if (isLikelyProductCode) {
        // Add directly as product code
        onAddProduct(trimmedQuery);
        setSearchQuery('');
      }
      // If not, let the search results handle it (user can click on results)
    }
  };

  if (mode === 'SEARCH') {
    return (
      <ActionPadContainer>
        <SearchInput
          type="text"
          placeholder="Search products by name, SKU, or barcode..."
          value={searchQuery}
          onChange={handleSearchInputChange}
          onKeyDown={handleSearchInputKeyDown}
          autoFocus
        />
        
        <SearchHint>
          💡 Tip: Enter a barcode number or product name. Press Enter to add directly if exact GTIN match.
        </SearchHint>

        <SearchResults>
          {isSearching ? (
            <SearchStatusIndicator className="searching">
              🔍 Searching products...
            </SearchStatusIndicator>
          ) : searchResults.length > 0 ? (
            searchResults.map((product, index) => (
              <ProductCard
                key={product.id}
                onClick={() => handleProductClick(product, index)}
                onDoubleClick={() => {
                  console.log('🛒 Double-click detected, adding to cart:', product.name);
                  onAddProduct(product.sku);
                }}
                isSelected={selectedIndex === index}
                isPreview={previewedProduct?.id === product.id}
              >
                {product.images && product.images.length > 0 ? (
                  <ProductImageSmall 
                    src={product.images[0]} 
                    alt={product.name}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <ProductImagePlaceholder>
                    📦
                  </ProductImagePlaceholder>
                )}
                <ProductInfo>
                  <ProductName>{product.name}</ProductName>
                  <ProductSku>GTIN/SKU: {product.sku}</ProductSku>
                  {product.price > 0 && (
                    <ProductPrice>{product.price.toFixed(2)}</ProductPrice>
                  )}
                </ProductInfo>
              </ProductCard>
            ))
          ) : searchQuery.trim().length >= 2 ? (
            <NoResults>
              No products found for "{searchQuery}"
              <br />
              <small>Try a different search term or check spelling</small>
            </NoResults>
          ) : (
            <SearchStatusIndicator>
              Start typing to search products
              <br />
              <small>Search by product name, barcode, SKU, or brand</small>
            </SearchStatusIndicator>
          )}
        </SearchResults>
      </ActionPadContainer>
    );
  }

  return (
    <ActionPadContainer>
      <Display>
        <DisplayLabel>
          {operation === 'PRODUCT_ENTRY' ? 'Enter Product:' : 'Quantity:'}
        </DisplayLabel>
        <DisplayValue>{display || '0'}</DisplayValue>
      </Display>

      <KeypadContainer>
        <KeypadButton onClick={() => handleKeypadPress('1')}>1</KeypadButton>
        <KeypadButton onClick={() => handleKeypadPress('2')}>2</KeypadButton>
        <KeypadButton onClick={() => handleKeypadPress('3')}>3</KeypadButton>
        
        <KeypadButton onClick={() => handleKeypadPress('4')}>4</KeypadButton>
        <KeypadButton onClick={() => handleKeypadPress('5')}>5</KeypadButton>
        <KeypadButton onClick={() => handleKeypadPress('6')}>6</KeypadButton>
        
        <KeypadButton onClick={() => handleKeypadPress('7')}>7</KeypadButton>
        <KeypadButton onClick={() => handleKeypadPress('8')}>8</KeypadButton>
        <KeypadButton onClick={() => handleKeypadPress('9')}>9</KeypadButton>
        
        <KeypadButton onClick={() => handleKeypadPress('C')} $isAction>
          Clear
        </KeypadButton>
        <KeypadButton onClick={() => handleKeypadPress('0')}>0</KeypadButton>
        <KeypadButton onClick={() => handleKeypadPress('⌫')} $isAction>
          ⌫
        </KeypadButton>
      </KeypadContainer>

      <ActionButton
        onClick={() => handleKeypadPress('SEARCH')}
        style={{ marginBottom: '10px' }}
      >
        {(mode as string) === 'SEARCH' ? '🔢 Keypad' : '🔍 Search'}
      </ActionButton>

      <ActionButton
        onClick={() => handleKeypadPress('ENTER')}
        disabled={!display}
      >
        Add to Basket
      </ActionButton>
    </ActionPadContainer>
  );
};
