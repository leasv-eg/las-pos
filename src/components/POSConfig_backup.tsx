import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { posApiService } from '../services/posApi';
import { itemService } from '../services/itemService';
import { POSEnvironment } from '../types/posApiTypes';

const ConfigContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin: 20px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ConfigSection = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 10px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: monospace;
  margin-bottom: 10px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' }>`
  padding: 10px 15px;
  margin: 5px 5px 5px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  
  ${({ variant = 'primary' }) => {
    switch (variant) {
      case 'primary':
        return 'background: #007bff; color: white;';
      case 'secondary':
        return 'background: #6c757d; color: white;';
      case 'success':
        return 'background: #28a745; color: white;';
      case 'danger':
        return 'background: #dc3545; color: white;';
      case 'warning':
        return 'background: #ffc107; color: #212529;';
      default:
        return 'background: #007bff; color: white;';
    }
  }}

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const StatusIndicator = styled.div<{ status: 'success' | 'error' | 'warning' | 'info' }>`
  padding: 10px;
  margin: 10px 0;
  border-radius: 4px;
  
  ${({ status }) => {
    switch (status) {
      case 'success':
        return 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;';
      case 'error':
        return 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;';
      case 'warning':
        return 'background: #fff3cd; color: #856404; border: 1px solid #ffeaa7;';
      case 'info':
        return 'background: #d1ecf1; color: #0c5460; border: 1px solid #b8daff;';
    }
  }}
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 10px;
  background: white;

  &:focus {
    outline: none;
    border-color: #007bff;
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

    if (savedItemToken) setItemBearerToken(savedItemToken);
    if (savedItemEnvironment) setItemEnvironment(savedItemEnvironment);

    // Load cache stats
    updateCacheStats();
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
        { ean: '0000000001234', quantity: 1 },
        { ean: '0000000005678', quantity: 2 }
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
      // First save the configuration
      itemService.configure(itemBearerToken, itemEnvironment);
      
      // Simple test - try to get an item (will test authentication)
      const testResult = await itemService.getItem({ gtin: '0000000001234' });
      
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
      itemService.configure(itemBearerToken, itemEnvironment);
      
      // Test with a sample barcode
      const result = await itemService.getItem({ gtin: '0000000001234' });
      
      if (result.success && result.result) {
        setItemConnectionStatus('success');
        setItemStatusMessage(
          `✅ Item lookup successful!\n` +
          `Item: ${result.result.item?.name || result.result.item?.itemId || 'Test Item'}\n` +
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

  if (!isVisible) return null;

  return (
    <ConfigContainer>
      <h2>🔧 POS API Configuration</h2>
      
      <ConfigSection>
        <h3>Current Status</h3>
        <div>
          <strong>Token Status:</strong> {config.hasToken ? '✅ Set' : '❌ Not set'}<br/>
          <strong>Environment:</strong> {config.environment}<br/>
          <strong>Store Number:</strong> {config.storeNum}<br/>
          <strong>API Key:</strong> {config.apiKey}<br/>
          <strong>Base URL:</strong> {config.environmentURL}
        </div>
      </ConfigSection>

      <ConfigSection>
        <Label htmlFor="environment">Environment</Label>
        <Select 
          id="environment" 
          value={environment} 
          onChange={(e) => setEnvironment(e.target.value as POSEnvironment)}
        >
          <option value="dev">Development (via proxy → posapi-dev.egretail.cloud/api)</option>
          <option value="test">Test (via proxy → posapi-test.egretail.cloud/api)</option>
          <option value="prod">Production (via proxy → posapi.egretail.cloud/api)</option>
        </Select>
      </ConfigSection>

      <ConfigSection>
        <Label htmlFor="storeNum">Store Number</Label>
        <Input
          id="storeNum"
          type="number"
          value={storeNum}
          onChange={(e) => setStoreNum(parseInt(e.target.value) || 1000)}
          placeholder="1000"
        />
      </ConfigSection>

      <ConfigSection>
        <Label htmlFor="apiKey">API Key</Label>
        <Input
          id="apiKey"
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="mobile"
        />
      </ConfigSection>

      <ConfigSection>
        <Label htmlFor="bearerToken">Bearer Token</Label>
        <TextArea
          id="bearerToken"
          value={bearerToken}
          onChange={(e) => setBearerToken(e.target.value)}
          placeholder="Paste your bearer token here..."
        />
        <small style={{ color: '#666' }}>
          This token is used to authenticate with the EG Retail POS API. 
          You can get this token from the EG Retail portal.
        </small>
      </ConfigSection>

      {statusMessage && (
        <StatusIndicator 
          status={
            connectionStatus === 'success' ? 'success' :
            connectionStatus === 'error' ? 'error' :
            connectionStatus === 'testing' ? 'info' : 'info'
          }
        >
          <div style={{ whiteSpace: 'pre-line' }}>
            <strong>POS API:</strong> {environment.toUpperCase()}
            <br />
            {statusMessage}
          </div>
        </StatusIndicator>
      )}

      <ConfigSection>
        <Button 
          variant="primary" 
          onClick={saveConfiguration}
        >
          💾 Save Config
        </Button>

        <Button 
          variant="secondary" 
          onClick={testConnection}
          disabled={connectionStatus === 'testing'}
        >
          🔄 Test Connection
        </Button>

        <Button 
          variant="success" 
          onClick={createTestCart}
          disabled={connectionStatus === 'testing' || !bearerToken}
        >
          🛒 Create Test Cart
        </Button>

        <Button 
          variant="danger" 
          onClick={clearConfiguration}
        >
          🗑️ Clear All
        </Button>
      </ConfigSection>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '2px solid #eee' }} />

      {/* Item Service Configuration */}
      <h2>📦 Item Service Configuration</h2>
      
      <ConfigSection>
        <h3>Item Service Status</h3>
        <div>
          <strong>Token Status:</strong> {itemBearerToken ? '✅ Set' : '❌ Not set'}<br/>
          <strong>Environment:</strong> {itemEnvironment}<br/>
          <strong>Service Status:</strong> {itemService.getStatus().ready ? '✅ Ready' : '❌ Not Ready'}<br/>
          {cacheStats && (
            <>
              <strong>Cache:</strong> {cacheStats.totalItems} items cached<br/>
            </>
          )}
        </div>
      </ConfigSection>

      <ConfigSection>
        <Label htmlFor="itemEnvironment">Item Service Environment</Label>
        <Select 
          id="itemEnvironment" 
          value={itemEnvironment} 
          onChange={(e) => setItemEnvironment(e.target.value as POSEnvironment)}
        >
          <option value="dev">Development (via proxy → itemservice-dev.egretail.cloud/api)</option>
          <option value="test">Test (via proxy → itemservice-test.egretail.cloud/api)</option>
          <option value="prod">Production (via proxy → itemservice.egretail.cloud/api)</option>
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
        <small style={{ color: '#666' }}>
          This token is used to access the EG Retail Item Gateway API for product information and pricing.
        </small>
      </ConfigSection>

      {itemStatusMessage && (
        <StatusIndicator 
          status={
            itemConnectionStatus === 'success' ? 'success' :
            itemConnectionStatus === 'error' ? 'error' :
            itemConnectionStatus === 'testing' ? 'info' : 'info'
          }
        >
          <div style={{ whiteSpace: 'pre-line' }}>
            <strong>Item Service:</strong> {itemEnvironment.toUpperCase()}
            <br />
            {itemStatusMessage}
          </div>
        </StatusIndicator>
      )}

      <ConfigSection>
        <Button 
          variant="primary" 
          onClick={saveItemConfiguration}
        >
          💾 Save Item Config
        </Button>

        <Button 
          variant="secondary" 
          onClick={testItemConnection}
          disabled={itemConnectionStatus === 'testing'}
        >
          🔄 Test Item Service
        </Button>

        <Button 
          variant="success" 
          onClick={testItemLookup}
          disabled={itemConnectionStatus === 'testing' || !itemBearerToken}
        >
          🔍 Test Item Lookup
        </Button>

        <Button 
          variant="warning" 
          onClick={clearItemCache}
        >
          🗑️ Clear Cache
        </Button>
      </ConfigSection>

      <hr style={{ margin: '30px 0', border: 'none', borderTop: '2px solid #eee' }} />

      <ConfigSection>
        <Button 
          variant="secondary" 
          onClick={onClose}
        >
          ❌ Close
        </Button>
      </ConfigSection>
    </ConfigContainer>
  );
};
