import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RecentTransactionsModule } from '../RecentTransactionsModule'
import { ModuleConfig } from '../../../types/modules'

// Mock console.error to avoid noise in tests
vi.spyOn(console, 'error').mockImplementation(() => {})

const mockModule: ModuleConfig = {
  id: 'recent-transactions',
  type: 'recent-transactions',
  title: 'Recent Transactions',
  position: { x: 0, y: 0, w: 4, h: 3 },
  visible: true,
  locked: false,
  minSize: { w: 3, h: 2 }
}

const mockTransactions = [
  {
    id: 'TXN001',
    date: '2024-01-15',
    time: '10:30',
    total: 25.99,
    items: 3,
    status: 'completed' as const,
    paymentMethod: 'Card'
  },
  {
    id: 'TXN002',
    date: '2024-01-15',
    time: '10:25',
    total: 12.50,
    items: 1,
    status: 'completed' as const,
    paymentMethod: 'Cash'
  },
  {
    id: 'TXN003',
    date: '2024-01-15',
    time: '10:20',
    total: 45.75,
    items: 5,
    status: 'voided' as const,
    paymentMethod: 'Card'
  }
]

const defaultProps = {
  module: mockModule,
  size: 'medium' as const,
  isEditMode: false,
  transactions: mockTransactions,
  onTransactionSelect: vi.fn(),
  onViewReceipt: vi.fn(),
  onRefund: vi.fn()
}

describe('RecentTransactionsModule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders edit mode placeholder', () => {
    render(
      <RecentTransactionsModule 
        {...defaultProps}
        isEditMode={true}
      />
    )
    
    expect(screen.getByText('Recent Transactions')).toBeInTheDocument()
  })

  it('renders transaction list when transactions provided', () => {
    render(<RecentTransactionsModule {...defaultProps} />)
    
    expect(screen.getByText('TXN001')).toBeInTheDocument()
    expect(screen.getByText('TXN002')).toBeInTheDocument()
    expect(screen.getByText('TXN003')).toBeInTheDocument()
    expect(screen.getByText('$25.99')).toBeInTheDocument()
    expect(screen.getByText('$12.50')).toBeInTheDocument()
    expect(screen.getByText('$45.75')).toBeInTheDocument()
  })

  it('renders empty state when no transactions', () => {
    render(
      <RecentTransactionsModule 
        {...defaultProps}
        transactions={[]}
      />
    )
    
    expect(screen.getByText('No recent transactions')).toBeInTheDocument()
  })

  it('handles transaction selection', () => {
    render(<RecentTransactionsModule {...defaultProps} />)
    
    fireEvent.click(screen.getByText('TXN001'))
    
    expect(defaultProps.onTransactionSelect).toHaveBeenCalledWith(mockTransactions[0])
  })

  it('handles transaction recall', () => {
    render(<RecentTransactionsModule {...defaultProps} />)
    
    // Look for view receipt or refund buttons
    const viewButtons = screen.getAllByText('View')
    if (viewButtons.length > 0) {
      fireEvent.click(viewButtons[0])
      expect(defaultProps.onViewReceipt).toHaveBeenCalledWith(mockTransactions[0])
    } else {
      // Try double-click if no specific buttons
      fireEvent.doubleClick(screen.getByText('TXN001'))
      expect(defaultProps.onTransactionSelect).toHaveBeenCalledWith(mockTransactions[0])
    }
  })

  it('displays transaction status correctly', () => {
    render(<RecentTransactionsModule {...defaultProps} />)
    
    expect(screen.getByText('completed')).toBeInTheDocument()
    expect(screen.getByText('voided')).toBeInTheDocument()
  })

  it('formats transaction timestamps', () => {
    render(<RecentTransactionsModule {...defaultProps} />)
    
    // Should display some formatted time
    expect(screen.getByText(/10:30/)).toBeInTheDocument()
    expect(screen.getByText(/10:25/)).toBeInTheDocument()
    expect(screen.getByText(/10:20/)).toBeInTheDocument()
  })

  it('adapts to different sizes', () => {
    const { rerender } = render(
      <RecentTransactionsModule 
        {...defaultProps}
        size="micro"
      />
    )
    
    // Micro size should show basic transaction info
    expect(screen.getByText('TXN001')).toBeInTheDocument()
    
    rerender(
      <RecentTransactionsModule 
        {...defaultProps}
        size="large"
      />
    )
    
    // Large size should show more detailed information
    expect(screen.getByText('TXN001')).toBeInTheDocument()
    expect(screen.getByText('$25.99')).toBeInTheDocument()
  })

  it('disables interactions in edit mode', () => {
    render(
      <RecentTransactionsModule 
        {...defaultProps}
        isEditMode={true}
      />
    )
    
    // In edit mode, clicking should not trigger callbacks
    const placeholder = screen.getByText('Recent Transactions')
    fireEvent.click(placeholder)
    
    expect(defaultProps.onTransactionSelect).not.toHaveBeenCalled()
    expect(defaultProps.onViewReceipt).not.toHaveBeenCalled()
  })

  it('shows transaction item count', () => {
    render(<RecentTransactionsModule {...defaultProps} />)
    
    expect(screen.getByText('3 items')).toBeInTheDocument()
    expect(screen.getByText('1 item')).toBeInTheDocument()
    expect(screen.getByText('5 items')).toBeInTheDocument()
  })
})
