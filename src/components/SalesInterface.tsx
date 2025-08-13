import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BasketPanel } from './BasketPanel';
import { ActionPad } from './ActionPad';
import { InsightEngine } from './InsightEngine';
import { useNotifications } from './NotificationProvider';
import { User, Company, Store, Device, BasketState, BasketItem, Product } from '../types';
import { db } from '../services/database';
import { posApiService } from '../services/posApi';
import { itemService } from '../services/itemService';
import { productImageService } from '../services/imageService';

const SalesContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  gap: 1px;
  background-color: #e0e0e0;
`;

const Panel = styled.div`
  background-color: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const LeftPanel = styled(Panel)`
  flex: 0 0 300px;
  min-width: 300px;
`;

const CenterPanel = styled(Panel)`
  flex: 1;
  min-width: 400px;
`;

const RightPanel = styled(Panel)`
  flex: 0 0 320px;
  min-width: 320px;
`;

const PanelHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PanelTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  background: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #1565c0;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const PanelContent = styled.div`
  flex: 1;
  overflow: auto;
`;

interface SalesInterfaceProps {
  user: User;
  company: Company;
  store: Store;
  device: Device;
  isOnline: boolean;
  isTrainingMode: boolean;
  onLogout: () => void;
  onToggleTrainingMode: () => void;
}

export const SalesInterface: React.FC<SalesInterfaceProps> = ({
  user,
  company,
  store,
  device,
  isOnline,
  isTrainingMode,
  onLogout,
  onToggleTrainingMode,
}) => {
  const { showSuccess, showError, showWarning } = useNotifications();
  
  const [basket, setBasket] = useState<BasketState>({
    items: [],
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    totalAmount: 0,
    promotions: []
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [actionPadMode, setActionPadMode] = useState<'KEYPAD' | 'SEARCH'>('KEYPAD');
  const [currentPOSCart, setCurrentPOSCart] = useState<{
    cartId: string | null;
    revision: number;
    isActive: boolean;
  }>({
    cartId: null,
    revision: 0,
    isActive: false
  });

  useEffect(() => {
    // Initialize any required data or listeners
    console.log('Sales interface initialized for:', user.firstName, user.lastName);
  }, [user]);

  const handleAddProduct = async (productCode: string, quantity: number = 1) => {
    try {
      console.log('🛒 Looking up product first (v2):', { productCode, quantity });
      
      // STEP 1: First look up the item using Item Service
      let itemInfo = null;
      let productName = 'Unknown Product';
      let productPrice = 0;
      let itemFound = false;

      // Try Item Service first (if configured)
      if (itemService.isReady()) {
        console.log('🔍 Looking up item via Item Service...');
        const posConfig = posApiService.getConfig();
        
        // Try looking up by SKU first (most search results provide SKUs)
        console.log('🔍 Trying SKU lookup for:', productCode);
        let itemResult = await itemService.getItem({ sku: productCode }, { storeNumber: posConfig.storeNum });
        
        // If SKU lookup fails, try GTIN lookup (for direct barcode scans)
        if (!itemResult.success || !itemResult.result) {
          console.log('🔍 SKU lookup failed, trying GTIN lookup for:', productCode);
          itemResult = await itemService.getItem({ gtin: productCode }, { storeNumber: posConfig.storeNum });
        }
        
        if (itemResult.success && itemResult.result) {
          itemInfo = itemResult.result.item;
          productName = itemInfo.itemText || itemInfo.labelText1 || productCode;
          
          // Get price if available
          if (itemResult.result.prices && itemResult.result.prices.length > 0) {
            const price = itemResult.result.prices[0];
            productPrice = price.salesPrice?.amount || price.netPrice?.amount || 0;
          }
          
          itemFound = true;
          console.log('✅ Item found via Item Service:', { productName, productPrice, source: itemResult.result.source, lookupType: itemResult.result.item.identifier?.sku ? 'SKU' : 'GTIN' });
        } else {
          console.log('⚠️ Item not found in Item Service (tried both SKU and GTIN):', itemResult.error);
        }
      }

      // Fallback to local database if Item Service didn't find it
      if (!itemFound) {
        console.log('🔍 Checking local database...');
        const product = await db.getProduct(productCode);
        if (product) {
          productName = product.name;
          productPrice = product.price;
          itemFound = true;
          console.log('✅ Item found in local database:', { productName, productPrice });
        }
      }

      // If no item found anywhere, show error
      if (!itemFound) {
        showError('Product Not Found', `Product with code "${productCode}" not found`);
        console.log('❌ Product not found anywhere:', productCode);
        return;
      }

      // STEP 2: Present item information to customer (for now, just log it)
      console.log('📋 Presenting item to customer:', {
        code: productCode,
        name: productName,
        price: productPrice,
        quantity: quantity,
        total: productPrice * quantity
      });

      // TODO: In a real implementation, you might show a confirmation dialog here
      // const confirmed = await showItemConfirmation(productName, productPrice, quantity);
      // if (!confirmed) return;

      // STEP 3: Customer confirmed, now add to cart using POS API (if available)
      let posResult: any = null;
      const posConfig = posApiService.getConfig();
      
      if (posConfig.hasToken) {
        console.log('� Adding to POS cart...');
        
        try {
          if (!currentPOSCart.cartId) {
            // Create new cart with the item
            posResult = await posApiService.createCartWithItems([{ ean: productCode, quantity }]);
            
            if (posResult.success && posResult.cart) {
              setCurrentPOSCart({
                cartId: posResult.cart.cartId.id,
                revision: posResult.cart.cartId.revision,
                isActive: true
              });
              console.log('✅ Created new POS cart:', posResult.cart.cartId.id);
            }
          } else {
            // Add to existing cart
            posResult = await posApiService.addItemToCart(
              currentPOSCart.cartId,
              currentPOSCart.revision,
              { ean: productCode, quantity }
            );
            
            if (posResult.success && posResult.cart) {
              setCurrentPOSCart(prev => ({
                ...prev,
                revision: posResult.cart.cartId.revision
              }));
              console.log('✅ Added item to existing POS cart');
            }
          }

          // Use POS API data for final display if available
          if (posResult?.success && posResult.cart?.items?.length > 0) {
            const latestItem = posResult.cart.items[posResult.cart.items.length - 1];
            productName = latestItem.article.text || productName;
            productPrice = latestItem.article.normalPrice || productPrice;
            console.log('📦 Updated with POS API data:', { productName, productPrice });
          }
        } catch (posError) {
          console.warn('⚠️ POS API failed, continuing with local basket:', posError);
        }
      }

      // STEP 4: Update local basket for UI display
      const existingItemIndex = basket.items.findIndex(item => item.sku === productCode);
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...basket.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
          totalPrice: (updatedItems[existingItemIndex].quantity + quantity) * productPrice
        };
        
        setBasket(prev => ({
          ...prev,
          items: updatedItems
        }));
        console.log('📈 Updated existing item quantity');
      } else {
        // Add new item to basket
        const newItem: BasketItem = {
          id: crypto.randomUUID(),
          productId: itemInfo?.identifier?.gtin || itemInfo?.identifier?.sku || productCode,
          sku: productCode,
          name: productName,
          quantity,
          unitPrice: productPrice,
          discountAmount: 0,
          totalPrice: productPrice * quantity
        };

        setBasket(prev => ({
          ...prev,
          items: [...prev.items, newItem]
        }));
        console.log('➕ Added new item to basket');
      }

      // Set selected product for insight panel (convert to local Product format if needed)
      const productImages = productImageService.getImageUrls(productCode);
      console.log('🖼️ Generated image URLs for GTIN', productCode, ':', productImages);
      const displayProduct: Product = {
        id: itemInfo?.identifier?.gtin || itemInfo?.identifier?.sku || productCode,
        companyId: company.id,
        sku: productCode,
        name: productName,
        price: productPrice,
        category: itemInfo?.itemCategory?.name || 'General',
        images: productImages,
        isActive: true,
        inventory: [],
        attributes: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setSelectedProduct(displayProduct);
      
      // Recalculate totals
      recalculateBasket();
      
      // Show success notification
      showSuccess('Product Added', `${productName} added to cart`, 2000); // Quick 2-second notification
      
      console.log('🎉 Product successfully added to basket via lookup-first workflow');
      if (posResult?.success) {
        console.log('✅ Also synchronized with POS API');
      }
      
    } catch (error) {
      console.error('💥 Error adding product:', error);
      showError('Error', 'Error adding product to basket');
    }
  };

  const handleCheckout = async () => {
    if (!currentPOSCart.cartId) {
      showWarning('No Cart Found', 'No active cart found. Please add items first.');
      return;
    }

    if (basket.totalAmount <= 0) {
      showWarning('Empty Cart', 'Cart is empty. Please add items before checkout.');
      return;
    }

    try {
      console.log('🛒 Starting checkout process...');
      console.log('Cart ID:', currentPOSCart.cartId);
      console.log('Total Amount:', basket.totalAmount);

      const checkoutResult = await posApiService.checkoutCart(currentPOSCart.cartId, basket.totalAmount);

      if (checkoutResult.success) {
        console.log('✅ Checkout successful!', checkoutResult);
        
        // Show success message
        showSuccess(
          'Payment Successful!', 
          `Transaction completed for ${basket.totalAmount.toFixed(2)}\nReceipt: ${checkoutResult.receiptNumber}`,
          8000 // 8 seconds for payment confirmation
        );
        
        // Reset the cart after successful checkout
        setBasket({
          items: [],
          subtotal: 0,
          taxAmount: 0,
          discountAmount: 0,
          totalAmount: 0,
          promotions: []
        });
        
        // Reset POS cart
        setCurrentPOSCart({
          cartId: null,
          revision: 0,
          isActive: false
        });
        
        // Clear selected product
        setSelectedProduct(null);
        
        console.log('🧹 Cart cleared after successful checkout');
      } else {
        console.error('❌ Checkout failed:', checkoutResult.error);
        showError('Checkout Failed', checkoutResult.error || 'Unknown error occurred during checkout');
      }
    } catch (error) {
      console.error('💥 Checkout error:', error);
      showError('Checkout Error', error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setBasket(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
    recalculateBasket();
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }

    setBasket(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity, totalPrice: item.unitPrice * newQuantity }
          : item
      )
    }));
    recalculateBasket();
  };

  const recalculateBasket = () => {
    setBasket(prev => {
      const subtotal = prev.items.reduce((sum, item) => sum + item.totalPrice, 0);
      const taxRate = company.settings.taxRate || 0.25; // Default 25% VAT
      const taxAmount = subtotal * taxRate;
      const totalAmount = subtotal + taxAmount - prev.discountAmount;

      return {
        ...prev,
        subtotal,
        taxAmount,
        totalAmount: Math.max(0, totalAmount)
      };
    });
  };

  const handleCompleteSale = async () => {
    // Use the same checkout functionality as the basket panel button
    await handleCheckout();
  };

  return (
    <SalesContainer>
      <LeftPanel>
        <PanelHeader>
          <PanelTitle>Basket</PanelTitle>
          <ActionButton
            onClick={handleCompleteSale}
            disabled={basket.items.length === 0}
          >
            Pay {basket.totalAmount.toFixed(2)}
          </ActionButton>
        </PanelHeader>
        <PanelContent>
          <BasketPanel
            basket={basket}
            onRemoveItem={handleRemoveItem}
            onUpdateQuantity={handleUpdateQuantity}
            onCheckout={handleCheckout}
            isTrainingMode={isTrainingMode}
            posApiActive={currentPOSCart.isActive}
            posCartId={currentPOSCart.cartId}
          />
        </PanelContent>
      </LeftPanel>

      <CenterPanel>
        <PanelHeader>
          <PanelTitle>
            {actionPadMode === 'KEYPAD' ? 'Keypad' : 'Search'}
          </PanelTitle>
          <div>
            <ActionButton
              onClick={() => setActionPadMode(actionPadMode === 'KEYPAD' ? 'SEARCH' : 'KEYPAD')}
            >
              {actionPadMode === 'KEYPAD' ? 'Search' : 'Keypad'}
            </ActionButton>
          </div>
        </PanelHeader>
        <PanelContent>
          <ActionPad
            mode={actionPadMode}
            onAddProduct={handleAddProduct}
            onProductSelect={setSelectedProduct}
            onModeChange={setActionPadMode}
            storeId={store.id}
          />
        </PanelContent>
      </CenterPanel>

      <RightPanel>
        <PanelHeader>
          <PanelTitle>Insight Engine</PanelTitle>
          <ActionButton onClick={onToggleTrainingMode}>
            {isTrainingMode ? 'Exit Training' : 'Training Mode'}
          </ActionButton>
        </PanelHeader>
        <PanelContent>
          <InsightEngine
            selectedProduct={selectedProduct}
            basket={basket}
            customer={null}
            isTrainingMode={isTrainingMode}
          />
        </PanelContent>
      </RightPanel>
    </SalesContainer>
  );
};
