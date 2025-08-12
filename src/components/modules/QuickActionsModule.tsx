import React from 'react';
import styled from 'styled-components';
import { ModuleProps, ModuleSize } from '../../types/modules';

interface QuickActionsModuleProps extends ModuleProps {
  onVoidTransaction?: () => void;
  onHoldTransaction?: () => void;
  onRecallTransaction?: () => void;
  onPrintReceipt?: () => void;
  onOpenCashDrawer?: () => void;
  onTaxExempt?: () => void;
  onDiscount?: () => void;
  onLoyaltyCard?: () => void;
  onManagerOverride?: () => void;
}

interface QuickAction {
  id: string;
  label: string;
  shortLabel: string;
  icon: string;
  color: string;
  action: string;
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
      case 'small': return '6px';
      case 'medium': return '8px';
      case 'large': return '12px';
      default: return '8px';
    }
  }};
`;

const Header = styled.div<{ size: ModuleSize }>`
  display: ${({ size }) => size === 'micro' ? 'none' : 'flex'};
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ size }) => {
    switch (size) {
      case 'small': return '6px';
      case 'medium': return '8px';
      case 'large': return '12px';
      default: return '8px';
    }
  }};
  font-size: ${({ size }) => {
    switch (size) {
      case 'small': return '12px';
      case 'medium': return '14px';
      case 'large': return '16px';
      default: return '14px';
    }
  }};
  font-weight: 600;
  color: #333;
`;

const ActionsGrid = styled.div<{ size: ModuleSize }>`
  flex: 1;
  display: grid;
  gap: ${({ size }) => {
    switch (size) {
      case 'micro': return '2px';
      case 'small': return '4px';
      case 'medium': return '6px';
      case 'large': return '8px';
      default: return '6px';
    }
  }};
  
  grid-template-columns: ${({ size }) => {
    switch (size) {
      case 'micro': return 'repeat(2, 1fr)';
      case 'small': return 'repeat(3, 1fr)';
      case 'medium': return 'repeat(3, 1fr)';
      case 'large': return 'repeat(4, 1fr)';
      default: return 'repeat(3, 1fr)';
    }
  }};
  
  align-content: start;
`;

const ActionButton = styled.button<{ size: ModuleSize; color: string }>`
  aspect-ratio: 1;
  border: none;
  border-radius: 6px;
  background: ${({ color }) => color};
  color: white;
  font-size: ${({ size }) => {
    switch (size) {
      case 'micro': return '8px';
      case 'small': return '9px';
      case 'medium': return '10px';
      case 'large': return '12px';
      default: return '10px';
    }
  }};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ size }) => {
    switch (size) {
      case 'micro': return '1px';
      case 'small': return '2px';
      case 'medium': return '3px';
      case 'large': return '4px';
      default: return '3px';
    }
  }};
  padding: ${({ size }) => {
    switch (size) {
      case 'micro': return '2px';
      case 'small': return '4px';
      case 'medium': return '6px';
      case 'large': return '8px';
      default: return '6px';
    }
  }};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ActionIcon = styled.div<{ size: ModuleSize }>`
  font-size: ${({ size }) => {
    switch (size) {
      case 'micro': return '10px';
      case 'small': return '14px';
      case 'medium': return '18px';
      case 'large': return '24px';
      default: return '18px';
    }
  }};
  line-height: 1;
`;

const ActionLabel = styled.div<{ size: ModuleSize }>`
  text-align: center;
  line-height: 1.1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: ${({ size }) => size === 'micro' ? 1 : 2};
  -webkit-box-orient: vertical;
`;

const quickActions: QuickAction[] = [
  {
    id: 'void',
    label: 'Void Transaction',
    shortLabel: 'Void',
    icon: '🗑️',
    color: '#d32f2f',
    action: 'onVoidTransaction'
  },
  {
    id: 'hold',
    label: 'Hold Transaction',
    shortLabel: 'Hold',
    icon: '⏸️',
    color: '#f57c00',
    action: 'onHoldTransaction'
  },
  {
    id: 'recall',
    label: 'Recall Transaction',
    shortLabel: 'Recall',
    icon: '↩️',
    color: '#388e3c',
    action: 'onRecallTransaction'
  },
  {
    id: 'receipt',
    label: 'Print Receipt',
    shortLabel: 'Print',
    icon: '🖨️',
    color: '#1976d2',
    action: 'onPrintReceipt'
  },
  {
    id: 'drawer',
    label: 'Open Cash Drawer',
    shortLabel: 'Drawer',
    icon: '💰',
    color: '#7b1fa2',
    action: 'onOpenCashDrawer'
  },
  {
    id: 'tax',
    label: 'Tax Exempt',
    shortLabel: 'Tax',
    icon: '📋',
    color: '#455a64',
    action: 'onTaxExempt'
  },
  {
    id: 'discount',
    label: 'Apply Discount',
    shortLabel: 'Discount',
    icon: '💸',
    color: '#e91e63',
    action: 'onDiscount'
  },
  {
    id: 'loyalty',
    label: 'Loyalty Card',
    shortLabel: 'Loyalty',
    icon: '🎁',
    color: '#00acc1',
    action: 'onLoyaltyCard'
  },
  {
    id: 'manager',
    label: 'Manager Override',
    shortLabel: 'Manager',
    icon: '🔐',
    color: '#5d4037',
    action: 'onManagerOverride'
  }
];

export const QuickActionsModule: React.FC<QuickActionsModuleProps> = ({
  module,
  size,
  isEditMode,
  onVoidTransaction,
  onHoldTransaction,
  onRecallTransaction,
  onPrintReceipt,
  onOpenCashDrawer,
  onTaxExempt,
  onDiscount,
  onLoyaltyCard,
  onManagerOverride
}) => {
  const actionHandlers: Record<string, (() => void) | undefined> = {
    onVoidTransaction,
    onHoldTransaction,
    onRecallTransaction,
    onPrintReceipt,
    onOpenCashDrawer,
    onTaxExempt,
    onDiscount,
    onLoyaltyCard,
    onManagerOverride
  };

  const handleActionClick = (action: QuickAction) => {
    if (isEditMode) return;
    
    const actionHandler = actionHandlers[action.action];
    if (typeof actionHandler === 'function') {
      actionHandler();
    }
  };

  const getMaxActions = () => {
    switch (size) {
      case 'micro': return 4;
      case 'small': return 6;
      case 'medium': return 9;
      case 'large': return 12;
      default: return 9;
    }
  };

  const displayedActions = quickActions.slice(0, getMaxActions());

  const getActionLabel = (action: QuickAction) => {
    switch (size) {
      case 'micro': return action.icon;
      case 'small': return action.shortLabel;
      default: return action.label;
    }
  };

  return (
    <ModuleContainer size={size}>
      <Header size={size}>
        Quick Actions
      </Header>
      
      <ActionsGrid size={size}>
        {displayedActions.map((action) => (
          <ActionButton
            key={action.id}
            size={size}
            color={action.color}
            onClick={() => handleActionClick(action)}
            disabled={isEditMode}
            title={action.label}
          >
            {size !== 'micro' && (
              <ActionIcon size={size}>
                {action.icon}
              </ActionIcon>
            )}
            <ActionLabel size={size}>
              {getActionLabel(action)}
            </ActionLabel>
          </ActionButton>
        ))}
      </ActionsGrid>
    </ModuleContainer>
  );
};
