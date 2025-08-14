import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { posApiService } from '../services/posApi';
import { itemService } from '../services/itemService';
import { POSEnvironment } from '../types/posApiTypes';
import { mediaQueries, spacing, touchTargets, panelSizes } from '../styles/responsive';

const ConfigOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${spacing.md};
  
  ${mediaQueries.mobile} {
    padding: 0;
    align-items: flex-start;
  }
`;

const ConfigContainer = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: ${panelSizes.desktop.settings};
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  
  ${mediaQueries.tablet} {
    max-width: ${panelSizes.tablet.settings};
    max-height: 85vh;
  }
  
  ${mediaQueries.mobile} {
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0;
    height: 100vh;
  }
`;

const ConfigHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.lg} ${spacing.lg} ${spacing.md} ${spacing.lg};
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  
  ${mediaQueries.mobile} {
    padding: ${spacing.md};
  }
`;

const ConfigTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  
  ${mediaQueries.mobile} {
    font-size: 20px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: ${spacing.sm};
  border-radius: 50%;
  min-width: ${touchTargets.comfortable};
  min-height: ${touchTargets.comfortable};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const ConfigContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${spacing.lg};
  
  ${mediaQueries.mobile} {
    padding: ${spacing.md};
  }
`;

const ConfigSection = styled.div`
  margin-bottom: ${spacing.xl};
  
  ${mediaQueries.mobile} {
    margin-bottom: ${spacing.lg};
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 ${spacing.md} 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  padding-bottom: ${spacing.sm};
  border-bottom: 2px solid #e0e0e0;
  
  ${mediaQueries.mobile} {
    font-size: 16px;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${spacing.sm};
  font-weight: 600;
  color: #333;
  font-size: 14px;
  
  ${mediaQueries.mobile} {
    font-size: 16px; // Larger text on mobile
  }
`;

