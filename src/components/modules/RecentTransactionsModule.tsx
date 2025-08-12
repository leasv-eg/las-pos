import React from 'react';
import styled from 'styled-components';
import { ModuleProps, ModuleSize } from '../../types/modules';

interface Transaction {
  id: string;
  date: string;
  time: string;
  total: number;
  items: number;
  status: 'completed' | 'voided' | 'held' | 'refunded';
  paymentMethod: string;
  customerName?: string;
}

interface RecentTransactionsModuleProps extends ModuleProps {
  transactions?: Transaction[];
  onTransactionSelect?: (transaction: Transaction) => void;
  onViewReceipt?: (transaction: Transaction) => void;
  onRefund?: (transaction: Transaction) => void;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ size }) => {
    switch (size) {
      case 'micro': return '4px';
      case 'small': return '6px';
      case 'medium': return '8px';
      case 'large': return '12px';
      default: return '8px';
    }
  }};
  font-size: ${({ size }) => {
    switch (size) {
      case 'micro': return '10px';
      case 'small': return '12px';
      case 'medium': return '14px';
      case 'large': return '16px';
      default: return '14px';
    }
  }};
  font-weight: 600;
  color: #333;
`;

const TransactionsList = styled.div<{ size: ModuleSize }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${({ size }) => {
    switch (size) {
      case 'micro': return '2px';
      case 'small': return '4px';
      case 'medium': return '6px';
      case 'large': return '8px';
      default: return '6px';
    }
  }};
  overflow-y: auto;
`;

const TransactionCard = styled.div<{ size: ModuleSize; status: string }>`
  border: 1px solid #e0e0e0;
  border-left: 4px solid ${({ status }) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'voided': return '#f44336';
      case 'held': return '#ff9800';
      case 'refunded': return '#9c27b0';
      default: return '#e0e0e0';
    }
  }};
  border-radius: 6px;
  padding: ${({ size }) => {
    switch (size) {
      case 'micro': return '4px';
      case 'small': return '6px';
      case 'medium': return '8px';
      case 'large': return '12px';
      default: return '8px';
    }
  }};
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  
  &:hover {
    border-color: #1976d2;
    box-shadow: 0 2px 8px rgba(25, 118, 210, 0.1);
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const TransactionHeader = styled.div<{ size: ModuleSize }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ size }) => {
    switch (size) {
      case 'micro': return '2px';
      case 'small': return '4px';
      case 'medium': return '6px';
      case 'large': return '8px';
      default: return '6px';
    }
  }};
`;

const TransactionId = styled.div<{ size: ModuleSize }>`
  font-size: ${({ size }) => {
    switch (size) {
      case 'micro': return '9px';
      case 'small': return '10px';
      case 'medium': return '11px';
      case 'large': return '12px';
      default: return '11px';
    }
  }};
  font-weight: 600;
  color: #333;
  font-family: 'Courier New', monospace;
`;

const TransactionTotal = styled.div<{ size: ModuleSize }>`
  font-size: ${({ size }) => {
    switch (size) {
      case 'micro': return '10px';
      case 'small': return '12px';
      case 'medium': return '14px';
      case 'large': return '16px';
      default: return '14px';
    }
  }};
  font-weight: 700;
  color: #1976d2;
`;

const TransactionDetails = styled.div<{ size: ModuleSize }>`
  display: ${({ size }) => size === 'micro' ? 'none' : 'flex'};
  justify-content: space-between;
  align-items: center;
  font-size: ${({ size }) => {
    switch (size) {
      case 'small': return '9px';
      case 'medium': return '10px';
      case 'large': return '11px';
      default: return '10px';
    }
  }};
  color: #666;
  margin-bottom: ${({ size }) => {
    switch (size) {
      case 'small': return '2px';
      case 'medium': return '3px';
      case 'large': return '4px';
      default: return '3px';
    }
  }};
`;

const TransactionTime = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TransactionStatus = styled.span<{ status: string }>`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 8px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${({ status }) => {
    switch (status) {
      case 'completed': return '#e8f5e8';
      case 'voided': return '#ffebee';
      case 'held': return '#fff3e0';
      case 'refunded': return '#f3e5f5';
      default: return '#f5f5f5';
    }
  }};
  color: ${({ status }) => {
    switch (status) {
      case 'completed': return '#2e7d32';
      case 'voided': return '#c62828';
      case 'held': return '#ef6c00';
      case 'refunded': return '#7b1fa2';
      default: return '#666';
    }
  }};
`;

const TransactionMeta = styled.div<{ size: ModuleSize }>`
  display: ${({ size }) => ['micro', 'small'].includes(size) ? 'none' : 'flex'};
  justify-content: space-between;
  align-items: center;
  font-size: ${({ size }) => {
    switch (size) {
      case 'medium': return '9px';
      case 'large': return '10px';
      default: return '9px';
    }
  }};
  color: #888;
`;

const ActionButtons = styled.div<{ size: ModuleSize }>`
  display: ${({ size }) => ['micro', 'small'].includes(size) ? 'none' : 'flex'};
  gap: 4px;
  margin-top: ${({ size }) => {
    switch (size) {
      case 'medium': return '6px';
      case 'large': return '8px';
      default: return '6px';
    }
  }};
`;

