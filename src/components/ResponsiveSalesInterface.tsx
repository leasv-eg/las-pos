import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BasketPanel } from './BasketPanel';
import { ActionPad } from './ActionPad';
import { InsightEngine } from './InsightEngine';
import { TabNavigation } from './TabNavigation';
import { useNotifications } from './NotificationProvider';
import { User, Company, Store, Device, BasketState, BasketItem, Product } from '../types';
import { db } from '../services/database';
import { posApiService } from '../services/posApi';
import { itemService } from '../services/itemService';
import { productImageService } from '../services/imageService';
import { mediaQueries, spacing } from '../styles/responsive';

const ResponsiveContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
`;

// Desktop layout (original three-panel)
const DesktopLayout = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  gap: 1px;
  background-color: #e0e0e0;
  
  ${mediaQueries.mobile} {
    display: none;
  }
`;

// Mobile layout (single panel with tabs)
const MobileLayout = styled.div`
  display: none;
  flex-direction: column;
  width: 100%;
  height: 100%;
  
  ${mediaQueries.mobile} {
    display: flex;
  }
`;

const MobilePanelContainer = styled.div`
  flex: 1;
  overflow: hidden;
  background: white;
`;

const Panel = styled.div`
  background-color: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

// Desktop panel styles with responsive breakpoints
const LeftPanel = styled(Panel)`
  flex: 0 0 320px;
  min-width: 320px;
  
  ${mediaQueries.tablet} {
    flex: 0 0 280px;
    min-width: 280px;
  }
`;

const CenterPanel = styled(Panel)`
  flex: 1;
  min-width: 400px;
  
  ${mediaQueries.tablet} {
    min-width: 300px;
  }
`;

const RightPanel = styled(Panel)`
  flex: 0 0 360px;
  min-width: 360px;
  
  ${mediaQueries.tablet} {
    flex: 0 0 300px;
    min-width: 300px;
  }
`;

const PanelHeader = styled.div`
  padding: ${spacing.md} ${spacing.lg};
  border-bottom: 1px solid #e0e0e0;
  background-color: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 60px;
`;

const PanelTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const PanelContent = styled.div`
  flex: 1;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
