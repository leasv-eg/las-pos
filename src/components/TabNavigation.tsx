import React from 'react';
import styled from 'styled-components';
import { mediaQueries, spacing, touchTargets } from '../styles/responsive';

interface TabNavigationProps {
  activeTab: 'basket' | 'actionpad' | 'insight';
  onTabChange: (tab: 'basket' | 'actionpad' | 'insight') => void;
  basketItemCount?: number;
}

const TabContainer = styled.div`
  display: none;
  
  ${mediaQueries.mobile} {
    display: flex;
    background: #f8f9fa;
    border-bottom: 1px solid #e0e0e0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

const Tab = styled.button<{ isActive: boolean }>`
  flex: 1;
  padding: ${spacing.md};
  border: none;
  background: ${props => props.isActive ? '#1976d2' : 'transparent'};
  color: ${props => props.isActive ? 'white' : '#666'};
  font-size: 14px;
  font-weight: 600;
  min-height: ${touchTargets.comfortable};
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
  
  &:active {
    background: ${props => props.isActive ? '#1565c0' : '#e0e0e0'};
  }
`;

const TabBadge = styled.span`
  position: absolute;
  top: 4px;
  right: 8px;
  background: #f44336;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: bold;
  min-width: 20px;
  text-align: center;
`;

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  basketItemCount = 0
}) => {
  return (
    <TabContainer>
      <Tab 
        isActive={activeTab === 'actionpad'} 
        onClick={() => onTabChange('actionpad')}
      >
        🔢 Keypad
      </Tab>
      <Tab 
        isActive={activeTab === 'basket'} 
        onClick={() => onTabChange('basket')}
      >
        🛒 Basket
        {basketItemCount > 0 && (
          <TabBadge>{basketItemCount}</TabBadge>
        )}
      </Tab>
      <Tab 
        isActive={activeTab === 'insight'} 
        onClick={() => onTabChange('insight')}
      >
        💡 Insights
      </Tab>
    </TabContainer>
  );
};
