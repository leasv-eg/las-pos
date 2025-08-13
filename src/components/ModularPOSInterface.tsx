import React, { useEffect } from 'react';
import { ModularGrid } from './ModularGrid';
import { NotificationProvider } from './NotificationProvider';
import { itemService } from '../services/itemService';

export const ModularPOSInterface: React.FC = () => {
  useEffect(() => {
    console.log('🔧 ModularPOSInterface: Initializing item service...');
    
    const initializeService = async () => {
      const itemToken = localStorage.getItem('item_bearer_token');
      const itemEnvironment = localStorage.getItem('item_environment');
      
      if (itemToken) {
        console.log('🔧 ModularPOSInterface: Found tokens, initializing service...');
        
        try {
          await itemService.init();
          itemService.configure(itemToken, itemEnvironment as any);
          console.log('✅ ModularPOSInterface: Item service initialized and configured!');
          
          const status = itemService.getStatus();
          const isReady = itemService.isReady();
          console.log('🔧 ModularPOSInterface: Service status:', { isReady, status });
        } catch (error) {
          console.error('❌ ModularPOSInterface: Failed to initialize service:', error);
        }
      } else {
        console.log('⚠️ ModularPOSInterface: No tokens found for service initialization');
      }
    };
    
    initializeService();
  }, []);

  return (
    <NotificationProvider>
      <ModularGrid />
    </NotificationProvider>
  );
};