`;

interface ResponsiveSalesInterfaceProps {
  user: User;
  company: Company;
  store: Store;
  device: Device;
  isOnline: boolean;
  isTrainingMode: boolean;
  onLogout: () => void;
  onToggleTrainingMode: () => void;
}

export const ResponsiveSalesInterface: React.FC<ResponsiveSalesInterfaceProps> = ({
  user,
  company,
  store,
  device,
  isOnline,
  isTrainingMode,
  onLogout,
  onToggleTrainingMode
}) => {
  const [activeTab, setActiveTab] = useState<'basket' | 'actionpad' | 'insight'>('actionpad');
  const [basketState, setBasketState] = useState<BasketState>({
    items: [],
    total: 0,
    itemCount: 0,
    customerId: null,
    discounts: [],
    payments: []
  });

  const { addNotification } = useNotifications();

  const handleAddProduct = async (productCode: string) => {
    console.log('🛒 Looking up product first (v2):', productCode);
    
    try {
      // Try SKU lookup first (search results provide SKUs)
      console.log('🔍 Trying SKU lookup for:', productCode);
      let itemResult = await itemService.getItem({ sku: productCode }, { storeNumber: posConfig.storeNum });
      
      // If SKU lookup fails, try GTIN lookup as fallback
      if (!itemResult.success) {
        console.log('🔄 SKU lookup failed, trying GTIN lookup...');
        itemResult = await itemService.getItem({ gtin: productCode }, { storeNumber: posConfig.storeNum });
      }

      if (itemResult.success && itemResult.data) {
        const item = itemResult.data;
        console.log('✅ Item found:', item);

        const basketItem: BasketItem = {
          id: Date.now().toString(),
          productId: item.sku || productCode,
          name: item.name || 'Unknown Product',
          price: item.pricing?.salesPrice || 0,
          quantity: 1,
          total: item.pricing?.salesPrice || 0,
          sku: item.sku,
          gtin: item.gtin,
          imageUrl: item.imageUrl
        };

        setBasketState(prev => {
          const newItems = [...prev.items, basketItem];
          const newTotal = newItems.reduce((sum, item) => sum + item.total, 0);
          
          return {
            ...prev,
            items: newItems,
            total: newTotal,
            itemCount: newItems.length
          };
        });

        addNotification({
          type: 'success',
          message: `Added ${item.name} to basket`,
          duration: 2000
        });

        // Switch to basket tab on mobile after adding item
        if (window.innerWidth <= 768) {
          setActiveTab('basket');
        }
      } else {
        console.log('❌ Item not found for code:', productCode);
        addNotification({
          type: 'error',
          message: `Product not found: ${productCode}`,
          duration: 3000
        });
      }
    } catch (error) {
      console.error('❌ Error adding product:', error);
      addNotification({
        type: 'error',
        message: 'Failed to add product to basket',
        duration: 3000
      });
    }
  };

  const posConfig = {
    storeNum: store.storeNumber || 1000,
    environment: 'test' as const
  };

  return (
    <ResponsiveContainer>
      {/* Desktop Layout - Three panels side by side */}
      <DesktopLayout>
        <LeftPanel>
          <PanelHeader>
            <PanelTitle>🛒 Basket</PanelTitle>
          </PanelHeader>
          <PanelContent>
            <BasketPanel
              basketState={basketState}
              onUpdateQuantity={(itemId, quantity) => {
                setBasketState(prev => ({
                  ...prev,
                  items: prev.items.map(item =>
                    item.id === itemId
                      ? { ...item, quantity, total: item.price * quantity }
                      : item
                  )
                }));
              }}
              onRemoveItem={(itemId) => {
                setBasketState(prev => ({
                  ...prev,
                  items: prev.items.filter(item => item.id !== itemId)
                }));
              }}
              isTrainingMode={isTrainingMode}
            />
          </PanelContent>
        </LeftPanel>

        <CenterPanel>
          <PanelHeader>
            <PanelTitle>🔢 Action Pad</PanelTitle>
          </PanelHeader>
          <PanelContent>
            <ActionPad
              onAddProduct={handleAddProduct}
              basketState={basketState}
              isTrainingMode={isTrainingMode}
            />
          </PanelContent>
        </CenterPanel>

        <RightPanel>
          <PanelHeader>
            <PanelTitle>💡 Insight Engine</PanelTitle>
          </PanelHeader>
          <PanelContent>
            <InsightEngine
              basketState={basketState}
              user={user}
              store={store}
              isTrainingMode={isTrainingMode}
            />
          </PanelContent>
        </RightPanel>
      </DesktopLayout>

      {/* Mobile Layout - Single panel with tabs */}
      <MobileLayout>
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          basketItemCount={basketState.itemCount}
        />
        
        <MobilePanelContainer>
          {activeTab === 'actionpad' && (
            <ActionPad
              onAddProduct={handleAddProduct}
              basketState={basketState}
              isTrainingMode={isTrainingMode}
            />
          )}
          
          {activeTab === 'basket' && (
            <BasketPanel
              basketState={basketState}
              onUpdateQuantity={(itemId, quantity) => {
                setBasketState(prev => ({
                  ...prev,
                  items: prev.items.map(item =>
                    item.id === itemId
                      ? { ...item, quantity, total: item.price * quantity }
                      : item
                  )
                }));
              }}
              onRemoveItem={(itemId) => {
                setBasketState(prev => ({
                  ...prev,
                  items: prev.items.filter(item => item.id !== itemId)
                }));
              }}
              isTrainingMode={isTrainingMode}
            />
          )}
          
          {activeTab === 'insight' && (
            <InsightEngine
              basketState={basketState}
              user={user}
              store={store}
              isTrainingMode={isTrainingMode}
            />
          )}
        </MobilePanelContainer>
      </MobileLayout>
    </ResponsiveContainer>
  );
};
