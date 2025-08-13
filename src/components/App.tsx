import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { LoginScreen } from './LoginScreen';
import { SalesInterface } from './SalesInterface';
import { POSConfig } from './POSConfig';
import { ModularPOSInterface } from './ModularPOSInterface';
import { NotificationProvider } from './NotificationProvider';
import { apiService } from '../services/api';
import { itemService } from '../services/itemService';
import { TokenValidator } from '../services/tokenValidator';
import { User, Company, Store, Device } from '../types';

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
`;

const StatusBar = styled.div<{ $isOnline: boolean; $isTrainingMode: boolean }>`
  height: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  background-color: ${props => 
    props.$isTrainingMode ? '#ff9800' : 
    props.$isOnline ? '#4caf50' : '#f44336'};
  color: white;
  font-size: 12px;
  font-weight: 500;
`;

const StatusItem = styled.span`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatusButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 4px 8px;
  font-size: 11px;
  border-radius: 3px;
  cursor: pointer;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  company: Company | null;
  store: Store | null;
  device: Device | null;
  isOnline: boolean;
  isTrainingMode: boolean;
}

export const App: React.FC = () => {
  console.log('🔥 App component rendering - MODIFIED VERSION WITH USEEFFECT...');
  
  const [appState, setAppState] = useState<AppState>({
    isAuthenticated: false,
    user: null,
    company: null,
    store: null,
    device: null,
    isOnline: navigator.onLine,
    isTrainingMode: false
  });

  const [showPOSConfig, setShowPOSConfig] = useState(false);
  const [useModularInterface, setUseModularInterface] = useState(false);

  useEffect(() => {
    console.log('🚀 App: useEffect starting...');
    
    // Set up token monitoring
    TokenValidator.setupTokenWarnings();
    
    try {
      console.log('🔍 App: localStorage check...');
      const itemToken = localStorage.getItem('item_bearer_token');
      console.log('🔍 App: itemToken exists:', !!itemToken);
      
      if (itemToken) {
        console.log('🔧 App: Token found, length:', itemToken.length);
        // Try basic itemService operations
        console.log('🔧 App: Calling itemService.init()...');
        itemService.init().then(() => {
          console.log('✅ App: itemService.init() completed');
          console.log('🔧 App: Calling itemService.configure()...');
          itemService.configure(itemToken, 'prod');
          console.log('✅ App: itemService.configure() completed');
          
          const isReady = itemService.isReady();
          console.log('🔍 App: itemService.isReady():', isReady);
        }).catch(error => {
          console.error('❌ App: itemService.init() failed:', error);
        });
      } else {
        console.log('⚠️ App: No token found');
      }
    } catch (error) {
      console.error('❌ App: Error in useEffect:', error);
    }

    // Check if user is already authenticated
    if (apiService.isAuthenticated()) {
      const user = apiService.getStoredUser();
      const company = apiService.getStoredCompany();
      const store = apiService.getStoredStore();
      const device = apiService.getStoredDevice();

      if (user && company && store && device) {
        setAppState(prev => ({
          ...prev,
          isAuthenticated: true,
          user,
          company,
          store,
          device
        }));
      }
    }

    // Set up online/offline event listeners
    const handleOnline = () => setAppState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setAppState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogin = (user: User, company: Company, store: Store, device: Device) => {
    setAppState(prev => ({
      ...prev,
      isAuthenticated: true,
      user,
      company,
      store,
      device
    }));
  };

  const handleLogout = async () => {
    await apiService.logout();
    setAppState(prev => ({
      ...prev,
      isAuthenticated: false,
      user: null,
      company: null,
      store: null,
      device: null
    }));
  };

  const toggleTrainingMode = () => {
    setAppState(prev => ({
      ...prev,
      isTrainingMode: !prev.isTrainingMode
    }));
  };

  return (
    <NotificationProvider>
      <AppContainer>
        <StatusBar $isOnline={appState.isOnline} $isTrainingMode={appState.isTrainingMode}>
          <StatusItem>
            <span>●</span>
            {appState.isTrainingMode ? 'TRAINING MODE' : 
             appState.isOnline ? 'ONLINE' : 'OFFLINE'}
          </StatusItem>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {appState.isAuthenticated && (
              <>
                <StatusItem>
                  {appState.store?.name} - {appState.device?.name}
                </StatusItem>
                
                <StatusItem>
                  {appState.user?.firstName} {appState.user?.lastName} ({appState.user?.userNumber})
                </StatusItem>
              </>
            )}
            
            <StatusButton onClick={() => setShowPOSConfig(!showPOSConfig)}>
              ⚙️
            </StatusButton>
            <StatusButton onClick={() => setUseModularInterface(!useModularInterface)}>
              {useModularInterface ? '📋 Classic' : '🧩 Modular'}
            </StatusButton>
          </div>
        </StatusBar>

        <MainContent>
          {showPOSConfig && (
            <POSConfig 
              isVisible={showPOSConfig}
              onClose={() => setShowPOSConfig(false)}
            />
          )}
          
          {!appState.isAuthenticated ? (
            <LoginScreen onLogin={handleLogin} />
          ) : useModularInterface ? (
            <ModularPOSInterface />
          ) : (
            <SalesInterface
              user={appState.user!}
              company={appState.company!}
              store={appState.store!}
              device={appState.device!}
              isOnline={appState.isOnline}
              isTrainingMode={appState.isTrainingMode}
              onLogout={handleLogout}
              onToggleTrainingMode={toggleTrainingMode}
            />
          )}
        </MainContent>
      </AppContainer>
    </NotificationProvider>
  );
};
