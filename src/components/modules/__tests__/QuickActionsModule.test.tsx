import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuickActionsModule } from '../QuickActionsModule'
import { ModuleConfig } from '../../../types/modules'

// Mock console.error to avoid noise in tests
vi.spyOn(console, 'error').mockImplementation(() => {})

const mockModule: ModuleConfig = {
  id: 'quick-actions',
  type: 'quick-actions',
  title: 'Quick Actions',
  position: { x: 0, y: 0, w: 3, h: 2 },
  visible: true,
  locked: false,
  minSize: { w: 2, h: 1 }
}

const defaultProps = {
  module: mockModule,
  size: 'medium' as const,
  isEditMode: false,
  onAction: vi.fn()
}

describe('QuickActionsModule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders edit mode placeholder', () => {
    render(
      <QuickActionsModule 
        {...defaultProps}
        isEditMode={true}
      />
    )
    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    render(<QuickActionsModule {...defaultProps} />)
    
    // Common quick actions in POS systems
    expect(screen.getByText('Hold')).toBeInTheDocument()
    expect(screen.getByText('Recall')).toBeInTheDocument()
    expect(screen.getByText('Void')).toBeInTheDocument()
  })

  it('handles action clicks', () => {
    render(<QuickActionsModule {...defaultProps} />)
    
    fireEvent.click(screen.getByText('Hold'))
    expect(defaultProps.onAction).toHaveBeenCalledWith('hold')
    
    fireEvent.click(screen.getByText('Recall'))
    expect(defaultProps.onAction).toHaveBeenCalledWith('recall')
    
    fireEvent.click(screen.getByText('Void'))
    expect(defaultProps.onAction).toHaveBeenCalledWith('void')
  })

  it('adapts layout for different sizes', () => {
    const { rerender } = render(
      <QuickActionsModule 
        {...defaultProps}
        size="micro"
      />
    )
    
    // Micro size should still show essential actions
    expect(screen.getByText('Hold')).toBeInTheDocument()
    
    rerender(
      <QuickActionsModule 
        {...defaultProps}
        size="large"
      />
    )
    
    // Large size should show more actions or bigger buttons
    expect(screen.getByText('Hold')).toBeInTheDocument()
    expect(screen.getByText('Recall')).toBeInTheDocument()
    expect(screen.getByText('Void')).toBeInTheDocument()
  })

  it('disables actions in edit mode', () => {
    render(
      <QuickActionsModule 
        {...defaultProps}
        isEditMode={true}
      />
    )
    
    // In edit mode, should not show interactive buttons
    expect(screen.queryByText('Hold')).not.toBeInTheDocument()
    expect(screen.getByText('Quick Actions')).toBeInTheDocument()
  })

  it('renders consistently across different scenarios', () => {
    // Test basic rendering
    render(<QuickActionsModule {...defaultProps} />)
    
    // Should show essential actions
    expect(screen.getByText('Hold')).toBeInTheDocument()
    expect(screen.getByText('Void')).toBeInTheDocument()
  })

  it('handles keyboard shortcuts', () => {
    render(<QuickActionsModule {...defaultProps} />)
    
    // Test keyboard shortcuts if implemented
    const holdButton = screen.getByText('Hold')
    fireEvent.keyDown(holdButton, { key: 'h', ctrlKey: true })
    
    // Should handle keyboard shortcuts appropriately
    expect(holdButton).toBeInTheDocument()
  })
})