const ActionButton = styled.button<{ size: ModuleSize }>`
  flex: 1;
  padding: ${({ size }) => {
    switch (size) {
      case 'medium': return '4px 6px';
      case 'large': return '6px 8px';
      default: return '4px 6px';
    }
  }};
  border: 1px solid #1976d2;
  border-radius: 4px;
  background: white;
  color: #1976d2;
  font-size: ${({ size }) => {
    switch (size) {
      case 'medium': return '9px';
      case 'large': return '10px';
      default: return '9px';
    }
  }};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #1976d2;
    color: white;
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &.secondary {
    border-color: #666;
    color: #666;
  }
  
  &.secondary:hover {
    background: #666;
    color: white;
  }
`;

const EmptyState = styled.div<{ size: ModuleSize }>`
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
`;

const sampleTransactions: Transaction[] = [
  {
    id: 'TXN001',
    date: '2024-01-15',
    time: '14:30',
    total: 45.99,
    items: 3,
    status: 'completed',
    paymentMethod: 'Card',
    customerName: 'John Doe'
  },
  {
    id: 'TXN002',
    date: '2024-01-15',
    time: '14:15',
    total: 12.50,
    items: 1,
    status: 'completed',
    paymentMethod: 'Cash'
  },
  {
    id: 'TXN003',
    date: '2024-01-15',
    time: '13:45',
    total: 89.99,
    items: 5,
    status: 'held',
    paymentMethod: 'Pending',
    customerName: 'Jane Smith'
  },
  {
    id: 'TXN004',
    date: '2024-01-15',
    time: '13:20',
    total: 25.00,
    items: 2,
    status: 'voided',
    paymentMethod: 'Card'
  },
  {
    id: 'TXN005',
    date: '2024-01-15',
    time: '12:55',
    total: 67.50,
    items: 4,
    status: 'refunded',
    paymentMethod: 'Card',
    customerName: 'Mike Johnson'
  }
];

export const RecentTransactionsModule: React.FC<RecentTransactionsModuleProps> = ({
  module,
  size,
  isEditMode,
  transactions = sampleTransactions,
  onTransactionSelect,
  onViewReceipt,
  onRefund
}) => {
  const handleTransactionClick = (transaction: Transaction) => {
    if (isEditMode) return;
    onTransactionSelect?.(transaction);
  };

  const handleViewReceipt = (transaction: Transaction, event: React.MouseEvent) => {
    event.stopPropagation();
    if (isEditMode) return;
    onViewReceipt?.(transaction);
  };

  const handleRefund = (transaction: Transaction, event: React.MouseEvent) => {
    event.stopPropagation();
    if (isEditMode) return;
    onRefund?.(transaction);
  };

  const getMaxTransactions = () => {
    switch (size) {
      case 'micro': return 3;
      case 'small': return 4;
      case 'medium': return 6;
      case 'large': return 8;
      default: return 6;
    }
  };

  const displayedTransactions = transactions.slice(0, getMaxTransactions());

  if (!displayedTransactions.length) {
    return (
      <ModuleContainer size={size}>
        <Header size={size}>
          {size === 'micro' ? 'Recent' : 'Recent Transactions'}
        </Header>
        <EmptyState size={size}>
          {size === 'micro' ? 'No data' : 'No recent transactions'}
        </EmptyState>
      </ModuleContainer>
    );
  }

  return (
    <ModuleContainer size={size}>
      <Header size={size}>
        {size === 'micro' ? 'Recent' : 'Recent Transactions'}
        {size !== 'micro' && (
          <span style={{ fontSize: '80%', color: '#666' }}>
            {displayedTransactions.length}
          </span>
        )}
      </Header>
      
      <TransactionsList size={size}>
        {displayedTransactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            size={size}
            status={transaction.status}
            onClick={() => handleTransactionClick(transaction)}
          >
            <TransactionHeader size={size}>
              <TransactionId size={size}>
                {transaction.id}
              </TransactionId>
              <TransactionTotal size={size}>
                {transaction.total.toFixed(2)}
              </TransactionTotal>
            </TransactionHeader>
            
            <TransactionDetails size={size}>
              <TransactionTime>
                <span>{transaction.time}</span>
                <span>•</span>
                <span>{transaction.items} items</span>
              </TransactionTime>
              <TransactionStatus status={transaction.status}>
                {transaction.status}
              </TransactionStatus>
            </TransactionDetails>
            
            <TransactionMeta size={size}>
              <span>{transaction.paymentMethod}</span>
              {transaction.customerName && (
                <span>{transaction.customerName}</span>
              )}
            </TransactionMeta>
            
            <ActionButtons size={size}>
              <ActionButton
                size={size}
                className="secondary"
                onClick={(e) => handleViewReceipt(transaction, e)}
              >
                Receipt
              </ActionButton>
              {transaction.status === 'completed' && (
                <ActionButton
                  size={size}
                  onClick={(e) => handleRefund(transaction, e)}
                >
                  Refund
                </ActionButton>
              )}
            </ActionButtons>
          </TransactionCard>
        ))}
      </TransactionsList>
    </ModuleContainer>
  );
};