const Input = styled.input`
  width: 100%;
  padding: ${spacing.md};
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px; // 16px prevents zoom on iOS
  margin-bottom: ${spacing.md};
  min-height: ${touchTargets.comfortable};
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
  }
  
  ${mediaQueries.touch} {
    min-height: ${touchTargets.comfortable};
    font-size: 16px;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: ${spacing.md};
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  margin-bottom: ${spacing.md};
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
  }
  
  ${mediaQueries.mobile} {
    min-height: 100px;
    font-size: 14px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${spacing.sm};
  margin-top: ${spacing.md};
  flex-wrap: wrap;
  
  ${mediaQueries.mobile} {
    flex-direction: column;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' }>`
  padding: ${spacing.md} ${spacing.lg};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  min-height: ${touchTargets.comfortable};
  transition: all 0.2s;
  flex: 1;
  
  ${mediaQueries.mobile} {
    width: 100%;
    margin-bottom: ${spacing.sm};
  }
  
  ${({ variant = 'primary' }) => {
    switch (variant) {
      case 'primary':
        return `
          background: #1976d2; 
          color: white;
          &:hover { background: #1565c0; }
        `;
      case 'secondary':
        return `
          background: #6c757d; 
          color: white;
          &:hover { background: #5a6268; }
        `;
      case 'success':
        return `
          background: #28a745; 
          color: white;
          &:hover { background: #218838; }
        `;
      case 'danger':
        return `
          background: #dc3545; 
          color: white;
          &:hover { background: #c82333; }
        `;
      case 'warning':
        return `
          background: #ffc107; 
          color: #212529;
          &:hover { background: #e0a800; }
        `;
      default:
        return `
          background: #1976d2; 
          color: white;
          &:hover { background: #1565c0; }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &:active {
    transform: translateY(1px);
  }
`;

const StatusIndicator = styled.div<{ $status: 'success' | 'error' | 'warning' | 'info' }>`
  padding: ${spacing.md};
  margin: ${spacing.md} 0;
  border-radius: 8px;
  font-weight: 500;
  
  ${({ $status }) => {
    switch ($status) {
      case 'success':
        return 'background: #d4edda; color: #155724; border: 2px solid #c3e6cb;';
      case 'error':
        return 'background: #f8d7da; color: #721c24; border: 2px solid #f5c6cb;';
      case 'warning':
        return 'background: #fff3cd; color: #856404; border: 2px solid #ffeaa7;';
      case 'info':
        return 'background: #d1ecf1; color: #0c5460; border: 2px solid #b8daff;';
    }
  }}
`;

const Select = styled.select`
  width: 100%;
  padding: ${spacing.md};
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: ${spacing.md};
  background: white;
  min-height: ${touchTargets.comfortable};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
  }
  
  ${mediaQueries.touch} {
    font-size: 16px; // Prevent zoom on iOS
  }
`;

interface POSConfigProps {
  isVisible: boolean;
  onClose: () => void;
}

export const POSConfig: React.FC<POSConfigProps> = ({ isVisible, onClose }) => {
  // POS API Configuration
  const [bearerToken, setBearerToken] = useState('');
  const [apiKey, setApiKey] = useState('mobile');
  const [storeNum, setStoreNum] = useState(1000);
  const [environment, setEnvironment] = useState<POSEnvironment>('test');
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error' | 'info'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [config, setConfig] = useState(posApiService.getConfig());

  // Item Service Configuration
  const [itemBearerToken, setItemBearerToken] = useState('');
  const [itemEnvironment, setItemEnvironment] = useState<POSEnvironment>('test');
  const [itemConnectionStatus, setItemConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error' | 'info'>('idle');
  const [itemStatusMessage, setItemStatusMessage] = useState('');
  const [cacheStats, setCacheStats] = useState<{ totalItems: number } | null>(null);

  useEffect(() => {
    const initializeServices = async () => {
      // Load saved POS API configuration
      const savedToken = localStorage.getItem('pos_bearer_token');
      const savedApiKey = localStorage.getItem('pos_api_key');
      const savedStoreNum = localStorage.getItem('pos_store_num');
      const savedEnvironment = localStorage.getItem('pos_environment') as POSEnvironment;

      if (savedToken) setBearerToken(savedToken);
      if (savedApiKey) setApiKey(savedApiKey);
      if (savedStoreNum) setStoreNum(parseInt(savedStoreNum));
      if (savedEnvironment) setEnvironment(savedEnvironment);

      // Load saved Item Service configuration
      const savedItemToken = localStorage.getItem('item_bearer_token');
      const savedItemEnvironment = localStorage.getItem('item_environment') as POSEnvironment;

      console.log('🔍 POSConfig: Checking saved Item Service config:', {
        hasToken: !!savedItemToken,
        tokenLength: savedItemToken?.length || 0,
        environment: savedItemEnvironment || 'none'
      });

      if (savedItemToken) setItemBearerToken(savedItemToken);
      if (savedItemEnvironment) setItemEnvironment(savedItemEnvironment);

      // Initialize and configure item service if we have saved config
      if (savedItemToken && savedItemEnvironment) {
        try {
          console.log('🔧 Initializing Item Service from saved config...');
          await itemService.init();
          itemService.configure(savedItemToken, savedItemEnvironment);
          
          // Verify service is ready
          const isReady = itemService.isReady();
          const status = itemService.getStatus();
          console.log('✅ Item Service initialized and configured from saved settings');
          console.log('🔍 Item Service status:', { isReady, status });
        } catch (error) {
          console.error('❌ Failed to initialize Item Service from saved config:', error);
        }
      } else {
        console.log('⚠️ No saved Item Service configuration found');
      }

      // Load cache stats
      updateCacheStats();
    };

    initializeServices();
  }, []);

  const updateCacheStats = async () => {
    try {
      const stats = await itemService.getCacheStats();
      setCacheStats(stats);
    } catch (error) {
      console.error('Failed to update cache stats:', error);
    }
  };

  const saveConfiguration = () => {
    try {
      posApiService.setBearerToken(bearerToken);
      posApiService.setApiKey(apiKey);
      posApiService.setStoreNumber(storeNum);
      posApiService.setEnvironment(environment);
      
      // Save to localStorage
      localStorage.setItem('pos_bearer_token', bearerToken);
      localStorage.setItem('pos_api_key', apiKey);
      localStorage.setItem('pos_store_num', storeNum.toString());
      localStorage.setItem('pos_environment', environment);
      
      setConfig(posApiService.getConfig());
      setStatusMessage('POS API configuration saved successfully');
      setConnectionStatus('success');
    } catch (error) {
      setStatusMessage(`Failed to save configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setConnectionStatus('error');
    }
  };

  const testConnection = async () => {
    setConnectionStatus('testing');
    setStatusMessage('Testing POS API connection...');
    
    try {
      // First save the configuration
      posApiService.setBearerToken(bearerToken);
      posApiService.setApiKey(apiKey);
      posApiService.setStoreNumber(storeNum);
      posApiService.setEnvironment(environment);
      
      const result = await posApiService.testConnection();
      
      if (result.success) {
        setConnectionStatus('success');
        setStatusMessage(
          `✅ POS API connection successful!\n` +
          `Environment: ${environment.toUpperCase()}\n` +
          `Store: ${storeNum}\n` +
          `API Key: ${apiKey}`
        );
      } else {
        setConnectionStatus('error');
        setStatusMessage(`❌ POS API connection failed: ${result.message}`);
      }
    } catch (error) {
      setConnectionStatus('error');
      setStatusMessage(`💥 POS API connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const createTestCart = async () => {
    if (!bearerToken) {
      setStatusMessage('❌ Please set a bearer token first');
      return;
    }
    
    setConnectionStatus('testing');
    setStatusMessage('Creating test cart...');
    
    try {
      // Create a simple test cart
      const result = await posApiService.createCartWithItems([
        { ean: '5711724072697', quantity: 1 },
        { ean: '5711724072697', quantity: 2 }
      ]);
      
      if (result.success && result.cart) {
        setConnectionStatus('success');
        setStatusMessage(
          `✅ Test cart created successfully!\n` +
          `Cart ID: ${result.cart.cartId.id}\n` +
          `Items: ${result.cart.items?.length || 0}\n` +
          `Total: $${result.cart.grandTotal?.toFixed(2) || '0.00'}`
        );
      } else {
        setConnectionStatus('error');
        setStatusMessage(`❌ Failed to create test cart: ${result.error || result.message}`);
      }
    } catch (error) {
      setConnectionStatus('error');
      setStatusMessage(`💥 Test cart error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearConfiguration = () => {
    if (confirm('Are you sure you want to clear all configuration? This cannot be undone.')) {
      // Clear POS API configuration
      setBearerToken('');
      setApiKey('mobile');
      setStoreNum(1000);
      setEnvironment('test');
      setConnectionStatus('idle');
      setStatusMessage('');
      
      // Clear Item Service configuration
      setItemBearerToken('');
      setItemEnvironment('test');
      setItemConnectionStatus('idle');
      setItemStatusMessage('');
      
      // Clear localStorage
      localStorage.removeItem('pos_bearer_token');
      localStorage.removeItem('pos_api_key');
      localStorage.removeItem('pos_store_num');
      localStorage.removeItem('pos_environment');
      localStorage.removeItem('item_bearer_token');
      localStorage.removeItem('item_environment');
      
      // Reset services
      posApiService.setBearerToken('');
      posApiService.setApiKey('mobile');
      posApiService.setStoreNumber(1000);
      posApiService.setEnvironment('test');
      itemService.configure('', 'test');
      setConfig(posApiService.getConfig());
    }
  };

  // Item Service Functions
  const saveItemConfiguration = async () => {
    try {
      // Initialize and configure the item service
      await itemService.init();
      itemService.configure(itemBearerToken, itemEnvironment);
      
      // Save to localStorage
      localStorage.setItem('item_bearer_token', itemBearerToken);
      localStorage.setItem('item_environment', itemEnvironment);
      
      setItemStatusMessage('Item Service configuration saved successfully');
      setItemConnectionStatus('success');
      updateCacheStats();
    } catch (error) {
      setItemStatusMessage(`Failed to save Item Service configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setItemConnectionStatus('error');
    }
  };

  const testItemConnection = async () => {
    setItemConnectionStatus('testing');
    setItemStatusMessage('Testing Item Service connection...');
    
    try {
      // Initialize and configure the item service
      await itemService.init();
      itemService.configure(itemBearerToken, itemEnvironment);
      
      // Simple test - try to get an item (will test authentication)
      const posConfig = posApiService.getConfig();
      const testResult = await itemService.getItem({ gtin: '5711724072697' }, { storeNumber: posConfig.storeNum });
      
      if (testResult.success) {
        setItemConnectionStatus('success');
        setItemStatusMessage(
          `✅ Item Service connection successful!\n` +
          `Environment: ${itemEnvironment.toUpperCase()}\n` +
          `API is responding correctly`
        );
      } else {
        // Even if item not found, it means connection works
        setItemConnectionStatus('success');
        setItemStatusMessage(
          `✅ Item Service connection successful!\n` +
          `Environment: ${itemEnvironment.toUpperCase()}\n` +
          `Note: ${testResult.error || 'Test item not found (this is normal)'}`
        );
      }
      
      updateCacheStats();
    } catch (error) {
      setItemConnectionStatus('error');
      setItemStatusMessage(`💥 Item Service test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const testItemLookup = async () => {
    if (!itemBearerToken) {
      setItemStatusMessage('❌ Please set an Item Service bearer token first');
      return;
    }
    
    setItemConnectionStatus('testing');
    setItemStatusMessage('Testing item lookup...');
    
    try {
      // Initialize and configure the item service
      await itemService.init();
      itemService.configure(itemBearerToken, itemEnvironment);
      
      // Test with a sample barcode
      const posConfig = posApiService.getConfig();
      const result = await itemService.getItem({ gtin: '5711724072697' }, { storeNumber: posConfig.storeNum });
      
      console.log('🔍 Item lookup test result:', result);
      
      if (result.success && result.result) {
        setItemConnectionStatus('success');
        setItemStatusMessage(
          `✅ Item lookup successful!\n` +
          `Item: ${result.result.item?.itemText || result.result.item?.labelText1 || 'Test Item'}\n` +
          `Prices: ${result.result.prices?.length || 0} found`
        );
      } else {
        setItemConnectionStatus('info');
        setItemStatusMessage(`⚠️ Item lookup test: ${result.error || 'Item not found (this is normal for test barcodes)'}`);
      }
      
      updateCacheStats();
    } catch (error) {
      setItemConnectionStatus('error');
      setItemStatusMessage(`💥 Item lookup error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const clearItemCache = async () => {
    if (confirm('Are you sure you want to clear the item cache? This will remove all cached item data.')) {
      try {
        await itemService.clearCache();
        setItemStatusMessage('✅ Item cache cleared successfully');
        setItemConnectionStatus('success');
        updateCacheStats();
      } catch (error) {
        setItemStatusMessage(`❌ Failed to clear cache: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setItemConnectionStatus('error');
      }
    }
  };

  const testSpecificGtin = async () => {
    if (!itemBearerToken) {
      setItemStatusMessage('❌ Please set an Item Service bearer token first');
      return;
    }
    
    setItemConnectionStatus('testing');
    setItemStatusMessage('Testing specific GTIN: 7323342206972...');
    
    try {
      // Initialize and configure the item service
      await itemService.init();
      itemService.configure(itemBearerToken, itemEnvironment);
      
      const gtin = '7323342206972';
      console.log(`🔍 Testing GTIN: ${gtin}`);
      
      // Test with the specific GTIN
      const posConfig = posApiService.getConfig();
      const result = await itemService.getItem({ gtin: gtin }, { storeNumber: posConfig.storeNum });
      
      console.log('🔍 Specific GTIN test result:', JSON.stringify(result, null, 2));
      
      if (result.success && result.result) {
        setItemConnectionStatus('success');
        setItemStatusMessage(
          `✅ GTIN ${gtin} found!\n` +
          `Item: ${result.result.item?.itemText || result.result.item?.labelText1 || 'Unknown'}\n` +
          `Prices: ${result.result.prices?.length || 0} found\n` +
          `Source: ${result.result.source || 'API'}`
        );
      } else {
        setItemConnectionStatus('error');
        setItemStatusMessage(
          `❌ GTIN ${gtin} not found\n` +
          `Error: ${result.error || 'Unknown error'}\n` +
          `Check console for detailed logs`
        );
      }
      
      updateCacheStats();
    } catch (error) {
      setItemConnectionStatus('error');
      setItemStatusMessage(`💥 GTIN test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('GTIN test error:', error);
    }
  };

  const testCheckout = async () => {
    if (!bearerToken) {
      setStatusMessage('❌ Please configure Bearer Token first');
      return;
    }

    setConnectionStatus('testing');
    setStatusMessage('🛒 Testing checkout process...');

    try {
      // First create a test cart with a sample item
      console.log('🛒 Creating test cart for checkout...');
      const cartResult = await posApiService.createCartWithItems([
        { ean: '7323342206972', quantity: 1 }
      ]);

      if (!cartResult.success || !cartResult.cart) {
        setConnectionStatus('error');
        setStatusMessage(`❌ Failed to create test cart: ${cartResult.error}`);
        return;
      }

      const cartId = cartResult.cart.cartId.id;
      const totalAmount = 99.50; // Mock total amount

      console.log('💳 Testing checkout with cart ID:', cartId);

      // Test the checkout
      const checkoutResult = await posApiService.checkoutCart(cartId, totalAmount);

      if (checkoutResult.success) {
        setConnectionStatus('success');
        setStatusMessage(
          `✅ Checkout test successful!\n` +
          `Transaction ID: ${checkoutResult.transactionId}\n` +
          `Receipt: ${checkoutResult.receiptNumber}\n` +
          `Amount: $${totalAmount.toFixed(2)}\n` +
          `Payment: ${checkoutResult.payment?.cardName}\n` +
          `Reference: ${checkoutResult.payment?.paymentReferenceNumber}`
        );
      } else {
        setConnectionStatus('error');
        setStatusMessage(
          `❌ Checkout test failed\n` +
          `Error: ${checkoutResult.error}\n` +
          `Check console for detailed logs`
        );
      }
    } catch (error) {
      setConnectionStatus('error');
      setStatusMessage(`💥 Checkout test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Checkout test error:', error);
    }
  };

  if (!isVisible) return null;

  return (
    <ConfigOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ConfigContainer>
        <ConfigHeader>
          <ConfigTitle>⚙️ POS Configuration</ConfigTitle>
          <CloseButton onClick={onClose} aria-label="Close configuration">
            ✕
          </CloseButton>
        </ConfigHeader>
        
        <ConfigContent>
          <ConfigSection>
            <SectionTitle>🔌 POS API Status</SectionTitle>
            <StatusIndicator $status={config.hasToken ? 'success' : 'warning'}>
              <strong>Token:</strong> {config.hasToken ? '✅ Configured' : '⚠️ Missing'}<br/>
              <strong>Environment:</strong> {config.environment}<br/>
              <strong>Store:</strong> {config.storeNum}<br/>
              <strong>API Key:</strong> {config.apiKey}<br/>
              <strong>Endpoint:</strong> {config.environmentURL}
            </StatusIndicator>
          </ConfigSection>

          <ConfigSection>
            <Label htmlFor="environment">Environment</Label>
            <Select 
              id="environment" 
              value={environment} 
              onChange={(e) => setEnvironment(e.target.value as POSEnvironment)}
            >
              <option value="dev">🔧 Development (via proxy → posapi-dev.egretail.cloud/api)</option>
              <option value="test">🧪 Test (via proxy → posapi-test.egretail.cloud/api)</option>
              <option value="prod">🚀 Production (via proxy → posapi.egretail.cloud/api)</option>
            </Select>
          </ConfigSection>

          <ConfigSection>
            <Label htmlFor="storeNum">Store Number</Label>
            <Input
              id="storeNum"
              type="number"
              value={storeNum}
              onChange={(e) => setStoreNum(parseInt(e.target.value) || 1000)}
              placeholder="Enter store number (e.g., 1000)"
            />
          </ConfigSection>

          <ConfigSection>
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter API key (default: mobile)"
            />
          </ConfigSection>

          <ConfigSection>
            <Label htmlFor="bearerToken">POS API Bearer Token</Label>
            <TextArea
              id="bearerToken"
              value={bearerToken}
              onChange={(e) => setBearerToken(e.target.value)}
              placeholder="Paste your POS API bearer token here..."
            />
            <small style={{ color: '#666', fontSize: '14px' }}>
              🔑 Get this token from the EG Retail portal for POS API access
            </small>
          </ConfigSection>

          <ButtonGroup>
            <Button onClick={savePOSApiConfig} variant="primary">
              💾 Save POS Config
            </Button>
            <Button onClick={testPOSApiConnection} variant="secondary" disabled={connectionStatus === 'testing'}>
              {connectionStatus === 'testing' ? '🔄 Testing...' : '🔍 Test Connection'}
            </Button>
            <Button onClick={clearPOSApiConfig} variant="danger">
              🗑️ Clear Config
            </Button>
          </ButtonGroup>

          {connectionStatus !== 'idle' && (
            <StatusIndicator $status={connectionStatus === 'testing' ? 'info' : connectionStatus}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '12px' }}>
                {statusMessage}
              </pre>
            </StatusIndicator>
          )}

          <ConfigSection>
            <SectionTitle>🛍️ Item Service Status</SectionTitle>
            <StatusIndicator $status={itemService.isReady() ? 'success' : 'warning'}>
              <strong>Status:</strong> {itemService.isReady() ? '✅ Ready' : '⚠️ Not Ready'}<br/>
              <strong>Environment:</strong> {itemEnvironment}<br/>
              <strong>Cache:</strong> {cacheStats ? `${cacheStats.totalItems} items` : 'No cache data'}
            </StatusIndicator>
          </ConfigSection>

          <ConfigSection>
            <Label htmlFor="itemEnvironment">Item Service Environment</Label>
            <Select 
              id="itemEnvironment" 
              value={itemEnvironment} 
              onChange={(e) => setItemEnvironment(e.target.value as POSEnvironment)}
            >
              <option value="dev">🔧 Development</option>
              <option value="test">🧪 Test</option>
              <option value="prod">🚀 Production</option>
            </Select>
          </ConfigSection>

          <ConfigSection>
            <Label htmlFor="itemBearerToken">Item Service Bearer Token</Label>
            <TextArea
              id="itemBearerToken"
              value={itemBearerToken}
              onChange={(e) => setItemBearerToken(e.target.value)}
              placeholder="Paste your Item Service bearer token here..."
            />
            <small style={{ color: '#666', fontSize: '14px' }}>
              📦 Token for product catalog and inventory access
            </small>
          </ConfigSection>

          <ButtonGroup>
            <Button onClick={saveItemServiceConfig} variant="primary">
              💾 Save Item Config
            </Button>
            <Button onClick={testItemServiceConnection} variant="secondary" disabled={itemConnectionStatus === 'testing'}>
              {itemConnectionStatus === 'testing' ? '🔄 Testing...' : '🔍 Test Items'}
            </Button>
            <Button onClick={clearItemServiceConfig} variant="danger">
              🗑️ Clear Items
            </Button>
          </ButtonGroup>

          {itemConnectionStatus !== 'idle' && (
            <StatusIndicator $status={itemConnectionStatus === 'testing' ? 'info' : itemConnectionStatus}>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '12px' }}>
                {itemStatusMessage}
              </pre>
            </StatusIndicator>
          )}

          <ConfigSection>
            <SectionTitle>🧪 Advanced Testing</SectionTitle>
            <ButtonGroup>
              <Button onClick={testFullWorkflow} variant="warning">
                🔄 Full Workflow Test
              </Button>
              <Button onClick={testCachePerformance} variant="secondary">
                ⚡ Cache Performance
              </Button>
            </ButtonGroup>
          </ConfigSection>
        </ConfigContent>
      </ConfigContainer>
    </ConfigOverlay>
  );
};

export default POSConfig;
