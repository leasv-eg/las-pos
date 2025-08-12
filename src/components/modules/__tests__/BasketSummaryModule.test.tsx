import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BasketSummaryModule } from '../BasketSummaryModule'
import { ModuleConfig } from '../../../types/modules'

// Mock console.error to avoid noise in tests
vi.spyOn(console, 'error').mockImplementation(() => {})

const mockModule: ModuleConfig = {
  id: 'basket-summary',
  type: 'basket-summary',
  title: 'Basket Summary',
  position: { x: 0, y: 0, w: 3, h: 2 },
  visible: true,
  locked: false,
  minSize: { w: 2, h: 2 }
}

const defaultProps = {
  module: mockModule,
  size: 'medium' as const,
  isEditMode: false,
  onCheckout: vi.fn(),
  onClear: vi.fn()
}

describe('BasketSummaryModule', () => {
  it('renders edit mode placeholder', () => {
    render(
      <BasketSummaryModule 
        {...defaultProps}
        isEditMode={true}
      />
    )
    
    expect(screen.getByText('Basket Summary')).toBeInTheDocument()
  })

  it('renders empty basket state', () => {
    render(<BasketSummaryModule {...defaultProps} />)
    
    // Should render without crashing
    expect(screen.getByText(/empty/i)).toBeInTheDocument()
  })
})
